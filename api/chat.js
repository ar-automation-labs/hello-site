// api/chat.js — proxies the site chat to the n8n webhook (URL stays private)
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const WEBHOOK = process.env.N8N_CHAT_WEBHOOK_URL || process.env.CHAT_WEBHOOK_URL;
  if (!WEBHOOK) return res.status(500).json({ error: 'Webhook not configured' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = (body.message || '').toString().trim();
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const payload = {
      name: (body.name || 'Guest').toString().slice(0, 60),
      message: message.slice(0, 2000),
      sessionId: (body.sessionId || '').toString().slice(0, 100),
      timestamp: body.timestamp || new Date().toISOString(),
      source: body.source || 'Website — ARIA Assistant',
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    const upstream = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const raw = await upstream.text();
    if (!upstream.ok) return res.status(502).json({ error: 'Assistant unavailable' });

    let reply = '';
    try {
      const data = JSON.parse(raw);
      const first = Array.isArray(data) ? data[0] : data;
      reply = first?.reply || first?.output || first?.text || first?.message || '';
      if (typeof reply !== 'string') reply = JSON.stringify(reply);
    } catch {
      reply = raw;
    }

    if (!reply || !reply.trim()) return res.status(502).json({ error: 'Empty reply' });
    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    return res.status(502).json({ error: 'Assistant unavailable' });
  }
}
