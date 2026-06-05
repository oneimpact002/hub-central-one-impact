import { useState, useRef } from 'react'

const statusOptions = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'paused', label: 'Pausados' },
  { id: 'completed', label: 'Concluídos' },
  { id: 'archived', label: 'Arquivados' },
]

const statusLabels = {
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  archived: 'Arquivado',
}

const taskStatusMeta = {
  'para fazer':             { label: 'Para fazer',             color: '#94a3b8' },
  'fazendo':                { label: 'Fazendo',                color: '#3b82f6' },
  'feito':                  { label: 'Feito',                  color: '#10b981' },
  'precisa de aprovação':   { label: 'Precisa de aprovação',   color: '#a855f7' },
  'precisa de aprovacao':   { label: 'Precisa de aprovação',   color: '#a855f7' },
  'aguardando':             { label: 'Aguardando',             color: '#f59e0b' },
  'cancelado':              { label: 'Cancelado',              color: '#6b7280' },
  // aliases de compatibilidade (status antigos)
  'pendente':               { label: 'Para fazer',             color: '#94a3b8' },
  'em progresso':           { label: 'Fazendo',                color: '#3b82f6' },
  'em andamento':           { label: 'Fazendo',                color: '#3b82f6' },
  'concluido':              { label: 'Feito',                  color: '#10b981' },
  'concluído':              { label: 'Feito',                  color: '#10b981' },
  'concluida':              { label: 'Feito',                  color: '#10b981' },
  'concluída':              { label: 'Feito',                  color: '#10b981' },
  'bloqueada':              { label: 'Aguardando',             color: '#f59e0b' },
  'cancelada':              { label: 'Cancelado',              color: '#6b7280' },
}

function formatDateBR(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

function daysBetween(startStr, endStr) {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr) {
  if (!dateStr) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

function Timeline({ startDate, endDate }) {
  if (!startDate || !endDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  const end = new Date(endDate)
  const total = daysBetween(startDate, endDate)
  const elapsed = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)))
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  const isOverdue = today > end

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        <span>{formatDateBR(startDate)}</span>
        <span>{formatDateBR(endDate)}</span>
      </div>
      <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: isOverdue ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        <span>INÍCIO</span>
        <span>{pct}% do tempo</span>
        <span>FIM</span>
      </div>
    </div>
  )
}

