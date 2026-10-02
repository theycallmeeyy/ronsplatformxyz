import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'ronkws_session';

export function sanitizeUserForClient(user) {
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = Boolean(user.admin_authorized === true && adminEmail && user.email?.toLowerCase() === adminEmail);
  const { id, google_uid, name, email, profile_photo, provider, created_at, updated_at, last_login } = user;
  return {
    id,
    google_uid,
    name,
    email,
    profile_photo,
    provider,
    role: isAdmin ? 'admin' : 'user',
    created_at,
    updated_at,
    last_login
  };
}

export function createSessionToken(userId, identity = {}) {
  return jwt.sign({
    sub: userId,
    email: identity.email,
    name: identity.name,
    role: identity.role || 'user',
    adminAuthorized: identity.adminAuthorized === true
  }, JWT_SECRET, {
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
