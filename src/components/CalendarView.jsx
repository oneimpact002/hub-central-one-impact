import { useState } from 'react'

export default function CalendarView({ tasks, onOpenModal, onUpdateTask }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [calendarMode, setCalendarMode] = useState('dueDate')
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverDay, setDragOverDay] = useState(null)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getTasksForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasks.filter(t => t[calendarMode] === dateStr)
  }

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, day) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDay(day)
  }

  const handleDragLeave = () => setDragOverDay(null)

  const handleDrop = (e, day) => {
    e.preventDefault()
    setDragOverDay(null)
    if (!draggedTask) return
    const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onUpdateTask(draggedTask.id, { [calendarMode]: newDate })
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverDay(null)
  }

  const upcoming = tasks
    .filter(t => !t.completed && t[calendarMode])
    .sort((a, b) => (a[calendarMode] || '').localeCompare(b[calendarMode] || ''))
    .slice(0, 15)

  const noDate = tasks.filter(t => !t.completed && !t[calendarMode])

  const formatDate = (d) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return `${day}/${m}`
  }

  const isOverdue = (d) => {
    if (!d) return false
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return d < todayStr
  }

  return (
    <div className="calendar-view flex flex-1 overflow-hidden">
      {/* Calendário — 70% */}
      <div className="flex-[7] overflow-auto p-6 flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Modo toggle */}
        <div className="flex items-center gap-1 mb-4 rounded-lg p-1" style={{ background: '#272431' }}>
          <button
            onClick={() => setCalendarMode('dueDate')}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md border-none cursor-pointer transition-colors"
            style={{
              background: calendarMode === 'dueDate' ? '#503FB6' : 'transparent',
              color: calendarMode === 'dueDate' ? '#ffffff' : 'rgba(255,255,255,0.5)',
            }}
          >
            Prazo
          </button>
          <button
            onClick={() => setCalendarMode('executionDate')}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md border-none cursor-pointer transition-colors"
            style={{
              background: calendarMode === 'executionDate' ? '#503FB6' : 'transparent',
              color: calendarMode === 'executionDate' ? '#ffffff' : 'rgba(255,255,255,0.5)',
            }}
          >
            Execução
          </button>
        </div>

        {/* Header mês */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="border-none cursor-pointer p-2 rounded-lg" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
            ←
          </button>
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="border-none cursor-pointer p-2 rounded-lg" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
            →
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold py-2 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {d.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Grid dias */}
        <div className="grid grid-cols-7 flex-1 gap-[1px]" style={{ background: 'var(--color-border)' }}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: 'var(--color-bg-main)' }}></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayTasks = getTasksForDay(day)
            const isDragOver = dragOverDay === day
            return (
              <div
                key={day}
                className="min-h-[80px] p-1.5 flex flex-col transition-colors"
                style={{
                  background: isDragOver ? 'var(--color-bg-row-hover)' : 'var(--color-bg-surface)',
                  outline: isDragOver ? '2px solid var(--color-text-muted)' : 'none',
                  outlineOffset: '-2px',
                }}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                <span
                  className={`text-[12px] w-[24px] h-[24px] flex items-center justify-center rounded-full mb-1 ${isToday(day) ? 'font-bold' : ''}`}
                  style={{
                    color: isToday(day) ? '#111111' : 'var(--color-text-secondary)',
                    background: isToday(day) ? '#cccccc' : 'transparent',
                  }}
                >
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map(t => (
                    <div
                      key={t.id}
                      className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer"
                      style={{ background: 'rgba(255,255,255,.06)', color: 'var(--color-text-secondary)' }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => { e.stopPropagation(); onOpenModal(t) }}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>+{dayTasks.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista — 30% */}
      <div className="flex-[3] overflow-auto p-5 flex flex-col">
        <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {calendarMode === 'dueDate' ? 'Próximos Prazos' : 'Próximas Execuções'}
        </h3>
        <div className="flex flex-col gap-[2px]">
          {upcoming.length === 0 && (
            <p className="text-[12px]" style={{ color: 'var(--color-text-label)' }}>Nenhuma tarefa com data definida.</p>
          )}
          {upcoming.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onClick={(e) => { e.stopPropagation(); onOpenModal(t) }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-surface)'}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] truncate m-0" style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                {task.responsible && (
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{task.responsible}</span>
                )}
              </div>
              <span
                className="text-[11px] font-medium flex-shrink-0"
                style={{ color: isOverdue(task[calendarMode]) ? '#888888' : 'var(--color-text-secondary)' }}
              >
                {formatDate(task[calendarMode])}
              </span>
            </div>
          ))}
        </div>

        {noDate.length > 0 && (
          <>
            <h3 className="text-[13px] font-semibold mb-3 mt-6" style={{ color: 'var(--color-text-primary)' }}>
              Sem data
            </h3>
            <div className="flex flex-col gap-[2px]">
              {noDate.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => { e.stopPropagation(); onOpenModal(t) }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-surface)'}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] truncate m-0" style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                    {task.responsible && (
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{task.responsible}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}