-- FoodSafeAI admin role management schema (RLS + RPC)
-- Apply in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- 1) Role enum

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('admin', 'user');
  end if;
end;
$$;

-- 2) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.app_role not null default 'user',
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- 3) Role change logs
create table if not exists public.role_change_logs (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  old_role public.app_role not null,
  new_role public.app_role not null,
  changed_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists role_change_logs_target_idx
  on public.role_change_logs (target_user_id, created_at desc);
create index if not exists role_change_logs_changed_by_idx
  on public.role_change_logs (changed_by, created_at desc);

-- 4) Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute procedure public.touch_updated_at();

-- 5) RLS
alter table public.profiles enable row level security;
alter table public.role_change_logs enable row level security;

-- Drop old policies for idempotent re-run

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_admin on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists role_change_logs_select_admin on public.role_change_logs;

-- profiles: users can read own row
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- profiles: admins can read all rows
create policy profiles_select_admin
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- profiles: users can insert their own row only
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- logs: only admins can view
create policy role_change_logs_select_admin
on public.role_change_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- 6) RPC: admin role change with self-demotion guard + audit log
create or replace function public.admin_set_user_role(
  target_user_id uuid,
  next_role public.app_role
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.app_role;
  v_target public.profiles%rowtype;
  v_updated public.profiles%rowtype;
begin
  if v_actor_id is null then
    raise exception 'authentication required'
      using errcode = '28000';
  end if;

  select p.role
    into v_actor_role
  from public.profiles p
  where p.id = v_actor_id;

  if v_actor_role is distinct from 'admin'::public.app_role then
    raise exception 'admin role required'
      using errcode = '42501';
  end if;

  select *
    into v_target
  from public.profiles
  where id = target_user_id
  for update;

  if not found then
    raise exception 'target profile not found'
      using errcode = 'P0002';
  end if;

  if v_actor_id = target_user_id and next_role = 'user'::public.app_role then
    raise exception 'self demotion is not allowed'
      using errcode = 'P0001';
  end if;

  update public.profiles
  set role = next_role,
      updated_at = now()
  where id = target_user_id
  returning * into v_updated;

  if v_target.role is distinct from v_updated.role then
    insert into public.role_change_logs (
      target_user_id,
      old_role,
      new_role,
      changed_by
    ) values (
      target_user_id,
      v_target.role,
      v_updated.role,
      v_actor_id
    );
  end if;

  return v_updated;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, public.app_role) from public;
grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;

-- 7) Optional: bootstrap profile rows from auth.users (for existing users)
insert into public.profiles (id, email)
select u.id, coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

-- 8) Initial admin assignment example (run manually after login/profile exists)
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-admin-email@example.com';
