import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'database.json');

async function loadDb() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { users: [], meta: { visitorOffset: 534 } };
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

export async function getMeta() {
  const db = await loadDb();
  return db.meta || { visitorOffset: 534 };
}

export async function incrementVisitorOffset(by = 1) {
  const db = await loadDb();
  db.meta = db.meta || { visitorOffset: 534 };
  db.meta.visitorOffset = (Number(db.meta.visitorOffset) || 0) + Number(by || 1);
  await saveDb(db);
  return db.meta;
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
    const updated = await updateUser(existingGoogleUser.id, {
      email,
      name,
      profile_photo: profilePhoto,
      updated_at: now,
      last_login: now
    });
    return { user: updated, created: false };
  }

  if (existingEmailUser) {
    const updated = await updateUser(existingEmailUser.id, {
      google_uid: googleUid,
      provider: 'google',
      name,
      profile_photo: profilePhoto,
      updated_at: now,
      last_login: now
    });
    return { user: updated, created: false };
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

  const createdUser = await createUser(newUser);
  return { user: createdUser, created: true };
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function getRatings(siteId) {
  const db = await loadDb();
  db.meta = db.meta || { visitorOffset: 534 };
  const ratings = db.meta.ratings || {};
  if (siteId) return ratings[siteId] || { totalScore: 0, count: 0, byUser: {} };
  return ratings;
}

export async function addOrUpdateRating(siteId, userId, score) {
  const db = await loadDb();
  db.meta = db.meta || { visitorOffset: 534 };
  db.meta.ratings = db.meta.ratings || {};
  const entry = db.meta.ratings[siteId] || { totalScore: 0, count: 0, byUser: {} };

  const prev = entry.byUser && entry.byUser[userId];
  if (prev !== undefined) {
    // adjust totals
    entry.totalScore = Math.max(0, Number(entry.totalScore) - Number(prev) + Number(score));
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
