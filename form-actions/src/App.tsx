import { useState, use, useMemo, Suspense, useOptimistic } from 'react'
import './App.css'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

const TodoList = ({ data }) => {
  if (!data.length) {
    return (<div>No todos</div>)
  }
  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>
          {item.text}
        </li>
      ))}
    </ul>
  )
}


function App() {
  const queryClient = useQueryClient()

  const { data } = useSuspenseQuery(
    {
      queryFn: () => fetch("http://localhost:3000/todos").then(res => res.json()),
      queryKey: ["todos"]
    }
  )

  const addItemMutation = useMutation(
    {
      mutationFn: (formData) => {
        return fetch("http://localhost:3000/todos", { method: "POST", body: formData })
      },
      onMutate: (formData) => {
        const newTodo = {
          text: formData.get('text'),
          id: "temp"

        }

        const previousTodos = queryClient.getQueryData(['todos']);
        queryClient.setQueryData(['todos'], [...previousTodos, newTodo]);

      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["todos"]

        }
    }
  )



  return (
    <>
      <div>
      </div>
      <TodoList data={data} />
      <div>
        Add an item:
      </div>
      <form
        action={addItemMutation.mutateAsync}
        name="add-new-item"
      >
        <input
          minLength={1}
          maxLength={30}
          name="text"
          type="text"
        />
        <button
          type="submit"
        >
        </button>
      </form>


    </>
  )
}

export default App
