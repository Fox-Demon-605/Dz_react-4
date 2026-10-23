
import { useState } from 'react'
import { useBoardStore } from '../store/useBoardStore'
import Column from './Column'
import TaskFormModal from './TaskFormModal'
import styles from './Board.module.scss'

function Board({ columns, tasks, filteredTasks, canReorderTasks }) {
  const [modal, setModal] = useState(null)

  const addTask = useBoardStore((state) => state.addTask)
  const updateTask = useBoardStore((state) => state.updateTask)

  const editingTask = modal?.taskId
    ? tasks.find((task) => task.id === modal.taskId)
    : null

  const handleSave = (data) => {
    if (!modal) return false

    if (modal.taskId) {
      return updateTask(modal.taskId, data)
    }

    return addTask(data.columnId, data)
  }

  return (
    <>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>ВАША ДОСКА</span>
          <h2>Задачи по этапам</h2>
        </div>

        <span className={styles.count}>
          Колонок: {columns.length}
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
                onAddTask={(columnId) =>
                  setModal({ columnId, taskId: null })
                }
                onEditTask={(taskId) =>
                  setModal({ taskId })
                }
              />
            )
          })}
        </div>
      )}

      {modal && columns.length > 0 && (
        <TaskFormModal
          key={modal.taskId ?? `new-${modal.columnId}`}
          task={editingTask}
          columns={columns}
          defaultColumnId={
            editingTask?.columnId ??
            modal.columnId ??
            columns[0].id
          }
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

export default Board