import { useState } from 'react'
import { useBoardStore } from './store/useBoardStore'
import './App.css'

function TaskCard({ task, columnIndex, columnsCount }) {
  const updateTask = useBoardStore((state) => state.updateTask)
  const deleteTask = useBoardStore((state) => state.deleteTask)
  const moveTask = useBoardStore((state) => state.moveTask)

  const handleEdit = () => {
    const title = window.prompt('Название заметки:', task.title)
    if (title === null || !title.trim()) return

    const description = window.prompt(
      'Описание заметки:',
      task.description,
    )
    if (description === null) return

    updateTask(task.id, title, description)
  }

  return (
    <article className="task-card">
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}

      <div className="task-actions">
        <button type="button" onClick={handleEdit} aria-label="Редактировать">
          ✎
        </button>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          aria-label="Удалить заметку"
        >
          🗑
        </button>
        <button
          type="button"
          onClick={() => moveTask(task.id, -1)}
          disabled={columnIndex === 0}
          aria-label="Переместить влево"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => moveTask(task.id, 1)}
          disabled={columnIndex === columnsCount - 1}
          aria-label="Переместить вправо"
        >
          →
        </button>
      </div>
    </article>
  )
}

function Column({ column, index, columnsCount, tasks }) {
  const addTask = useBoardStore((state) => state.addTask)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const isEmpty = tasks.length === 0

  const handleAddTask = () => {
    const title = window.prompt('Название заметки:')
    if (title === null || !title.trim()) return

    const description = window.prompt('Описание заметки:') ?? ''
    addTask(column.id, title, description)
  }

  return (
    <section className="column">
      <header className="column-header">
        <h2>{column.title}</h2>

        <div className="column-actions">
          <button
            type="button"
            onClick={handleAddTask}
            aria-label={`Добавить заметку в колонку ${column.title}`}
            title="Добавить заметку"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => deleteColumn(column.id)}
            disabled={!isEmpty}
            aria-label={`Удалить колонку ${column.title}`}
            title={
              isEmpty
                ? 'Удалить пустую колонку'
                : 'Сначала удалите или переместите заметки'
            }
          >
            🗑
          </button>
        </div>
      </header>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnIndex={index}
            columnsCount={columnsCount}
          />
        ))}
      </div>
    </section>
  )
}

function App() {
  const columns = useBoardStore((state) => state.columns)
  const tasks = useBoardStore((state) => state.tasks)
  const addColumn = useBoardStore((state) => state.addColumn)
  const [columnTitle, setColumnTitle] = useState('')

  const handleAddColumn = (event) => {
    event.preventDefault()

    if (!columnTitle.trim()) return

    addColumn(columnTitle)
    setColumnTitle('')
  }

  return (
    <main className="app">
      <div className="page-header">
        <div>
          <h1>Доска заметок</h1>
          <p>Организуйте заметки по этапам работы</p>
        </div>

        <form className="add-column-form" onSubmit={handleAddColumn}>
          <input
            type="text"
            value={columnTitle}
            onChange={(event) => setColumnTitle(event.target.value)}
            placeholder="Название колонки"
            aria-label="Название новой колонки"
          />
          <button type="submit">+ Добавить колонку</button>
        </form>
      </div>

      <div className="board">
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            index={index}
            columnsCount={columns.length}
            tasks={tasks.filter((task) => task.columnId === column.id)}
          />
        ))}
      </div>
    </main>
  )
}

export default App