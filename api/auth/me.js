import { parseCookies } from '../_lib/authHelpers.js';
import { verifySessionToken } from '../_lib/authHelpers.js';
import { getUserById } from '../_lib/db.js';
import { buildSessionCookie, sanitizeUserForClient } from '../_lib/authHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.ronkws_session;
  if (!token) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'No active session' }));
  }

  try {
    const payload = verifySessionToken(token);
    const storedUser = await getUserById(payload.sub);
    const user = storedUser || (payload.email ? {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      admin_authorized: payload.adminAuthorized === true
    } : null);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: 'Session user not found' }));
    }

    const newToken = verifySessionToken(token); // keep existing token valid
    res.setHeader('Set-Cookie', buildSessionCookie(newToken));
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, user: sanitizeUserForClient(user) }));
  } catch (error) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Invalid session' }));
  }
}
