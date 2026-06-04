import { useTaskColWidth } from './TaskList'

export default function TaskItem({ task, properties, visibility, onToggle, onDelete, onOpenModal, even, planTitle, milestoneTitle }) {
  const visible = properties.filter(p => visibility[p.id])
  const taskColWidth = useTaskColWidth()

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

        {/* Title + chip de vínculo */}
        <span
          className="flex-shrink-0 text-[13px] cursor-pointer pr-4 flex items-center gap-2"
          style={{ width: `${taskColWidth}px` }}
          onClick={() => onOpenModal(task)}
        >
          <span
            style={{
              color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
              flex: 1,
              minWidth: 0,
            }}
          >
            {task.title}
          </span>

          {planTitle && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                background: 'var(--color-bg-surface)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                opacity: 0.85,
              }}
              title={milestoneTitle ? `${planTitle} → ${milestoneTitle}` : planTitle}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px',
                }}
              >
                {planTitle}{milestoneTitle ? ` → ${milestoneTitle}` : ''}
              </span>
            </span>
          )}
        </span>

        {/* Properties cells */}
        {visible.map(prop => {
          const val = task[prop.id]
          if (prop.id === 'responsible') {
            return (
              <span key={prop.id} className="w-[120px] flex-shrink-0 text-[12px]">
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
              <span key={prop.id} className="w-[120px] flex-shrink-0 text-[12px]">
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
              <span key={prop.id} className="w-[120px] flex-shrink-0 text-[12px]">
                {val ? (
                  <span style={{ color: 'var(--color-text-secondary)' }}>{val.split('-').reverse().slice(0, 2).join('/')}</span>
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