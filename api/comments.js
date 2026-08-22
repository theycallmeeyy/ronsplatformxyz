import { parseCookies, verifySessionToken } from './_lib/authHelpers.js';
import { addComment, getComments } from './_lib/db.js';

function getIdentity(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (cookies.ronkws_session) {
    try { return verifySessionToken(cookies.ronkws_session).sub; } catch { /* use guest identity */ }
  }
  return cookies.ronkws_guest || 'guest';
}

export default async function handler(req, res) {
  const siteId = String(req.query.siteId || req.body?.siteId || '');
  if (!siteId) return res.status(400).json({ success: false, error: 'Missing siteId' });
  const userId = getIdentity(req);

  if (req.method === 'GET') {
    return res.json({ success: true, comments: await getComments(siteId) });
  }
  if (req.method === 'POST') {
    const comment = String(req.body?.comment || '').trim();
    if (!comment) return res.status(400).json({ success: false, error: 'Comment cannot be empty' });
    const entry = await addComment(siteId, userId, comment, req.body?.useful, req.body?.author);
    return res.json({ success: true, comment: entry });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
