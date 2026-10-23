import { useState } from 'react'
import {
    FiArrowLeft,
    FiArrowRight,
    FiEdit2,
    FiPlus,
    FiTrash2,
} from 'react-icons/fi'
import { useBoardStore } from '../store/useBoardStore'
import { DRAG_TASK_TYPE } from '../utils/task'
import TaskCard from './TaskCard'
import styles from './Column.module.scss'

function Column({
    column,
    index,
    columns,
    allTasks,
    visibleTasks,
    canReorderTasks,
    onAddTask,
    onEditTask,
}) {
    const [isDragOver, setIsDragOver] = useState(false)

    const renameColumn = useBoardStore(
        (state) => state.renameColumn,
    )
    const deleteColumn = useBoardStore(
        (state) => state.deleteColumn,
    )
    const moveColumn = useBoardStore(
        (state) => state.moveColumn,
    )
    const moveTaskToColumn = useBoardStore(
        (state) => state.moveTaskToColumn,
    )

    const handleRename = () => {
        const title = window.prompt(
            'Новое название колонки:',
            column.title,
        )

        if (title !== null) {
            renameColumn(column.id, title)
        }
    }

    const handleDelete = () => {
        if (
            window.confirm(
                `Удалить пустую колонку «${column.title}»?`,
            )
        ) {
            deleteColumn(column.id)
        }
    }

    const hasDraggedTask = (event) =>
        Array.from(event.dataTransfer.types).includes(
            DRAG_TASK_TYPE,
        )

    const handleDragOver = (event) => {
        if (!hasDraggedTask(event)) return

        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'

        if (!isDragOver) {
            setIsDragOver(true)
        }
    }

    const handleDragLeave = (event) => {
        const nextTarget = event.relatedTarget

        if (
            !(
                nextTarget instanceof Node &&
                event.currentTarget.contains(nextTarget)
            )
        ) {
            setIsDragOver(false)
        }
    }

    const handleDrop = (event) => {
        if (!hasDraggedTask(event)) return

        event.preventDefault()
        setIsDragOver(false)

        const taskId = event.dataTransfer.getData(
            DRAG_TASK_TYPE,
        )

        if (taskId) {
            moveTaskToColumn(taskId, column.id)
        }
    }

    return (
        <section
            className={`${styles.column} ${
                isDragOver ? styles.dropTarget : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <header className={styles.header}>
                <div className={styles.title}>
                    <span
                        className={styles.marker}
                        aria-hidden="true"
                    />
                    <h2>{column.title}</h2>
                    <span className={styles.count}>
                        {allTasks.length}
                    </span>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() =>
                            moveColumn(column.id, -1)
                        }
                        disabled={index === 0}
                        title="Переместить колонку влево"
                        aria-label={`Переместить колонку ${column.title} влево`}
                    >
                        <FiArrowLeft aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            moveColumn(column.id, 1)
                        }
                        disabled={
                            index === columns.length - 1
                        }
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
                                ? 'Сначала переместите или удалите задачи'
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
                className={styles.addButton}
                onClick={() => onAddTask(column.id)}
                title={`Добавить задачу в колонку ${column.title}`}
                aria-label={`Добавить задачу в колонку ${column.title}`}
            >
                <FiPlus aria-hidden="true" />
                Добавить задачу
            </button>

            <div className={styles.taskList}>
                {visibleTasks.length === 0 && (
                    <p
                        className={
                            allTasks.length === 0
                                ? styles.emptyColumn
                                : styles.emptyMessage
                        }
                    >
                        {allTasks.length === 0
                            ? 'Нет задач'
                            : 'Нет совпадений с фильтрами'}
                    </p>
                )}

                {visibleTasks.map((task, taskIndex) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        columns={columns}
                        columnIndex={index}
                        taskIndex={taskIndex}
                        tasksCount={visibleTasks.length}
                        canReorderTasks={canReorderTasks}
                        onEdit={onEditTask}
                    />
                ))}
            </div>

            {!canReorderTasks &&
                visibleTasks.length > 1 && (
                    <p className={styles.hint}>
                        Чтобы изменить порядок задач,
                        выберите сортировку «Вручную»
                        и очистите фильтры.
                    </p>
                )}
        </section>
    )
}

export default Column