function DocumentItem({ doc, onDelete }) {
  return (
    <div
      className="group/doc flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors"
      style={{ background: 'var(--color-bg-surface)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-surface)'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>

      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[13px] font-medium truncate"
        style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
      >
        {doc.title}
      </a>

      <span
        className="text-[10px] truncate flex-1"
        style={{ color: 'var(--color-text-muted)', minWidth: 0 }}
      >
        {doc.url}
      </span>

      <button
        onClick={() => onDelete(doc.id)}
        className="opacity-0 group-hover/doc:opacity-100 border-none cursor-pointer p-1 rounded transition-opacity flex-shrink-0"
        style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
        title="Remover documento"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

function DocumentsSection({ planId, documents, onAdd, onDelete }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const titleRef = useRef(null)

  const docs = documents || []

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return
    onAdd(planId, title, url)
    setTitle('')
    setUrl('')
    setTimeout(() => titleRef.current?.focus(), 0)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wider mb-2 m-0" style={{ color: 'var(--color-text-muted)' }}>
        DOCUMENTOS RELACIONADOS
      </p>

      {docs.length > 0 && (
        <div
          className="rounded-lg overflow-hidden flex flex-col gap-1 mb-2"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {docs.map(doc => (
            <DocumentItem key={doc.id} doc={doc} onDelete={(docId) => onDelete(planId, docId)} />
          ))}
        </div>
      )}

      {docs.length === 0 && (
        <p className="text-[12px] m-0 mb-2" style={{ color: 'var(--color-text-label)' }}>
          Nenhum documento. Cole links do Notion, Figma, Google Docs...
        </p>
      )}

      <div
        className="flex items-center gap-1.5 rounded-md transition-colors"
        style={{ background: 'var(--color-bg-surface)', border: '1px dashed var(--color-border)', padding: '6px 8px' }}
      >
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Título..."
          className="flex-1 border-none outline-none text-[11px]"
          style={{ color: 'var(--color-text-primary)', padding: '8px 10px', minWidth: 0, background: 'transparent' }}
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://..."
          className="flex-1 border-none outline-none text-[11px]"
          style={{ color: 'var(--color-text-primary)', padding: '8px 10px', minWidth: 0, background: 'transparent' }}
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim() || !url.trim()}
          className="text-[10px] font-semibold cursor-pointer rounded px-1.5 py-0.5 border-none flex-shrink-0 transition-opacity"
          style={{
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-main)',
            opacity: title.trim() && url.trim() ? 1 : 0.3,
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

function MilestoneTaskItem({ task, index, total, onToggle, onReorderTasks, onDelete, onOpen }) {
  const overdue = !task.completed && task.dueDate && daysUntil(task.dueDate) < 0
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  if (!onReorderTasks) {
    return (
      <div
        className="group/mt flex items-start gap-2.5 px-2.5 py-2 rounded-md transition-colors cursor-pointer"
        style={{ background: 'var(--color-bg-surface)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-surface)'}
        onClick={onOpen}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="w-[14px] h-[14px] rounded-full border-[1.5px] flex-shrink-0 cursor-pointer flex items-center justify-center transition-all"
          style={{
            background: task.completed ? 'var(--color-text-secondary)' : 'transparent',
            borderColor: task.completed ? 'var(--color-text-secondary)' : '#555555',
          }}
        >
          {task.completed && (
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="var(--color-bg-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <span
            className="text-[12px] truncate"
            style={{
              color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            {task.responsible && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Responsável:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 500 }}
                >
                  {task.responsible}
                </span>
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Prazo:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-bg-input)',
                    color: overdue ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: overdue ? 600 : 500,
                  }}
                >
                  {formatDateBR(task.dueDate)}
                </span>
              </span>
            )}
            {task.executionDate && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Execução:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 500 }}
                >
                  {formatDateBR(task.executionDate)}
                </span>
              </span>
            )}
            {task.status && (() => {
              const meta = taskStatusMeta[task.status.toLowerCase()]
              if (!meta) return null
              return (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>Status:</span>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: `${meta.color}22`, color: meta.color, fontWeight: 600 }}
                  >
                    {meta.label}
                  </span>
                </span>
              )
            })()}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover/mt:opacity-100 border-none cursor-pointer p-0.5 rounded transition-opacity flex-shrink-0"
          style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
          title="Remover tarefa"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    )
  }

  const handleDragStart = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(task.id))
  }
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }
  const handleDragLeave = (e) => {
    e.stopPropagation()
    setIsDragOver(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setIsDragging(false)
    const draggedId = Number(e.dataTransfer.getData('text/plain'))
    if (!draggedId || draggedId === task.id) return
    onReorderTasks(task.milestoneId, draggedId, index)
  }
  const handleDragEnd = (e) => {
    e.stopPropagation()
    setIsDragging(false)
    setIsDragOver(false)
  }

  const moveUp = (e) => {
    e.stopPropagation()
    if (index === 0) return
    onReorderTasks(task.milestoneId, task.id, index - 1)
  }
  const moveDown = (e) => {
    e.stopPropagation()
    if (index === total - 1) return
    onReorderTasks(task.milestoneId, task.id, index + 1)
  }

  return (
    <div
      className="group/mt flex items-stretch rounded-md transition-colors"
      style={{
        background: 'var(--color-bg-surface)',
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? '2px solid #503FB6' : 'none',
        outlineOffset: '-2px',
      }}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {/* Coluna esquerda: setas + número */}
      <div
        className="flex flex-col items-center justify-center gap-0.5 px-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{ borderRight: '1px solid var(--color-border)', minWidth: '24px', opacity: 0.5 }}
        title="Arraste para reordenar"
      >
        <button
          onClick={moveUp}
          disabled={index === 0}
          className="border-none cursor-pointer p-0.5 rounded disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
          title="Mover para cima"
        >
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <span className="text-[9px] font-semibold tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          onClick={moveDown}
          disabled={index === total - 1}
          className="border-none cursor-pointer p-0.5 rounded disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
          title="Mover para baixo"
        >
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* Conteúdo da tarefa */}
      <div
        className="flex-1 flex items-center gap-2.5 px-2.5 py-2 cursor-pointer min-w-0"
        onMouseEnter={(e) => e.currentTarget.parentElement.style.background = 'var(--color-bg-row-hover)'}
        onMouseLeave={(e) => e.currentTarget.parentElement.style.background = 'var(--color-bg-surface)'}
        onClick={onOpen}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="w-[14px] h-[14px] rounded-full border-[1.5px] flex-shrink-0 cursor-pointer flex items-center justify-center transition-all"
          style={{
            background: task.completed ? 'var(--color-text-secondary)' : 'transparent',
            borderColor: task.completed ? 'var(--color-text-secondary)' : '#555555',
          }}
        >
          {task.completed && (
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="var(--color-bg-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <span
            className="text-[12px] truncate"
            style={{
              color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            {task.responsible && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Responsável:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 500 }}
                >
                  {task.responsible}
                </span>
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Prazo:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-bg-input)',
                    color: overdue ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: overdue ? 600 : 500,
                  }}
                >
                  {formatDateBR(task.dueDate)}
                </span>
              </span>
            )}
            {task.executionDate && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>Execução:</span>
                <span
                  className="px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)', fontWeight: 500 }}
                >
                  {formatDateBR(task.executionDate)}
                </span>
              </span>
            )}
            {task.status && (() => {
              const meta = taskStatusMeta[task.status.toLowerCase()]
              if (!meta) return null
              return (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>Status:</span>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: `${meta.color}22`, color: meta.color, fontWeight: 600 }}
                  >
                    {meta.label}
                  </span>
                </span>
              )
            })()}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover/mt:opacity-100 border-none cursor-pointer p-0.5 rounded transition-opacity flex-shrink-0"
          style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
          title="Remover tarefa"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function MilestoneSection({ planId, milestone, index, total, tasks, onToggle, onReorderTasks, onDelete, onOpenTask, onAddTask, onDeleteMilestone, onUpdateMilestone, onToggleMilestone, onMoveUp, onMoveDown, isDragging, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) {
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(milestone.title)
  const [editDate, setEditDate] = useState(milestone.dueDate || '')
  const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
  const pendingTasks = milestoneTasks.filter(t => !t.completed)
  const doneTasks = milestoneTasks.filter(t => t.completed)
  const overdue = !milestone.done && milestone.dueDate && daysUntil(milestone.dueDate) < 0

  const startEdit = (e) => {
    e.stopPropagation()
    setEditTitle(milestone.title)
    setEditDate(milestone.dueDate || '')
    setIsEditing(true)
  }
  const cancelEdit = (e) => {
    e?.stopPropagation()
    setIsEditing(false)
  }
  const saveEdit = (e) => {
    e?.stopPropagation()
    const t = editTitle.trim()
    if (t) onUpdateMilestone(planId, milestone.id, { title: t, dueDate: editDate })
    setIsEditing(false)
  }
  const editKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit(e)
    if (e.key === 'Escape') cancelEdit(e)
  }

  const taskProgress = milestoneTasks.length > 0 ? (doneTasks.length / milestoneTasks.length) * 100 : 0

  return (
    <div
      className="rounded-lg flex transition-all"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? '2px solid #503FB6' : 'none',
        outlineOffset: '-2px',
      }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Coluna esquerda: número + setas */}
      <div
        className="flex flex-col items-center justify-center gap-1 px-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{ borderRight: '1px solid var(--color-border)', minWidth: '32px', opacity: 0.5 }}
        title="Arraste para reordenar"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp() }}
          disabled={index === 0}
          className="border-none cursor-pointer p-0.5 rounded disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
          title="Mover para cima"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown() }}
          disabled={index === total - 1}
          className="border-none cursor-pointer p-0.5 rounded disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
          title="Mover para baixo"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* Conteúdo do card */}
      <div className="flex-1 min-w-0">
        {/* Milestone header */}
        <div
          className="group/ms flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
          style={{ borderBottom: expanded ? '1px solid var(--color-border)' : 'none' }}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-[11px] flex-shrink-0 w-[12px] text-center" style={{ color: 'var(--color-text-muted)' }}>
            {expanded ? '▾' : '▸'}
          </span>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleMilestone(milestone.id) }}
          className="w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 cursor-pointer flex items-center justify-center transition-all"
          style={{
            background: milestone.done ? 'var(--color-text-primary)' : 'transparent',
            borderColor: milestone.done ? 'var(--color-text-primary)' : '#555555',
          }}
        >
          {milestone.done && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="var(--color-bg-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={editKeyDown}
              autoFocus
              className="flex-1 text-[13px] font-medium rounded px-2 py-1"
              style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-text-primary)', color: 'var(--color-text-primary)' }}
            />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              onKeyDown={editKeyDown}
              className="text-[11px] rounded px-1 py-1"
              style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', width: '130px' }}
            />
            <button
              onClick={saveEdit}
              className="text-[11px] font-semibold cursor-pointer rounded px-2 py-1 border-none"
              style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)' }}
            >
              Salvar
            </button>
            <button
              onClick={cancelEdit}
              className="text-[11px] cursor-pointer rounded px-2 py-1 border-none"
              style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span
            className="flex-1 text-[13px] font-medium truncate"
            style={{
              color: milestone.done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: milestone.done ? 'line-through' : 'none',
            }}
          >
            {milestone.title}
          </span>
        )}

        <span
          className="text-[11px] font-semibold flex-shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {doneTasks.length}/{milestoneTasks.length}
        </span>

        {!isEditing && (
          <span
            className="text-[10px] flex-shrink-0"
            style={{
              color: overdue ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontWeight: overdue ? 600 : 400,
              minWidth: '70px',
              textAlign: 'right',
            }}
          >
            {milestone.dueDate ? `Prazo: ${formatDateBR(milestone.dueDate)}` : ''}
          </span>
        )}

        {!isEditing && (
          <button
            onClick={startEdit}
            className="opacity-0 group-hover/ms:opacity-100 border-none cursor-pointer p-1 rounded transition-opacity flex-shrink-0"
            style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
            title="Editar milestone"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDeleteMilestone(milestone.id) }}
          className="opacity-0 group-hover/ms:opacity-100 border-none cursor-pointer p-1 rounded transition-opacity flex-shrink-0"
          style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
          title="Deletar milestone"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Barra de progresso segmentada (4 partes) */}
      <div className="flex gap-1 px-3 pb-2">
        {[0, 1, 2, 3].map(i => {
          const filled = taskProgress >= (i + 1) * 25
          return (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-all"
              style={{
                background: filled
                  ? (taskProgress === 100 ? '#10b981' : '#503FB6')
                  : 'var(--color-border)',
                opacity: filled ? 0.85 : 1,
              }}
            />
          )
        })}
      </div>

      {/* Tarefas do milestone (escondidas quando recolhido) */}
      {expanded && (
        <div className="p-2 flex flex-col gap-1">
        {pendingTasks.map((task, i) => (
          <MilestoneTaskItem
            key={task.id}
            task={task}
            index={i}
            total={pendingTasks.length}
            onToggle={() => onToggle(task.id)}
            onReorderTasks={onReorderTasks}
            onDelete={() => onDelete(task.id)}
            onOpen={() => onOpenTask(task)}
          />
        ))}

        {doneTasks.length > 0 && (
          <div
            className="mt-1 pt-1 flex flex-col gap-1"
            style={{ borderTop: '1px dashed var(--color-border)' }}
          >
            {doneTasks.map(task => (
              <MilestoneTaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
                onOpen={() => onOpenTask(task)}
              />
            ))}
          </div>
        )}

        {/* Botão para abrir modal de tarefa pré-preenchido */}
        <button
          onClick={() => onAddTask(planId, milestone.id)}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md mt-1 transition-colors text-left border-none cursor-pointer"
          style={{ background: 'var(--color-bg-surface)', border: '1px dashed var(--color-border)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-surface)'}
        >
          <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>+</span>
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Nova tarefa...</span>
        </button>
      </div>
      )}
      </div>
    </div>
  )
}

