import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from '@apollo/client';

import { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import { Recommend } from './components/Recommend';
import { ALL_BOOKS, BOOK_ADDED } from './queries/queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      window.alert(`New Book Added by ${data.data.bookAdded.author.name}`);

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(data.data.bookAdded),
        };
      });
    },
  });
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <button onClick={() => setPage('add')}>add book</button>
        ) : null}
        {token ? (
          <button onClick={() => setPage('recommend')}>recommend</button>
        ) : null}
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage('loginForm')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <Recommend show={page === 'recommend'} />

      <NewBook show={page === 'add'} />

      <LoginForm
        setPage={setPage}
        setToken={setToken}
        show={page === 'loginForm'}
      />
    </div>
  );
};

export default App;
