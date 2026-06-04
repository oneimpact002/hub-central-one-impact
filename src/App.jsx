import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import PlansView from './components/PlansView'
import CalendarView from './components/CalendarView'
import GoalsView from './components/GoalsView'
import HomeView from './components/HomeView'
import PlanModal from './components/PlanModal'
import './App.css'

const TEAM_MEMBERS = ['Karol', 'Gabi', 'Chris']

const properties = [
  { id: 'priority', label: 'Prioridade', visible: true },
  { id: 'responsible', label: 'Responsável', visible: true },
  { id: 'executionDate', label: 'Data Execução', visible: true },
  { id: 'dueDate', label: 'Prazo', visible: true },
  { id: 'tags', label: 'Tags', visible: false },
  { id: 'comment', label: 'Comentários', visible: false },
]

const tabs = [
  { id: 'home', label: 'Início' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'calendario', label: 'Calendário' },
  { id: 'planos', label: 'Planos de Ação' },
  { id: 'direcionamento', label: 'Direcionamento' },
]

// ─── Map DB → JS ────────────────────────────────
const mapTask = t => ({
  id: t.id,
  title: t.title,
  priority: t.priority || 'qualquer-momento',
  client: t.client || '',
  dueDate: t.due_date || '',
  executionDate: t.execution_date || '',
  status: t.status || 'Pendente',
  responsible: t.responsible || '',
  comment: t.comment || '',
  tags: t.tags || [],
  completed: t.completed || false,
  planId: t.plan_id || null,
  milestoneId: t.milestone_id || null,
})

const mapPlan = p => ({
  id: p.id,
  title: p.title,
  context: p.context || '',
  startDate: p.start_date || '',
  endDate: p.end_date || '',
  status: p.status || 'active',
  createdAt: p.created_at || '',
  documents: (p.plan_documents || []).map(d => ({ id: d.id, title: d.title, url: d.url })),
  milestones: (p.plan_milestones || []).map(m => ({ id: m.id, title: m.title, dueDate: m.due_date || '', done: m.done || false })),
})

const mapDirection = d => ({
  id: d.id,
  title: d.title,
  description: d.description || '',
  color: d.color || '#6366f1',
  active: d.active !== false,
})

const mapGoal = g => ({
  id: g.id,
  title: g.title,
  description: g.description || '',
  directionId: g.direction_id || null,
  type: g.type || 'resultado',
  status: g.status || 'active',
  metric: g.metric || '',
  currentValue: g.current_value || 0,
  targetValue: g.target_value || 100,
  quarter: g.quarter || 'Q2',
  deadline: g.deadline || '',
  planId: g.plan_id || null,
  milestones: (g.goal_milestones || []).map(m => ({ id: m.id, title: m.title, done: m.done || false })),
})

// ─── Map JS → DB ────────────────────────────────
const toDbTask = f => ({
  title: f.title,
  priority: f.priority || 'qualquer-momento',
  client: f.client || '',
  due_date: f.dueDate || null,
  execution_date: f.executionDate || null,
  status: f.status || 'Pendente',
  responsible: f.responsible || '',
  comment: f.comment || '',
  tags: f.tags || [],
  completed: f.completed || false,
  plan_id: f.planId || null,
  milestone_id: f.milestoneId || null,
})

const toDbPlan = f => ({
  title: f.title,
  context: f.context || '',
  start_date: f.startDate || null,
  end_date: f.endDate || null,
  status: f.status || 'active',
  milestones: undefined,
})

const toDbDirection = f => ({
  title: f.title,
  description: f.description || '',
  color: f.color || '#6366f1',
  active: f.active !== undefined ? f.active : true,
})

const toDbGoal = f => ({
  title: f.title,
  description: f.description || '',
  direction_id: f.directionId || null,
  type: f.type || 'resultado',
  status: f.status || 'active',
  metric: f.metric || '',
  current_value: f.currentValue || 0,
  target_value: f.targetValue || 100,
  quarter: f.quarter || 'Q2',
  deadline: f.deadline || null,
  plan_id: f.planId || null,
})

