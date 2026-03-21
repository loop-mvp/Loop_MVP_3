create extension if not exists pgcrypto;

create table if not exists public.loop_projects (
  id text primary key,
  name text not null default 'Untitled Test Project',
  description text not null default 'Loop MVP project',
  launch_date date,
  version text not null default 'v1.0',
  status text not null default 'Planned',
  platform_mode text not null default 'test',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_loop_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists loop_projects_set_updated_at on public.loop_projects;
create trigger loop_projects_set_updated_at
before update on public.loop_projects
for each row
execute function public.set_loop_projects_updated_at();

alter table public.loop_projects enable row level security;

drop policy if exists "public can read loop projects" on public.loop_projects;
create policy "public can read loop projects"
on public.loop_projects
for select
to anon, authenticated
using (true);

drop policy if exists "public can insert loop projects" on public.loop_projects;
create policy "public can insert loop projects"
on public.loop_projects
for insert
to anon, authenticated
with check (true);

drop policy if exists "public can update loop projects" on public.loop_projects;
create policy "public can update loop projects"
on public.loop_projects
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public can delete loop projects" on public.loop_projects;
create policy "public can delete loop projects"
on public.loop_projects
for delete
to anon, authenticated
using (true);
