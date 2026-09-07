// Kongu Brilliance — admin-only user creation (Vercel serverless).
// The admin panel calls this to create student/evaluator/admin accounts.
// The SERVICE ROLE key lives ONLY here (Vercel env), never in the browser.
//
// Vercel → Settings → Environment Variables:
//   SUPABASE_URL           = https://jpngmqyidbuzbzqbsyhp.supabase.co
//   SUPABASE_SERVICE_ROLE  = <your service_role secret key>   (Supabase → Settings → API → service_role)
//
// Request (POST): { access_token, email, password, full_name, role, board, class }
//   access_token = the logged-in admin's Supabase session token (proves they are admin)
// Response: { ok:true, id } | { error }

const URL = process.env.SUPABASE_URL;
const SVC = process.env.SUPABASE_SERVICE_ROLE;

async function sb(path, opts = {}) {
  const r = await fetch(URL + path, {
    ...opts,
    headers: { apikey: SVC, Authorization: 'Bearer ' + SVC, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await r.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!URL || !SVC) return res.status(503).json({ error: 'Server not configured: add SUPABASE_URL and SUPABASE_SERVICE_ROLE in Vercel env vars.' });

  let p = req.body; if (typeof p === 'string') { try { p = JSON.parse(p); } catch { p = {}; } }
  const { access_token, email, password, full_name, role, board, class: cls } = p || {};
  if (!access_token) return res.status(401).json({ error: 'Missing session token.' });
  if (!email || !password) return res.status(400).json({ error: 'email and password are required.' });
  const validRole = ['student', 'evaluator', 'admin'].includes(role) ? role : 'student';

  // 1) Verify the caller and that they are an admin
  const who = await fetch(URL + '/auth/v1/user', { headers: { apikey: SVC, Authorization: 'Bearer ' + access_token } });
  if (!who.ok) return res.status(401).json({ error: 'Invalid or expired session.' });
  const caller = await who.json();
  const prof = await sb('/rest/v1/profiles?select=role&id=eq.' + caller.id);
  const callerRole = Array.isArray(prof.body) && prof.body[0] && prof.body[0].role;
  if (callerRole !== 'admin') return res.status(403).json({ error: 'Only an admin can create accounts.' });

  // 2) Create the auth user (auto-confirmed so they can log in immediately)
  const created = await sb('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: full_name || email } }),
  });
  if (!created.ok) return res.status(created.status).json({ error: (created.body && (created.body.msg || created.body.error_description || created.body.error)) || 'Could not create user.' });
  const newId = created.body.id;

  // 3) Set their profile role / details (the signup trigger already inserted the row)
  await sb('/rest/v1/profiles?id=eq.' + newId, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ role: validRole, full_name: full_name || email, board: board || null, class: cls || null }),
  });

  return res.status(200).json({ ok: true, id: newId, role: validRole });
}
