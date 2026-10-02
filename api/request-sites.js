import { parseCookies, verifySessionToken } from './_lib/authHelpers.js';
import { createSiteRequest, deleteSiteRequest, getSiteRequests, updateSiteRequest } from './_lib/db.js';

async function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (!cookies.ronkws_session) return null;
  try {
    const payload = verifySessionToken(cookies.ronkws_session);
    return {
      email: payload.email,
      role: payload.role,
      admin_authorized: payload.adminAuthorized === true
    };
  } catch {
    return null;
  }
}

function isAdminUser(user) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(
    user?.admin_authorized === true &&
    user?.role === 'admin' &&
    adminEmail &&
    user.email?.toLowerCase() === adminEmail
  );
}

function normalizeSiteRequest(body = {}) {
  const siteName = typeof body.siteName === 'string' ? body.siteName.trim().slice(0, 80) : '';
  const whyAdd = typeof body.whyAdd === 'string' ? body.whyAdd.trim().slice(0, 1000) : '';
  let parsedUrl;
  try {
    parsedUrl = new URL(typeof body.siteUrl === 'string' ? body.siteUrl.trim() : '');
  } catch {
    return { error: 'Enter a valid site URL.' };
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol) || !siteName) {
    return { error: 'A site name and valid HTTP or HTTPS URL are required.' };
  }
  if (!Array.isArray(body.regionsSections) || body.regionsSections.length === 0 || body.regionsSections.length > 10) {
    return { error: 'Choose between 1 and 10 region and section pairs.' };
  }
  const regionsSections = body.regionsSections
    .filter((target) => typeof target?.region === 'string' && typeof target?.section === 'string')
    .map((target) => ({ region: target.region.trim().slice(0, 80), section: target.section.trim().slice(0, 80) }))
    .filter((target) => target.region && target.section);
  if (!regionsSections.length) {
    return { error: 'Each request needs a valid region and section.' };
  }
  return { value: { siteName, siteUrl: parsedUrl.href, whyAdd, regionsSections } };
}

export default async function handler(req, res) {
  try {
  if (req.method === 'POST') {
    const normalized = normalizeSiteRequest(req.body);
    if (normalized.error) return res.status(400).json({ success: false, error: normalized.error });
    const user = await getSessionUser(req);
    const request = await createSiteRequest({
      ...normalized.value,
      createdBy: user?.email || 'anonymous'
    });
    return res.status(201).json({ success: true, request });
  }

  const user = await getSessionUser(req);
  if (!isAdminUser(user)) return res.status(403).json({ success: false, error: 'Admin access required.' });

  if (req.method === 'GET') {
    return res.json({ success: true, requests: await getSiteRequests() });
  }

  if (req.method === 'PATCH') {
    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!id || req.body?.status !== 'added') {
      return res.status(400).json({ success: false, error: 'A request ID and added status are required.' });
    }
    const request = await updateSiteRequest(id, { status: 'added', reviewedAt: new Date().toISOString() });
    if (!request) return res.status(404).json({ success: false, error: 'Site request not found.' });
    return res.json({ success: true, request });
  }

  if (req.method === 'DELETE') {
    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!id) return res.status(400).json({ success: false, error: 'A request ID is required.' });
    const deleted = await deleteSiteRequest(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Site request not found.' });
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Site request API failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Unable to process site request.' });
  }
}
