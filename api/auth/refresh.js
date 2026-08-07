import { parseCookies } from '../_lib/authHelpers.js';
import { verifySessionToken } from '../_lib/authHelpers.js';
import { buildSessionCookie } from '../_lib/authHelpers.js';
import { getUserById } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
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
    const user = await getUserById(payload.sub);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: 'Session user not found' }));
    }

    res.setHeader('Set-Cookie', buildSessionCookie(token));
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, user }));
  } catch (error) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Session refresh failed' }));
  }
}
