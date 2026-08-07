import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'ronkws_session';

export function createSessionToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function verifySessionToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function buildSessionCookie(token) {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toUTCString();
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}; Max-Age=${SESSION_DURATION_MS / 1000}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie() {
  const expires = new Date(0).toUTCString();
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const cookie of cookieHeader.split(';')) {
    const [name, ...rest] = cookie.trim().split('=');
    cookies[name] = rest.join('=');
  }
  return cookies;
}
