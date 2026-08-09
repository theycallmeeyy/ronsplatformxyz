import { getContent, updateContent } from './db.js';

// Simple health-check script for content URLs.
// Usage:
//   node server/health-check.js --dry-run   # prints what would be checked (no DB updates)
//   node server/health-check.js              # performs checks and updates server/database.json

const TIMEOUT_MS = 10000; // 10s

function timeoutFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

async function checkUrl(url) {
  try {
    // Try HEAD first, fallback to GET if server doesn't accept HEAD
    let res = await timeoutFetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok && res.status >= 400) {
      // try GET as some servers block HEAD
      res = await timeoutFetch(url, { method: 'GET', redirect: 'follow' });
    }
    return res.ok;
  } catch (err) {
    return false;
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`Health-check starting (dryRun=${dryRun})`);

  const content = await getContent();
  if (!Array.isArray(content) || content.length === 0) {
    console.log('No content items found in DB.');
    return;
  }

  // Limit concurrent checks to avoid overloading local network.
  const CONCURRENCY = 6;
  let idx = 0;

  async function worker() {
    while (idx < content.length) {
      const i = idx++;
      const item = content[i];
      if (!item || !item.url) continue;
      const title = item.title || item.id || `item-${i}`;
      try {
        if (dryRun) {
          console.log(`[dry-run] Would check: ${title} -> ${item.url}`);
          continue;
        }

        const ok = await checkUrl(item.url);
        await updateContent(item.id, {
          isOffline: !ok,
          offlineCheckedAt: new Date().toISOString()
        });
        console.log(`${title}: ${ok ? 'online' : 'offline'}`);
      } catch (err) {
        console.error(`Error checking ${title}:`, err.message || err);
      }
    }
  }

  // start workers
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log('Health-check complete.');
}

// Allow top-level await by calling main and catching errors
main().catch((err) => {
  console.error('Health-check failed:', err);
  process.exit(1);
});
