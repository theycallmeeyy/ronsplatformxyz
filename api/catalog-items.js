import { parseCookies, verifySessionToken } from './_lib/authHelpers.js';
import { createSharedCatalogItem, getSharedCatalogItems } from './_lib/db.js';

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (!cookies.ronkws_session) return null;
  try {
    return verifySessionToken(cookies.ronkws_session);
  } catch {
    return null;
  }
}

function isAdminSession(session) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(
    session?.adminAuthorized === true &&
    session.role === 'admin' &&
    adminEmail &&
    session.email?.toLowerCase() === adminEmail
  );
}

function validateItem(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const categories = ['Movies', 'TV Shows', 'Anime', 'Manga', 'Live TV', 'Sports', 'Apps'];
  let siteUrl;
  try {
    siteUrl = new URL(typeof body.url === 'string' ? body.url.trim() : '');
  } catch {
    return { error: 'Enter a valid site URL.' };
  }
  if (!title || !categories.includes(category) || !['http:', 'https:'].includes(siteUrl.protocol)) {
    return { error: 'A title, supported category, and valid HTTP or HTTPS URL are required.' };
  }
  return {
    value: {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category,
      type: typeof body.type === 'string' ? body.type.slice(0, 40) : 'movie',
      url: siteUrl.href,
      embedUrl: typeof body.embedUrl === 'string' ? body.embedUrl.trim().slice(0, 2000) : '',
      bannerUrl: typeof body.bannerUrl === 'string' ? body.bannerUrl.trim().slice(0, 2000) : '',
      description: typeof body.description === 'string' ? body.description.trim().slice(0, 2000) : '',
      rating: Number.isFinite(Number(body.rating)) ? Math.max(0, Math.min(5, Number(body.rating))) : 4.5,
      year: typeof body.year === 'string' ? body.year.slice(0, 30) : new Date().getFullYear().toString(),
      views: '0',
      isTrending: false,
      isRecommended: false,
      ...(typeof body.sourceRequestId === 'string' ? { sourceRequestId: body.sourceRequestId.slice(0, 100) } : {})
    }
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json({ success: true, items: await getSharedCatalogItems() });
    }

    if (req.method === 'POST') {
      const session = getSession(req);
      if (!isAdminSession(session)) return res.status(403).json({ success: false, error: 'Admin access required.' });
      const normalized = validateItem(req.body);
      if (normalized.error) return res.status(400).json({ success: false, error: normalized.error });
      const item = await createSharedCatalogItem(normalized.value);
      return res.status(201).json({ success: true, item });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Catalog items API failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Unable to process catalog item.' });
  }
}