function PlanCard({ plan, tasks, isExpanded, onToggleExpand, onOpenModal, onDelete, onToggleMilestone, onUpdateMilestone, onReorderMilestones, onDeleteMilestone, onAddTaskToMilestone, onToggleTask, onReorderTasks, onDeleteTask, onOpenTaskModal, onAddDocument, onDeleteDocument }) {
  const [draggedMsId, setDraggedMsId] = useState(null)
  const [dragOverMsId, setDragOverMsId] = useState(null)

  const handleMsDragStart = (e, msId) => {
    setDraggedMsId(msId)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleMsDragOver = (e, msId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedMsId && draggedMsId !== msId) setDragOverMsId(msId)
  }
  const handleMsDragLeave = () => setDragOverMsId(null)
  const handleMsDrop = (e, targetMsId) => {
    e.preventDefault()
    setDragOverMsId(null)
    if (!draggedMsId || draggedMsId === targetMsId) { setDraggedMsId(null); return }
    const ids = plan.milestones.map(m => m.id)
    const fromIdx = ids.indexOf(draggedMsId)
    const toIdx = ids.indexOf(targetMsId)
    if (fromIdx < 0 || toIdx < 0) { setDraggedMsId(null); return }
    const next = [...ids]
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, draggedMsId)
    onReorderMilestones(plan.id, next)
    setDraggedMsId(null)
  }
  const handleMsDragEnd = () => {
    setDraggedMsId(null)
    setDragOverMsId(null)
  }

  const moveMs = (msId, dir) => {
    const ids = plan.milestones.map(m => m.id)
    const idx = ids.indexOf(msId)
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= ids.length) return
    const next = [...ids]
    ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
    onReorderMilestones(plan.id, next)
  }
  const doneMilestones = plan.milestones.filter(m => m.done).length
  const totalMilestones = plan.milestones.length
  const planTasks = tasks.filter(t => t.planId === plan.id)
  const doneTasks = planTasks.filter(t => t.completed).length
  const milestoneProgress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0

  const days = daysUntil(plan.endDate)
  const isCompleted = plan.status === 'completed'
  const isArchived = plan.status === 'archived'
  const isPaused = plan.status === 'paused'
  const isActive = plan.status === 'active'

  let timeLabel = ''
  if (isCompleted) timeLabel = 'Concluído'
  else if (isArchived) timeLabel = 'Arquivado'
  else if (isPaused) timeLabel = 'Pausado'
  else if (days < 0) timeLabel = `Atrasado ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`
  else if (days === 0) timeLabel = 'Vence hoje'
  else timeLabel = `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        opacity: isArchived ? 0.5 : 1,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={onToggleExpand}
        style={{ borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none' }}
      >
        <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {isExpanded ? '▾' : '▸'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-[15px] font-bold m-0"
              style={{
                color: 'var(--color-text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {plan.title}
            </h3>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
              style={{
                background: 'var(--color-bg-input)',
                color: 'var(--color-text-secondary)',
                opacity: isPaused ? 0.6 : 1,
              }}
            >
              {statusLabels[plan.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
            <span>{formatDateBR(plan.startDate)} → {formatDateBR(plan.endDate)}</span>
            <span>•</span>
            <span>{doneMilestones}/{totalMilestones} milestones</span>
            <span>•</span>
            <span>{doneTasks}/{planTasks.length} tarefas</span>
            {!isArchived && !isCompleted && (
              <>
                <span>•</span>
                <span style={{ fontWeight: days < 0 ? 600 : 400, color: days < 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {timeLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar mini */}
        <div className="w-[120px] flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>{milestoneProgress}%</span>
          </div>
          <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${milestoneProgress}%`, background: 'var(--color-text-primary)' }}
            ></div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onOpenModal}
            className="border-none cursor-pointer p-1.5 rounded"
            style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
            title="Editar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="border-none cursor-pointer p-1.5 rounded"
            style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
            title="Deletar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body expandido */}
      {isExpanded && (
        <div className="p-5 flex flex-col gap-5" style={{ background: 'var(--color-bg-main)' }}>
          {/* Duas colunas: Sobre o plano | Documentos */}
          <div className="grid grid-cols-2 gap-5">
            {/* Coluna esquerda: contexto + timeline */}
            <div className="flex flex-col gap-5">
              {/* Contexto */}
              {plan.context && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider mb-2 m-0" style={{ color: 'var(--color-text-muted)' }}>
                    SOBRE O PLANO
                  </p>
                  <p className="text-[13px] m-0 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {plan.context}
                  </p>
                </div>
              )}

              {/* Timeline */}
              {plan.startDate && plan.endDate && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider mb-2 m-0" style={{ color: 'var(--color-text-muted)' }}>
                    TIMELINE
                  </p>
                  <Timeline startDate={plan.startDate} endDate={plan.endDate} />
                </div>
              )}
            </div>

            {/* Coluna direita: documentos */}
            <DocumentsSection
              planId={plan.id}
              documents={plan.documents}
              onAdd={onAddDocument}
              onDelete={onDeleteDocument}
            />
          </div>

          {/* Milestones com tarefas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-wider m-0" style={{ color: 'var(--color-text-muted)' }}>
                MILESTONES & TAREFAS
              </p>
            </div>

            {plan.milestones.length > 0 ? (
              <div className="flex flex-col gap-2.5 relative pl-4" style={{ borderLeft: '3px solid #503FB6' }}>
                {plan.milestones.map((m, idx) => (
                  <MilestoneSection
                    key={m.id}
                    planId={plan.id}
                    milestone={m}
                    index={idx}
                    total={plan.milestones.length}
                    tasks={tasks}
                    onToggle={onToggleTask}
                    onReorderTasks={onReorderTasks}
                    onDelete={onDeleteTask}
                    onOpenTask={onOpenTaskModal}
                    onAddTask={onAddTaskToMilestone}
                    onDeleteMilestone={onDeleteMilestone}
                    onUpdateMilestone={(msId, fields) => onUpdateMilestone(plan.id, msId, fields)}
                    onToggleMilestone={(msId) => onToggleMilestone(plan.id, msId)}
                    onMoveUp={() => moveMs(m.id, -1)}
                    onMoveDown={() => moveMs(m.id, 1)}
                    isDragging={draggedMsId === m.id}
                    isDragOver={dragOverMsId === m.id}
                    onDragStart={(e) => handleMsDragStart(e, m.id)}
                    onDragOver={(e) => handleMsDragOver(e, m.id)}
                    onDragLeave={handleMsDragLeave}
                    onDrop={(e) => handleMsDrop(e, m.id)}
                    onDragEnd={handleMsDragEnd}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-[12px]" style={{ color: 'var(--color-text-label)' }}>
                Nenhum milestone ainda.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlansView({
  plans,
  tasks,
  onOpenModal,
  onDelete,
  onToggleMilestone,
  onUpdateMilestone,
  onReorderMilestones,
  onDeleteMilestone,
  onAddTaskToMilestone,
  onToggleTask,
  onReorderTasks,
  onDeleteTask,
  onOpenTaskModal,
  onAddDocument,
  onDeleteDocument,
}) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())

  const toggleExpand = (id) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  const filteredPlans = filter === 'all' ? plans : plans.filter(p => p.status === filter)
  const counts = {
    all: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    paused: plans.filter(p => p.status === 'paused').length,
    completed: plans.filter(p => p.status === 'completed').length,
    archived: plans.filter(p => p.status === 'archived').length,
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Planos de Ação
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {counts.active} ativo{counts.active !== 1 ? 's' : ''} • {counts.completed} concluído{counts.completed !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => onOpenModal(null)}
          className="text-[13px] font-semibold cursor-pointer rounded-lg px-4 py-2 border-none transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)' }}
        >
          + Novo Plano
        </button>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-1.5 px-8 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {statusOptions.map(opt => {
          const isActive = filter === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className="text-[12px] font-medium cursor-pointer rounded-md px-3 py-1.5 border-none transition-colors"
              style={{
                background: isActive ? '#503FB6' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              {opt.label}
              {counts[opt.id] > 0 && (
                <span className="ml-1.5 text-[10px]" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                  {counts[opt.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-5">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] m-0" style={{ color: 'var(--color-text-secondary)' }}>
              Nenhum plano {filter !== 'all' ? `${statusLabels[filter].toLowerCase()}` : 'criado'} ainda.
            </p>
            <p className="text-[12px] m-0 mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {filter === 'all' ? 'Crie o primeiro plano de ação da agência.' : 'Mude o filtro ou crie um novo plano.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                tasks={tasks}
                isExpanded={expanded.has(plan.id)}
                onToggleExpand={() => toggleExpand(plan.id)}
                onOpenModal={() => onOpenModal(plan)}
                onDelete={() => onDelete(plan.id)}
                onToggleMilestone={onToggleMilestone}
                onUpdateMilestone={onUpdateMilestone}
                onReorderMilestones={onReorderMilestones}
                onDeleteMilestone={onDeleteMilestone}
                onAddTaskToMilestone={onAddTaskToMilestone}
                onToggleTask={onToggleTask}
                onReorderTasks={onReorderTasks}
                onDeleteTask={onDeleteTask}
                onOpenTaskModal={onOpenTaskModal}
                onAddDocument={onAddDocument}
                onDeleteDocument={onDeleteDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}