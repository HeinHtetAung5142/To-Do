/* eslint-disable react/jsx-key */
import { DateTime } from 'luxon';
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { supabaseClient } from "../lib/client";
import styles from '../styles/Home.module.css'

export default function Home() {
  const [todo, setToDo] = useState('');
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    onRun();
  }, []);

  const onRun = async event => {
    supabaseClient
      .from("todos")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (!error) {
          setTodos(data);
        }
      });
  }

  const handleSubmit = async event => {
    event.preventDefault();

    const { error } = await supabaseClient
      .from("todos")
      .insert([{ name: todo, created_at: DateTime.now() }]);

    if (error) {
      console.log(error);
    } else {
      onRun();
      closeHandler();
    }
  };

  const handleDelete = async (tid) => {
    const { error } = await supabaseClient
      .from("todos")
      .delete()
      .eq('id', tid);

    if (error) {
      console.log(error);
    } else {
      setTodos(todos.filter((todo) => todo.id !== tid));
    }
  }

  const closeHandler = () => {
    setToDo('');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>To-Do App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <a>To-Do</a> App
        </h1>

        <p className={styles.description}>
          Get started by adding{' '}
          <code className={styles.code}>a new task</code>
        </p>

        <form className='form-control' onSubmit={handleSubmit}>
          <label className="label">
            <span className="label-text">Add a new task</span>
          </label>
          <input 
            className='input' 
            type="text" 
            placeholder="To-Do" 
            value={todo}
            onChange={event => setToDo(event.target.value)}
          />

          <br/>
          <button className='btn btn-primary' type="submit">Add</button>
        </form>

        <br/>
        <table className='table w-80'>
          <thead>
            <tr>
              <th>Task</th>
              <th>Created at</th>
              <th>Option</th>
            </tr>
          </thead>
          <tbody>
            {todos.map(todo => (
              <tr key={todo.id}>
                <td>{todo.name}</td>
                <td>{todo.created_at}</td>
                <td>
                  <button className='btn btn-error' onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(todo.id);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>

      <footer className={styles.footer}>
          Powered by
          Hein Htet Aung
      </footer>
    </div>
  )
}
