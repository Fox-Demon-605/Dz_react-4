import { useMemo, useRef, useState } from 'react'
import { useBoardStore } from './store/useBoardStore'
import './App.css'

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  tags: '',
}

const formatDate = (value) => {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('ru-RU').format(date)
}

const isOverdue = (task) => {
  if (!task.dueDate) return false

  const today = new Date()
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  return task.dueDate < localToday
}

function TaskForm({ initialValue, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialValue
      ? {
          title: initialValue.title,
          description: initialValue.description,
          priority: initialValue.priority,
          dueDate: initialValue.dueDate,
          tags: initialValue.tags.join(', '),
        }
      : emptyForm,
  )

  const changeField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim()) return

    const saved = onSave(form)

    if (saved && !initialValue) {
      setForm({ ...emptyForm })
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Название *
        <input
          value={form.title}
          onChange={changeField('title')}
          maxLength={120}
          placeholder="Название заметки"
          required
          autoFocus
        />
      </label>

      <label>
        Описание
        <textarea
          value={form.description}
          onChange={changeField('description')}
          maxLength={3000}
          rows={3}
          placeholder="Подробности"
        />
      </label>

      <div className="form-row">
        <label>
          Приоритет
          <select value={form.priority} onChange={changeField('priority')}>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>

        <label>
          Дедлайн
          <input
            type="date"
            value={form.dueDate}
            onChange={changeField('dueDate')}
          />
        </label>
      </div>

      <label>
        Теги через запятую
        <input
          value={form.tags}
          onChange={changeField('tags')}
          placeholder="учёба, важно"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {initialValue ? 'Сохранить' : 'Добавить'}
        </button>

        <button type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}

