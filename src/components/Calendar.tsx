import React, { useState } from 'react'

interface Props {
  onSelectDate: (date: string) => void
  badgeDates: Record<string, number> // 날짜별 '하는중' 개수
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function Calendar({ onSelectDate, badgeDates }: Props) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  return (
    <div className="calendar">
      {/* 헤더 */}
      <div className="cal-header">
        <button className="nav-btn" onClick={prevMonth}>&#8249;</button>
        <h1 className="cal-title">{year}년 {month + 1}월</h1>
        <button className="nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>

      {/* 그리드 */}
      <div className="cal-grid">
        {DAYS.map((d, i) => (
          <div key={d} className={`day-label ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`}>{d}</div>
        ))}

        {cells.map((d, i) => {
          const col = i % 7
          const dateStr = d !== null ? toDateStr(year, month, d) : ''
          const badge = d !== null ? (badgeDates[dateStr] ?? 0) : 0

          const cls = [
            'day-cell',
            d === null ? 'empty' : 'clickable',
            d !== null && isToday(d) ? 'today' : '',
            col === 0 ? 'sunday' : col === 6 ? 'saturday' : '',
          ].join(' ')

          return (
            <div
              key={i}
              className={cls}
              onClick={() => d !== null && onSelectDate(dateStr)}
            >
              {d !== null && (
                <>
                  <span className="day-num">{d}</span>
                  {badge > 0 && (
                    <span className="day-badge">{badge}</span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
