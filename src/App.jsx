import { useMemo, useRef, useState } from 'react'
import {
    FiAlertCircle,
    FiArrowDown,
    FiArrowLeft,
    FiArrowRight,
    FiArrowUp,
    FiCalendar,
    FiCheck,
    FiCopy,
    FiDownload,
    FiEdit2,
    FiFilter,
    FiMoon,
    FiPlus,
    FiRotateCcw,
    FiSearch,
    FiStar,
    FiSun,
    FiTag,
    FiTrash2,
    FiUpload,
    FiX,
} from 'react-icons/fi'
import { useBoardStore } from './store/useBoardStore'
import styles from './App.module.css'
import columnStyles from './Column.module.css'

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
            : { ...emptyForm },
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
        <form className={styles.taskForm} onSubmit={handleSubmit}>
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
                    placeholder="Добавьте подробности..."
                />
            </label>

            <div className={styles.formRow}>
                <label>
                    Приоритет
                    <select
                        value={form.priority}
                        onChange={changeField('priority')}
                    >
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

            <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton}>
                    <FiCheck aria-hidden="true" />
                    {initialValue ? 'Сохранить' : 'Добавить'}
                </button>

                <button type="button" onClick={onCancel}>
                    <FiX aria-hidden="true" />
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
    canReorderTasks,
    onEdit,
}) {
    const deleteTask = useBoardStore((state) => state.deleteTask)
    const duplicateTask = useBoardStore((state) => state.duplicateTask)
    const togglePin = useBoardStore((state) => state.togglePin)
    const moveTask = useBoardStore((state) => state.moveTask)
    const moveTaskToColumn = useBoardStore(
        (state) => state.moveTaskToColumn,
    )
    const reorderTask = useBoardStore((state) => state.reorderTask)

    const handleDelete = () => {
        if (window.confirm(`Удалить заметку «${task.title}»?`)) {
            deleteTask(task.id)
        }
    }

    const overdue = isOverdue(task)

    return (
        <article
            className={`${styles.taskCard} ${task.pinned ? styles.isPinned : ''}`}
        >
            <div className={styles.taskHeading}>
                <h3>{task.title}</h3>

                <button
                    type="button"
                    className={`${styles.iconButton} ${styles.pinButton}`}
                    onClick={() => togglePin(task.id)}
                    title={task.pinned ? 'Открепить' : 'Закрепить'}
                    aria-label={
                        task.pinned
                            ? 'Открепить заметку'
                            : 'Закрепить заметку'
                    }
                    aria-pressed={task.pinned}
                >
                    <FiStar
                        aria-hidden="true"
                        fill={task.pinned ? 'currentColor' : 'none'}
                    />
                </button>
            </div>

            {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
            )}

            <div className={styles.taskMeta}>
                <span
                    className={`${styles.priority} ${
                        styles[
                            `priority${task.priority[0].toUpperCase()}${task.priority.slice(1)}`
                        ]
                    }`}
                >
                    <span
                        className={styles.priorityDot}
                        aria-hidden="true"
                    />
                    {priorityLabels[task.priority]}
                </span>

                {task.dueDate && (
                    <span
                        className={`${styles.dateBadge} ${
                            overdue ? styles.overdue : ''
                        }`}
                    >
                        <FiCalendar aria-hidden="true" />
                        {formatDate(task.dueDate)}
                        {overdue ? ' · просрочено' : ''}
                    </span>
                )}
            </div>

            {task.tags.length > 0 && (
                <div className={styles.tags}>
                    {task.tags.map((tag) => (
                        <span className={styles.tag} key={tag}>
                            <FiTag aria-hidden="true" />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className={styles.taskActions}>
                <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => onEdit(task)}
                >
                    <FiEdit2 aria-hidden="true" />
                    Изменить
                </button>

                <button
                    type="button"
                    onClick={() => duplicateTask(task.id)}
                    title="Создать копию"
                    aria-label={`Дублировать заметку ${task.title}`}
                >
                    <FiCopy aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={() => reorderTask(task.id, -1)}
                    disabled={!canReorderTasks || taskIndex === 0}
                    title="Поднять заметку"
                    aria-label={`Поднять заметку ${task.title}`}
                >
                    <FiArrowUp aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={() => reorderTask(task.id, 1)}
                    disabled={
                        !canReorderTasks || taskIndex === tasksCount - 1
                    }
                    title="Опустить заметку"
                    aria-label={`Опустить заметку ${task.title}`}
                >
                    <FiArrowDown aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={() => moveTask(task.id, -1)}
                    disabled={columnIndex === 0}
                    title="В предыдущую колонку"
                    aria-label={`Переместить заметку ${task.title} влево`}
                >
                    <FiArrowLeft aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={() => moveTask(task.id, 1)}
                    disabled={columnIndex === columns.length - 1}
                    title="В следующую колонку"
                    aria-label={`Переместить заметку ${task.title} вправо`}
                >
                    <FiArrowRight aria-hidden="true" />
                </button>

                <button
                    type="button"
                    className={styles.dangerText}
                    onClick={handleDelete}
                    title="Удалить заметку"
                    aria-label={`Удалить заметку ${task.title}`}
                >
                    <FiTrash2 aria-hidden="true" />
                </button>
            </div>

            {columns.length > 1 && (
                <label className={styles.moveSelect}>
                    Переместить в
                    <select
                        value={task.columnId}
                        onChange={(event) =>
                            moveTaskToColumn(task.id, event.target.value)
                        }
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
    canReorderTasks,
}) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

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
        <section
            className={`${styles.column} ${isDragging ? columnStyles.dragging : ''}`}
            draggable
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
        >
            <header className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                    <span
                        className={styles.columnMarker}
                        aria-hidden="true"
                    />
                    <h2>{column.title}</h2>
                    <span className={styles.countBadge}>
                        {allTasks.length}
                    </span>
                </div>

                <div className={styles.columnActions}>
                    <button
                        type="button"
                        onClick={() => moveColumn(column.id, -1)}
                        disabled={index === 0}
                        title="Переместить колонку влево"
                        aria-label={`Переместить колонку ${column.title} влево`}
                    >
                        <FiArrowLeft aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() => moveColumn(column.id, 1)}
                        disabled={index === columns.length - 1}
                        title="Переместить колонку вправо"
                        aria-label={`Переместить колонку ${column.title} вправо`}
                    >
                        <FiArrowRight aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={handleRename}
                        title="Переименовать колонку"
                        aria-label={`Переименовать колонку ${column.title}`}
                    >
                        <FiEdit2 aria-hidden="true" />
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
                        <FiTrash2 aria-hidden="true" />
                    </button>
                </div>
            </header>

            <button
                type="button"
                className={styles.addTaskButton}
                onClick={() => setShowAddForm((value) => !value)}
                aria-expanded={showAddForm}
            >
                {showAddForm ? (
                    <>
                        <FiX aria-hidden="true" />
                        Скрыть форму
                    </>
                ) : (
                    <>
                        <FiPlus aria-hidden="true" />
                        Добавить заметку
                    </>
                )}
            </button>

            {showAddForm && (
                <TaskForm
                    onSave={(data) => addTask(column.id, data)}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <div className={styles.taskList}>
                {visibleTasks.length === 0 && (
                    <p
                        className={
                            allTasks.length === 0
                                ? columnStyles.emptyColumn
                                : styles.emptyMessage
                        }
                    >
                        {allTasks.length === 0
                            ? 'Нет задач'
                            : 'Нет совпадений с фильтрами'}
                    </p>
                )}

                {visibleTasks.map((task, taskIndex) => (
                    <div key={task.id}>
                        {editingTask?.id === task.id ? (
                            <div className={styles.editWrapper}>
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
                                canReorderTasks={canReorderTasks}
                                onEdit={setEditingTask}
                            />
                        )}
                    </div>
                ))}
            </div>

            {!canReorderTasks && visibleTasks.length > 1 && (
                <p className={styles.columnHint}>
                    Чтобы изменить порядок заметок, выберите сортировку
                    «Вручную» и очистите фильтры.
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
            ]
                .join(' ')
                .toLowerCase()

            if (query && !searchableText.includes(query)) return false

            if (
                priorityFilter !== 'all' &&
                task.priority !== priorityFilter
            ) {
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
    }, [tasks, search, priorityFilter, tagFilter, statusFilter, sortBy])

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
        <main
            className={`${styles.app} ${
                theme === 'dark' ? styles.themeDark : styles.themeLight
            }`}
        >
            <div className={styles.appInner}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.brand}>
                            <span
                                className={styles.brandIcon}
                                aria-hidden="true"
                            >
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
                        <button type="button" onClick={toggleTheme}>
                            {theme === 'light' ? (
                                <>
                                    <FiMoon aria-hidden="true" />
                                    Тёмная тема
                                </>
                            ) : (
                                <>
                                    <FiSun aria-hidden="true" />
                                    Светлая тема
                                </>
                            )}
                        </button>

                        <button type="button" onClick={handleExport}>
                            <FiDownload aria-hidden="true" />
                            Экспорт
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiUpload aria-hidden="true" />
                            Импорт
                        </button>

                        <button
                            type="button"
                            className={styles.dangerText}
                            onClick={handleReset}
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
                        <span className={styles.statLabel}>Колонки</span>
                        <strong>{columns.length}</strong>
                        <span className={styles.statCaption}>
                            этапов работы
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Все заметки
                        </span>
                        <strong>{tasks.length}</strong>
                        <span className={styles.statCaption}>
                            на вашей доске
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Закреплено
                        </span>
                        <strong>{pinnedCount}</strong>
                        <span className={styles.statCaption}>
                            в центре внимания
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            Просрочено
                        </span>
                        <strong>{overdueCount}</strong>
                        <span className={styles.statCaption}>
                            требуют внимания
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Показано</span>
                        <strong>{filteredTasks.length}</strong>
                        <span className={styles.statCaption}>
                            с учётом фильтров
                        </span>
                    </div>
                </section>

                <section
                    className={styles.toolbar}
                    aria-label="Управление доской"
                >
                    <div className={styles.toolbarHeader}>
                        <div>
                            <h2>Рабочее пространство</h2>
                            <p>
                                Создавайте колонки и находите нужные
                                заметки.
                            </p>
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
                                className={styles.primaryButton}
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
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Поиск по заметкам..."
                                aria-label="Поиск по заметкам"
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
                            onChange={(event) =>
                                setTagFilter(event.target.value)
                            }
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
                            <option value="all">Все заметки</option>
                            <option value="pinned">
                                Закреплённые
                            </option>
                            <option value="overdue">
                                Просроченные
                            </option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(event.target.value)
                            }
                            aria-label="Сортировка заметок"
                        >
                            <option value="manual">Вручную</option>
                            <option value="priority">
                                По приоритету
                            </option>
                            <option value="dueDate">По дедлайну</option>
                            <option value="newest">
                                Сначала новые
                            </option>
                            <option value="title">По названию</option>
                        </select>

                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={clearFilters}
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
                            aria-label="Закрыть сообщение"
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    </div>
                )}

                <div className={styles.boardHeading}>
                    <div>
                        <span className={styles.sectionEyebrow}>
                            ВАША ДОСКА
                        </span>
                        <h2>Задачи по этапам</h2>
                    </div>
                    <span className={styles.boardCount}>
                        {columns.length}{' '}
                        {columns.length === 1 ? 'колонка' : 'колонок'}
                    </span>
                </div>

                {columns.length === 0 ? (
                    <p className={styles.noColumns}>
                        Колонок пока нет. Добавьте первую колонку выше.
                    </p>
                ) : (
                    <div className={styles.board}>
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
                                    canReorderTasks={canReorderTasks}
                                />
                            )
                        })}
                    </div>
                )}

                <p className={styles.footerNote}>
                    Данные сохраняются локально в этом браузере. Для
                    резервной копии используйте экспорт JSON.
                </p>
            </div>
        </main>
    )
}

export default App