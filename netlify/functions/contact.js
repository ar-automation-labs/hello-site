/* ============================================
   NETLIFY FUNCTION — Contact Form Proxy
   Keeps your n8n webhook URL hidden from browser
   ============================================

   ENV VARIABLE TO SET IN NETLIFY DASHBOARD:
   N8N_CONTACT_WEBHOOK_URL = your actual n8n webhook URL
   N8N_HEADER_AUTH_VALUE   = your secret header value from n8n
   ============================================ */

exports.handler = async function(event) {

  /* Only allow POST */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  /* Basic rate limit — Netlify Functions don't persist memory
     so this is per-invocation. For real rate limiting use Upstash Redis.
     This at least blocks empty/malformed spam instantly. */
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  /* Validate required fields server-side */
  const { name, email, who, service } = body;
  if (!name || !email || !who || !service) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  /* Webhook URL and auth — stored in Netlify env, never in code */
  const WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL;
  const AUTH_VALUE  = process.env.N8N_HEADER_AUTH_VALUE;

  if (!WEBHOOK_URL) {
    /* Dev mode — no webhook set yet, just return success */
    console.log('DEV MODE: No webhook URL set. Form data:', body);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, dev: true })
    };
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_VALUE || ''   /* Header Auth from n8n */
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

    if (!response.ok) {
      throw new Error('n8n returned ' + response.status);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error('Contact webhook error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Webhook failed' })
    };
  }
};
