export type TaskStatus = 'todo' | 'inprogress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  date: string // 'YYYY-MM-DD'
  createdAt: number
}
