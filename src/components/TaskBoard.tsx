import React, { useState } from 'react'
import type { Task, TaskStatus } from '../types'
import { addTask, updateTaskStatus, deleteTask } from '../store'

interface Props {
  date: string
  tasks: Task[]
  allTasks: Task[]
  onClose: () => void
  onTasksChange: (tasks: Task[]) => void
}

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo',       label: '할 일',   color: '#6b7280' },
  { key: 'inprogress', label: '하는 중', color: '#f59e0b' },
  { key: 'done',       label: '완료',    color: '#10b981' },
]

export default function TaskBoard({ date, tasks, allTasks, onClose, onTasksChange }: Props) {
  const [inputText, setInputText]   = useState('')
  const [addingTo, setAddingTo]     = useState<TaskStatus | null>(null)
  const [dragId, setDragId]         = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const [saving, setSaving]         = useState(false)

  const displayDate = (() => {
    const [y, m, d] = date.split('-').map(Number)
    return `${y}년 ${m}월 ${d}일`
  })()

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status)

  /* ── 추가 ── */
  async function handleAdd(status: TaskStatus) {
    if (!inputText.trim() || saving) return
    setSaving(true)
    const updated = await addTask(allTasks, inputText.trim(), date, status)
    onTasksChange(updated)
    setInputText('')
    setAddingTo(null)
    setSaving(false)
  }

  /* ── 삭제 ── */
  async function handleDelete(id: string) {
    if (saving) return
    setSaving(true)
    const updated = await deleteTask(allTasks, id)
    onTasksChange(updated)
    setSaving(false)
  }

  /* ── 드래그앤드롭 ── */
  function onDragStart(id: string) { setDragId(id) }
  function onDragEnd() { setDragId(null); setDragOverCol(null) }

  async function onDrop(status: TaskStatus) {
    if (!dragId || saving) return
    setSaving(true)
    const updated = await updateTaskStatus(allTasks, dragId, status)
    onTasksChange(updated)
    setDragId(null)
    setDragOverCol(null)
    setSaving(false)
  }

  return (
    <div className="board-overlay" onClick={onClose}>
      <div className="board-modal" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="board-header">
          <h2 className="board-date">{displayDate} 일정</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {saving && <span className="saving-indicator">저장 중...</span>}
            <button className="board-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* 칸반 컬럼 */}
        <div className="board-columns">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              className={`board-col ${dragOverCol === col.key ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDragLeave={() => setDragOverCol(col.key === dragOverCol ? null : dragOverCol)}
              onDrop={() => onDrop(col.key)}
            >
              {/* 컬럼 헤더 */}
              <div className="col-header">
                <span className="col-dot" style={{ background: col.color }} />
                <span className="col-label">{col.label}</span>
                <span className="col-count">{tasksByStatus(col.key).length}</span>
              </div>

              {/* 카드 영역 */}
              <div className="col-body">
                {tasksByStatus(col.key).map(task => (
                  <div
                    key={task.id}
                    className={`task-card ${dragId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onDragEnd={onDragEnd}
                  >
                    <span className="task-title">{task.title}</span>
                    <button
                      className="task-delete"
                      onClick={() => handleDelete(task.id)}
                      title="삭제"
                      disabled={saving}
                    >✕</button>
                  </div>
                ))}

                {/* 입력창 */}
                {addingTo === col.key ? (
                  <div className="task-input-box">
                    <input
                      autoFocus
                      className="task-input"
                      placeholder="일정 입력..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAdd(col.key)
                        if (e.key === 'Escape') { setAddingTo(null); setInputText('') }
                      }}
                      disabled={saving}
                    />
                    <div className="task-input-actions">
                      <button className="btn-confirm" onClick={() => handleAdd(col.key)} disabled={saving}>
                        {saving ? '저장 중' : '추가'}
                      </button>
                      <button className="btn-cancel" onClick={() => { setAddingTo(null); setInputText('') }} disabled={saving}>취소</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-add-task" onClick={() => setAddingTo(col.key)} disabled={saving}>
                    + 일정 추가
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
