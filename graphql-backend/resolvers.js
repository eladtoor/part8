const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const query = {};
      if (args.author) {
        // Assuming args.author is the name of the author
        const author = await Author.findOne({ name: args.author });
        if (author) {
          query['author'] = author._id;
        }
      }
      if (args.genre) {
        query['genres'] = args.genre;
      }
      console.log(query);
      try {
        // Use Mongoose find() with the constructed query
        const books = await Book.find(query).populate('author');
        return books;
      } catch (error) {
        throw new GraphQLError('Failed to fetch books', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error,
          },
        });
      }
    },

    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => {
      //const author = await Author.findOne({ name: root.name });
      //const authorId = author._id;
      const books = await Book.find({ author: root._id });
      return books.length;
      //books.filter((book) => book.author === root.name).length;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      console.log('got here', args);

      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      // Find the author by name
      const existingAuthor = await Author.findOne({ name: args.author });

      let authorId;

      if (existingAuthor) {
        authorId = existingAuthor._id;
      } else {
        // If the author doesn't exist, create a new author and get the new _id
        const newAuthor = new Author({ name: args.author, born: null });
        try {
          const savedAuthor = await newAuthor.save();
          authorId = savedAuthor._id;
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error,
            },
          });
        }
      }

      const book = new Book({ ...args, author: authorId });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          },
        });
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') });

      return book.populate('author');
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError('Editing born failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          },
        });
      }
      return author;
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      console.log(user);
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
};

module.exports = resolvers;

