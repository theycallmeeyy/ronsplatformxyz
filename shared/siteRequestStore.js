function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && serviceKey) return { url: url.replace(/\/+$/, ''), serviceKey };
  if (process.env.VERCEL === '1' || serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be configured for persistent site requests.');
  }
  return null;
}

export function hasSupabaseStorageConfig() {
  return Boolean(getSupabaseConfig());
}

function toRequest(row) {
  return {
    id: row.id,
    siteName: row.site_name,
    siteUrl: row.site_url,
    whyAdd: row.why_add || '',
    regionsSections: row.regions_sections || [],
    createdBy: row.created_by || 'anonymous',
    status: row.status,
    submittedAt: row.submitted_at,
    ...(row.reviewed_at ? { reviewedAt: row.reviewed_at } : {})
  };
}

async function requestSupabase(path, { method = 'GET', body, prefer } = {}) {
  const config = getSupabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    const details = await response.text();
    console.error(`Supabase site request storage failed (${response.status}):`, details);
    throw new Error('Persistent site request storage is unavailable.');
  }
  if (response.status === 204) return [];
  return response.json();
}

export async function getSupabaseSiteRequests() {
  const rows = await requestSupabase('site_requests?select=*&order=submitted_at.desc');
  return rows?.map(toRequest);
}

export async function createSupabaseSiteRequest(request) {
  const rows = await requestSupabase('site_requests', {
    method: 'POST',
    prefer: 'return=representation',
    body: {
      site_name: request.siteName,
      site_url: request.siteUrl,
      why_add: request.whyAdd,
      regions_sections: request.regionsSections,
      created_by: request.createdBy,
      status: 'pending'
    }
  });
  return rows?.[0] ? toRequest(rows[0]) : null;
}

export async function updateSupabaseSiteRequest(id, updates) {
  const query = new URLSearchParams({ id: `eq.${id}`, select: '*' });
  const rows = await requestSupabase(`site_requests?${query}`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: {
      status: updates.status,
      reviewed_at: updates.reviewedAt
    }
  });
  return rows?.[0] ? toRequest(rows[0]) : null;
}

export async function deleteSupabaseSiteRequest(id) {
  const query = new URLSearchParams({ id: `eq.${id}`, select: 'id' });
  const rows = await requestSupabase(`site_requests?${query}`, {
    method: 'DELETE',
    prefer: 'return=representation'
  });
  return Boolean(rows?.length);
}

export async function getSupabaseCatalogItems() {
  const rows = await requestSupabase('catalog_items?select=item_data&order=created_at.desc');
  return rows?.map((row) => row.item_data) || [];
}

export async function createSupabaseCatalogItem(item) {
  const requestQuery = item.sourceRequestId
    ? `?${new URLSearchParams({ select: 'item_data', request_id: `eq.${item.sourceRequestId}`, limit: '1' })}`
    : null;

  if (requestQuery) {
    const existing = await requestSupabase(`catalog_items${requestQuery}`);
    if (existing?.[0]) return existing[0].item_data;
  }

  try {
    const rows = await requestSupabase('catalog_items', {
      method: 'POST',
      prefer: 'return=representation',
      body: { id: item.id, item_data: item, request_id: item.sourceRequestId || null }
    });
    return rows?.[0]?.item_data || null;
  } catch (error) {
    if (requestQuery) {
      const existing = await requestSupabase(`catalog_items${requestQuery}`);
      if (existing?.[0]) return existing[0].item_data;
    }
    throw error;
  }
}
