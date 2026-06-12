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

create table if not exists public.loop_asset_files (
  id uuid primary key default gen_random_uuid(),
  project_id text references public.loop_projects(id) on delete cascade,
  asset_id text,
  kind text not null default 'generated-asset',
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  generated_by text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_loop_asset_files_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists loop_asset_files_set_updated_at on public.loop_asset_files;
create trigger loop_asset_files_set_updated_at
before update on public.loop_asset_files
for each row
execute function public.set_loop_asset_files_updated_at();

alter table public.loop_asset_files enable row level security;

drop policy if exists "public can read loop asset files" on public.loop_asset_files;
create policy "public can read loop asset files"
on public.loop_asset_files
for select
to anon, authenticated
using (true);

drop policy if exists "public can insert loop asset files" on public.loop_asset_files;
create policy "public can insert loop asset files"
on public.loop_asset_files
for insert
to anon, authenticated
with check (true);

drop policy if exists "public can update loop asset files" on public.loop_asset_files;
create policy "public can update loop asset files"
on public.loop_asset_files
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public can delete loop asset files" on public.loop_asset_files;
create policy "public can delete loop asset files"
on public.loop_asset_files
for delete
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('loop-assets', 'loop-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can view loop assets" on storage.objects;
create policy "public can view loop assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'loop-assets');

drop policy if exists "public can upload loop assets" on storage.objects;
create policy "public can upload loop assets"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'loop-assets');

drop policy if exists "public can update loop assets" on storage.objects;
create policy "public can update loop assets"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'loop-assets')
with check (bucket_id = 'loop-assets');

drop policy if exists "public can delete loop assets" on storage.objects;
create policy "public can delete loop assets"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'loop-assets');
