import { useState } from 'react'
import Calendar from './components/Calendar'
import TaskBoard from './components/TaskBoard'
import type { Task } from './types'
import { loadTasks, getTasksByDate, getInProgressCountByDate } from './store'
import './App.css'

function App() {
  const [tasks, setTasks]           = useState<Task[]>(loadTasks)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const badgeDates = getInProgressCountByDate(tasks)
  const dateTasks  = selectedDate ? getTasksByDate(tasks, selectedDate) : []

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
