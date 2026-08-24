-- Kongu Brilliance — Messaging & Calls schema (production path for messages.html)
-- Run in Supabase SQL editor. Enforces the same privacy model in the DB via RLS.

create table if not exists kb_conversations (
  id text primary key,                 -- 'dm:<a>~<b>' or 'grp:<batch>'
  type text not null check (type in ('dm','group')),
  members text[] default '{}',         -- user ids for dm
  batch text,                          -- for group channels
  created_at timestamptz default now()
);

create table if not exists kb_messages (
  id uuid primary key default gen_random_uuid(),
  conv text not null references kb_conversations(id) on delete cascade,
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
  kind text not null,                  -- ring/answer/ice/hangup
  from_id text, to_id text,
  payload jsonb,
  ts timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table kb_messages;
alter publication supabase_realtime add table kb_call_signals;

-- ---- PRIVACY (Row Level Security) --------------------------------------
-- Assumes a helper that returns the current app user's id/role/batch/tutor.
-- Replace current_kb_user() with your auth mapping (jwt claim or lookup).
alter table kb_messages enable row level security;

-- A user may read a message only if they are allowed to see its conversation:
--   dm    -> they are one of the two members, OR admin
--   group -> student in that batch, tutor of that batch, OR admin
create policy kb_read_messages on kb_messages for select using (
  exists (
    select 1 from kb_conversations c
    where c.id = kb_messages.conv and (
      (auth.jwt()->>'role') = 'admin'
      or (c.type='dm'    and (auth.jwt()->>'uid') = any(c.members))
      or (c.type='group' and (auth.jwt()->>'batch') = c.batch)
      or (c.type='group' and c.batch = any(string_to_array(auth.jwt()->>'batches', ',')))
    )
  )
);
-- Users may only insert messages they send, into conversations they can access:
create policy kb_write_messages on kb_messages for insert with check (
  sender = (auth.jwt()->>'uid')
);
