function getWeekRange() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: monday, end: sunday }
}

function formatWeekLabel(start, end) {
  const opts = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('pt-BR', opts)} — ${end.toLocaleDateString('pt-BR', opts)}`
}

function formatDateBR(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return ''
  return `${parts[2]}/${parts[1]}`
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

function getCongratsMessage(doneCount) {
  if (doneCount >= 5) return 'Incrível! Continua nesse ritmo'
  if (doneCount >= 3) return 'Muito bem! Keep going'
  if (doneCount >= 1) return 'Parabéns! Mais uma concluída'
  return null
}

export default function HomeView({ tasks, goals, plans, directions }) {
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const weekLabel = formatWeekLabel(weekStart, weekEnd)

  const allTasks = Array.isArray(tasks) ? tasks : []
  const allGoals = Array.isArray(goals) ? goals : []
  const allDirections = Array.isArray(directions) ? directions : []

  const pending = allTasks.filter(t => !t.completed)
  const done = allTasks.filter(t => t.completed)
  const total = allTasks.length
  const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0

  const upcoming = allTasks
    .filter(t => !t.completed && t.dueDate)
    .map(t => ({ ...t, _days: daysUntil(t.dueDate) }))
    .filter(t => t._days !== null && t._days >= 0 && t._days <= 7)
    .sort((a, b) => a._days - b._days)

  const overdue = allTasks
    .filter(t => !t.completed && t.dueDate)
    .map(t => ({ ...t, _days: daysUntil(t.dueDate) }))
    .filter(t => t._days !== null && t._days < 0)

  const activeGoals = allGoals.filter(g => g.status === 'active')

  const teamMembers = ['Karol', 'Gabi', 'Chris']
  const teamStats = teamMembers.map(member => {
    const memberTasks = allTasks.filter(t => t.responsible === member)
    const weekTasks = memberTasks.filter(t => {
      if (!t.executionDate) return false
      return t.executionDate >= weekStartStr && t.executionDate <= weekEndStr
    })
    const doneThisWeek = weekTasks.filter(t => t.completed).length
    const totalThisWeek = weekTasks.length
    const doneAll = memberTasks.filter(t => t.completed).length
    const totalAll = memberTasks.length
    const weekPct = totalThisWeek > 0 ? Math.round((doneThisWeek / totalThisWeek) * 100) : 0
    return { member, doneThisWeek, totalThisWeek, doneAll, totalAll, weekPct }
  })

  const STATUS_COLORS = {
    active: '#10b981',
    'not-started': '#666666',
    paused: '#f59e0b',
    completed: '#3b82f6',
    abandoned: '#ef4444',
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto px-8 py-6 gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>Olá, equipe 👋</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Resumo da semana • {weekLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{completionRate}%</p>
          <p className="text-[11px] m-0" style={{ color: 'var(--color-text-muted)' }}>conclusão geral</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Pendentes */}
        <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>TAREFAS PENDENTES</span>
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: pending.length > 0 ? '#f59e0b' : '#10b981' }}></div>
          </div>
          <p className="text-[36px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{pending.length}</p>
          <div className="flex items-center gap-4">
            <div className="h-[4px] flex-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div className="h-full rounded-full" style={{ width: `${completionRate}%`, background: 'var(--color-text-primary)' }}></div>
            </div>
            <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{done.length} concluída{done.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Prazos */}
        <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>PRAZOS NA SEMANA</span>
            {overdue.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: '#ef444420', color: '#ef4444' }}>
                {overdue.length} atrasada{overdue.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-[36px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{upcoming.length}</p>
          <p className="text-[11px] m-0" style={{ color: 'var(--color-text-muted)' }}>com prazo nos próximos 7 dias</p>
        </div>
      </div>

      {/* Lista prazos */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: '#f59e0b' }}></div>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Próximos prazos</span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {upcoming.map((t, i) => {
              const isToday = t._days === 0
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{
                    background: 'var(--color-bg-surface)',
                    borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-row-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-surface)' }}
                >
                  <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: isToday ? '#ef4444' : '#f59e0b' }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate m-0" style={{ color: 'var(--color-text-primary)' }}>{t.title}</p>
                    {t.responsible ? (
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.responsible}</span>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: isToday ? '#ef4444' : 'var(--color-text-secondary)' }}>
                    {isToday ? 'Hoje' : `Em ${t._days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Atividade por responsável */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-[8px] h-[8px] rounded-full" style={{ background: '#6366f1' }}></div>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Atividade por responsável</span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>— semana de {weekLabel}</span>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {teamStats.map(({ member, doneThisWeek, totalThisWeek, doneAll, totalAll, weekPct }) => {
            const congrats = getCongratsMessage(doneThisWeek)
            return (
              <div key={member} className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[14px] font-bold"
                    style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                  >
                    {member.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold m-0" style={{ color: 'var(--color-text-primary)' }}>{member}</p>
                    <p className="text-[10px] m-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{doneAll}/{totalAll} no total</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>ESSA SEMANA</span>
                    <span className="text-[16px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{doneThisWeek}/{totalThisWeek}</span>
                  </div>
                  <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${weekPct}%`, background: '#6366f1' }}></div>
                  </div>
                  {totalThisWeek === 0 && (
                    <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-label)' }}>Nenhuma tarefa agendada</p>
                  )}
                </div>
                {congrats ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#10b98115', border: '1px solid #10b98130' }}>
                    <span className="text-[14px]">🎉</span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{congrats}</span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Metas ativas */}
      {activeGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: '#10b981' }}></div>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Metas ativas</span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {activeGoals.map(g => {
              const progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0
              const dir = allDirections.find(d => d.id === g.directionId)
              const dirColor = dir ? dir.color : '#10b981'
              const statusColor = STATUS_COLORS[g.status] || '#666'
              return (
                <div key={g.id} className="rounded-xl p-5" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[14px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{g.title}</h4>
                      {dir ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: dirColor + '20', color: dirColor }}>{dir.title}</span>
                      ) : null}
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: statusColor + '20', color: statusColor }}>{g.status}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>{g.quarter}</span>
                    </div>
                    <span className="text-[18px] font-bold flex-shrink-0 ml-2" style={{ color: dirColor }}>{progress}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{g.metric}: {g.currentValue} / {g.targetValue}</span>
                    {g.deadline ? (
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Prazo: {formatDateBR(g.deadline)}</span>
                    ) : null}
                  </div>
                  <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: dirColor }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}