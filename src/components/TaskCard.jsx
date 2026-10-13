import { useState } from 'react'
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCalendar,
  FiCopy,
  FiEdit2,
  FiStar,
  FiTag,
  FiTrash2,
} from 'react-icons/fi'
import { useBoardStore } from '../store/useBoardStore'
import {
  DRAG_TASK_TYPE,
  formatDate,
  isOverdue,
  priorityLabels,
} from '../utils/task'
import styles from './TaskCard.module.scss'

function TaskCard({
  task,
  columns,
  columnIndex,
  taskIndex,
  tasksCount,
  canReorderTasks,
  onEdit,
}) {
  const [isDragging, setIsDragging] = useState(false)

  const deleteTask = useBoardStore((state) => state.deleteTask)
  const duplicateTask = useBoardStore((state) => state.duplicateTask)
  const togglePin = useBoardStore((state) => state.togglePin)
  const moveTask = useBoardStore((state) => state.moveTask)
  const moveTaskToColumn = useBoardStore(
    (state) => state.moveTaskToColumn,
  )
  const reorderTask = useBoardStore((state) => state.reorderTask)

  const overdue = isOverdue(task)

  const handleDelete = () => {
    if (window.confirm(`Удалить задачу «${task.title}»?`)) {
      deleteTask(task.id)
    }
  }

  const handleDragStart = (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('button, input, textarea, select, a')
    ) {
      event.preventDefault()
      return
    }

    event.dataTransfer.setData(DRAG_TASK_TYPE, task.id)
    event.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  return (
    <article
      className={[
        styles.card,
        task.pinned ? styles.pinned : '',
        isDragging ? styles.dragging : '',
      ].join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className={styles.heading}>
        <h3>{task.title}</h3>

        <button
          type="button"
          className={styles.pinButton}
          onClick={() => togglePin(task.id)}
          title={task.pinned ? 'Открепить задачу' : 'Закрепить задачу'}
          aria-label={
            task.pinned
              ? `Открепить задачу ${task.title}`
              : `Закрепить задачу ${task.title}`
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
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.meta}>
        <span
          className={`${styles.priority} ${
            styles[
              `priority${
                task.priority[0].toUpperCase() + task.priority.slice(1)
              }`
            ]
          }`}
        >
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

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editButton}
          onClick={() => onEdit(task.id)}
          title="Редактировать задачу"
          aria-label={`Редактировать задачу ${task.title}`}
        >
          <FiEdit2 aria-hidden="true" />
          Изменить
        </button>

        <button
          type="button"
          onClick={() => duplicateTask(task.id)}
          title="Создать копию"
          aria-label={`Дублировать задачу ${task.title}`}
        >
          <FiCopy aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => reorderTask(task.id, -1)}
          disabled={!canReorderTasks || taskIndex === 0}
          title="Поднять задачу"
          aria-label={`Поднять задачу ${task.title}`}
        >
          <FiArrowUp aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => reorderTask(task.id, 1)}
          disabled={!canReorderTasks || taskIndex === tasksCount - 1}
          title="Опустить задачу"
          aria-label={`Опустить задачу ${task.title}`}
        >
          <FiArrowDown aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => moveTask(task.id, -1)}
          disabled={columnIndex === 0}
          title="В предыдущую колонку"
          aria-label={`Переместить задачу ${task.title} влево`}
        >
          <FiArrowLeft aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => moveTask(task.id, 1)}
          disabled={columnIndex === columns.length - 1}
          title="В следующую колонку"
          aria-label={`Переместить задачу ${task.title} вправо`}
        >
          <FiArrowRight aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Удалить задачу"
          aria-label={`Удалить задачу ${task.title}`}
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
            aria-label={`Выбрать колонку для задачи ${task.title}`}
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

export default TaskCard