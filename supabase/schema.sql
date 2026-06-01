-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (shared between LaLideres and companies)
create table public.profiles (
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

-- Positions table (created by companies)
create table public.positions (
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

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.positions enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Positions are viewable by authenticated users"
  on public.positions for select
  using (auth.role() = 'authenticated');

create policy "Companies can insert their own positions"
  on public.positions for insert
  with check (
    company_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Companies can update their own positions"
  on public.positions for update
  using (
    company_profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
