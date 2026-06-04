import { useState, useEffect } from 'react'
import TipsPanel from './TipsPanel'

const DEFAULT_FORM = {
  title: '',
  priority: 'qualquer-momento',
  client: '',
  dueDate: '',
  executionDate: '',
  status: 'Pendente',
  responsible: '',
  comment: '',
  planId: null,
  milestoneId: null,
  completed: false,
}

export default function TaskModal({ task, plans = [], teamMembers = [], initialForm = null, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        priority: task.priority || 'qualquer-momento',
        client: task.client || '',
        dueDate: task.dueDate || '',
        executionDate: task.executionDate || '',
        status: task.status || 'Pendente',
        responsible: task.responsible || '',
        comment: task.comment || '',
        planId: task.planId ?? null,
        milestoneId: task.milestoneId ?? null,
        completed: task.completed || false,
      })
    } else if (initialForm) {
      setForm({ ...DEFAULT_FORM, planId: initialForm.planId ?? null, milestoneId: initialForm.milestoneId ?? null })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [task, initialForm])

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({ ...form, planId: form.planId || null, milestoneId: form.milestoneId || null })
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id)
      onClose()
    }
  }

  const selectedPlan = plans.find(p => p.id === form.planId)
  const milestones = selectedPlan ? selectedPlan.milestones : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.75)' }}></div>
      <div
        className="relative w-full max-w-[900px] rounded-xl flex max-h-[90vh] overflow-hidden"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 25px 80px var(--color-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coluna esquerda — formulário */}
        <div className="flex-1 flex flex-col max-h-[90vh] overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nome da tarefa"
            className="bg-transparent border-none outline-none text-[18px] font-semibold w-full"
            style={{ color: 'var(--color-text-primary)' }}
            autoFocus
          />
        </div>

        {/* Fields */}
        <div className="px-6 py-5 flex flex-col gap-6 overflow-y-auto flex-1">

          {/* Seção: Vínculo ao plano */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-text-muted)' }}>VÍNCULO</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Plano</span>
                <select value={form.planId || ''} onChange={(e) => setForm({ ...form, planId: e.target.value ? Number(e.target.value) : null, milestoneId: null })} className="w-full">
                  <option value="">Sem plano</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              {form.planId && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Milestone</span>
                  <select value={form.milestoneId || ''} onChange={(e) => setForm({ ...form, milestoneId: e.target.value ? Number(e.target.value) : null })} className="w-full">
                    <option value="">Sem milestone</option>
                    {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

          {/* Seção: Atribuição */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-text-muted)' }}>ATRIBUIÇÃO</p>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Responsável</span>
              <div className="flex gap-2 flex-wrap">
                {teamMembers.map(member => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => setForm({ ...form, responsible: member })}
                    className="text-[12px] font-medium cursor-pointer rounded-md px-4 py-2 border-none transition-colors"
                    style={{
                      background: form.responsible === member ? 'var(--color-text-primary)' : 'var(--color-bg-input)',
                      color: form.responsible === member ? 'var(--color-bg-main)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {member}
                  </button>
                ))}
                {form.responsible && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, responsible: '' })}
                    className="text-[11px] cursor-pointer rounded-md px-2 py-2 border-none"
                    style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
                    title="Limpar"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

          {/* Seção: Datas & Status */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-text-muted)' }}>DATA & STATUS</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Execução</span>
                <input type="date" value={form.executionDate} onChange={(e) => setForm({ ...form, executionDate: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Prazo</span>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Prioridade</span>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full">
                  <option value="hoje">Hoje</option>
                  <option value="essa-semana">Essa Semana</option>
                  <option value="proxima-semana">Próxima Semana</option>
                  <option value="qualquer-momento">Qualquer Momento</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full">
                <option value="Pendente">Pendente</option>
                <option value="Em Progresso">Em Progresso</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

          {/* Seção: Comentários */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-text-muted)' }}>COMENTÁRIOS</span>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Observações, links, contexto adicional..."
              rows={3}
              className="resize-none"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-between gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div>
            {task?.id && onDelete && (
              <button
                onClick={handleDelete}
                className="text-[13px] cursor-pointer rounded-lg px-4 py-2 border-none transition-colors"
                style={{ background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Excluir tarefa
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-[13px] cursor-pointer rounded-lg px-4 py-2 border-none"
              style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim()}
              className="text-[13px] font-semibold cursor-pointer rounded-lg px-5 py-2 border-none transition-opacity"
              style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)', opacity: form.title.trim() ? 1 : 0.4 }}
            >
              {task?.id ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
        </div>

        {/* Coluna direita — dicas */}
        <div className="w-[300px] flex-shrink-0 p-5 overflow-y-auto" style={{ background: 'var(--color-bg-main)' }}>
          <TipsPanel type="task" />
        </div>
      </div>
    </div>
  )
}