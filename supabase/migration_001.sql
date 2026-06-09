-- Run this in Supabase SQL Editor to add matches and LinkedIn support

-- Add LinkedIn URL to profiles
alter table public.profiles add column if not exists linkedin_url text;

-- Matches table — stores AI match results
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  position_id uuid references public.positions(id) on delete cascade not null,
  lalider_profile_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 10),
  match_reason text not null,
  gaps text,
  created_at timestamptz default now() not null,
  unique(position_id, lalider_profile_id)
);

alter table public.matches enable row level security;

-- Companies can see matches for their own positions
create policy "Companies can view their position matches"
  on public.matches for select
  using (
    position_id in (
      select pos.id from public.positions pos
      join public.profiles pr on pr.id = pos.company_profile_id
      where pr.user_id = auth.uid()
    )
  );

-- LaLideres can see their own matches
create policy "LaLideres can view their own matches"
  on public.matches for select
  using (
    lalider_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert matches (company triggering the match)
create policy "Authenticated users can insert matches"
  on public.matches for insert
  with check (auth.role() = 'authenticated');

-- Allow re-running matches (upsert)
create policy "Authenticated users can update matches"
  on public.matches for update
  using (auth.role() = 'authenticated');
