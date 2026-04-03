
import type { Task, TaskStatus } from './types'

const STORAGE_KEY = 'planp_tasks'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function addTask(tasks: Task[], title: string, date: string, status: TaskStatus = 'todo'): Task[] {
  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    status,
    date,
    createdAt: Date.now(),
  }
  const updated = [...tasks, newTask]
  saveTasks(updated)
  return updated
}

export function updateTaskStatus(tasks: Task[], id: string, status: TaskStatus): Task[] {
  const updated = tasks.map(t => (t.id === id ? { ...t, status } : t))
  saveTasks(updated)
  return updated
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  const updated = tasks.filter(t => t.id !== id)
  saveTasks(updated)
  return updated
}

export function getTasksByDate(tasks: Task[], date: string): Task[] {
  return tasks.filter(t => t.date === date)
}

/** 달력에 표시할 날짜별 '하는중' 개수 반환 */
export function getInProgressCountByDate(tasks: Task[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of tasks) {
    if (t.status === 'inprogress') {
      map[t.date] = (map[t.date] ?? 0) + 1
    }
  }
  return map
}
