import { REFRESH_TOKEN_KEY, getApiConfig } from './config';
import { apiFetch, authFetch, clearTokens, storeTokens } from './client';
import type { CurrentUser } from '../types';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: CurrentUser;
}

/** Connexion : range les deux jetons puis renvoie l'utilisateur. */
export async function login(email: string, password: string): Promise<CurrentUser> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await storeTokens(data);
  return data.user;
}

/**
 * Déconnexion. Le jeton de rafraîchissement est révoqué côté serveur avant d'être effacé
 * localement : sans cet appel il resterait valide 30 jours pour qui l'aurait copié.
 * L'échec réseau n'empêche pas le nettoyage local.
 */
export async function logout(): Promise<void> {
  const { storage } = getApiConfig();
  const refreshToken = (await storage.get(REFRESH_TOKEN_KEY)) ?? null;

  if (refreshToken) {
    try {
      await apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Hors ligne : on efface quand même, le jeton expirera de lui-même.
    }
  }

  await clearTokens();
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

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Enregistre l'appareil pour les notifications push Expo. */
export function registerPushToken(
  token: string,
  platform?: 'ios' | 'android'
): Promise<{ device: { id: string } }> {
  return authFetch<{ device: { id: string } }>('/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

export function unregisterPushToken(token: string): Promise<{ removed: number }> {
  return authFetch<{ removed: number }>(`/me/push-token/${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
}
