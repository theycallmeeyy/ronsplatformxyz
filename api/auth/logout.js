import { clearSessionCookie } from '../_lib/authHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ success: true }));
}
