-- MobileAgents Supabase Schema
-- Run this in the Supabase SQL Editor

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  transparency_level text not null default 'full_transparency',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversations enable row level security;
-- No RLS policies — everyone sees everything
create policy "Allow all" on conversations for all using (true) with check (true);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null,
  content text not null default '',
  image_url text,
  voice_transcript text,
  agent_id text,
  input_modality text not null default 'text',
  task_plan jsonb,
  execution_graph jsonb,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;
create policy "Allow all" on messages for all using (true) with check (true);

-- Executions
create table if not exists executions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  plan jsonb not null default '{}',
  graph jsonb not null default '{}',
  status text not null default 'pending',
  summary text,
  step_results jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table executions enable row level security;
create policy "Allow all" on executions for all using (true) with check (true);

-- Approvals
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid references executions(id) on delete cascade not null,
  step_id text not null,
  approved boolean,
  comment text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table approvals enable row level security;
create policy "Allow all" on approvals for all using (true) with check (true);
