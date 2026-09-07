// Kongu Brilliance — multi-provider LLM proxy with automatic failover.
// Deployed by Vercel as /api/llm. Keys live ONLY in Vercel env vars, never in the page.
//
// Set any of these in Vercel → Project → Settings → Environment Variables.
// The proxy tries every provider that has a key, in order, and for Groq it tries
// several models until one is available on your account:
//   GROQ_API_KEY        (free, fast, recommended)   model override via GROQ_MODEL
//   GEMINI_API_KEY      (Google, free tier)          model override via GEMINI_MODEL
//   OPENROUTER_API_KEY  (many models)                model override via OPENROUTER_MODEL
//   OPENAI_API_KEY      (paid)                        model override via OPENAI_MODEL
//
// Request  (POST):  { messages:[{role,content}], temperature?, json? }
// Response (200):   { text, provider, model }
// Response (5xx):   { error, tried:[{provider,error}] }

const PROVIDERS = [
  {
    id: 'groq', keyEnv: 'GROQ_API_KEY', kind: 'openai',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: () => [process.env.GROQ_MODEL, 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant',
                   'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it', 'openai/gpt-oss-20b'].filter(Boolean),
  },
  {
    id: 'gemini', keyEnv: 'GEMINI_API_KEY', kind: 'gemini',
    models: () => [process.env.GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-1.5-flash-8b'].filter(Boolean),
  },
  {
    id: 'openrouter', keyEnv: 'OPENROUTER_API_KEY', kind: 'openai',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: () => [process.env.OPENROUTER_MODEL, 'meta-llama/llama-3.3-70b-instruct'].filter(Boolean),
  },
  {
    id: 'openai', keyEnv: 'OPENAI_API_KEY', kind: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    models: () => [process.env.OPENAI_MODEL, 'gpt-4o-mini'].filter(Boolean),
  },
];

async function callOpenAI(p, key, model, messages, temperature, json) {
  const body = { model, temperature: temperature ?? 0.4, messages };
  if (json) body.response_format = { type: 'json_object' };
  const r = await fetch(p.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) { const e = new Error(p.id + '/' + model + ' ' + r.status + ' ' + raw.slice(0, 140)); e.status = r.status; throw e; }
  const data = JSON.parse(raw);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(p.id + '/' + model + ' returned no content');
  return text;
}

async function callGemini(p, key, model, messages, temperature) {
  const sys = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }],
  }));
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
  const body = { contents, generationConfig: { temperature: temperature ?? 0.4 } };
  if (sys) body.systemInstruction = { parts: [{ text: sys }] };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const raw = await r.text();
  if (!r.ok) { const e = new Error('gemini/' + model + ' ' + r.status + ' ' + raw.slice(0, 140)); e.status = r.status; throw e; }
  const data = JSON.parse(raw);
  const text = data?.candidates?.[0]?.content?.parts?.map(x => x.text).join('') || '';
  if (!text) throw new Error('gemini/' + model + ' returned no content');
  return text;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const available = PROVIDERS.filter(p => process.env[p.keyEnv]).map(p => p.id);
    return res.status(200).json({ ok: true, providers: available });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { messages, temperature, json } = payload || {};
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'messages[] required' });

  const active = PROVIDERS.filter(p => process.env[p.keyEnv]);
  if (!active.length) return res.status(503).json({ error: 'No AI provider configured. Add GROQ_API_KEY in Vercel env vars.', tried: [] });

  const tried = [];
  for (const p of active) {
    const key = process.env[p.keyEnv];
    for (const model of p.models()) {
      try {
        const text = p.kind === 'gemini'
          ? await callGemini(p, key, model, messages, temperature)
          : await callOpenAI(p, key, model, messages, temperature, json);
        return res.status(200).json({ text, provider: p.id, model });
      } catch (e) {
        tried.push({ provider: p.id, model, error: String(e.message || e).slice(0, 180) });
        // model_not_found → try next model; other errors → also try next, then next provider
      }
    }
  }
  return res.status(502).json({ error: 'All providers failed', tried });
}
