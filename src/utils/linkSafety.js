const BADWARE_PATTERNS = [
  'malware',
  'badware',
  'spy',
  'phishing',
  'tracking',
  'track',
  'redirect',
  'popup',
  'click',
  'adservice',
  'doubleclick',
  'junk',
  'scam',
  'adsystem',
  'advert',
  'tracker',
  'analytics'
];

export function assessUrlSafety(url) {
  if (!url) {
    return {
      blocked: true,
      label: 'No provider link',
      summary: 'This item does not have a direct provider link.'
    };
  }

  try {
    const parsedUrl = new URL(url);
    const lowerUrl = parsedUrl.href.toLowerCase();
    const blockedPattern = BADWARE_PATTERNS.find((pattern) => lowerUrl.includes(pattern));

    if (parsedUrl.protocol !== 'https:' || blockedPattern) {
      return {
        blocked: true,
        label: 'Link needs review',
        summary: blockedPattern
          ? 'This link contains a pattern associated with unwanted redirects or advertising.'
          : 'Only secure HTTPS provider links can be opened.'
      };
    }

    return {
      blocked: false,
      label: 'Safety check passed',
      summary: 'The provider link uses HTTPS and passed Ronkws pre-open checks.'
    };
  } catch {
    return {
      blocked: true,
      label: 'Invalid provider link',
      summary: 'This provider link is not a valid web address.'
    };
  }
}

export function getProviderStatus(item) {
  if (!item?.url) return { label: 'Unavailable', tone: 'text-zinc-500', dot: 'bg-zinc-500' };
  const safety = assessUrlSafety(item.url);
  if (safety.blocked) return { label: 'Needs review', tone: 'text-amber-300', dot: 'bg-amber-400' };
  return { label: 'Link ready', tone: 'text-emerald-300', dot: 'bg-emerald-400' };
}
