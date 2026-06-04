import { useTaskColWidth, usePropColWidths } from './TaskList'

export default function TaskItem({ task, properties, visibility, onToggle, onDelete, onOpenModal, even, planTitle, milestoneTitle }) {
  const visible = properties.filter(p => visibility[p.id])
  const taskColWidth = useTaskColWidth()
  const propColWidths = usePropColWidths()
  const w = (id) => propColWidths[id] || 120

  return (
    <div
      className="group transition-colors"
      style={{
        background: 'var(--color-task-row)',
        borderBottom: '1px solid var(--color-border)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-task-row-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-task-row)'}
    >
      <div className="flex items-center px-4 py-3">
        {/* Checkbox */}
        <span className="w-[40px] flex-shrink-0 flex items-center justify-center">
          <button
            onClick={() => onToggle(task.id)}
            className="w-[16px] h-[16px] rounded-full border-[1.5px] flex-shrink-0 cursor-pointer flex items-center justify-center transition-all"
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
        </span>

        {/* Title */}
        <span
          className="flex-shrink-0 text-[13px] cursor-pointer pr-4 flex items-center min-w-0"
          style={{ width: `${taskColWidth}px` }}
          onClick={() => onOpenModal(task)}
        >
          <span
            className="truncate"
            style={{
              color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
              flex: 1,
              minWidth: 0,
            }}
          >
            {task.title}
          </span>
        </span>

        {/* Properties cells */}
        {visible.map(prop => {
          const val = task[prop.id]
          if (prop.id === 'responsible') {
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {val ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                      style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                      {val.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{val}</span>
                  </span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'priority') {
            const labels = { hoje: 'Hoje', 'essa-semana': 'Esta semana', 'proxima-semana': 'Próxima semana', 'qualquer-momento': 'Qualquer' }
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {val ? (
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
                    {labels[val] || val}
                  </span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'dueDate' || prop.id === 'executionDate') {
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {val ? (
                  <span style={{ color: 'var(--color-text-secondary)' }}>{val.split('-').reverse().slice(0, 2).join('/')}</span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'client') {
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {val ? (
                  <span className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>{val}</span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'planLink') {
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {planTitle ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--color-bg-surface)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      opacity: 0.85,
                      maxWidth: '100%',
                    }}
                    title={milestoneTitle ? `${planTitle} → ${milestoneTitle}` : planTitle}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="truncate">
                      {planTitle}{milestoneTitle ? ` → ${milestoneTitle}` : ''}
                    </span>
                  </span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'status') {
            const statusMeta = {
              'para fazer': { label: 'Para fazer', color: '#94a3b8' },
              'fazendo': { label: 'Fazendo', color: '#3b82f6' },
              'feito': { label: 'Feito', color: '#10b981' },
              'precisa de aprovação': { label: 'Aprovação', color: '#a855f7' },
              'precisa de aprovacao': { label: 'Aprovação', color: '#a855f7' },
              'aguardando': { label: 'Aguardando', color: '#f59e0b' },
              'cancelado': { label: 'Cancelado', color: '#6b7280' },
            }
            const meta = val ? statusMeta[val.toLowerCase()] : null
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {meta ? (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          if (prop.id === 'comment') {
            return (
              <span key={prop.id} className="flex-shrink-0 text-[12px]" style={{ width: `${w(prop.id)}px` }}>
                {val ? (
                  <span className="text-[11px] truncate block" style={{ color: 'var(--color-text-secondary)' }} title={val}>{val}</span>
                ) : <span style={{ color: 'var(--color-text-label)' }}>—</span>}
              </span>
            )
          }
          return null
        })}

        {/* Delete button */}
        <span className="w-[50px] flex-shrink-0 flex justify-end">
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 border-none cursor-pointer p-1.5 rounded transition-opacity"
            style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </span>
      </div>
    </div>
  )
}