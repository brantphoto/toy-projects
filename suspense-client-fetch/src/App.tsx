import { useState, use, useMemo, Suspense, useDeferredValue } from 'react'
import './App.css'
import LoadingSpinner from './LoadingSpinner'

const Person = ({ dataPromise }) => {
  const { result: { properties: { name, mass, height } } } = use(dataPromise)
  return (
    <div>
      <div>
        Name: {name}
      </div>
      <div>
      </div>
      Mass: {mass}
      <div>
        Height: {height}
      </div>
    </div>
  )
}

// const usePerson = (id) => {
//   return useMemo(
//     () =>
//       fetch(`https://www.swapi.tech/api/people/${id}`).then(res => res.json())
//     , [id]);
// }
//
//
const peopleMap = new Map()
const usePerson = (id) => {
  return useMemo(() => {
    const fetchData = async () => {
      const res = await fetch(`https://www.swapi.tech/api/people/${id}`);
      return res.json();
    };
    return fetchData();
  }, [id]);
}


function App() {
  const [id, setId] = useState(1)
  // const defId = useDeferredValue(id)
  const p = usePerson(id)
  const personData = useDeferredValue(p)
  const isLoading = p !== personData ? "loading" : ""


  return (
    <>
      <section className={isLoading ? "is-loading" : ""}>
        <Suspense fallback={<LoadingSpinner />}>
          <Person dataPromise={personData} />
        </Suspense>
      </section>
      <div style={{ display: 'flex', width: `100%`, flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setId((id) => id - 1)}
          disabled={id < 2}
        >
          Prev
        </button>
        <div>Character Index: {id}</div>
        <button
          onClick={() => setId((id) => id + 1)}
          disabled={id > 15}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default App
