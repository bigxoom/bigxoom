// Relative by default so the same build works from any host that can reach
// this server (localhost, LAN IP, hostname) — Caddy proxies /api/* on the
// same origin as the page. NEXT_PUBLIC_API_URL only needs to be set for
// non-standard setups (e.g. frontend and backend on different hosts/ports).
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fatima_token');
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}
