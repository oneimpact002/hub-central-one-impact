-- =============================================
-- SUPABASE SCHEMA — Hub Central
-- =============================================

-- ─── DIRECIONAMENTOS ───
create table if not exists public.directions (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  color text default '#6366f1',
  active boolean default true,
  created_at timestamptz default now()
);

-- ─── METAS ANUAIS ───
create table if not exists public.goals (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  direction_id bigint references public.directions(id) on delete set null,
  type text default 'resultado',
  status text default 'active',
  metric text,
  current_value numeric default 0,
  target_value numeric default 100,
  quarter text default 'Q2',
  deadline date,
  plan_id bigint,
  created_at timestamptz default now()
);

-- ─── MILESTONES DE META ───
create table if not exists public.goal_milestones (
  id bigint generated always as identity primary key,
  goal_id bigint references public.goals(id) on delete cascade,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- ─── PLANOS DE AÇÃO ───
create table if not exists public.plans (
  id bigint generated always as identity primary key,
  title text not null,
  context text,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

-- ─── MILESTONES DE PLANO ───
create table if not exists public.plan_milestones (
  id bigint generated always as identity primary key,
  plan_id bigint references public.plans(id) on delete cascade,
  title text not null,
  due_date date,
  done boolean default false,
  created_at timestamptz default now()
);

-- ─── DOCUMENTOS DE PLANO ───
create table if not exists public.plan_documents (
  id bigint generated always as identity primary key,
  plan_id bigint references public.plans(id) on delete cascade,
  title text not null,
  url text,
  created_at timestamptz default now()
);

-- ─── TAREFAS ───
create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  priority text default 'qualquer-momento',
  client text,
  due_date date,
  execution_date date,
  status text default 'Pendente',
  responsible text,
  comment text,
  tags text[],
  completed boolean default false,
  plan_id bigint references public.plans(id) on delete set null,
  milestone_id bigint,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Para desenvolvimento: tudo público
-- Em produção, ativar RLS e configurar autenticação
-- =============================================

alter table public.directions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.plans enable row level security;
alter table public.plan_milestones enable row level security;
alter table public.plan_documents enable row level security;
alter table public.tasks enable row level security;

-- Liberar tudo para desenvolvimento
create policy "public_all" on public.directions for all using (true) with check (true);
create policy "public_all" on public.goals for all using (true) with check (true);
create policy "public_all" on public.goal_milestones for all using (true) with check (true);
create policy "public_all" on public.plans for all using (true) with check (true);
create policy "public_all" on public.plan_milestones for all using (true) with check (true);
create policy "public_all" on public.plan_documents for all using (true) with check (true);
create policy "public_all" on public.tasks for all using (true) with check (true);