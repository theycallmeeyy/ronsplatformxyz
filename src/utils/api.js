const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

export async function fetchGoogleAuth(credential) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ credential })
  });
  return response.json();
}

export async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}

export async function logoutBackend() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}

export async function fetchAuthStats() {
  const response = await fetch(`${API_BASE_URL}/api/auth/stats`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function trackVisit(count = 1) {
  const response = await fetch(`${API_BASE_URL}/api/track/visit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count })
  });
  return response.json();
}

export async function fetchRatings(siteId) {
  const url = siteId ? `${API_BASE_URL}/api/ratings?siteId=${encodeURIComponent(siteId)}` : `${API_BASE_URL}/api/ratings`;
  const response = await fetch(url, { method: 'GET', credentials: 'include' });
  return response.json();
}

export async function submitRating(siteId, score) {
  const response = await fetch(`${API_BASE_URL}/api/ratings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, score })
  });
  return response.json();
}

export async function fetchPwaStatus() {
  const response = await fetch(`${API_BASE_URL}/api/pwa/status`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}
