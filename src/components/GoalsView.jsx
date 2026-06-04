import { useState } from 'react'
import TipsPanel from './TipsPanel'

const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#14b8a6']

const goalTypes = [
  { id: 'resultado', label: 'Resultado' },
  { id: 'habito', label: 'Hábito' },
  { id: 'projeto', label: 'Projeto' },
]

const statusOptions = [
  { id: 'active', label: 'Ativa', color: '#10b981' },
  { id: 'not-started', label: 'Não iniciada', color: '#666666' },
  { id: 'paused', label: 'Pausada', color: '#f59e0b' },
  { id: 'completed', label: 'Concluída', color: '#3b82f6' },
  { id: 'abandoned', label: 'Abandonada', color: '#ef4444' },
]

const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

const year = new Date().getFullYear()

export default function GoalsView({
  directions, setDirections, goals, setGoals, plans,
  onOpenPlanModal,
  onDeleteDirection, onToggleDir, onCreateDirection, onUpdateDirection,
  onCreateGoal, onUpdateGoal, onDeleteGoal, onToggleGoalStatus,
  onToggleGoalMilestone, onAddGoalMilestone, onRemoveGoalMilestone, onUpdateGoalMilestone,
}) {
  const [collapsedSections, setCollapsedSections] = useState({})
  const toggleSection = (id) => setCollapsedSections(s => ({ ...s, [id]: !s[id] }))
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const toggleGroup = (id) => setCollapsedGroups(s => ({ ...s, [id]: !s[id] }))

  // Direction CRUD
  const [dirModal, setDirModal] = useState(false)
  const [dirForm, setDirForm] = useState({ title: '', description: '', color: '#6366f1' })
  const [editingDir, setEditingDir] = useState(null)

  const openDirModal = (dir = null) => {
    if (dir) { setDirForm({ title: dir.title, description: dir.description || '', color: dir.color || '#6366f1' }); setEditingDir(dir.id) }
    else { setDirForm({ title: '', description: '', color: '#6366f1' }); setEditingDir(null) }
    setDirModal(true)
  }
  const saveDir = () => {
    if (!dirForm.title.trim()) return
    if (editingDir) onUpdateDirection(editingDir, dirForm)
    else onCreateDirection(dirForm)
    setDirModal(false)
  }
  const deleteDir = (id) => { if (window.confirm('Excluir direcionamento?')) onDeleteDirection(id) }
  const toggleDir = (id) => onToggleDir(id)

  // Goal CRUD
  const [goalModal, setGoalModal] = useState(false)
  const [goalForm, setGoalForm] = useState({
    title: '', description: '', directionId: '', type: 'resultado',
    status: 'active', metric: '', currentValue: 0, targetValue: 100,
    quarter: 'Q2', deadline: '', planId: null, milestones: []
  })
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [milestoneInput, setMilestoneInput] = useState('')
  const [msFormGoalId, setMsFormGoalId] = useState(null)
  const [msInput, setMsInput] = useState('')
  const [editingMsId, setEditingMsId] = useState(null)
  const [editingMsText, setEditingMsText] = useState('')

  const openGoalModal = (goal = null) => {
    if (goal) { setGoalForm({ ...goal }); setEditingGoalId(goal.id) }
    else {
      setGoalForm({
        title: '', description: '', directionId: directions[0]?.id || '',
        type: 'resultado', status: 'active', metric: '',
        currentValue: 0, targetValue: 100, quarter: 'Q2',
        deadline: '', planId: null, milestones: []
      })
      setEditingGoalId(null)
    }
    setGoalModal(true)
    setMilestoneInput('')
  }
  const saveGoal = () => {
    if (!goalForm.title.trim()) return
    if (editingGoalId) onUpdateGoal(editingGoalId, goalForm)
    else onCreateGoal(goalForm)
    setGoalModal(false)
  }
  const deleteGoal = (id) => { if (window.confirm('Excluir meta?')) onDeleteGoal(id) }
  const toggleGoalStatus = (id) => onToggleGoalStatus(id)
  const removeMilestone = (msId) => {
    setGoalForm({ ...goalForm, milestones: goalForm.milestones.filter(m => m.id !== msId) })
  }
  const addMilestone = () => {
    if (!milestoneInput.trim()) return
    setGoalForm({ ...goalForm, milestones: [...goalForm.milestones, { id: Date.now(), title: milestoneInput.trim(), done: false }] })
    setMilestoneInput('')
  }
  const toggleMilestone = (goalId, msId) => onToggleGoalMilestone(goalId, msId)
  const addMilestoneInline = (goalId) => {
    if (!msInput.trim()) return
    onAddGoalMilestone(goalId, msInput.trim())
    setMsInput('')
    setMsFormGoalId(null)
  }
  const removeMilestoneInline = (goalId, msId) => onRemoveGoalMilestone(goalId, msId)

  const startEditMilestone = (m) => {
    setEditingMsId(m.id)
    setEditingMsText(m.title)
  }

  const saveEditMilestone = (goalId, msId) => {
    const t = editingMsText.trim()
    if (t && t !== '') onUpdateGoalMilestone(goalId, msId, t)
    setEditingMsId(null)
    setEditingMsText('')
  }

  const cancelEditMilestone = () => {
    setEditingMsId(null)
    setEditingMsText('')
  }

  const getProgress = (g) => g.targetValue === 0 ? 0 : Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
  const getStatusInfo = (id) => statusOptions.find(s => s.id === id) || statusOptions[0]

  const activeDirections = directions.filter(d => d.active)
  const inactiveDirections = directions.filter(d => !d.active)

  const groupedGoals = (activeFilter) => {
    const groups = {}
    directions.forEach(d => {
      if (activeFilter && !d.active) return
      groups[d.id] = { direction: d, goals: [] }
    })
    goals.forEach(g => {
      const d = directions.find(d => d.id === g.directionId)
      if (!d) return
      if (activeFilter && !d.active) return
      if (groups[g.directionId]) groups[g.directionId].goals.push(g)
    })
    return Object.values(groups).filter(g => g.goals.length > 0)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Direcionamento</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {activeDirections.length} ativo{activeDirections.length !== 1 ? 's' : ''} • {goals.length} meta{goals.length !== 1 ? 's' : ''} • {plans.length} plano{plans.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openDirModal()} className="text-[12px] font-medium cursor-pointer rounded-lg px-3 py-2 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
            + Direcionamento
          </button>
          <button onClick={() => openGoalModal()} className="text-[13px] font-semibold cursor-pointer rounded-lg px-4 py-2 border-none" style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)' }}>
            + Nova Meta
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 flex flex-col gap-10">

        {/* ═══ DIRECIONAMENTOS ═══ */}
        <div>
          <button onClick={() => toggleSection('directions')} className="flex items-center gap-2 bg-transparent border-none cursor-pointer mb-4">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{collapsedSections['directions'] ? '▸' : '▾'}</span>
            <h2 className="text-[14px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>DIRECIONAMENTOS</h2>
          </button>

          {!collapsedSections['directions'] && (
            <>
              <p className="text-[12px] mb-4 m-0" style={{ color: 'var(--color-text-secondary)' }}>
                Pilares que guiam suas decisões. Vincule metas anuais a cada um.
              </p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {activeDirections.map(dir => {
                  const dirGoalCount = goals.filter(g => g.directionId === dir.id).length
                  const activeCount = goals.filter(g => g.directionId === dir.id && g.status === 'active').length
                  return (
                    <div key={dir.id} className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: dir.color }}></div>
                      <div className="flex items-start justify-between mb-3 pl-3">
                        <div>
                          <h3 className="text-[14px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{dir.title}</h3>
                          {dir.description && <p className="text-[12px] m-0 mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{dir.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pl-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-[6px] h-[6px] rounded-full" style={{ background: dir.color }}></div>
                          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{dirGoalCount} meta{dirGoalCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleDir(dir.id)}
                            className="text-[10px] font-medium cursor-pointer rounded px-2 py-1 border-none"
                            style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}
                            title="Desativar"
                          >
                            Ativo ✓
                          </button>
                          <button onClick={() => openDirModal(dir)} className="border-none cursor-pointer p-1.5 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => deleteDir(dir.id)} className="border-none cursor-pointer p-1.5 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Inativos */}
              {inactiveDirections.length > 0 && (
                <div className="mt-6">
                  <button onClick={() => toggleSection('inactive-dirs')} className="flex items-center gap-2 bg-transparent border-none cursor-pointer mb-3">
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{collapsedSections['inactive-dirs'] ? '▸' : '▾'}</span>
                    <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Inativos ({inactiveDirections.length})</span>
                  </button>
                  {!collapsedSections['inactive-dirs'] && (
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {inactiveDirections.map(dir => (
                        <div key={dir.id} className="rounded-xl p-4 relative overflow-hidden flex items-center gap-3" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', opacity: 0.5 }}>
                          <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: dir.color }}></div>
                          <span className="text-[12px] flex-1" style={{ color: 'var(--color-text-muted)' }}>{dir.title}</span>
                          <button onClick={() => toggleDir(dir.id)} className="text-[10px] cursor-pointer rounded px-2 py-1 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>Ativar</button>
                          <button onClick={() => deleteDir(dir.id)} className="border-none cursor-pointer p-1 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {directions.length === 0 && (
                <div className="text-center py-8 col-span-full">
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Nenhum direcionamento ainda. Crie o primeiro acima.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══ METAS DO ANO ═══ */}
        <div>
          <button onClick={() => toggleSection('goals')} className="flex items-center gap-2 bg-transparent border-none cursor-pointer mb-4">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{collapsedSections['goals'] ? '▸' : '▾'}</span>
            <h2 className="text-[14px] font-bold m-0 uppercase" style={{ color: 'var(--color-text-primary)' }}>METAS DO ANO {year}</h2>
          </button>

          {!collapsedSections['goals'] && (
            <div className="flex flex-col gap-8">
              {groupedGoals(true).map(({ direction, goals: gList }) => (
                <div key={direction.id}>
                  <button className="flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer" onClick={() => toggleGroup(direction.id)}>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{collapsedGroups[direction.id] ? '▸' : '▾'}</span>
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: direction.color }}></div>
                    <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{direction.title}</span>
                    <span className="text-[12px] ml-1" style={{ color: 'var(--color-text-muted)' }}>({gList.length})</span>
                  </button>

                  {!collapsedGroups[direction.id] && (
                    <div className="flex flex-col gap-4 pl-5" style={{ borderLeft: `2px solid ${direction.color}30` }}>
                      {gList.map(g => {
                        const progress = getProgress(g)
                        const status = getStatusInfo(g.status)
                        const msDone = g.milestones.filter(m => m.done).length
                        const msTotal = g.milestones.length
                        const linkedPlan = g.planId ? plans.find(p => p.id === g.planId) : null
                        const isActive = g.status === 'active'

                        return (
                          <div key={g.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', opacity: isActive ? 1 : 0.55 }}>
                            {/* Meta header */}
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className="text-[15px] font-bold m-0" style={{ color: 'var(--color-text-primary)' }}>{g.title}</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${status.color}20`, color: status.color }}>{status.label}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>{goalTypes.find(t => t.id === g.type)?.label}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${direction.color}20`, color: direction.color }}>{g.quarter}</span>
                                  </div>
                                  {g.description && <p className="text-[12px] m-0 mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{g.description}</p>}
                                </div>
                                <div className="flex items-center gap-1 ml-3">
                                  <button
                                    onClick={() => toggleGoalStatus(g.id)}
                                    className="text-[10px] font-medium cursor-pointer rounded px-2 py-1 border-none"
                                    style={{ background: 'var(--color-bg-input)', color: isActive ? '#10b981' : 'var(--color-text-muted)' }}
                                    title={isActive ? 'Pausar meta' : 'Ativar meta'}
                                  >
                                    {isActive ? 'Ativo ✓' : 'Pausado'}
                                  </button>
                                  <button onClick={() => openGoalModal(g)} className="border-none cursor-pointer p-1.5 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button onClick={() => deleteGoal(g.id)} className="border-none cursor-pointer p-1.5 rounded" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                  </button>
                                </div>
                              </div>

                              {/* Progress */}
                              <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{g.metric || 'Progresso'}</span>
                                  <span className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{g.currentValue} / {g.targetValue}</span>
                                </div>
                                <div className="h-[8px] rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: direction.color }}></div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{progress}% concluído</span>
                                  {g.deadline && <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Prazo: {g.deadline.split('-').reverse().slice(0, 2).join('/')}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Milestones */}
                            <div className="px-5 py-4" style={{ background: 'var(--color-bg-main)', borderTop: '1px solid var(--color-border)' }}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Milestones</span>
                                <span className="text-[11px] font-semibold" style={{ color: direction.color }}>{msDone}/{msTotal}</span>
                              </div>
                              <div className="h-[4px] rounded-full overflow-hidden mb-4" style={{ background: 'var(--color-border)' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${msTotal > 0 ? (msDone / msTotal) * 100 : 0}%`, background: direction.color }}></div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {g.milestones.map(m => (
                                  editingMsId === m.id ? (
                                    <div
                                      key={m.id}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                      style={{ background: 'var(--color-bg-surface)', border: '1px solid ' + direction.color }}
                                    >
                                      <input
                                        type="text"
                                        value={editingMsText}
                                        onChange={e => setEditingMsText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') saveEditMilestone(g.id, m.id); if (e.key === 'Escape') cancelEditMilestone() }}
                                        autoFocus
                                        className="flex-1 text-[13px]"
                                      />
                                      <button onClick={() => saveEditMilestone(g.id, m.id)} className="text-[11px] font-semibold cursor-pointer rounded px-3 py-1.5 border-none" style={{ background: direction.color, color: '#fff' }}>Salvar</button>
                                      <button onClick={cancelEditMilestone} className="text-[11px] cursor-pointer rounded px-2 py-1.5 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>✕</button>
                                    </div>
                                  ) : (
                                    <div
                                      key={m.id}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group/ms"
                                      style={{ background: m.done ? 'rgba(255,255,255,.03)' : 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                                      onClick={() => toggleMilestone(g.id, m.id)}
                                    >
                                      <div className="w-[18px] h-[18px] rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors" style={{ borderColor: m.done ? direction.color : 'var(--color-text-label)', background: m.done ? direction.color : 'transparent' }}>
                                        {m.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                      </div>
                                      <span className="text-[13px] flex-1" style={{ color: m.done ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.title}</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); startEditMilestone(m) }}
                                        className="opacity-0 group-hover/ms:opacity-100 border-none cursor-pointer p-1 rounded transition-opacity"
                                        style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
                                        title="Editar milestone"
                                      >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); removeMilestoneInline(g.id, m.id) }}
                                        className="opacity-0 group-hover/ms:opacity-100 border-none cursor-pointer p-1 rounded transition-opacity"
                                        style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
                                        title="Remover milestone"
                                      >
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                      </button>
                                    </div>
                                  )
                                ))}

                                {/* Adicionar milestone inline */}
                                {msFormGoalId === g.id ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={msInput}
                                      onChange={e => setMsInput(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') addMilestoneInline(g.id); if (e.key === 'Escape') { setMsFormGoalId(null); setMsInput('') } }}
                                      placeholder="Título do milestone..."
                                      className="flex-1 text-[12px]"
                                      autoFocus
                                    />
                                    <button onClick={() => addMilestoneInline(g.id)} className="text-[11px] font-semibold cursor-pointer rounded px-3 py-1.5 border-none" style={{ background: direction.color, color: '#fff' }}>Adicionar</button>
                                    <button onClick={() => { setMsFormGoalId(null); setMsInput('') }} className="text-[11px] cursor-pointer rounded px-2 py-1.5 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>✕</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setMsFormGoalId(g.id); setMsInput('') }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-none cursor-pointer text-left transition-colors text-[12px]"
                                    style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-row-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg-input)'}
                                  >
                                    + Adicionar milestone
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Plano vinculado */}
                            <div className="px-5 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,.01)' }}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>PLANO DE AÇÃO VINCULADO</span>
                                {linkedPlan && (
                                  <button
                                    onClick={() => setGoals(goals.map(x => x.id === g.id ? { ...x, planId: null } : x))}
                                    className="text-[11px] cursor-pointer rounded px-2 py-1 border-none"
                                    style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}
                                  >
                                    Desvincular
                                  </button>
                                )}
                              </div>

                              {linkedPlan ? (
                                <div
                                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group/pl"
                                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                                  onClick={() => onOpenPlanModal(linkedPlan)}
                                  onMouseEnter={(e) => e.currentTarget.style.borderColor = direction.color}
                                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                >
                                  <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: direction.color }}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold truncate m-0" style={{ color: 'var(--color-text-primary)' }}>{linkedPlan.title}</p>
                                    <p className="text-[10px] m-0" style={{ color: 'var(--color-text-muted)' }}>
                                      {linkedPlan.milestones.filter(m => m.done).length}/{linkedPlan.milestones.length} milestones • {linkedPlan.startDate ? linkedPlan.startDate.split('-').reverse().slice(0,2).join('/') : ''} → {linkedPlan.endDate ? linkedPlan.endDate.split('-').reverse().slice(0,2).join('/') : ''}
                                    </p>
                                  </div>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)' }}>
                                    <path d="M9 18l6-6-6-6"/>
                                  </svg>
                                </div>
                              ) : (
                                <select
                                  value=""
                                  onChange={(e) => { if (e.target.value) setGoals(goals.map(x => x.id === g.id ? { ...x, planId: Number(e.target.value) } : x)) }}
                                  className="w-full text-[12px]"
                                >
                                  <option value="">Vincular a um plano existente...</option>
                                  {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {goals.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-[13px] m-0" style={{ color: 'var(--color-text-muted)' }}>Nenhuma meta criada ainda.</p>
                  <p className="text-[12px] m-0 mt-1" style={{ color: 'var(--color-text-label)' }}>Clique em "+ Nova Meta" para adicionar uma meta anual.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MODAL DIRECIONAMENTO ═══ */}
      {dirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setDirModal(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.7)' }}></div>
          <div className="relative rounded-xl flex w-full max-w-[820px] max-h-[90vh] overflow-hidden" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 25px 80px var(--color-shadow)' }} onClick={e => e.stopPropagation()}>
            {/* Coluna esquerda — formulário */}
            <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto" style={{ borderRight: '1px solid var(--color-border)' }}>
              <h3 className="text-[16px] font-semibold m-0" style={{ color: 'var(--color-text-primary)' }}>{editingDir ? 'Editar' : 'Novo'} Direcionamento</h3>
              <input type="text" value={dirForm.title} onChange={e => setDirForm({ ...dirForm, title: e.target.value })} placeholder="Ex: Crescimento & Receita" className="bg-transparent border-none outline-none text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)', padding: '10px' }} autoFocus />
              <textarea value={dirForm.description} onChange={e => setDirForm({ ...dirForm, description: e.target.value })} placeholder="Por que essa área é importante?" rows={3} className="resize-none text-[13px]" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border-input)', borderRadius: '6px', padding: '10px 12px', color: 'var(--color-text-primary)', outline: 'none' }} />
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>COR</span>
                <div className="flex gap-2">
                  {defaultColors.map(c => (
                    <button key={c} onClick={() => setDirForm({ ...dirForm, color: c })} className="w-[22px] h-[22px] rounded-full border-2 cursor-pointer transition-transform" style={{ background: c, borderColor: dirForm.color === c ? 'var(--color-text-primary)' : 'transparent', transform: dirForm.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDirModal(false)} className="text-[13px] cursor-pointer rounded-lg px-4 py-2 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>Cancelar</button>
                <button onClick={saveDir} disabled={!dirForm.title.trim()} className="text-[13px] font-semibold cursor-pointer rounded-lg px-5 py-2 border-none transition-opacity" style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)', opacity: dirForm.title.trim() ? 1 : 0.4 }}>{editingDir ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
            {/* Coluna direita — dicas */}
            <div className="w-[300px] flex-shrink-0 p-5 overflow-y-auto" style={{ background: 'var(--color-bg-main)' }}>
              <TipsPanel type="direction" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL META ═══ */}
      {goalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setGoalModal(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.7)' }}></div>
          <div className="relative rounded-xl flex w-full max-w-[900px] max-h-[90vh] overflow-hidden" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', boxShadow: '0 25px 80px var(--color-shadow)' }} onClick={e => e.stopPropagation()}>
            {/* Coluna esquerda — formulário */}
            <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto" style={{ borderRight: '1px solid var(--color-border)' }}>
            <input type="text" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Nome da meta" className="bg-transparent border-none outline-none text-[18px] font-semibold" style={{ color: 'var(--color-text-primary)' }} autoFocus />
            <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>DESCRIÇÃO</span>
                <textarea value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Por que essa meta importa?" rows={2} className="resize-none text-[13px]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>DIRECIONAMENTO</span>
                  <select value={goalForm.directionId} onChange={e => setGoalForm({ ...goalForm, directionId: Number(e.target.value) })}>
                    {directions.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>TIPO</span>
                  <select value={goalForm.type} onChange={e => setGoalForm({ ...goalForm, type: e.target.value })}>
                    {goalTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>STATUS</span>
                  <select value={goalForm.status} onChange={e => setGoalForm({ ...goalForm, status: e.target.value })}>
                    {statusOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>TRIMESTRE</span>
                  <select value={goalForm.quarter} onChange={e => setGoalForm({ ...goalForm, quarter: e.target.value })}>
                    {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>

              <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>MÉTRICA DE PROGRESSO</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Nome</span>
                    <input type="text" value={goalForm.metric} onChange={e => setGoalForm({ ...goalForm, metric: e.target.value })} placeholder="Ex: Receita" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Atual</span>
                    <input type="number" value={goalForm.currentValue} onChange={e => setGoalForm({ ...goalForm, currentValue: Number(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Meta</span>
                    <input type="number" value={goalForm.targetValue} onChange={e => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>PRAZO</span>
                <input type="date" value={goalForm.deadline} onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })} />
              </div>

              <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>MILESTONES</span>
                {goalForm.milestones.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-1">
                    {goalForm.milestones.map(m => (
                      <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{m.title}</span>
                        <button onClick={() => removeMilestone(m.id)} className="border-none bg-transparent cursor-pointer text-[11px] p-0" style={{ color: 'var(--color-text-muted)' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={milestoneInput} onChange={e => setMilestoneInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())} placeholder="Ex: Fechar 3 clientes novos" className="flex-1 text-[12px]" />
                  <button onClick={addMilestone} disabled={!milestoneInput.trim()} className="text-[12px] font-semibold cursor-pointer rounded-lg px-3 py-1.5 border-none transition-opacity" style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)', opacity: milestoneInput.trim() ? 1 : 0.4 }}>Adicionar</button>
                </div>
              </div>

              <div className="w-full h-[1px]" style={{ background: 'var(--color-border)' }}></div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>VINCULAR A PLANO DE AÇÃO</span>
                <select value={goalForm.planId || ''} onChange={e => setGoalForm({ ...goalForm, planId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Nenhum plano vinculado</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setGoalModal(false)} className="text-[13px] cursor-pointer rounded-lg px-4 py-2 border-none" style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>Cancelar</button>
              <button onClick={saveGoal} disabled={!goalForm.title.trim()} className="text-[13px] font-semibold cursor-pointer rounded-lg px-5 py-2 border-none transition-opacity" style={{ background: 'var(--color-button-cta)', color: 'var(--color-button-cta-text)', opacity: goalForm.title.trim() ? 1 : 0.4 }}>{editingGoalId ? 'Salvar' : 'Criar Meta'}</button>
            </div>
            </div>

            {/* Coluna direita — dicas */}
            <div className="w-[300px] flex-shrink-0 p-5 overflow-y-auto" style={{ background: 'var(--color-bg-main)' }}>
              <TipsPanel type="goal" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}