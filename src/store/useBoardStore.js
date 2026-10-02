import { create } from 'zustand'

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
  },
  {
    id: 'task-2',
    columnId: 'todo',
    title: 'Изучить Zustand',
    description: 'Прочитать документацию и примеры',
  },
  {
    id: 'task-3',
    columnId: 'progress',
    title: 'Создать проект',
    description: 'Инициализировать Vite + React',
  },
  {
    id: 'task-4',
    columnId: 'done',
    title: 'Настроить стили',
    description: 'Подключить CSS-модули или обычный CSS',
  },
]

export const useBoardStore = create((set) => ({
  columns: initialColumns,
  tasks: initialTasks,

  addColumn: (title) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    set((state) => ({
      columns: [
        ...state.columns,
        { id: crypto.randomUUID(), title: trimmedTitle },
      ],
    }))
  },

  deleteColumn: (columnId) => {
    set((state) => {
      // Защита на уровне стора: колонку с задачами удалить нельзя.
      if (state.tasks.some((task) => task.columnId === columnId)) {
        return state
      }

      return {
        columns: state.columns.filter((column) => column.id !== columnId),
      }
    })
  },

  addTask: (columnId, title, description = '') => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    set((state) => {
      if (!state.columns.some((column) => column.id === columnId)) {
        return state
      }

      return {
        tasks: [
          ...state.tasks,
          {
            id: crypto.randomUUID(),
            columnId,
            title: trimmedTitle,
            description: description.trim(),
          },
        ],
      }
    })
  },

  updateTask: (taskId, title, description) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: trimmedTitle,
              description: description.trim(),
            }
          : task,
      ),
    }))
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }))
  },

  moveTask: (taskId, direction) => {
    if (direction !== -1 && direction !== 1) return

    set((state) => {
      const task = state.tasks.find((item) => item.id === taskId)
      if (!task) return state

      const currentIndex = state.columns.findIndex(
        (column) => column.id === task.columnId,
      )
      const targetColumn = state.columns[currentIndex + direction]

      if (!targetColumn) return state

      return {
        tasks: state.tasks.map((item) =>
          item.id === taskId
            ? { ...item, columnId: targetColumn.id }
            : item,
        ),
      }
    })
  },
}))