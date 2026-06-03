/* ============================================
   VERCEL API ROUTE — Chatbot Proxy
   Keeps your n8n webhook URL hidden from browser

   ENV VARIABLES TO SET IN VERCEL DASHBOARD:
   N8N_CHAT_WEBHOOK_URL  = your actual n8n chatbot webhook URL
   N8N_HEADER_AUTH_VALUE = your secret header value from n8n
   ============================================ */

export default async function handler(req, res) {

  /* Only allow POST */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;

  /* Parse manually if body is a string (shouldn't happen on Vercel but safe) */
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { message, sessionId } = body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const safeMessage = message.trim().slice(0, 500);

  const WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;
  const AUTH_VALUE  = process.env.N8N_HEADER_AUTH_VALUE;

  if (!WEBHOOK_URL) {
    console.log('DEV MODE: No chat webhook URL set. Message:', safeMessage);
    return res.status(200).json({
      ok: true,
      reply: 'Chat webhook not connected yet. Check back soon!'
    });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_VALUE || ''
      },
      body: JSON.stringify({
        message: safeMessage,
        sessionId: sessionId || 'anonymous',
        timestamp: new Date().toISOString(),
        source: 'Website Chatbot'
      })
    });

    if (!response.ok) throw new Error('n8n returned ' + response.status);

    const data = await response.json();
    const reply = data.reply || data.output || data.text || data.message || 'Got it! Ali will follow up shortly.';

    return res.status(200).json({ ok: true, reply });

  } catch (err) {
    console.error('Chat webhook error:', err.message);
    return res.status(500).json({
      ok: false,
      reply: 'Something went wrong. Reach Ali directly at aiautomationexpert786@gmail.com'
    });
  }
}
