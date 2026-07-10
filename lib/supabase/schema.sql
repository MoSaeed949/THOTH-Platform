-- ============================================================
-- Thoth — Database Schema for Supabase (Postgres)
-- Run this once in the Supabase SQL Editor for your project.
-- ============================================================

-- Profiles -----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Study plans ----------------------------------------------------
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  tasks jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.study_plans enable row level security;
create policy "Owner full access to study_plans" on public.study_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Summaries --------------------------------------------------------
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_text text not null,
  summary_text text not null,
  created_at timestamptz not null default now()
);
alter table public.summaries enable row level security;
create policy "Owner full access to summaries" on public.summaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quizzes ------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  summary_id uuid references public.summaries(id) on delete set null,
  title text not null,
  questions jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.quizzes enable row level security;
create policy "Owner full access to quizzes" on public.quizzes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total integer not null,
  answers jsonb not null default '[]',
  created_at timestamptz not null default now()
);
alter table public.quiz_attempts enable row level security;
create policy "Owner full access to quiz_attempts" on public.quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Flashcards --------------------------------------------------------
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);
alter table public.flashcard_decks enable row level security;
create policy "Owner full access to flashcard_decks" on public.flashcard_decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  interval_days integer not null default 1,
  ease numeric not null default 2.5,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.flashcards enable row level security;
create policy "Owner full access to flashcards" on public.flashcards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pomodoro sessions ----------------------------------------------------
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null,
  completed_at timestamptz not null default now()
);
alter table public.pomodoro_sessions enable row level security;
create policy "Owner full access to pomodoro_sessions" on public.pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Achievements -----------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, key)
);
alter table public.achievements enable row level security;
create policy "Owner full access to achievements" on public.achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mentor chat messages -----------------------------------------------------
create table if not exists public.mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.mentor_messages enable row level security;
create policy "Owner full access to mentor_messages" on public.mentor_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Revision schedule ----------------------------------------------------------
create table if not exists public.revision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now()
);
alter table public.revision_items enable row level security;
create policy "Owner full access to revision_items" on public.revision_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscriptions --------------------------------------------------------------
-- One row per user describing their current plan. The Free plan may be
-- represented either by the absence of a row or by plan_id = 'free'. Billing is
-- currently simulated (no real charges); the schema is shaped to map cleanly
-- onto a Stripe integration later (add stripe_customer_id / stripe_subscription_id).
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'basic', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  -- When true, the plan stays active until current_period_end, then reverts to Free.
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  -- Reserved for a future Stripe integration:
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Owner full access to subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Billing history ------------------------------------------------------------
create table if not exists public.billing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  amount numeric not null,
  currency text not null default 'USD',
  status text not null default 'paid' check (status in ('paid', 'refunded', 'failed')),
  period_start timestamptz not null default now(),
  period_end timestamptz,
  created_at timestamptz not null default now()
);
alter table public.billing_history enable row level security;
create policy "Owner full access to billing_history" on public.billing_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contact messages -----------------------------------------------------------
-- Submissions from the public Contact form. Anyone (including anonymous
-- visitors) may INSERT; only the sender — when signed in — may read their own
-- messages back. Support staff read these via the service role / dashboard.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can submit a contact message" on public.contact_messages
  for insert with check (true);
create policy "Users can read their own contact messages" on public.contact_messages
  for select using (auth.uid() = user_id);

-- Indexes for the new tables (idempotent; safe to re-run) ---------------------
create index if not exists billing_history_user_created_idx
  on public.billing_history (user_id, created_at desc);
create index if not exists contact_messages_user_idx
  on public.contact_messages (user_id);
create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