function App() {
  const [tasks, setTasks] = useState([])
  const [plans, setPlans] = useState([])
  const [directions, setDirections] = useState([])
  const [goals, setGoals] = useState([])
  const [activeTab, setActiveTab] = useState('home')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskInitialForm, setTaskInitialForm] = useState(null)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    loadAll()
  }, [])

  // ─── Load ────────────────────────────────────
  const loadAll = async () => {
    setLoading(true)

    // Carrega planos sem relations aninhadas (evita 400 do select aninhado)
    const plansRes = await supabase.from('plans').select('*')
    if (plansRes.error) console.error('plansRes error:', plansRes.error)

    // Carrega milestones e documentos em paralelo
    const [msRes, docsRes, tasksRes, directionsRes, goalsRes] = await Promise.all([
      supabase.from('plan_milestones').select('*'),
      supabase.from('plan_documents').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('directions').select('*'),
      supabase.from('goals').select('*, goal_milestones(*)'),
    ])

    if (tasksRes.data) setTasks(tasksRes.data.map(mapTask))

    if (plansRes.data) {
      const rawPlans = plansRes.data
      const milestonesMap = {}
      const documentsMap = {}

      ;(msRes.data || []).forEach(m => {
        if (!milestonesMap[m.plan_id]) milestonesMap[m.plan_id] = []
        milestonesMap[m.plan_id].push({ id: m.id, title: m.title, dueDate: m.due_date || '', done: m.done || false })
      })
      ;(docsRes.data || []).forEach(d => {
        if (!documentsMap[d.plan_id]) documentsMap[d.plan_id] = []
        documentsMap[d.plan_id].push({ id: d.id, title: d.title, url: d.url })
      })

      setPlans(rawPlans.map(p => ({
        id: p.id,
        title: p.title,
        context: p.context || '',
        startDate: p.start_date || '',
        endDate: p.end_date || '',
        status: p.status || 'active',
        createdAt: p.created_at || '',
        documents: documentsMap[p.id] || [],
        milestones: milestonesMap[p.id] || [],
      })))
    }

    if (directionsRes.data) setDirections(directionsRes.data.map(mapDirection))
    if (goalsRes.data) setGoals(goalsRes.data.map(mapGoal))
    setLoading(false)
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ─── Tasks ────────────────────────────────────
  const openModal = (task = null, initialForm = null) => {
    setEditingTask(task)
    setTaskInitialForm(initialForm)
    setModalOpen(true)
  }
  const closeModal = () => { setEditingTask(null); setTaskInitialForm(null); setModalOpen(false) }

  const saveTask = async (form) => {
    if (editingTask?.id) {
      const { data } = await supabase.from('tasks').update(toDbTask(form)).eq('id', editingTask.id).select().single()
      if (data) setTasks(t => t.map(x => x.id === editingTask.id ? mapTask(data) : x))
    } else {
      const { data } = await supabase.from('tasks').insert(toDbTask(form)).select().single()
      if (data) setTasks(t => [...t, mapTask(data)])
    }
    closeModal()
  }

  const openTaskModalForMilestone = (planId, milestoneId) => {
    setEditingTask(null)
    setTaskInitialForm({ planId, milestoneId })
    setModalOpen(true)
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const { data } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id).select().single()
    if (data) setTasks(t => t.map(x => x.id === id ? mapTask(data) : x))
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Excluir tarefa?')) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(t => t.filter(x => x.id !== id))
  }

  const updateTask = async (id, changes) => {
    // Converte chaves camelCase → snake_case (usado pelo drag & drop do calendário)
    const dbChanges = {}
    for (const [k, v] of Object.entries(changes)) {
      if (k === 'dueDate') dbChanges.due_date = v
      else if (k === 'executionDate') dbChanges.execution_date = v
      else dbChanges[k] = v
    }
    const { data, error } = await supabase.from('tasks').update(dbChanges).eq('id', id).select().single()
    if (error) {
      console.error('updateTask error:', error)
      return
    }
    if (data) setTasks(t => t.map(x => x.id === id ? mapTask(data) : x))
  }

  // ─── Plans ────────────────────────────────────
  const openPlanModal = (plan = null) => { setEditingPlan(plan); setEditingPlanId(plan?.id || null); setPlanModalOpen(true) }
  const closePlanModal = () => { setEditingPlan(null); setEditingPlanId(null); setPlanModalOpen(false) }

  const savePlan = async (form) => {
    const milestonesForm = form.milestones || []
    const planData = { ...form, milestones: undefined }

    if (editingPlanId) {
      await supabase.from('plans').update(toDbPlan(planData)).eq('id', editingPlanId)

      // Pega milestones atuais do banco para diff
      const { data: existingMs } = await supabase
        .from('plan_milestones')
        .select('*')
        .eq('plan_id', editingPlanId)

      const existingIds = new Set((existingMs || []).map(m => m.id))
      const formIds = new Set(milestonesForm.filter(m => m.id && m.id < 1e12).map(m => m.id))

      // 1. Inserir milestones novos (ID Date.now() = temp, não tem no banco)
      const newMs = milestonesForm.filter(m => !m.id || m.id > 1e12)
      if (newMs.length > 0) {
        const msRows = newMs.map(m => ({
          plan_id: editingPlanId,
          title: m.title,
          due_date: m.dueDate || null,
          done: m.done || false,
        }))
        const { data: msData, error: msError } = await supabase
          .from('plan_milestones')
          .insert(msRows)
          .select()
        if (msError) {
          console.error('Erro ao inserir novos milestones:', msError)
          alert('Erro ao salvar milestones: ' + msError.message)
        } else {
          console.log('Novos milestones inseridos:', msData)
        }
      }

      // 2. Deletar milestones que foram removidos pelo usuário
      const toDelete = (existingMs || [])
        .filter(m => !formIds.has(m.id))
        .map(m => m.id)
      if (toDelete.length > 0) {
        const { error: delError } = await supabase
          .from('plan_milestones')
          .delete()
          .in('id', toDelete)
        if (delError) {
          console.error('Erro ao deletar milestones:', delError)
        } else {
          console.log('Milestones deletados:', toDelete)
        }
      }

      // 3. Atualiza estado local com o que veio do form
      setPlans(plans => plans.map(p => p.id === editingPlanId ? {
        ...p,
        title: planData.title,
        context: planData.context,
        startDate: planData.startDate,
        endDate: planData.endDate,
        status: planData.status,
        milestones: milestonesForm.map(m => ({
          id: m.id < 1e12 ? m.id : m.id,
          title: m.title,
          dueDate: m.dueDate || '',
          done: m.done || false,
        })),
      } : p))
    } else {
      console.log('planData to insert:', JSON.stringify(toDbPlan(planData), null, 2))
      const { data, error } = await supabase.from('plans').insert(toDbPlan(planData)).select()
      if (error) {
        console.error('insert plan error:', error)
        alert('Erro ao criar plano: ' + error.message)
        return
      }
      if (data && data.length > 0) {
        const newPlanId = data[0].id
        console.log('Plano criado com ID:', newPlanId)
        console.log('Milestones a inserir:', milestonesForm.length, milestonesForm)

        let savedMilestones = []
        if (milestonesForm.length > 0) {
          const msRows = milestonesForm.map(m => ({
            plan_id: newPlanId,
            title: m.title,
            due_date: m.dueDate || null,
            done: m.done || false,
          }))
          const { data: msData, error: msError } = await supabase
            .from('plan_milestones')
            .insert(msRows)
            .select()

          if (msError) {
            console.error('Erro ao inserir milestones:', msError)
            alert('Plano criado, mas erro ao salvar milestones: ' + msError.message)
          } else {
            console.log('Milestones inseridos:', msData)
            savedMilestones = (msData || []).map(m => ({
              id: m.id,
              title: m.title,
              dueDate: m.due_date || '',
              done: m.done || false,
            }))
          }
        }

        const newPlan = {
          id: newPlanId,
          title: data[0].title,
          context: data[0].context || '',
          startDate: data[0].start_date || '',
          endDate: data[0].end_date || '',
          status: data[0].status || 'active',
          createdAt: data[0].created_at || '',
          documents: [],
          milestones: savedMilestones,
        }
        setPlans(p => [...p, newPlan])
      }
    }
    closePlanModal()
  }

  const deletePlan = async (id) => {
    const linked = tasks.filter(t => t.planId === id).length
    const msg = linked > 0
      ? `Excluir plano? ${linked} tarefa${linked !== 1 ? 's' : ''} serão desvinculadas.`
      : 'Excluir plano?'
    if (!window.confirm(msg)) return
    await supabase.from('tasks').update({ plan_id: null, milestone_id: null }).eq('plan_id', id)
    await supabase.from('plans').delete().eq('id', id)
    setPlans(p => p.filter(x => x.id !== id))
    setTasks(t => t.map(x => x.planId === id ? { ...x, planId: null, milestoneId: null } : x))
  }

  const toggleMilestone = async (planId, msId) => {
    const plan = plans.find(p => p.id === planId)
    const ms = plan?.milestones.find(m => m.id === msId)
    if (!ms) return
    await supabase.from('plan_milestones').update({ done: !ms.done }).eq('id', msId)
    setPlans(plans.map(p => p.id === planId ? {
      ...p,
      milestones: p.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m),
    } : p))
  }

  const deleteMilestone = async (planId, msId) => {
    await supabase.from('plan_milestones').delete().eq('id', msId)
    setPlans(plans.map(p => p.id === planId ? {
      ...p,
      milestones: p.milestones.filter(m => m.id !== msId),
    } : p))
  }

  const addDocument = async (planId, title, url) => {
    const { data } = await supabase.from('plan_documents').insert({ plan_id: planId, title, url }).select().single()
    if (data) {
      setPlans(plans.map(p => p.id === planId ? { ...p, documents: [...p.documents, { id: data.id, title, url }] } : p))
    }
  }

  const deleteDocument = async (planId, docId) => {
    await supabase.from('plan_documents').delete().eq('id', docId)
    setPlans(plans.map(p => p.id === planId ? { ...p, documents: p.documents.filter(d => d.id !== docId) } : p))
  }

  // ─── Directions ────────────────────────────────
  const deleteDirection = async (id) => {
    if (!window.confirm('Excluir direcionamento?')) return
    await supabase.from('goals').update({ direction_id: null }).eq('direction_id', id)
    await supabase.from('directions').delete().eq('id', id)
    setDirections(d => d.filter(x => x.id !== id))
    setGoals(g => g.map(x => x.directionId === id ? { ...x, directionId: null } : x))
  }

  const toggleDir = async (id) => {
    const dir = directions.find(d => d.id === id)
    if (!dir) return
    const { data } = await supabase.from('directions').update({ active: !dir.active }).eq('id', id).select().single()
    if (data) setDirections(d => d.map(x => x.id === id ? mapDirection(data) : x))
  }

  const createDirection = async (form) => {
    const { data } = await supabase.from('directions').insert(toDbDirection(form)).select().single()
    if (data) setDirections(d => [...d, mapDirection(data)])
  }

  const updateDirection = async (id, form) => {
    const { data } = await supabase.from('directions').update(toDbDirection(form)).eq('id', id).select().single()
    if (data) setDirections(d => d.map(x => x.id === id ? mapDirection(data) : x))
  }

  // ─── Goals ───────────────────────────────────
  const createGoal = async (form) => {
    const milestonesForm = form.milestones || []
    const goalData = { ...form, milestones: undefined }
    const { data } = await supabase.from('goals').insert(toDbGoal(goalData)).select().single()
    if (data) {
      if (milestonesForm.length > 0) {
        const msRows = milestonesForm.map(m => ({ goal_id: data.id, title: m.title, done: m.done || false }))
        await supabase.from('goal_milestones').insert(msRows)
      }
      // Busca milestones separadamente
      const { data: msRows } = await supabase.from('goal_milestones').select('*').eq('goal_id', data.id)
      const newGoal = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        directionId: data.direction_id || null,
        type: data.type || 'resultado',
        status: data.status || 'active',
        metric: data.metric || '',
        currentValue: data.current_value || 0,
        targetValue: data.target_value || 100,
        quarter: data.quarter || 'Q2',
        deadline: data.deadline || '',
        planId: data.plan_id || null,
        milestones: (msRows || []).map(m => ({ id: m.id, title: m.title, done: m.done || false })),
      }
      setGoals(g => [...g, newGoal])
    }
  }

  const updateGoal = async (id, form) => {
    const milestonesForm = form.milestones || []
    const goalData = { ...form, milestones: undefined }
    await supabase.from('goals').update(toDbGoal(goalData)).eq('id', id)
    const newMs = milestonesForm.filter(m => !m.id || m.id > 1e12)
    if (newMs.length > 0) {
      const msRows = newMs.map(m => ({ goal_id: id, title: m.title, done: m.done || false }))
      await supabase.from('goal_milestones').insert(msRows)
    }
    // Busca milestones separadamente
    const { data: msRows } = await supabase.from('goal_milestones').select('*').eq('goal_id', id)
    const { data: goalRow } = await supabase.from('goals').select('*').eq('id', id).single()
    if (goalRow) {
      const updatedGoal = {
        id: goalRow.id,
        title: goalRow.title,
        description: goalRow.description || '',
        directionId: goalRow.direction_id || null,
        type: goalRow.type || 'resultado',
        status: goalRow.status || 'active',
        metric: goalRow.metric || '',
        currentValue: goalRow.current_value || 0,
        targetValue: goalRow.target_value || 100,
        quarter: goalRow.quarter || 'Q2',
        deadline: goalRow.deadline || '',
        planId: goalRow.plan_id || null,
        milestones: (msRows || []).map(m => ({ id: m.id, title: m.title, done: m.done || false })),
      }
      setGoals(g => g.map(x => x.id === id ? updatedGoal : x))
    }
  }

  const deleteGoal = async (id) => {
    if (!window.confirm('Excluir meta?')) return
    await supabase.from('goals').delete().eq('id', id)
    setGoals(g => g.filter(x => x.id !== id))
  }

  const toggleGoalStatus = async (id) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const next = goal.status === 'active' ? 'paused' : 'active'
    const { data } = await supabase.from('goals').update({ status: next }).eq('id', id).select().single()
    if (data) setGoals(g => g.map(x => x.id === id ? mapGoal(data) : x))
  }

  const toggleGoalMilestone = async (goalId, msId) => {
    const goal = goals.find(g => g.id === goalId)
    const ms = goal?.milestones.find(m => m.id === msId)
    if (!ms) return
    await supabase.from('goal_milestones').update({ done: !ms.done }).eq('id', msId)
    setGoals(g => g.map(goal => goal.id === goalId ? {
      ...goal,
      milestones: goal.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m),
    } : goal))
  }

  const addGoalMilestoneInline = async (goalId, title) => {
    const { data } = await supabase.from('goal_milestones').insert({ goal_id: goalId, title, done: false }).select().single()
    if (data) {
      setGoals(g => g.map(goal => goal.id === goalId ? { ...goal, milestones: [...goal.milestones, { id: data.id, title, done: false }] } : goal))
    }
  }

  const removeGoalMilestoneInline = async (goalId, msId) => {
    await supabase.from('goal_milestones').delete().eq('id', msId)
    setGoals(g => g.map(goal => goal.id === goalId ? { ...goal, milestones: goal.milestones.filter(m => m.id !== msId) } : goal))
  }

  const updateGoalMilestoneInline = async (goalId, msId, title) => {
    await supabase.from('goal_milestones').update({ title }).eq('id', msId)
    setGoals(g => g.map(goal => goal.id === goalId ? {
      ...goal,
      milestones: goal.milestones.map(m => m.id === msId ? { ...m, title } : m),
    } : goal))
  }

  // ─── Render ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'home' && (
          <HomeView tasks={tasks} goals={goals} plans={plans} directions={directions} />
        )}
        {activeTab === 'tarefas' && (
          <TaskList tasks={tasks} properties={properties} plans={plans} teamMembers={TEAM_MEMBERS} onToggle={toggleTask} onDelete={deleteTask} onOpenModal={openModal} />
        )}
        {activeTab === 'planos' && (
          <PlansView plans={plans} tasks={tasks} onOpenModal={openPlanModal} onDelete={deletePlan} onToggleMilestone={toggleMilestone} onDeleteMilestone={deleteMilestone} onToggleTask={toggleTask} onDeleteTask={deleteTask} onOpenTaskModal={openModal} onAddTaskToMilestone={openTaskModalForMilestone} onAddDocument={addDocument} onDeleteDocument={deleteDocument} />
        )}
        {activeTab === 'calendario' && (
          <CalendarView tasks={tasks} onOpenModal={openModal} onUpdateTask={updateTask} />
        )}
        {activeTab === 'direcionamento' && (
          <GoalsView directions={directions} setDirections={setDirections} goals={goals} setGoals={setGoals} plans={plans} onOpenPlanModal={openPlanModal} onDeleteDirection={deleteDirection} onToggleDir={toggleDir} onCreateDirection={createDirection} onUpdateDirection={updateDirection} onCreateGoal={createGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} onToggleGoalStatus={toggleGoalStatus} onToggleGoalMilestone={toggleGoalMilestone} onAddGoalMilestone={addGoalMilestoneInline} onRemoveGoalMilestone={removeGoalMilestoneInline} onUpdateGoalMilestone={updateGoalMilestoneInline} />
        )}
      </main>
      {modalOpen && (
        <TaskModal task={editingTask} plans={plans} teamMembers={TEAM_MEMBERS} initialForm={taskInitialForm} onSave={saveTask} onDelete={deleteTask} onClose={closeModal} />
      )}
      {planModalOpen && (
        <PlanModal plan={editingPlan} onSave={savePlan} onClose={closePlanModal} />
      )}
    </div>
  )
}

export default App