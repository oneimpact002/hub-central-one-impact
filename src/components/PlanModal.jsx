import { useState, useEffect } from 'react'
import TipsPanel from './TipsPanel'

const statusOptions = [
  { id: 'active', label: 'Ativo' },
  { id: 'paused', label: 'Pausado' },
  { id: 'completed', label: 'Concluído' },
  { id: 'archived', label: 'Arquivado' },
]

function formatDateBR(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

export default function PlanModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    context: '',
    startDate: '',
    endDate: '',
    status: 'active',
    milestones: [],
  })
  const [newMsTitle, setNewMsTitle] = useState('')
  const [newMsDate, setNewMsDate] = useState('')

  useEffect(() => {
    if (plan) {
      setForm({
        title: plan.title || '',
        context: plan.context || '',
        startDate: plan.startDate || '',
        endDate: plan.endDate || '',
        status: plan.status || 'active',
        milestones: plan.milestones || [],
      })
    } else {
      setForm({
        title: '',
        context: '',
        startDate: '',
        endDate: '',
        status: 'active',
        milestones: [],
      })
    }
  }, [plan])

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  const addMilestone = () => {
    if (!newMsTitle.trim()) return
    setForm(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: newMsTitle.trim(),
          dueDate: newMsDate,
          done: false,
        },
      ],
    }))
    setNewMsTitle('')
    setNewMsDate('')
  }

  const removeMilestone = (id) => {
    setForm({ ...form, milestones: form.milestones.filter(m => m.id !== id) })
  }

  const handleMsKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMilestone()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.75)' }}></div>
      <div
        className="relative w-full max-w-[900px] rounded-xl flex max-h-[90vh] overflow-hidden"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 80px var(--color-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coluna esquerda — formulário */}
        <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Title input */}
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Nome do plano de ação"
          className="bg-transparent border-none outline-none text-[18px] font-semibold w-full"
          style={{ color: 'var(--color-text-primary)', padding: '10px' }}
          autoFocus
        />

        <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

        {/* Contexto */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            CONTEXTO — POR QUE ESSE PLANO EXISTE
          </span>
          <textarea
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="O problema que resolve, a oportunidade, o objetivo..."
            rows={3}
            className="resize-none"
            style={{ fontSize: '13px' }}
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              DATA DE INÍCIO
            </span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              DATA DE FIM
            </span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-wider w-[120px]" style={{ color: 'var(--color-text-muted)' }}>
            STATUS
          </span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="flex-1"
          >
            {statusOptions.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

        {/* Milestones */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            MILESTONES — ENTREGAS COM PRAZO
          </span>

          {form.milestones.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-1">
              {form.milestones.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
                >
                  <span className="flex-1 text-[12px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {m.title}
                  </span>
                  <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {m.dueDate ? formatDateBR(m.dueDate) : 'Sem prazo'}
                  </span>
                  <button
                    onClick={() => removeMilestone(m.id)}
                    className="border-none cursor-pointer p-1 rounded flex-shrink-0"
                    style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
                    title="Remover"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newMsTitle}
              onChange={(e) => setNewMsTitle(e.target.value)}
              onKeyDown={handleMsKey}
              placeholder="Título do milestone..."
              className="flex-1"
              style={{ fontSize: '12px' }}
            />
            <input
              type="date"
              value={newMsDate}
              onChange={(e) => setNewMsDate(e.target.value)}
              style={{ fontSize: '12px', width: '140px' }}
            />
            <button
              onClick={addMilestone}
              className="text-[12px] font-semibold cursor-pointer rounded-lg px-3 py-1.5 border-none"
              style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)' }}
            >
              + Adicionar
            </button>
          </div>
        </div>

        <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
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
            style={{
              background: 'var(--color-button-cta)',
              color: 'var(--color-button-cta-text)',
              opacity: form.title.trim() ? 1 : 0.4,
            }}
          >
            {plan?.id ? 'Salvar' : 'Criar Plano'}
          </button>
        </div>
        </div>

        {/* Coluna direita — dicas */}
        <div className="w-[300px] flex-shrink-0 p-5 overflow-y-auto" style={{ background: 'var(--color-bg-main)' }}>
          <TipsPanel type="plan" />
        </div>
      </div>
    </div>
  )
}