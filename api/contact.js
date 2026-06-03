/* ============================================
   VERCEL API ROUTE — Contact Form Proxy
   Keeps your n8n webhook URL hidden from browser

   ENV VARIABLES TO SET IN VERCEL DASHBOARD:
   N8N_CONTACT_WEBHOOK_URL = your actual n8n webhook URL
   N8N_HEADER_AUTH_VALUE   = your secret header value from n8n
   ============================================ */

export default async function handler(req, res) {

  /* Only allow POST */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { name, email, who, service } = body || {};

  if (!name || !email || !who || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL;
  const AUTH_VALUE  = process.env.N8N_HEADER_AUTH_VALUE;

  if (!WEBHOOK_URL) {
    console.log('DEV MODE: No webhook URL set. Form data:', body);
    return res.status(200).json({ ok: true, dev: true });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_VALUE || ''
      },
      body: JSON.stringify({
        name,
        email,
        who,
        service,
        message: body.message || '',
        timestamp: new Date().toISOString(),
        source: 'Website Contact Form'
      })
    });

    if (!response.ok) throw new Error('n8n returned ' + response.status);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Contact webhook error:', err.message);
    return res.status(500).json({ ok: false, error: 'Webhook failed' });
  }
}
