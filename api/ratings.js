import { parseCookies, verifySessionToken } from './_lib/authHelpers.js';
import { addOrUpdateRating, getRatings } from './_lib/db.js';

function getIdentity(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  let userId = null;
  if (cookies.ronkws_session) {
    try { userId = verifySessionToken(cookies.ronkws_session).sub; } catch { /* use guest identity */ }
  }
  if (!userId) {
    userId = cookies.ronkws_guest || `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    if (!cookies.ronkws_guest) {
      res.setHeader('Set-Cookie', `ronkws_guest=${userId}; Path=/; Max-Age=315360000; SameSite=Lax; HttpOnly`);
    }
  }
  return userId;
}

export default async function handler(req, res) {
  const siteId = String(req.query.siteId || req.body?.siteId || '');
  if (!siteId) return res.status(400).json({ success: false, error: 'Missing siteId' });
  const userId = getIdentity(req, res);

  if (req.method === 'GET') {
    const ratings = await getRatings(siteId);
    return res.json({ success: true, ratings, userScore: ratings.byUser?.[userId] ?? null });
  }
  if (req.method === 'POST') {
    const score = Math.max(1, Math.min(5, Number(req.body?.score)));
    if (!Number.isFinite(score)) return res.status(400).json({ success: false, error: 'Invalid score' });
    const rating = await addOrUpdateRating(siteId, userId, score);
    return res.json({ success: true, rating, userScore: rating.byUser?.[userId] ?? score });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
