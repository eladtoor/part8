import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER, ALL_BOOKS } from '../queries/queries';

export const Recommend = (props) => {
  const user = useQuery(GET_USER);
  const favoriteGenre = user.data?.me.favoriteGenre;
  const result = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    //pollInterval: 500,
  });
  //const result = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (user.loading) {
    return <div>loading...</div>;
  }
  console.log(user.data, 'my user');
  const books = result.data.allBooks;
  return (
    <div>
      <h1> Recommendations</h1>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

