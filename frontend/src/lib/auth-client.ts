import { API_URL, ApiRequestError, apiFetch, type ApiError } from './api';

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface CurrentUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  locale: 'fr' | 'en';
  createdAt: string;
}

/** Comme `apiFetch`, mais ajoute l'en-tête `Authorization` et exige un jeton présent. */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new ApiRequestError(401, 'Session expirée ou invalide, merci de vous reconnecter.');

  return apiFetch<T>(path, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
}

export function fetchCurrentUser(): Promise<{ user: CurrentUser }> {
  return authFetch<{ user: CurrentUser }>('/auth/me');
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  locale?: 'fr' | 'en';
}

export function updateProfile(data: UpdateProfileInput): Promise<{ user: CurrentUser }> {
  return authFetch<{ user: CurrentUser }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Récupère un PDF protégé (nécessite le jeton) et déclenche son téléchargement côté navigateur. */
export async function downloadProtectedFile(path: string, downloadName: string): Promise<void> {
  const token = getToken();
  if (!token) throw new ApiRequestError(401, 'Session expirée ou invalide, merci de vous reconnecter.');

  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(response.status, body?.error ?? `Erreur ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
