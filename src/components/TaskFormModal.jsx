import { useEffect, useId, useRef, useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import styles from './TaskFormModal.module.scss'

const makeForm = (task, defaultColumnId) => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  columnId: task?.columnId ?? defaultColumnId,
  priority: task?.priority ?? 'medium',
  dueDate: task?.dueDate ?? '',
  tags: task?.tags?.join(', ') ?? '',
})

function TaskFormModal({
  task,
  columns,
  defaultColumnId,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() => makeForm(task, defaultColumnId))
  const dialogRef = useRef(null)
  const titleId = useId()
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const dialog = dialogRef.current

    if (dialog && !dialog.open) dialog.showModal()

    return () => {
      if (dialog?.open) dialog.close()
      previousFocusRef.current?.focus?.()
    }
  }, [])

  const changeField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return

    if (onSave(form)) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.heading}>
        <h2 id={titleId}>
          {task ? 'Редактировать задачу' : 'Новая задача'}
        </h2>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          title="Закрыть форму"
          aria-label="Закрыть форму задачи"
        >
          <FiX aria-hidden="true" />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Название *
          <input
            value={form.title}
            onChange={changeField('title')}
            maxLength={120}
            placeholder="Название задачи"
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
            rows={4}
            placeholder="Добавьте подробности..."
          />
        </label>

        <label>
          Колонка *
          <select
            value={form.columnId}
            onChange={changeField('columnId')}
            required
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
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

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveButton}
            title={task ? 'Сохранить изменения' : 'Добавить задачу'}
            aria-label={task ? 'Сохранить изменения задачи' : 'Добавить задачу'}
          >
            <FiCheck aria-hidden="true" />
            {task ? 'Сохранить' : 'Добавить'}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            title="Отменить изменения"
            aria-label="Отменить и закрыть форму задачи"
          >
            <FiX aria-hidden="true" />
            Отмена
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default TaskFormModal