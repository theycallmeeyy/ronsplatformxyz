Suggestions & Implementation Notes for Ronkws Streaming Hub

Overview

This file collects high-value, non-UI suggestions and small backend utilities that improve safety, reliability, and UX without changing the existing user interfaces.

1) Sandboxed Embed Player

Rationale
- Many external streaming sites include aggressive redirects, popups, or third-party scripts that can break the host app or open unexpected windows.

Recommendation
- When embedding remote sites in an iframe, use a strict sandbox policy. Example:

html
<iframe
  src={item.embedUrl}
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allow="autoplay; encrypted-media"
/>

Notes
- "allow-scripts" enables scripts inside the iframe but combined with sandbox prevents top-level navigation.
- Test embed behaviors: some providers intentionally rely on navigation or popups; those will fail under sandboxing. Provide a fallback "Open in new tab" link where necessary.

2) Automated Link Status Checker (Health Check)

Rationale
- Many free streaming domains change or are taken down frequently. Marking offline links prevents poor UX.

What was added
- server/health-check.js — a standalone Node script that checks every content item in server/database.json (via the existing db.js API) and sets isOffline and offlineCheckedAt fields.

How to run
- Dry-run (doesn't modify DB):
  npm run health-check -- --dry-run

- Full run (updates server/database.json):
  npm run health-check

Cron example (run daily):
- On Linux / macOS (system crontab):
  0 3 * * * cd /path/to/project && /usr/bin/node server/health-check.js >> /var/log/ronkws-health.log 2>&1

Security / Rate-limiting
- The script uses simple HEAD requests with a timeout. If running at scale, consider rate-limiting, exponential backoff, or delegating to a queue.

3) Ad-Blocker Recommendation Banner

Rationale
- External sites may show intrusive ads. Providing a small information chip helps users avoid a poor experience.

Implementation suggestion (non-UI):
- Add a small banner snippet to documentation or a static footer partial encouraging use of uBlock Origin or Brave.
- Example copy:
  "For a cleaner browsing experience when opening external streaming links, consider using a privacy-first browser (Brave) or a trusted ad-blocker like uBlock Origin."

4) Multi-Region Filter System

Rationale
- Many sources provide region-specific mirrors. A region selector improves relevance.

Non-UI recommendation
- Extend the content data model to include a `regions` array (e.g. ["US","UK","GLOBAL"]) on items and add a lightweight server-side endpoint to filter content by region.
- This change is non-breaking: if `regions` is absent, items remain visible to all regions.

Notes on pushing and deployment
- A new npm script "health-check" has been added that runs server/health-check.js.
- No UI changes were made in this commit; only documentation and a non-UI script were added.

Contact
- If any of these suggestions should be promoted to a full UI implementation, open a follow-up PR and include mockups and acceptance criteria.
