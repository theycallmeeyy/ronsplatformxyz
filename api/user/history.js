import { parseCookies, verifySessionToken } from '../_lib/authHelpers.js';
import { getUserById, updateUser } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const token = parseCookies(req.headers.cookie || '').ronkws_session;
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    const payload = verifySessionToken(token);
    const user = await getUserById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: 'Session user not found' });
    const data = { ...(user.app_data || {}), watchHistory: [], clickAnalytics: {} };
    await updateUser(user.id, { app_data: data, updated_at: new Date().toISOString() });
    return res.json({ success: true, data });
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid session' });
  }
}
