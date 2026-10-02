import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const initialColumns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

const initialTasks = [
  {
    id: 'task-1',
    columnId: 'backlog',
    title: 'Сформулировать требования',
    description: 'Описать функциональность доски задач',
    priority: 'high',
    dueDate: '',
    tags: ['проект'],
    pinned: false,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'task-2',
    columnId: 'todo',
    title: 'Изучить Zustand',
    description: 'Прочитать документацию и примеры',
    priority: 'medium',
    dueDate: '',
    tags: ['react'],
    pinned: false,
    createdAt: '2025-01-01T10:01:00.000Z',
    updatedAt: '2025-01-01T10:01:00.000Z',
  },
  {
    id: 'task-3',
    columnId: 'progress',
    title: 'Создать проект',
    description: 'Инициализировать Vite + React',
    priority: 'medium',
    dueDate: '',
    tags: [],
    pinned: false,
    createdAt: '2025-01-01T10:02:00.000Z',
    updatedAt: '2025-01-01T10:02:00.000Z',
  },
  {
    id: 'task-4',
    columnId: 'done',
    title: 'Настроить стили',
    description: 'Подключить обычный CSS',
    priority: 'low',
    dueDate: '',
    tags: ['дизайн'],
    pinned: false,
    createdAt: '2025-01-01T10:03:00.000Z',
    updatedAt: '2025-01-01T10:03:00.000Z',
  },
]

const priorities = ['low', 'medium', 'high']

const normalizeTags = (value) => {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',')

  return [...new Set(
    items
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  )].slice(0, 10)
}

const normalizeTaskData = (data) => ({
  title: String(data.title ?? '').trim(),
  description: String(data.description ?? '').trim(),
  priority: priorities.includes(data.priority) ? data.priority : 'medium',
  dueDate: /^\d{4}-\d{2}-\d{2}$/.test(data.dueDate ?? '')
    ? data.dueDate
    : '',
  tags: normalizeTags(data.tags),
})

const moveItem = (items, fromIndex, toIndex) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items
  }

  const result = [...items]
  const [item] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, item)

  return result
}

const normalizeImportedBoard = (data) => {
  if (
    !data ||
    typeof data !== 'object' ||
    !Array.isArray(data.columns) ||
    !Array.isArray(data.tasks)
  ) {
    throw new Error('Файл должен содержать массивы columns и tasks.')
  }

  if (data.columns.length > 100 || data.tasks.length > 10000) {
    throw new Error('Слишком большой файл: максимум 100 колонок и 10 000 заметок.')
  }

  const columnIds = new Set()

  const columns = data.columns.map((column) => {
    if (
      !column ||
      typeof column.id !== 'string' ||
      !column.id.trim() ||
      typeof column.title !== 'string' ||
      !column.title.trim() ||
      columnIds.has(column.id)
    ) {
      throw new Error('Некорректные данные колонок или повторяющиеся ID.')
    }

    columnIds.add(column.id)

    return {
      id: column.id,
      title: column.title.trim(),
    }
  })

  const taskIds = new Set()

  const tasks = data.tasks.map((task) => {
    if (
      !task ||
      typeof task.id !== 'string' ||
      !task.id.trim() ||
      taskIds.has(task.id) ||
      typeof task.columnId !== 'string' ||
      !columnIds.has(task.columnId) ||
      typeof task.title !== 'string' ||
      !task.title.trim()
    ) {
      throw new Error('Некорректные заметки, повторяющиеся ID или неизвестная колонка.')
    }

    taskIds.add(task.id)

    const now = new Date().toISOString()
    const normalized = normalizeTaskData(task)

    return {
      id: task.id,
      columnId: task.columnId,
      ...normalized,
      pinned: task.pinned === true,
      createdAt: typeof task.createdAt === 'string' && !Number.isNaN(Date.parse(task.createdAt))
        ? task.createdAt
        : now,
      updatedAt: typeof task.updatedAt === 'string' && !Number.isNaN(Date.parse(task.updatedAt))
        ? task.updatedAt
        : now,
    }
  })

  return { columns, tasks }
}

