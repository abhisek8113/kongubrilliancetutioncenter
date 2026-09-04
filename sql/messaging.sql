-- Kongu Brilliance — Messaging & Calls schema (in-portal Messages & Calls)
-- Run this whole file in the Supabase SQL editor, then hard-refresh the site.
--
-- WHY THIS VERSION: the KB portal talks to Supabase with the public ANON key and
-- does NOT use Supabase Auth (there is no auth.jwt() with uid/role/batch claims).
-- The previous RLS policies were keyed to auth.jwt(), so they blocked every read
-- and write from the app — which is why messages never reached other devices.
-- Conversation privacy is enforced in the client (canAccess in kb-comm.js).
--
-- SECURITY NOTE: with the anon key, anyone who has your public Supabase URL+anon
-- key could technically read/write these tables directly (outside the UI). That is
-- the same trust model the rest of this portal already uses for its tables. If you
-- later add real Supabase Auth, re-introduce JWT-based RLS policies below.

-- Use TEXT ids so the client-generated ids ('m....') match between devices.
create table if not exists kb_messages (
  id text primary key,
  conv text not null,                  -- 'dm:<a>~<b>' or 'grp:<batch>'
  sender text not null,                -- user id
  sender_role text,
  kind text not null default 'text' check (kind in ('text','file','call')),
  body text,
  file_name text, file_size text, file_url text,
  video bool, missed bool, dur text,
  ts timestamptz default now()
);
create index if not exists idx_kb_messages_conv on kb_messages(conv, ts);

create table if not exists kb_call_signals (
  id uuid primary key default gen_random_uuid(),
  conv text not null,
  kind text not null,                  -- ring/answer/ice/hangup/candidate
  from_id text, to_id text,
  payload jsonb,
  ts timestamptz default now()
);

-- ---- Realtime: broadcast INSERTs to subscribed clients ----------------------
-- Wrapped so re-running the file doesn't error if the table is already added.
do $$ begin
  begin alter publication supabase_realtime add table kb_messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table kb_call_signals; exception when duplicate_object then null; end;
end $$;

-- ---- Access for the anon key (client-side privacy model) --------------------
alter table kb_messages enable row level security;
alter table kb_call_signals enable row level security;

drop policy if exists kb_msg_all on kb_messages;
create policy kb_msg_all on kb_messages
  for all to anon, authenticated using (true) with check (true);

drop policy if exists kb_sig_all on kb_call_signals;
create policy kb_sig_all on kb_call_signals
  for all to anon, authenticated using (true) with check (true);

-- Optional housekeeping: drop call-signal rows older than a day (they are transient).
-- Run manually or schedule with pg_cron if you have it enabled:
--   delete from kb_call_signals where ts < now() - interval '1 day';
