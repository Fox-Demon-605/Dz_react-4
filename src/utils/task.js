export const DRAG_TASK_TYPE = 'application/x-focus-board-task'

export const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const formatDate = (value) => {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('ru-RU').format(date)
}

export const isOverdue = (task) => {
  if (!task.dueDate) return false

  const today = new Date()
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  return task.dueDate < localToday
}