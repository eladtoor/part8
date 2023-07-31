import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries/queries';
import { useState } from 'react';
const Books = (props) => {
  const genres = [
    'refactoring',
    'agile',
    'patterns',
    'design',
    'crime',
    'classic',
    'all genres',
  ];
  const [filter, setFilter] = useState('all genres');
  const result = useQuery(ALL_BOOKS, {
    variables: { genre: filter === 'all genres' ? '' : filter },
    //pollInterval: 500,
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }
  console.log('here test1');

  const books = result.data.allBooks;
  console.log('here test2');

  return (
    <div>
      <h2>books</h2>

      <h4>in genre {filter}</h4>

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

      {genres.map((genre) => (
        <button key={genre} onClick={() => setFilter(genre)}>
          {genre}
        </button>
      ))}
      {console.log(filter)}
    </div>
  );
};

export default Books;
