alter table public.profiles add column if not exists approved boolean default false;
alter table public.profiles add column if not exists registration_notified boolean default false;
