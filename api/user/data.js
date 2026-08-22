import { parseCookies, verifySessionToken } from '../_lib/authHelpers.js';
import { getUserById, updateUser } from '../_lib/db.js';

async function getSessionUser(req) {
  const token = parseCookies(req.headers.cookie || '').ronkws_session;
  if (!token) return null;
  try {
    const payload = verifySessionToken(token);
    return getUserById(payload.sub);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });

  if (req.method === 'GET') {
    return res.json({ success: true, data: user.app_data || { watchHistory: [], clickAnalytics: {}, favorites: [], favoriteGroups: {}, favoriteCategories: ['Watch later'], providerHistory: {}, preferences: { analyticsTracking: true, browsingHistory: true } } });
  }

  if (req.method === 'PUT') {
    const incoming = req.body || {};
    const data = {
      watchHistory: Array.isArray(incoming.watchHistory) ? incoming.watchHistory.slice(0, 100) : [],
      clickAnalytics: incoming.clickAnalytics && typeof incoming.clickAnalytics === 'object' ? incoming.clickAnalytics : {},
      favorites: Array.isArray(incoming.favorites) ? incoming.favorites.slice(0, 200) : [],
      favoriteGroups: incoming.favoriteGroups && typeof incoming.favoriteGroups === 'object' ? incoming.favoriteGroups : {},
      favoriteCategories: Array.isArray(incoming.favoriteCategories) ? incoming.favoriteCategories.slice(0, 30) : ['Watch later'],
      providerHistory: incoming.providerHistory && typeof incoming.providerHistory === 'object' ? incoming.providerHistory : {},
      preferences: incoming.preferences && typeof incoming.preferences === 'object' ? incoming.preferences : { analyticsTracking: true, browsingHistory: true }
    };
    await updateUser(user.id, { app_data: data, updated_at: new Date().toISOString() });
    return res.json({ success: true, data });
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
