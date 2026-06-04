import { useState, useRef, useEffect, createContext, useContext } from 'react'
import TaskItem from './TaskItem'

const TaskColWidthContext = createContext(480)
export const useTaskColWidth = () => useContext(TaskColWidthContext)

const priorityOrder = { hoje: 0, 'essa-semana': 1, 'proxima-semana': 2, 'qualquer-momento': 3 }
const priorityLabels = { hoje: 'Hoje', 'essa-semana': 'Esta Semana', 'proxima-semana': 'Próxima Semana', 'qualquer-momento': 'Qualquer Momento' }

export default function TaskList({ tasks, properties, plans, teamMembers, onToggle, onDelete, onOpenModal }) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [groupBy, setGroupBy] = useState('none')
  const [filterResponsible, setFilterResponsible] = useState('')
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('taskColumnOrder')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === properties.length) return parsed
      } catch { /* ignore */ }
    }
    return properties.map(p => p.id)
  })
  const [taskColWidth, setTaskColWidth] = useState(() => {
    const saved = localStorage.getItem('taskColWidth')
    const n = saved ? Number(saved) : 480
    return n >= 200 && n <= 1200 ? n : 480
  })
  const [visibility, setVisibility] = useState(() => {
    const saved = localStorage.getItem('taskColumns')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    return properties.reduce((acc, p) => ({ ...acc, [p.id]: p.visible }), {})
  })
  const columnsRef = useRef(null)
  const groupRef = useRef(null)
  const filterRef = useRef(null)
  const [draggedColId, setDraggedColId] = useState(null)
  const [dragOverColId, setDragOverColId] = useState(null)

  useEffect(() => {
    localStorage.setItem('taskColumns', JSON.stringify(visibility))
  }, [visibility])

  useEffect(() => {
    localStorage.setItem('taskColumnOrder', JSON.stringify(columnOrder))
  }, [columnOrder])

  useEffect(() => {
    localStorage.setItem('taskColWidth', String(taskColWidth))
  }, [taskColWidth])

  // Resize handle para a coluna TAREFA
  const resizeState = useRef({ active: false, startX: 0, startW: 0 })
  const onResizeMouseDown = (e) => {
    resizeState.current = { active: true, startX: e.clientX, startW: taskColWidth }
    e.preventDefault()
    e.stopPropagation()
  }
  useEffect(() => {
    const onMove = (e) => {
      if (!resizeState.current.active) return
      const dx = e.clientX - resizeState.current.startX
      const next = Math.min(1200, Math.max(200, resizeState.current.startW + dx))
      setTaskColWidth(next)
    }
    const onUp = () => { resizeState.current.active = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('taskColumns', JSON.stringify(visibility))
  }, [visibility])

  useEffect(() => {
    const handler = (e) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target)) setColumnsOpen(false)
      if (groupRef.current && !groupRef.current.contains(e.target)) setGroupByOpen(false)
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleColumn = (id) => setVisibility(v => ({ ...v, [id]: !v[id] }))
  const visibleCount = Object.values(visibility).filter(Boolean).length

  // Colunas visíveis na ordem do columnOrder
  const orderedVisibleProperties = columnOrder
    .map(id => properties.find(p => p.id === id))
    .filter(p => p && visibility[p.id])

  // Drag & drop handlers
  const handleColDragStart = (e, id) => {
    setDraggedColId(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleColDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedColId && draggedColId !== id) setDragOverColId(id)
  }
  const handleColDragLeave = () => setDragOverColId(null)
  const handleColDrop = (e, targetId) => {
    e.preventDefault()
    setDragOverColId(null)
    if (!draggedColId || draggedColId === targetId) { setDraggedColId(null); return }
    const next = [...columnOrder]
    const fromIdx = next.indexOf(draggedColId)
    const toIdx = next.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) { setDraggedColId(null); return }
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, draggedColId)
    setColumnOrder(next)
    setDraggedColId(null)
  }
  const handleColDragEnd = () => {
    setDraggedColId(null)
    setDragOverColId(null)
  }

  const [groupByOpen, setGroupByOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  // Filter tasks
  const filtered = filterResponsible
    ? tasks.filter(t => t.responsible === filterResponsible)
    : tasks

  const pending = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  const resolveContext = (task) => {
    if (!task.planId) return { planTitle: null, milestoneTitle: null }
    const plan = plans.find(p => p.id === task.planId)
    if (!plan) return { planTitle: null, milestoneTitle: null }
    const milestone = task.milestoneId ? plan.milestones.find(m => m.id === task.milestoneId) : null
    return { planTitle: plan.title, milestoneTitle: milestone?.title || null }
  }

  const getGrouped = () => {
    const groups = {}
    pending.forEach(t => {
      const key = t.priority || 'qualquer-momento'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups).sort((a, b) => (priorityOrder[a[0]] ?? 9) - (priorityOrder[b[0]] ?? 9))
  }

  const renderTasks = (taskList, isCompleted = false) => taskList.map((task, i) => {
    const { planTitle, milestoneTitle } = resolveContext(task)
    return (
      <TaskItem
        key={task.id}
        task={task}
        properties={properties}
        visibility={visibility}
        onToggle={onToggle}
        onDelete={onDelete}
        onOpenModal={onOpenModal}
        even={i % 2 === 0}
        planTitle={planTitle}
        milestoneTitle={milestoneTitle}
      />
    )
  })

  return (
    <TaskColWidthContext.Provider value={taskColWidth}>
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Tarefas
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {pending.length} pendente{pending.length !== 1 ? 's' : ''}
            {filterResponsible && <span> • {filterResponsible}</span>}
            {groupBy !== 'none' && <span> • agrupado por {groupBy === 'priority' ? 'prioridade' : groupBy}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Group by */}
          <div className="relative" ref={groupRef}>
            <button
              onClick={() => setGroupByOpen(!groupByOpen)}
              className="flex items-center gap-1.5 text-[12px] cursor-pointer rounded-lg px-3 py-2 border-none transition-colors"
              style={{
                background: groupBy !== 'none' ? 'var(--color-bg-active)' : 'var(--color-bg-input)',
                color: groupBy !== 'none' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              {groupBy === 'none' ? 'Agrupar' : groupBy === 'priority' ? 'Prioridade' : groupBy}
            </button>

            {groupByOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 rounded-lg p-2 z-50 min-w-[160px]"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px var(--color-shadow)' }}
              >
                <p className="text-[10px] font-bold tracking-wider px-1 pb-2" style={{ color: 'var(--color-text-muted)' }}>AGRUPAR POR</p>
                {[
                  { id: 'none', label: 'Nenhum' },
                  { id: 'priority', label: 'Prioridade' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setGroupBy(opt.id); setGroupByOpen(false) }}
                    className="w-full text-left px-2 py-1.5 rounded cursor-pointer border-none transition-colors text-[12px]"
                    style={{
                      background: groupBy === opt.id ? 'var(--color-bg-active)' : 'transparent',
                      color: groupBy === opt.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => { if (groupBy !== opt.id) e.currentTarget.style.background = 'var(--color-bg-row-hover)' }}
                    onMouseLeave={(e) => { if (groupBy !== opt.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter by responsible */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 text-[12px] cursor-pointer rounded-lg px-3 py-2 border-none transition-colors"
              style={{
                background: filterResponsible ? 'var(--color-bg-active)' : 'var(--color-bg-input)',
                color: filterResponsible ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {filterResponsible || 'Filtrar'}
            </button>

            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 rounded-lg p-2 z-50 min-w-[160px]"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px var(--color-shadow)' }}
              >
                <p className="text-[10px] font-bold tracking-wider px-1 pb-2" style={{ color: 'var(--color-text-muted)' }}>RESPONSÁVEL</p>
                <button
                  onClick={() => { setFilterResponsible(''); setFilterOpen(false) }}
                  className="w-full text-left px-2 py-1.5 rounded cursor-pointer border-none transition-colors text-[12px]"
                  style={{
                    background: !filterResponsible ? 'var(--color-bg-active)' : 'transparent',
                    color: !filterResponsible ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (filterResponsible) e.currentTarget.style.background = 'var(--color-bg-row-hover)' }}
                  onMouseLeave={(e) => { if (filterResponsible) e.currentTarget.style.background = 'transparent' }}
                >
                  Todos
                </button>
                {teamMembers.map(member => (
                  <button
                    key={member}
                    onClick={() => { setFilterResponsible(member); setFilterOpen(false) }}
                    className="w-full text-left px-2 py-1.5 rounded cursor-pointer border-none transition-colors text-[12px]"
                    style={{
                      background: filterResponsible === member ? 'var(--color-bg-active)' : 'transparent',
                      color: filterResponsible === member ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => { if (filterResponsible !== member) e.currentTarget.style.background = 'var(--color-bg-row-hover)' }}
                    onMouseLeave={(e) => { if (filterResponsible !== member) e.currentTarget.style.background = 'transparent' }}
                  >
                    {member}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column visibility */}
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setColumnsOpen(!columnsOpen)}
              className="flex items-center gap-1.5 text-[12px] cursor-pointer rounded-lg px-3 py-2 border-none transition-colors"
              style={{
                background: columnsOpen ? 'var(--color-bg-active)' : 'var(--color-bg-input)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Colunas ({visibleCount})
            </button>

            {columnsOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 rounded-lg p-2 z-50 min-w-[180px]"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px var(--color-shadow)' }}
              >
                <p className="text-[10px] font-bold tracking-wider px-1 pb-2" style={{ color: 'var(--color-text-muted)' }}>COLUNAS VISÍVEIS (arraste pra reordenar)</p>
                {columnOrder.map(id => {
                  const prop = properties.find(p => p.id === id)
                  if (!prop) return null
                  const isDragging = draggedColId === prop.id
                  const isDragOver = dragOverColId === prop.id
                  return (
                    <div
                      key={prop.id}
                      draggable
                      onDragStart={(e) => handleColDragStart(e, prop.id)}
                      onDragOver={(e) => handleColDragOver(e, prop.id)}
                      onDragLeave={handleColDragLeave}
                      onDrop={(e) => handleColDrop(e, prop.id)}
                      onDragEnd={handleColDragEnd}
                      className="flex items-center gap-2.5 px-1 py-1.5 rounded cursor-pointer transition-colors"
                      style={{
                        color: 'var(--color-text-secondary)',
                        opacity: isDragging ? 0.4 : 1,
                        outline: isDragOver ? '1.5px solid #503FB6' : 'none',
                        outlineOffset: '-1.5px',
                      }}
                      onMouseEnter={(e) => { if (!isDragging && !isDragOver) e.currentTarget.style.background = 'var(--color-bg-row-hover)' }}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span
                        style={{ color: 'var(--color-text-muted)', cursor: 'grab', fontSize: '12px', opacity: 0.5 }}
                        title="Arrastar"
                      >⋮⋮</span>
                      <div
                        className="w-[14px] h-[14px] rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
                        style={{
                          background: visibility[prop.id] ? 'var(--color-text-primary)' : 'transparent',
                          border: visibility[prop.id] ? 'none' : '1.5px solid var(--color-text-muted)',
                        }}
                        onClick={() => toggleColumn(prop.id)}
                      >
                        {visibility[prop.id] && (
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--color-bg-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] flex-1" style={{ color: visibility[prop.id] ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {prop.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenModal(null)}
            className="text-[13px] font-semibold cursor-pointer rounded-lg px-4 py-2 border-none transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)' }}
          >
            + Nova Tarefa
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-5">
        {groupBy === 'priority' ? (
          /* ═══ VIEW AGRUPADA POR PRIORIDADE ═══ */
          <div className="flex flex-col gap-6">
            {getGrouped().map(([priority, taskList]) => (
              <div key={priority}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                    style={{ background: priority === 'hoje' ? '#ef4444' : priority === 'essa-semana' ? '#f59e0b' : priority === 'proxima-semana' ? '#3b82f6' : '#666' }}
                  ></div>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {priorityLabels[priority] || priority}
                  </span>
                  <div className="flex-1 h-[1px]" style={{ background: 'var(--color-border)' }}></div>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{taskList.length}</span>
                </div>

                {/* Table */}
                <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 'max-content', minWidth: '100%' }}>
                    <div className="flex items-center px-4 py-2.5" style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
                      <span className="w-[40px] flex-shrink-0"></span>
                      <span
                        className="flex-shrink-0 text-[10px] font-semibold tracking-wider pr-4 relative"
                        style={{ color: 'var(--color-text-muted)', width: `${taskColWidth}px` }}
                      >
                        TAREFA
                        <span
                          onMouseDown={onResizeMouseDown}
                          className="absolute top-0 right-0 h-full cursor-col-resize"
                          style={{ width: '6px', marginRight: '-3px', zIndex: 5 }}
                          title="Arraste para ajustar a largura"
                        />
                      </span>
                      {orderedVisibleProperties.map(prop => (
                        <span key={prop.id} className="w-[140px] flex-shrink-0 text-[10px] font-semibold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{prop.label.toUpperCase()}</span>
                      ))}
                      <span className="w-[50px] flex-shrink-0"></span>
                    </div>
                    {taskList.map((task, i) => {
                      const { planTitle, milestoneTitle } = resolveContext(task)
                      return (
                        <TaskItem
                          key={task.id}
                          task={task}
                          properties={orderedVisibleProperties}
                          visibility={visibility}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onOpenModal={onOpenModal}
                          even={i % 2 === 0}
                          planTitle={planTitle}
                          milestoneTitle={milestoneTitle}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
            {getGrouped().length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-label)' }}>Nenhuma tarefa encontrada.</p>
            )}
          </div>
        ) : (
          /* ═══ VIEW PADRÃO (TABELA) ═══ */
          <>
            <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--color-border)' }}>
              <div style={{ width: 'max-content', minWidth: '100%' }}>
                <div
                  className="flex items-center px-4 py-3"
                  style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}
                >
                  <span className="w-[40px] flex-shrink-0"></span>
                  <span
                    className="flex-shrink-0 text-[11px] font-semibold tracking-wider pr-4 relative"
                    style={{ color: 'var(--color-text-primary)', width: `${taskColWidth}px` }}
                  >
                    TAREFA
                    {/* Handle de resize */}
                    <span
                      onMouseDown={onResizeMouseDown}
                      className="absolute top-0 right-0 h-full cursor-col-resize"
                      style={{ width: '6px', marginRight: '-3px', zIndex: 5 }}
                      title="Arraste para ajustar a largura"
                    />
                  </span>
                  {orderedVisibleProperties.map(prop => (
                    <span key={prop.id} className="w-[120px] flex-shrink-0 text-[11px] font-semibold tracking-wider" style={{ color: 'var(--color-text-primary)' }}>{prop.label.toUpperCase()}</span>
                  ))}
                  <span className="w-[50px] flex-shrink-0"></span>
                </div>

                {pending.map((task, i) => {
                  const { planTitle, milestoneTitle } = resolveContext(task)
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      properties={orderedVisibleProperties}
                      visibility={visibility}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onOpenModal={onOpenModal}
                      even={i % 2 === 0}
                      planTitle={planTitle}
                      milestoneTitle={milestoneTitle}
                    />
                  )
                })}
                {pending.length === 0 && (
                  <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-label)' }}>Nenhuma tarefa encontrada.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="bg-transparent border-none text-xs cursor-pointer transition-colors flex items-center gap-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span>{showCompleted ? '▾' : '▸'}</span>
              <span>{completed.length} concluída{completed.length !== 1 ? 's' : ''}</span>
            </button>

            {showCompleted && (
              <div
                className="rounded-xl overflow-x-auto mt-3"
                style={{ border: '1px solid var(--color-border)', opacity: 0.6 }}
              >
                <div style={{ width: 'max-content', minWidth: '100%' }}>
                  {completed.map((task, i) => {
                    const { planTitle, milestoneTitle } = resolveContext(task)
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        properties={orderedVisibleProperties}
                        visibility={visibility}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onOpenModal={onOpenModal}
                        even={i % 2 === 0}
                        planTitle={planTitle}
                        milestoneTitle={milestoneTitle}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </TaskColWidthContext.Provider>
  )
}