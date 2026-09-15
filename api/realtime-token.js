
// api/realtime-token.js
// Mints a SHORT-LIVED (ephemeral) OpenAI Realtime session token so the browser
// can open a WebRTC voice connection WITHOUT ever seeing your secret API key.
//
// SETUP (one time):
//   Vercel → Project → Settings → Environment Variables → add:
//     OPENAI_API_KEY   = sk-...            (required, paid OpenAI account)
//     REALTIME_MODEL   = gpt-4o-realtime-preview   (optional override)
//     REALTIME_VOICE   = alloy             (optional: alloy, verse, shimmer, ...)
//   Then redeploy. If OPENAI_API_KEY is absent, this returns 503 and the site
//   automatically falls back to the built-in browser Live Voice mode.

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'POST only' });
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'realtime_not_configured', message: 'Add OPENAI_API_KEY in Vercel env vars to enable Realtime voice.' });
  }
  const model = process.env.REALTIME_MODEL || 'gpt-4o-realtime-preview';
  const voice = process.env.REALTIME_VOICE || 'alloy';

  // optional per-request teaching instructions from the client
  let instructions = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body && typeof body.instructions === 'string') instructions = body.instructions.slice(0, 4000);
  } catch (e) {}

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, voice, ...(instructions ? { instructions } : {}) })
    });
    const raw = await r.text();
    if (!r.ok) {
      return res.status(502).json({ error: 'openai_session_failed', status: r.status, detail: raw.slice(0, 300) });
    }
    const data = JSON.parse(raw);
    // return only what the browser needs
    return res.status(200).json({ client_secret: data.client_secret, model, voice });
  } catch (e) {
    return res.status(502).json({ error: 'session_error', detail: String(e && e.message || e).slice(0, 300) });
  }
}
Displaying realtime-token.txt.
