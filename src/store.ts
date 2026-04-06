/**
 * store.ts
 * Firebase Firestore를 사용하여 데이터를 관리합니다.
 *
 * Firestore 컬렉션 구조:
 *   tasks (컬렉션)
 *     └─ {taskId} (문서)
 *           ├─ id: string
 *           ├─ title: string
 *           ├─ status: 'todo' | 'inprogress' | 'done'
 *           ├─ date: string  (YYYY-MM-DD)
 *           └─ createdAt: number
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Task, TaskStatus } from './types'

const COLLECTION = 'tasks'

/* ─────────────────────────────────────────
   전체 태스크 불러오기
───────────────────────────────────────── */
export async function loadTasks(): Promise<Task[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data() as Task)
  } catch (e) {
    console.error('[loadTasks] Firestore 읽기 실패:', e)
    return []
  }
}

/* ─────────────────────────────────────────
   태스크 추가
───────────────────────────────────────── */
export async function addTask(
  tasks: Task[],
  title: string,
  date: string,
  status: TaskStatus = 'todo',
): Promise<Task[]> {
  try {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status,
      date,
      createdAt: Date.now(),
    }
    // Firestore에 저장 (문서 ID = task.id)
    await addDoc(collection(db, COLLECTION), newTask)
    return [...tasks, newTask]
  } catch (e) {
    console.error('[addTask] Firestore 쓰기 실패:', e)
    return tasks
  }
}

/* ─────────────────────────────────────────
   태스크 상태 변경 (드래그앤드롭)
───────────────────────────────────────── */
export async function updateTaskStatus(
  tasks: Task[],
  id: string,
  status: TaskStatus,
): Promise<Task[]> {
  try {
    // id 필드로 문서 찾기
    const q = query(collection(db, COLLECTION))
    const snapshot = await getDocs(q)
    const target = snapshot.docs.find(d => d.data().id === id)
    if (target) {
      await updateDoc(doc(db, COLLECTION, target.id), { status })
    }
    return tasks.map(t => (t.id === id ? { ...t, status } : t))
  } catch (e) {
    console.error('[updateTaskStatus] Firestore 업데이트 실패:', e)
    return tasks
  }
}

/* ─────────────────────────────────────────
   태스크 삭제
───────────────────────────────────────── */
export async function deleteTask(tasks: Task[], id: string): Promise<Task[]> {
  try {
    const q = query(collection(db, COLLECTION))
    const snapshot = await getDocs(q)
    const target = snapshot.docs.find(d => d.data().id === id)
    if (target) {
      await deleteDoc(doc(db, COLLECTION, target.id))
    }
    return tasks.filter(t => t.id !== id)
  } catch (e) {
    console.error('[deleteTask] Firestore 삭제 실패:', e)
    return tasks
  }
}

/* ─────────────────────────────────────────
   날짜별 태스크 필터
───────────────────────────────────────── */
export function getTasksByDate(tasks: Task[], date: string): Task[] {
  return tasks.filter(t => t.date === date)
}

/* ─────────────────────────────────────────
   달력 뱃지용 - 날짜별 '하는 중' 개수
───────────────────────────────────────── */
export function getInProgressCountByDate(tasks: Task[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of tasks) {
    if (t.status === 'inprogress') {
      map[t.date] = (map[t.date] ?? 0) + 1
    }
  }
  return map
}
