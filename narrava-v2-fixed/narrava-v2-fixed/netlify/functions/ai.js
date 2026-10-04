/**
 * Narrava AI Proxy — Netlify Function
 * Support: Geraikita & 9Router
 */
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: JSON.stringify({ error: { message: 'Method not allowed' } }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: { message: 'Invalid JSON' } }) }; }

  const { apiKey, model, messages, temperature, max_tokens, targetUrl, provider } = body;

  if (!apiKey) return {
    statusCode: 400, headers: cors,
    body: JSON.stringify({ error: { message: 'API Key belum diisi. Buka Settings dan masukkan API key.' } }),
  };

  let endpoint;
  if (provider === '9router' && targetUrl) {
    try {
      const u = new URL(targetUrl);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
      endpoint = targetUrl;
    } catch {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: { message: '9Router URL tidak valid. Contoh: http://IP:20128/v1/chat/completions' } }) };
    }
  } else {
    endpoint = 'https://ai.geraikita.com/v1/chat/completions';
  }

  const payload = {
    model:       model || 'deepseek-v4-flash',
    messages:    Array.isArray(messages) ? messages : [],
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    max_tokens:  Math.min(typeof max_tokens === 'number' ? max_tokens : 4096, 8000),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  let upRes;
  try {
    upRes = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey.trim() },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    return {
      statusCode: err.name === 'AbortError' ? 504 : 502,
      headers: cors,
      body: JSON.stringify({ error: { message: err.name === 'AbortError' ? 'Timeout (>25s). Coba model lebih ringan.' : 'Tidak bisa terhubung: ' + err.message } }),
    };
  } finally { clearTimeout(timer); }

  const raw = await upRes.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { error: { message: 'Respons tidak valid: ' + raw.substring(0, 200) } }; }
  return { statusCode: upRes.status, headers: cors, body: JSON.stringify(data) };
};
