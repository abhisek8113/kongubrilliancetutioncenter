-- Kongu Brilliance — lock down lead tables (DO NOT RUN until step 0 is done)
-- Verified 2026-10-28 with the public anon key from /assets/kb-gclid.js:
--   enquiries:         anon can SELECT (all rows), INSERT, and DELETE   <-- anyone can read parent names/phones or wipe leads
--   online_enquiries:  anon can SELECT (16 rows)
--   demo_enquiries:    anon can SELECT (3 rows)
--   attendance, tasks, leaves, fees, checkins: anon can SELECT (verified by row count only)
--
-- STEP 0 (required first): the admin panel in /assets/kb-app.js logs in with a client-side
-- SHA-256 check (adminLogin) and then reads these tables with the anon key. After this
-- migration the anon key can only INSERT, so the admin panel must read leads as a real
-- Supabase Auth user whose profiles.role = 'admin' (the same model /api/admin-create-user.js
-- already uses). Switch adminLogin() to supabase.auth.signInWithPassword() first.

create or replace function public.kb_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

do $$
declare t text;
begin
  foreach t in array array['enquiries','online_enquiries','demo_enquiries'] loop
    execute format('alter table public.%I enable row level security', t);
    -- drop every existing policy on the table
    perform 1;
    execute (select coalesce(string_agg(format('drop policy if exists %I on public.%I;', policyname, t), ' '), 'select 1')
             from pg_policies where schemaname='public' and tablename=t);
    execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', t||'_public_insert', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.kb_is_admin())', t||'_admin_select', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.kb_is_admin()) with check (public.kb_is_admin())', t||'_admin_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.kb_is_admin())', t||'_admin_delete', t);
  end loop;
end $$;

-- Internal records: admin only (no public insert). NOTE: if the student/tutor portals read these
-- with the public key, they will stop seeing them until those portals also use Supabase Auth.
do $$
declare t text;
begin
  foreach t in array array['attendance','tasks','leaves','fees','checkins'] loop
    execute format('alter table public.%I enable row level security', t);
    execute (select coalesce(string_agg(format('drop policy if exists %I on public.%I;', policyname, t), ' '), 'select 1')
             from pg_policies where schemaname='public' and tablename=t);
    execute format('create policy %I on public.%I for all to authenticated using (public.kb_is_admin()) with check (public.kb_is_admin())', t||'_admin_all', t);
  end loop;
end $$;
-- 'materials' (study material, 7 rows) is left readable on purpose.

-- Rollback: re-create the previous permissive policies, e.g.
--   create policy enquiries_all on public.enquiries for all to anon using (true) with check (true);
-- Verify after applying (anon key): POST /rest/v1/enquiries -> 201; GET -> [] ; DELETE -> 0 rows.
