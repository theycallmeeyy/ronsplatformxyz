import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import {
  getUserById,
  getUsers,
  upsertGoogleUser
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

if (!GOOGLE_CLIENT_ID) {
  console.warn('Warning: GOOGLE_CLIENT_ID is not configured. Google auth will not work until set.');
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

function createSessionToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const ACTIVE_SESSION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes for live active user count
const activeSessions = new Map();

function pruneActiveSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAtMs <= now || now - session.lastSeen > ACTIVE_SESSION_WINDOW_MS) {
      activeSessions.delete(token);
    }
  }
}

function registerActiveSession(token, userId, expiresAt) {
  activeSessions.set(token, {
    userId,
    expiresAtMs: new Date(expiresAt).getTime(),
    lastSeen: Date.now()
  });
  pruneActiveSessions();
}

function touchActiveSession(token) {
  const session = activeSessions.get(token);
  if (!session) return;
  session.lastSeen = Date.now();
  activeSessions.set(token, session);
  pruneActiveSessions();
}

function clearActiveSession(token) {
  activeSessions.delete(token);
}

function getActiveUserCount() {
  pruneActiveSessions();
  return new Set(Array.from(activeSessions.values()).map((session) => session.userId)).size;
}

function setSessionCookie(res, userId) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const token = jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: '7d'
  });
  res.cookie('ronkws_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS
  });
  registerActiveSession(token, userId, expiresAt);
  return { token, expiresAt };
}

function sanitizeForClient(user) {
  if (!user) return null;
  const { id, google_uid, name, email, profile_photo, provider, created_at, updated_at, last_login } = user;
  return { id, google_uid, name, email, profile_photo, provider, created_at, updated_at, last_login };
}

app.post('/api/auth/google', async (req, res) => {
  if (!googleClient) {
    return res.status(500).json({ success: false, error: 'Google auth is not configured on the server.' });
  }

  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, error: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ success: false, error: 'Invalid Google ID token' });
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

    const { expiresAt } = setSessionCookie(res, user.id);

    return res.json({ success: true, user: sanitizeForClient(user), expiresAt });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ success: false, error: 'Google login failed. Please try again.' });
  }
});

app.get('/api/auth/stats', async (req, res) => {
  try {
    const users = await getUsers();
    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: getActiveUserCount()
      }
    });
  } catch (error) {
    console.error('Failed to fetch auth stats:', error);
    return res.status(500).json({ success: false, error: 'Unable to load auth stats' });
  }
});

app.get('/api/pwa/status', async (req, res) => {
  try {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '');
    const host = String(req.headers.host || '');
    const isLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
    const isSecure = req.secure || forwardedProto.split(',')[0] === 'https' || isLocalhost;
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    const swPath = path.resolve(__dirname, '../public/service-worker.js');
    const manifestExists = fs.existsSync(manifestPath);
    const serviceWorkerExists = fs.existsSync(swPath);

    return res.json({
      success: true,
      status: {
        secureContext: isSecure,
        manifestExists,
        serviceWorkerExists,
        installable: isSecure && manifestExists && serviceWorkerExists
      }
    });
  } catch (error) {
    console.error('Failed to evaluate PWA status:', error);
    return res.status(500).json({ success: false, error: 'Unable to evaluate PWA status' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.ronkws_session;
  if (!token) {
    return res.status(401).json({ success: false, error: 'No active session' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.sub);
    if (!user) {
      clearActiveSession(token);
      return res.status(401).json({ success: false, error: 'Session user not found' });
    }
    touchActiveSession(token);
    const { expiresAt } = setSessionCookie(res, user.id);
    return res.json({ success: true, user: sanitizeForClient(user), expiresAt });
  } catch (error) {
    clearActiveSession(token);
    return res.status(401).json({ success: false, error: 'Invalid session' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const token = req.cookies.ronkws_session;
  if (!token) {
    return res.status(401).json({ success: false, error: 'No active session' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session user not found' });
    }

    const { expiresAt } = setSessionCookie(res, user.id);
    return res.json({ success: true, user: sanitizeForClient(user), expiresAt });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Session refresh failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.ronkws_session;
  if (token) {
    clearActiveSession(token);
  }
  res.clearCookie('ronkws_session');
  return res.json({ success: true });
});

app.get('/api/config', (req, res) => {
  return res.json({
    success: true,
    config: {
      googleClientId: GOOGLE_CLIENT_ID || null
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RonKws auth server is running' });
});

const frontendDistPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Auth server listening on http://localhost:${PORT}`);
  });
}

export default app;