export const useBoardStore = create(
  persist(
    (set, get) => ({
      columns: initialColumns,
      tasks: initialTasks,
      theme: 'light',

      addColumn: (title) => {
        const trimmedTitle = String(title ?? '').trim()
        if (!trimmedTitle) return false

        set((state) => ({
          columns: [
            ...state.columns,
            { id: crypto.randomUUID(), title: trimmedTitle },
          ],
        }))

        return true
      },

      renameColumn: (columnId, title) => {
        const trimmedTitle = String(title ?? '').trim()
        if (!trimmedTitle) return false

        if (!get().columns.some((column) => column.id === columnId)) {
          return false
        }

        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? { ...column, title: trimmedTitle }
              : column,
          ),
        }))

        return true
      },

      deleteColumn: (columnId) => {
        const state = get()

        if (!state.columns.some((column) => column.id === columnId)) {
          return false
        }

        if (state.tasks.some((task) => task.columnId === columnId)) {
          return false
        }

        set({
          columns: state.columns.filter((column) => column.id !== columnId),
        })

        return true
      },

      moveColumn: (columnId, direction) => {
        if (direction !== -1 && direction !== 1) return false

        const columns = get().columns
        const index = columns.findIndex((column) => column.id === columnId)
        const next = moveItem(columns, index, index + direction)

        if (next === columns) return false

        set({ columns: next })
        return true
      },

      addTask: (columnId, data) => {
        const normalized = normalizeTaskData(data)

        if (
          !normalized.title ||
          !get().columns.some((column) => column.id === columnId)
        ) {
          return false
        }

        const now = new Date().toISOString()

        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              columnId,
              ...normalized,
              pinned: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }))

        return true
      },

      updateTask: (taskId, data) => {
        const normalized = normalizeTaskData(data)

        if (!normalized.title || !get().tasks.some((task) => task.id === taskId)) {
          return false
        }

        const now = new Date().toISOString()

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...normalized, updatedAt: now }
              : task,
          ),
        }))

        return true
      },

      deleteTask: (taskId) => {
        if (!get().tasks.some((task) => task.id === taskId)) return false

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }))

        return true
      },

      duplicateTask: (taskId) => {
        const task = get().tasks.find((item) => item.id === taskId)
        if (!task) return false

        const now = new Date().toISOString()

        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              title: `${task.title} — копия`,
              pinned: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }))

        return true
      },

      togglePin: (taskId) => {
        if (!get().tasks.some((task) => task.id === taskId)) return false

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  pinned: !task.pinned,
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
        }))

        return true
      },

      moveTaskToColumn: (taskId, targetColumnId) => {
        const state = get()

        if (
          !state.tasks.some((task) => task.id === taskId) ||
          !state.columns.some((column) => column.id === targetColumnId)
        ) {
          return false
        }

        set((current) => ({
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  columnId: targetColumnId,
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
        }))

        return true
      },

      moveTask: (taskId, direction) => {
        if (direction !== -1 && direction !== 1) return false

        const state = get()
        const task = state.tasks.find((item) => item.id === taskId)
        if (!task) return false

        const currentIndex = state.columns.findIndex(
          (column) => column.id === task.columnId,
        )
        const targetColumn = state.columns[currentIndex + direction]

        if (!targetColumn) return false

        return get().moveTaskToColumn(taskId, targetColumn.id)
      },

      reorderTask: (taskId, direction) => {
        if (direction !== -1 && direction !== 1) return false

        const tasks = get().tasks
        const task = tasks.find((item) => item.id === taskId)
        if (!task) return false

        const columnTaskIds = tasks
          .filter((item) => item.columnId === task.columnId)
          .map((item) => item.id)

        const index = columnTaskIds.indexOf(taskId)
        const targetId = columnTaskIds[index + direction]
        if (!targetId) return false

        const firstIndex = tasks.findIndex((item) => item.id === taskId)
        const secondIndex = tasks.findIndex((item) => item.id === targetId)

        const nextTasks = [...tasks]
        ;[nextTasks[firstIndex], nextTasks[secondIndex]] = [
          nextTasks[secondIndex],
          nextTasks[firstIndex],
        ]

        set({ tasks: nextTasks })
        return true
      },

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }))
      },

      importBoard: (data) => {
        const board = normalizeImportedBoard(data)
        set(board)
        return true
      },

      resetBoard: () => {
        set({
          columns: initialColumns.map((column) => ({ ...column })),
          tasks: initialTasks.map((task) => ({
            ...task,
            tags: [...task.tags],
          })),
        })
      },
    }),
    {
      name: 'notes-board-v2',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        columns: state.columns,
        tasks: state.tasks,
        theme: state.theme,
      }),
    },
  ),
)