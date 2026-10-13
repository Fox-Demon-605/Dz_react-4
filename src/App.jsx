import { useMemo, useRef, useState } from 'react'
import {
  FiAlertCircle,
  FiCheck,
  FiDownload,
  FiFilter,
  FiMoon,
  FiPlus,
  FiRotateCcw,
  FiSearch,
  FiSun,
  FiUpload,
  FiX,
} from 'react-icons/fi'
import Board from './components/Board'
import { useBoardStore } from './store/useBoardStore'
import { isOverdue } from './utils/task'
import styles from './App.module.scss'

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
      const text = [
        task.title,
        task.description,
        ...task.tags,
      ]
        .join(' ')
        .toLowerCase()

      if (query && !text.includes(query)) return false
      if (
        priorityFilter !== 'all' &&
        task.priority !== priorityFilter
      ) {
        return false
      }
      if (
        tagFilter !== 'all' &&
        !task.tags.includes(tagFilter)
      ) {
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
        return (
          priorityWeight[first.priority] -
          priorityWeight[second.priority]
        )
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
  }, [
    tasks,
    search,
    priorityFilter,
    tagFilter,
    statusFilter,
    sortBy,
  ])

  const canReorderTasks =
    sortBy === 'manual' &&
    !search.trim() &&
    priorityFilter === 'all' &&
    tagFilter === 'all' &&
    statusFilter === 'all'

  const handleAddColumn = (event) => {
    event.preventDefault()

    if (addColumn(columnTitle)) {
      setColumnTitle('')
    }
  }

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ columns, tasks }, null, 2)],
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
      const data = JSON.parse(await file.text())

      if (
        !window.confirm(
          'Импорт заменит все текущие колонки и задачи. Продолжить?',
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
        'Сбросить доску? Все текущие колонки и задачи будут заменены примерами.',
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

  return (
    <main
      className={`${styles.app} ${
        theme === 'dark'
          ? styles.themeDark
          : styles.themeLight
      }`}
    >
      <div className={styles.appInner}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.brand}>
              <span className={styles.brandIcon} aria-hidden="true">
                <FiCheck />
              </span>
              <span>FOCUS BOARD</span>
            </div>

            <h1>Планы под контролем.</h1>
            <p>
              Удобное пространство для задач, идей и всего,
              что важно довести до результата.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={toggleTheme}
              title={
                theme === 'light'
                  ? 'Включить тёмную тему'
                  : 'Включить светлую тему'
              }
              aria-label={
                theme === 'light'
                  ? 'Включить тёмную тему'
                  : 'Включить светлую тему'
              }
            >
              {theme === 'light' ? (
                <FiMoon aria-hidden="true" />
              ) : (
                <FiSun aria-hidden="true" />
              )}
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </button>

            <button
              type="button"
              onClick={handleExport}
              title="Экспортировать доску в JSON"
              aria-label="Экспортировать доску в JSON"
            >
              <FiDownload aria-hidden="true" />
              Экспорт
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Импортировать доску из JSON"
              aria-label="Импортировать доску из JSON"
            >
              <FiUpload aria-hidden="true" />
              Импорт
            </button>

            <button
              type="button"
              className={styles.dangerText}
              onClick={handleReset}
              title="Сбросить доску"
              aria-label="Сбросить доску к примерам"
            >
              <FiRotateCcw aria-hidden="true" />
              Сбросить
            </button>

            <input
              ref={fileInputRef}
              className={styles.visuallyHidden}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              aria-label="Выбрать JSON-файл для импорта"
            />
          </div>
        </header>

        <section
          className={styles.overview}
          aria-label="Статистика доски"
        >
          <div className={styles.statCard}>
            <span>Колонки</span>
            <strong>{columns.length}</strong>
            <small>этапов работы</small>
          </div>

          <div className={styles.statCard}>
            <span>Все задачи</span>
            <strong>{tasks.length}</strong>
            <small>на вашей доске</small>
          </div>

          <div className={styles.statCard}>
            <span>Закреплено</span>
            <strong>{pinnedCount}</strong>
            <small>в центре внимания</small>
          </div>

          <div className={styles.statCard}>
            <span>Просрочено</span>
            <strong>{overdueCount}</strong>
            <small>требуют внимания</small>
          </div>

          <div className={styles.statCard}>
            <span>Показано</span>
            <strong>{filteredTasks.length}</strong>
            <small>с учётом фильтров</small>
          </div>
        </section>

        <section
          className={styles.toolbar}
          aria-label="Управление доской"
        >
          <div className={styles.toolbarHeader}>
            <div>
              <h2>Рабочее пространство</h2>
              <p>Создавайте колонки и находите нужные задачи.</p>
            </div>

            <form
              className={styles.addColumnForm}
              onSubmit={handleAddColumn}
            >
              <input
                type="text"
                value={columnTitle}
                onChange={(event) =>
                  setColumnTitle(event.target.value)
                }
                placeholder="Название колонки"
                aria-label="Название новой колонки"
                maxLength={60}
                required
              />

              <button
                type="submit"
                className={styles.addColumnButton}
                title="Добавить колонку"
                aria-label="Добавить колонку"
              >
                <FiPlus aria-hidden="true" />
                Добавить колонку
              </button>
            </form>
          </div>

          <div className={styles.filters}>
            <label className={styles.searchField}>
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по задачам..."
                aria-label="Поиск по задачам"
              />
            </label>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
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
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Фильтр по состоянию"
            >
              <option value="all">Все задачи</option>
              <option value="pinned">Закреплённые</option>
              <option value="overdue">Просроченные</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Сортировка задач"
            >
              <option value="manual">Вручную</option>
              <option value="priority">По приоритету</option>
              <option value="dueDate">По дедлайну</option>
              <option value="newest">Сначала новые</option>
              <option value="title">По названию</option>
            </select>

            <button
              type="button"
              className={styles.clearButton}
              onClick={clearFilters}
              title="Очистить фильтры"
              aria-label="Очистить фильтры и сортировку"
            >
              <FiFilter aria-hidden="true" />
              Очистить
            </button>
          </div>
        </section>

        {message && (
          <div className={styles.notice} role="status">
            <span className={styles.noticeContent}>
              {message.startsWith('Ошибка') ? (
                <FiAlertCircle aria-hidden="true" />
              ) : (
                <FiCheck aria-hidden="true" />
              )}
              {message}
            </span>

            <button
              type="button"
              onClick={() => setMessage('')}
              title="Закрыть сообщение"
              aria-label="Закрыть сообщение"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        )}

        <Board
          columns={columns}
          tasks={tasks}
          filteredTasks={filteredTasks}
          canReorderTasks={canReorderTasks}
        />

        <p className={styles.footerNote}>
          Данные сохраняются локально в этом браузере.
          Для резервной копии используйте экспорт JSON.
        </p>
      </div>
    </main>
  )
}

export default App