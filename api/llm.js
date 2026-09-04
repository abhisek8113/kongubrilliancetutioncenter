// Kongu Brilliance — multi-provider LLM proxy with automatic failover.
// Deployed by Vercel as /api/llm. Keys live ONLY in Vercel env vars, never in the page.
//
// Set any of these in Vercel → Project → Settings → Environment Variables.
// The proxy tries every provider that has a key, in order, until one succeeds:
//   GROQ_API_KEY        (free, fast, recommended)      model via GROQ_MODEL       (default llama-3.3-70b-versatile)
//   GEMINI_API_KEY      (Google, free tier)            model via GEMINI_MODEL     (default gemini-1.5-flash)
//   OPENROUTER_API_KEY  (many models, has free ones)   model via OPENROUTER_MODEL (default meta-llama/llama-3.3-70b-instruct)
//   OPENAI_API_KEY      (paid)                          model via OPENAI_MODEL     (default gpt-4o-mini)
//
// Request  (POST):  { messages:[{role,content}], temperature?, json? }
// Response (200):   { text, provider }
// Response (5xx):   { error, tried:[{provider,error}] }

const PROVIDERS = [
  {
    id: 'groq', keyEnv: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    kind: 'openai',
  },
  {
    id: 'gemini', keyEnv: 'GEMINI_API_KEY',
    model: () => process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    kind: 'gemini',
  },
  {
    id: 'openrouter', keyEnv: 'OPENROUTER_API_KEY',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: () => process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
    kind: 'openai',
  },
  {
    id: 'openai', keyEnv: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    model: () => process.env.OPENAI_MODEL || 'gpt-4o-mini',
    kind: 'openai',
  },
];

async function callOpenAICompatible(p, key, messages, temperature, json) {
  const body = {
    model: p.model(),
    temperature: temperature ?? 0.4,
    messages,
  };
  if (json) body.response_format = { type: 'json_object' };
  const r = await fetch(p.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(p.id + ' ' + r.status + ' ' + (await r.text()).slice(0, 160));
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(p.id + ' returned no content');
  return text;
}

async function callGemini(p, key, messages, temperature) {
  // Fold system + user turns into Gemini's format.
  const sys = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + p.model() + ':generateContent?key=' + key;
  const body = {
    contents,
    generationConfig: { temperature: temperature ?? 0.4 },
  };
  if (sys) body.systemInstruction = { parts: [{ text: sys }] };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('gemini ' + r.status + ' ' + (await r.text()).slice(0, 160));
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(x => x.text).join('') || '';
  if (!text) throw new Error('gemini returned no content');
  return text;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // health check — which providers are configured (no keys leaked)
    const available = PROVIDERS.filter(p => process.env[p.keyEnv]).map(p => p.id);
    return res.status(200).json({ ok: true, providers: available });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { messages, temperature, json } = payload || {};
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'messages[] required' });

  const active = PROVIDERS.filter(p => process.env[p.keyEnv]);
  if (!active.length) {
    return res.status(503).json({
      error: 'No AI provider configured. Add GROQ_API_KEY (free) or another key in Vercel env vars.',
      tried: [],
    });
  }

  const tried = [];
  for (const p of active) {
    const key = process.env[p.keyEnv];
    try {
      const text = p.kind === 'gemini'
        ? await callGemini(p, key, messages, temperature)
        : await callOpenAICompatible(p, key, messages, temperature, json);
      return res.status(200).json({ text, provider: p.id });
    } catch (e) {
      tried.push({ provider: p.id, error: String(e.message || e).slice(0, 200) });
      // continue to next provider (automatic failover)
    }
  }
  return res.status(502).json({ error: 'All providers failed', tried });
}
