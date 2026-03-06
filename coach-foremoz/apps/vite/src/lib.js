export const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN || 'https://coach.foremoz.com';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3400';

const AUTH_KEY = 'fc.auth';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function requireField(value, name) {
  if (!value || String(value).trim() === '') {
    throw new Error(`${name} is required`);
  }
  return String(value).trim();
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function coachPath(session, suffix) {
  const handle = session?.coach?.handle || 'coach-demo';
  return `/c/${handle}${suffix}`;
}

export async function apiJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === 'FAIL') {
    throw new Error(payload.message || `request failed: ${response.status}`);
  }
  return payload;
}
