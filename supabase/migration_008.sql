-- Profile expansion: mobile number, structured work experience, multi-select
-- skills/opportunity type, work arrangements, and a restricted diversity census.

alter table public.profiles add column if not exists phone text;

-- Structured, repeatable work experience entries (replaces free-text experience
-- for LaLideres going forward). Each entry: { title, company, startDate, endDate, current, description }.
alter table public.profiles add column if not exists work_experience jsonb not null default '[]'::jsonb;

-- Skills: predefined multi-select + freeform overflow.
alter table public.profiles alter column skills drop default;
alter table public.profiles alter column skills type text[]
  using case when skills is null or skills = '' then null else regexp_split_to_array(trim(both from skills), '\s*,\s*') end;
alter table public.profiles add column if not exists skills_other text;

-- Opportunity type sought: now multi-select.
alter table public.profiles alter column opportunity_type drop default;
alter table public.profiles alter column opportunity_type type text[]
  using case when opportunity_type is null or opportunity_type = '' then null else array[opportunity_type] end;

-- Work arrangements the LaLider is available for (Remote / Hybrid / On-site).
alter table public.profiles add column if not exists work_arrangements text[];

-- Positions can be flagged as affirmative-action openings, which grants the
-- posting company access to candidates' diversity census answers (see below).
alter table public.positions add column if not exists affirmative_action boolean not null default false;

-- Diversity census — kept in a separate table with its own restrictive RLS
-- policies so it is not exposed through the broad "profiles" select policy.
create table if not exists public.profile_diversity (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  gender text,
  gender_identity text,
  sexual_orientation text,
  race_color text,
  updated_at timestamptz default now() not null
);

alter table public.profile_diversity enable row level security;

create policy "LaLideres can view their own diversity answers"
  on public.profile_diversity for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

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

create policy "LaLideres can insert their own diversity answers"
  on public.profile_diversity for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "LaLideres can update their own diversity answers"
  on public.profile_diversity for update
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create trigger on_profile_diversity_updated
  before update on public.profile_diversity
  for each row execute procedure public.handle_updated_at();
