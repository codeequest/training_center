import { ApiRequestError, apiFetch } from './api';

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Comme apiFetch, mais ajoute le jeton du localStorage — utilisé par les espaces protégés. */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new ApiRequestError(401, 'Non authentifié.');

  return apiFetch<T>(path, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
}

export { ApiRequestError };
