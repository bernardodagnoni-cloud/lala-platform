-- Reconstructed + fixed: the on_auth_user_created trigger (function
-- handle_new_user) was never saved to a migration file either — found via
-- SQL-editor introspection while debugging "Database error creating new
-- user" on accounts created without full_name/role metadata (e.g. via the
-- Supabase dashboard's "Add user" form, which sends no metadata at all).
--
-- Two bugs fixed:
-- 1. full_name was inserted straight from metadata with no fallback, so a
--    missing value violated profiles.full_name's NOT NULL constraint.
-- 2. The default role was 'lalider' (lowercase l), which doesn't match
--    either value profiles.role's CHECK constraint allows ('laLider' or
--    'company') — so even with (1) fixed, account creation without an
--    explicit role would still fail.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$begin
    insert into public.profiles (user_id, full_name, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'role', 'laLider')
    );
    return new;
  end;$function$;