function TaskCard({
  task,
  columns,
  columnIndex,
  taskIndex,
  tasksCount,
  onEdit,
}) {
  const deleteTask = useBoardStore((state) => state.deleteTask)
  const duplicateTask = useBoardStore((state) => state.duplicateTask)
  const togglePin = useBoardStore((state) => state.togglePin)
  const moveTask = useBoardStore((state) => state.moveTask)
  const moveTaskToColumn = useBoardStore((state) => state.moveTaskToColumn)
  const reorderTask = useBoardStore((state) => state.reorderTask)

  const handleDelete = () => {
    if (window.confirm(`Удалить заметку «${task.title}»?`)) {
      deleteTask(task.id)
    }
  }

  return (
    <article className={`task-card ${task.pinned ? 'is-pinned' : ''}`}>
      <div className="task-heading">
        <h3>{task.title}</h3>

        <button
          type="button"
          className="icon-button"
          onClick={() => togglePin(task.id)}
          title={task.pinned ? 'Открепить' : 'Закрепить'}
          aria-label={task.pinned ? 'Открепить заметку' : 'Закрепить заметку'}
        >
          {task.pinned ? '★' : '☆'}
        </button>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>
          {priorityLabels[task.priority]}
        </span>

        {task.dueDate && (
          <span className={isOverdue(task) ? 'overdue' : ''}>
            📅 {formatDate(task.dueDate)}
            {isOverdue(task) ? ' · просрочено' : ''}
          </span>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="tags">
          {task.tags.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-actions">
        <button type="button" onClick={() => onEdit(task)}>
          Изменить
        </button>

        <button
          type="button"
          onClick={() => duplicateTask(task.id)}
          title="Создать копию"
          aria-label={`Дублировать заметку ${task.title}`}
        >
          ⧉
        </button>

        <button
          type="button"
          onClick={() => reorderTask(task.id, -1)}
          disabled={taskIndex === 0}
          title="Поднять заметку"
          aria-label={`Поднять заметку ${task.title}`}
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => reorderTask(task.id, 1)}
          disabled={taskIndex === tasksCount - 1}
          title="Опустить заметку"
          aria-label={`Опустить заметку ${task.title}`}
        >
          ↓
        </button>

        <button
          type="button"
          onClick={() => moveTask(task.id, -1)}
          disabled={columnIndex === 0}
          title="В предыдущую колонку"
          aria-label={`Переместить заметку ${task.title} влево`}
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => moveTask(task.id, 1)}
          disabled={columnIndex === columns.length - 1}
          title="В следующую колонку"
          aria-label={`Переместить заметку ${task.title} вправо`}
        >
          →
        </button>

        <button
          type="button"
          className="danger-text"
          onClick={handleDelete}
          title="Удалить заметку"
          aria-label={`Удалить заметку ${task.title}`}
        >
          🗑
        </button>
      </div>

      {columns.length > 1 && (
        <label className="move-select">
          Переместить в
          <select
            value={task.columnId}
            onChange={(event) => moveTaskToColumn(task.id, event.target.value)}
            aria-label={`Выбрать колонку для заметки ${task.title}`}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </label>
      )}
    </article>
  )
}

function Column({
  column,
  index,
  columns,
  allTasks,
  visibleTasks,
  sortBy,
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const addTask = useBoardStore((state) => state.addTask)
  const updateTask = useBoardStore((state) => state.updateTask)
  const renameColumn = useBoardStore((state) => state.renameColumn)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const moveColumn = useBoardStore((state) => state.moveColumn)

  const handleRename = () => {
    const title = window.prompt('Новое название колонки:', column.title)
    if (title !== null) renameColumn(column.id, title)
  }

  const handleDelete = () => {
    if (window.confirm(`Удалить пустую колонку «${column.title}»?`)) {
      deleteColumn(column.id)
    }
  }

  const handleUpdate = (data) => {
    if (!editingTask) return false

    const saved = updateTask(editingTask.id, data)

    if (saved) setEditingTask(null)

    return saved
  }

  return (
    <section className="column">
      <header className="column-header">
        <div className="column-title">
          <h2>{column.title}</h2>
          <span className="count-badge">{allTasks.length}</span>
        </div>

        <div className="column-actions">
          <button
            type="button"
            onClick={() => moveColumn(column.id, -1)}
            disabled={index === 0}
            title="Переместить колонку влево"
            aria-label={`Переместить колонку ${column.title} влево`}
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => moveColumn(column.id, 1)}
            disabled={index === columns.length - 1}
            title="Переместить колонку вправо"
            aria-label={`Переместить колонку ${column.title} вправо`}
          >
            →
          </button>

          <button
            type="button"
            onClick={handleRename}
            title="Переименовать колонку"
            aria-label={`Переименовать колонку ${column.title}`}
          >
            ✎
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={allTasks.length > 0}
            title={
              allTasks.length > 0
                ? 'Сначала удалите или переместите заметки'
                : 'Удалить пустую колонку'
            }
            aria-label={`Удалить колонку ${column.title}`}
          >
            🗑
          </button>
        </div>
      </header>

      <button
        type="button"
        className="add-task-button"
        onClick={() => setShowAddForm((value) => !value)}
      >
        {showAddForm ? 'Скрыть форму' : '+ Добавить заметку'}
      </button>

      {showAddForm && (
        <TaskForm
          onSave={(data) => addTask(column.id, data)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="task-list">
        {visibleTasks.length === 0 && (
          <p className="empty-message">
            {allTasks.length === 0
              ? 'Здесь пока нет заметок'
              : 'Нет совпадений с фильтрами'}
          </p>
        )}

        {visibleTasks.map((task, taskIndex) => (
          <div key={task.id}>
            {editingTask?.id === task.id ? (
              <div className="edit-wrapper">
                <TaskForm
                  key={task.id}
                  initialValue={editingTask}
                  onSave={handleUpdate}
                  onCancel={() => setEditingTask(null)}
                />
              </div>
            ) : (
              <TaskCard
                task={task}
                columns={columns}
                columnIndex={index}
                taskIndex={taskIndex}
                tasksCount={visibleTasks.length}
                onEdit={setEditingTask}
              />
            )}
          </div>
        ))}
      </div>

      {sortBy !== 'manual' && visibleTasks.length > 1 && (
        <p className="column-hint">
          Для изменения порядка заметок выберите сортировку «Вручную».
        </p>
      )}
    </section>
  )
}

function App() {
  const columns = useBoardStore((state) => state.columns)
  const tasks = useBoardStore((state) => state.tasks)
  const theme = useBoardStore((state) => state.theme)
  const addColumn = useBoardStore((state) => state.addColumn)
  const toggleTheme = useBoardStore((state) => state.toggleTheme)
  const importBoard = useBoardStore((state) => state.importBoard)
  const resetBoard = useBoardStore((state) => state.resetBoard)

  const [columnTitle, setColumnTitle] = useState('')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('manual')
  const [message, setMessage] = useState('')

  const fileInputRef = useRef(null)

  const tags = useMemo(
    () => [...new Set(tasks.flatMap((task) => task.tags))].sort(),
    [tasks],
  )

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = tasks.filter((task) => {
      const searchableText = [
        task.title,
        task.description,
        ...task.tags,
      ].join(' ').toLowerCase()

      if (query && !searchableText.includes(query)) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false
      }
      if (tagFilter !== 'all' && !task.tags.includes(tagFilter)) {
        return false
      }
      if (statusFilter === 'pinned' && !task.pinned) return false
      if (statusFilter === 'overdue' && !isOverdue(task)) return false

      return true
    })

    if (sortBy === 'manual') return result

    const priorityWeight = { high: 0, medium: 1, low: 2 }

    return [...result].sort((first, second) => {
      if (first.pinned !== second.pinned) {
        return first.pinned ? -1 : 1
      }

      if (sortBy === 'priority') {
        return priorityWeight[first.priority] - priorityWeight[second.priority]
      }

      if (sortBy === 'title') {
        return first.title.localeCompare(second.title, 'ru')
      }

      if (sortBy === 'dueDate') {
        return (first.dueDate || '9999-12-31').localeCompare(
          second.dueDate || '9999-12-31',
        )
      }

      if (sortBy === 'newest') {
        return second.createdAt.localeCompare(first.createdAt)
      }

      return 0
    })
  }, [tasks, search, priorityFilter, tagFilter, statusFilter, sortBy])

  const handleAddColumn = (event) => {
    event.preventDefault()

    if (addColumn(columnTitle)) {
      setColumnTitle('')
    }
  }

  const handleExport = () => {
    const data = {
      columns,
      tasks,
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'notes-board.json'
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Доска экспортирована.')
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ошибка: файл должен быть меньше 5 МБ.')
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (
        !window.confirm(
          'Импорт заменит все текущие колонки и заметки. Продолжить?',
        )
      ) {
        return
      }

      importBoard(data)
      setMessage('Доска импортирована.')
    } catch (error) {
      setMessage(`Ошибка импорта: ${error.message}`)
    }
  }

  const handleReset = () => {
    if (
      window.confirm(
        'Сбросить доску? Все текущие колонки и заметки будут заменены примерами.',
      )
    ) {
      resetBoard()
      setMessage('Доска сброшена.')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setPriorityFilter('all')
    setTagFilter('all')
    setStatusFilter('all')
    setSortBy('manual')
  }

  const overdueCount = tasks.filter(isOverdue).length
  const pinnedCount = tasks.filter((task) => task.pinned).length
  const canReorderTasks =
    sortBy === 'manual' &&
    !search.trim() &&
    priorityFilter === 'all' &&
    tagFilter === 'all' &&
    statusFilter === 'all'

  return (
    <main className={`app theme-${theme}`}>
      <div className="app-inner">
        <header className="page-header">
          <div>
            <h1>Доска заметок</h1>
            <p>Организуйте задачи, идеи и планы по колонкам</p>
          </div>

          <div className="header-actions">
            <button type="button" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
            </button>

            <button type="button" onClick={handleExport}>
              Экспорт JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Импорт JSON
            </button>

            <button
              type="button"
              className="danger-text"
              onClick={handleReset}
            >
              Сбросить
            </button>

            <input
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              aria-label="Выбрать JSON-файл для импорта"
            />
          </div>
        </header>

        <section className="overview" aria-label="Статистика доски">
          <span>Колонок: <strong>{columns.length}</strong></span>
          <span>Заметок: <strong>{tasks.length}</strong></span>
          <span>Закреплено: <strong>{pinnedCount}</strong></span>
          <span>Просрочено: <strong>{overdueCount}</strong></span>
          <span>Показано: <strong>{filteredTasks.length}</strong></span>
        </section>

        <section className="toolbar" aria-label="Управление доской">
          <form className="add-column-form" onSubmit={handleAddColumn}>
            <input
              type="text"
              value={columnTitle}
              onChange={(event) => setColumnTitle(event.target.value)}
              placeholder="Название колонки"
              aria-label="Название новой колонки"
              maxLength={60}
              required
            />

            <button type="submit" className="primary-button">
              + Добавить колонку
            </button>
          </form>

          <div className="filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по заметкам"
              aria-label="Поиск по заметкам"
            />

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Фильтр по приоритету"
            >
              <option value="all">Все приоритеты</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>

            <select
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              aria-label="Фильтр по тегу"
            >
              <option value="all">Все теги</option>
              {tags.map((tag) => (
                <option value={tag} key={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Фильтр по состоянию"
            >
              <option value="all">Все заметки</option>
              <option value="pinned">Закреплённые</option>
              <option value="overdue">Просроченные</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Сортировка заметок"
            >
              <option value="manual">Вручную</option>
              <option value="priority">По приоритету</option>
              <option value="dueDate">По дедлайну</option>
              <option value="newest">Сначала новые</option>
              <option value="title">По названию</option>
            </select>

            <button type="button" onClick={clearFilters}>
              Очистить фильтры
            </button>
          </div>
        </section>

        {message && (
          <div className="notice" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Закрыть сообщение"
            >
              ×
            </button>
          </div>
        )}

        {columns.length === 0 ? (
          <p className="no-columns">
            Колонок пока нет. Добавьте первую колонку выше.
          </p>
        ) : (
          <div className="board">
            {columns.map((column, index) => {
              const allColumnTasks = tasks.filter(
                (task) => task.columnId === column.id,
              )

              const visibleColumnTasks = filteredTasks.filter(
                (task) => task.columnId === column.id,
              )

              return (
                <Column
                  key={column.id}
                  column={column}
                  index={index}
                  columns={columns}
                  allTasks={allColumnTasks}
                  visibleTasks={visibleColumnTasks}
                  sortBy={canReorderTasks ? 'manual' : 'filtered'}
                />
              )
            })}
          </div>
        )}

        <p className="footer-note">
          Данные сохраняются локально в этом браузере. Для резервной копии
          используйте экспорт JSON.
        </p>
      </div>
    </main>
  )
}

export default App