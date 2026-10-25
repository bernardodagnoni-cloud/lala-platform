-- Reconstructed migration: these columns are referenced throughout the app
-- (types/database.ts, profile/edit, dashboard, admin, matching) but were never
-- saved as a migration file — they must have been run ad hoc in the SQL editor.

alter table public.profiles add column if not exists desired_role text;
alter table public.profiles add column if not exists open_to_relocate text;
alter table public.positions add column if not exists work_modality text;
