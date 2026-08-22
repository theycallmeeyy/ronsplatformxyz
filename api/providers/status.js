export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const rawUrl = String(req.query.url || '');
  let providerUrl;
  try {
    providerUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid provider URL' });
  }
  if (providerUrl.protocol !== 'https:') {
    return res.status(400).json({ success: false, error: 'Only HTTPS provider URLs are supported' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(providerUrl, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    if (!response.ok && response.status >= 400) {
      response = await fetch(providerUrl, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return res.json({ success: true, status: response.ok ? 'online' : 'offline', code: response.status, checkedAt: new Date().toISOString() });
  } catch {
    return res.json({ success: true, status: 'offline', code: null, checkedAt: new Date().toISOString() });
  } finally {
    clearTimeout(timeout);
  }
}
