/* ============================================
   NETLIFY FUNCTION — Chatbot Proxy
   Keeps your n8n webhook URL hidden from browser
   ============================================

   ENV VARIABLE TO SET IN NETLIFY DASHBOARD:
   N8N_CHAT_WEBHOOK_URL  = your actual n8n chatbot webhook URL
   N8N_HEADER_AUTH_VALUE = your secret header value from n8n
                           (same secret as contact, or different — your choice)
   ============================================ */

exports.handler = async function(event) {

  /* Only allow POST */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { message, sessionId } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { statusCode: 400, body: 'Missing message' };
  }

  /* Truncate message to prevent abuse */
  const safeMessage = message.trim().slice(0, 500);

  const WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;
  const AUTH_VALUE  = process.env.N8N_HEADER_AUTH_VALUE;

  if (!WEBHOOK_URL) {
    /* Dev mode — webhook not set yet, return placeholder */
    console.log('DEV MODE: No chat webhook URL set. Message:', safeMessage);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        reply: 'Chat webhook not connected yet. Check back soon!'
      })
    };
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

    if (!response.ok) {
      throw new Error('n8n returned ' + response.status);
    }

    const data = await response.json();

    /* n8n should return { reply: "..." } — adjust key if yours is different */
    const reply = data.reply || data.output || data.text || data.message || 'Got it! Ali will follow up shortly.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, reply })
    };

  } catch (err) {
    console.error('Chat webhook error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        reply: 'Something went wrong. Reach Ali directly at aiautomationexpert786@gmail.com'
      })
    };
  }
};
