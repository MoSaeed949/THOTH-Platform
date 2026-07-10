-- ============================================================
-- Migration 0001 — Subscriptions, Billing history, Contact messages
-- Safe to run on an existing Thoth database. Idempotent: uses
-- `create table if not exists`, `drop policy if exists`, and
-- `create index if not exists`, so re-running it will not error.
-- Run in the Supabase SQL Editor (or via psql).
-- ============================================================

-- Subscriptions --------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'basic', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists "Owner full access to subscriptions" on public.subscriptions;
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
drop policy if exists "Owner full access to billing_history" on public.billing_history;
create policy "Owner full access to billing_history" on public.billing_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contact messages -----------------------------------------------------------
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
drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message" on public.contact_messages
  for insert with check (true);
drop policy if exists "Users can read their own contact messages" on public.contact_messages;
create policy "Users can read their own contact messages" on public.contact_messages
  for select using (auth.uid() = user_id);

-- Indexes --------------------------------------------------------------------
create index if not exists billing_history_user_created_idx
  on public.billing_history (user_id, created_at desc);
create index if not exists contact_messages_user_idx
  on public.contact_messages (user_id);
create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
