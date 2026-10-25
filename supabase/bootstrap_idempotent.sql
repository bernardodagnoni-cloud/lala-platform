-- Consolidated, idempotent version of schema.sql + migration_001..009.
-- Safe to paste into the SQL Editor and run on a project in ANY state —
-- empty, partially set up, or fully set up already. Every statement either
-- uses IF NOT EXISTS, or drops-then-recreates (policies/triggers have no
-- native IF NOT EXISTS in Postgres), or checks current column state before
-- altering (the skills/opportunity_type type conversion from migration_008).

create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('laLider', 'company')),
  full_name text not null,
  location text,
  bio text,
  education text,
  experience text,
  opportunity_type text,
  skills text,
  company_name text,
  company_description text,
  website text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.positions (
  id uuid primary key default uuid_generate_v4(),
  company_profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text not null,
  location text,
  opportunity_type text not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

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

create table if not exists public.profile_diversity (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  gender text,
  gender_identity text,
  sexual_orientation text,
  race_color text,
  updated_at timestamptz default now() not null
);

-- ── Columns added by migrations 001-009 ────────────────────────────────
alter table public.profiles add column if not exists linkedin_url text;
alter table public.profiles add column if not exists life_stage text;
alter table public.profiles add column if not exists open_to_opportunities boolean default true;
alter table public.profiles add column if not exists approved boolean default false;
alter table public.profiles add column if not exists registration_notified boolean default false;
alter table public.profiles add column if not exists lala_id text unique;
alter table public.profiles add column if not exists contact_email text;
alter table public.profiles add column if not exists volunteer_experience text;
alter table public.profiles add column if not exists cv_url text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists work_experience jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists skills_other text;
alter table public.profiles add column if not exists work_arrangements text[];
alter table public.profiles add column if not exists desired_role text;
alter table public.profiles add column if not exists open_to_relocate text;
alter table public.positions add column if not exists affirmative_action boolean not null default false;
alter table public.positions add column if not exists work_modality text;

-- skills / opportunity_type: migration_008 converts these from text to
-- text[]. Only run the conversion if they're still plain text (re-running
-- it on an already-converted text[] column would error).
do $$
begin
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'skills') = 'text' then
    alter table public.profiles alter column skills drop default;
    alter table public.profiles alter column skills type text[]
      using case when skills is null or skills = '' then null
                 else regexp_split_to_array(trim(both from skills), '\s*,\s*') end;
  end if;

  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'opportunity_type') = 'text' then
    alter table public.profiles alter column opportunity_type drop default;
    alter table public.profiles alter column opportunity_type type text[]
      using case when opportunity_type is null or opportunity_type = '' then null
                 else array[opportunity_type] end;
  end if;
end $$;

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.positions enable row level security;
alter table public.matches enable row level security;
alter table public.profile_diversity enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

drop policy if exists "Positions are viewable by authenticated users" on public.positions;
create policy "Positions are viewable by authenticated users"
  on public.positions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Companies can insert their own positions" on public.positions;
create policy "Companies can insert their own positions"
  on public.positions for insert
  with check (
    company_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

drop policy if exists "Companies can update their own positions" on public.positions;
create policy "Companies can update their own positions"
  on public.positions for update
  using (
    company_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

drop policy if exists "Companies can view their position matches" on public.matches;
create policy "Companies can view their position matches"
  on public.matches for select
  using (
    position_id in (
      select pos.id from public.positions pos
      join public.profiles pr on pr.id = pos.company_profile_id
      where pr.user_id = auth.uid()
    )
  );

drop policy if exists "LaLideres can view their own matches" on public.matches;
create policy "LaLideres can view their own matches"
  on public.matches for select
  using (
    lalider_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can insert matches" on public.matches;
create policy "Authenticated users can insert matches"
  on public.matches for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update matches" on public.matches;
create policy "Authenticated users can update matches"
  on public.matches for update
  using (auth.role() = 'authenticated');

drop policy if exists "LaLideres can view their own diversity answers" on public.profile_diversity;
create policy "LaLideres can view their own diversity answers"
  on public.profile_diversity for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Companies with affirmative action openings can view diversity answers" on public.profile_diversity;
create policy "Companies with affirmative action openings can view diversity answers"
  on public.profile_diversity for select
  using (
    exists (
      select 1
      from public.positions p
      join public.profiles cp on cp.id = p.company_profile_id
      where cp.user_id = auth.uid() and p.affirmative_action = true
    )
  );

drop policy if exists "LaLideres can insert their own diversity answers" on public.profile_diversity;
create policy "LaLideres can insert their own diversity answers"
  on public.profile_diversity for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "LaLideres can update their own diversity answers" on public.profile_diversity;
create policy "LaLideres can update their own diversity answers"
  on public.profile_diversity for update
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- ── Functions & triggers ────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_profile_diversity_updated on public.profile_diversity;
create trigger on_profile_diversity_updated
  before update on public.profile_diversity
  for each row execute procedure public.handle_updated_at();
