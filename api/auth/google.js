import { OAuth2Client } from 'google-auth-library';
import { upsertGoogleUser } from '../_lib/db.js';
import { createSessionToken, buildSessionCookie } from '../_lib/authHelpers.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  if (!googleClient) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, error: 'Google auth is not configured on the server.' }));
  }

  const { credential } = await new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });

  if (!credential) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: 'Missing Google credential' }));
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'Invalid Google ID token' }));
    }

    const googleUid = payload.sub;
    const email = payload.email || '';
    const name = payload.name || 'Google User';
    const profilePhoto = payload.picture || '';

    const user = await upsertGoogleUser({
      googleUid,
      email,
      name,
      profilePhoto
    });

    const token = createSessionToken(user.id);
    res.setHeader('Set-Cookie', buildSessionCookie(token));
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, user, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }));
  } catch (error) {
    console.error('Google auth error:', error);
    res.statusCode = 401;
    return res.end(JSON.stringify({ success: false, error: 'Google login failed. Please try again.' }));
  }
}
