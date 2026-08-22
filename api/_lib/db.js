import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const DB_FILE = process.env.VERCEL === '1'
  ? path.join(os.tmpdir(), 'ronkws-database.json')
  : path.join(process.cwd(), 'server', 'database.json');

async function loadDb() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { users: [] };
    }
    throw error;
  }
}

async function saveDb(db) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export async function getUsers() {
  const db = await loadDb();
  return Array.isArray(db.users) ? db.users : [];
}

export async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserByGoogleUid(googleUid) {
  const users = await getUsers();
  return users.find((u) => u.google_uid === googleUid);
}

export async function createUser(user) {
  const db = await loadDb();
  db.users = db.users || [];
  db.users.push(user);
  await saveDb(db);
  return user;
}

export async function updateUser(userId, updates) {
  const db = await loadDb();
  db.users = db.users || [];
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  await saveDb(db);
  return db.users[index];
}

export async function upsertGoogleUser({ googleUid, email, name, profilePhoto }) {
  const existingGoogleUser = await findUserByGoogleUid(googleUid);
  const existingEmailUser = await findUserByEmail(email);
  const now = new Date().toISOString();

  if (existingGoogleUser) {
    return updateUser(existingGoogleUser.id, {
      email,
      name,
      profile_photo: profilePhoto,
      updated_at: now,
      last_login: now
    });
  }

  if (existingEmailUser) {
    return updateUser(existingEmailUser.id, {
      google_uid: googleUid,
      provider: 'google',
      name,
      profile_photo: profilePhoto,
      updated_at: now,
      last_login: now
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    google_uid: googleUid,
    name,
    email,
    profile_photo: profilePhoto,
    provider: 'google',
    created_at: now,
    updated_at: now,
    last_login: now
  };

  return createUser(newUser);
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function getRatings(siteId) {
  const db = await loadDb();
  const ratings = db.meta?.ratings || {};
  return siteId ? (ratings[siteId] || { totalScore: 0, count: 0, byUser: {} }) : ratings;
}

export async function addOrUpdateRating(siteId, userId, score) {
  const db = await loadDb();
  db.meta = db.meta || {};
  db.meta.ratings = db.meta.ratings || {};
  const entry = db.meta.ratings[siteId] || { totalScore: 0, count: 0, byUser: {} };
  const previous = entry.byUser?.[userId];
  if (previous !== undefined) {
    entry.totalScore = Math.max(0, Number(entry.totalScore) - Number(previous) + Number(score));
  } else {
    entry.totalScore = Number(entry.totalScore) + Number(score);
    entry.count = Number(entry.count || 0) + 1;
  }
  entry.byUser = entry.byUser || {};
  entry.byUser[userId] = Number(score);
  db.meta.ratings[siteId] = entry;
  await saveDb(db);
  return entry;
}

export async function getComments(siteId) {
  const db = await loadDb();
  const comments = db.meta?.comments || {};
  return siteId ? (comments[siteId] || []) : comments;
}

export async function addComment(siteId, userId, comment, useful, author) {
  const db = await loadDb();
  db.meta = db.meta || {};
  db.meta.comments = db.meta.comments || {};
  const comments = db.meta.comments[siteId] || [];
  const entry = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    author: String(author || userId || 'Guest'),
    comment: String(comment || '').trim(),
    useful: Boolean(useful),
    createdAt: new Date().toISOString()
  };
  comments.unshift(entry);
  db.meta.comments[siteId] = comments;
  await saveDb(db);
  return entry;
}
