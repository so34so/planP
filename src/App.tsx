import { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import TaskBoard from './components/TaskBoard'
import type { Task } from './types'
import { loadTasks, getTasksByDate, getInProgressCountByDate } from './store'
import './App.css'

function App() {
  const [tasks, setTasks]             = useState<Task[]>([])
  const [loading, setLoading]         = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  /* 앱 시작 시 Firestore에서 전체 태스크 로드 */
  useEffect(() => {
    loadTasks().then(data => {
      setTasks(data)
      setLoading(false)
    })
  }, [])

  const badgeDates = getInProgressCountByDate(tasks)
  const dateTasks  = selectedDate ? getTasksByDate(tasks, selectedDate) : []

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="loading-box">
          <div className="loading-spinner" />
          <p className="loading-text">일정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <Calendar
        onSelectDate={setSelectedDate}
        badgeDates={badgeDates}
      />

      {selectedDate && (
        <TaskBoard
          date={selectedDate}
          tasks={dateTasks}
          allTasks={tasks}
          onClose={() => setSelectedDate(null)}
          onTasksChange={setTasks}
        />
      )}
    </div>
  )
}

export default App
