import { useQuery } from '@apollo/client';
import { ALL_AUTHORS, EDIT_BIRTH } from '../queries/queries';
import { useState } from 'react';
import { useMutation } from '@apollo/client';

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS, { pollInterval: 500 });

  const [name, setName] = useState('');
  const [born, setBorn] = useState('');
  const [editAuthor] = useMutation(EDIT_BIRTH, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const editBirthday = (event) => {
    event.preventDefault();
    editAuthor({ variables: { name, setBornTo: born } });
    setName('');
    setBorn('');
  };
  if (!props.show) {
    return null;
  }
  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Set birthyear</h3>
        <div>
          <select
            value={name}
            onChange={(event) => {
              console.log(event.target.value);
              setName(event.target.value);
            }}
          >
            <option>---</option>
            {authors.map((author) => (
              <option key={author.name} value={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
          <button onClick={editBirthday} type="button">
            update author
          </button>
        </div>
      </div>
    </div>
  );
};

export default Authors;
