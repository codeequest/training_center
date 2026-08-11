import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getApiConfig,
  type TokenStorage,
} from './config';

export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

/** Erreur levée quand l'API répond avec un statut d'échec. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly details?: ApiError['details'];

  constructor(status: number, message: string, details?: ApiError['details']) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

async function read(storage: TokenStorage, key: string): Promise<string | null> {
  return (await storage.get(key)) ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  return read(getApiConfig().storage, ACCESS_TOKEN_KEY);
}

export async function storeTokens(tokens: {
  token: string;
  refreshToken?: string;
}): Promise<void> {
  const { storage } = getApiConfig();
  await storage.set(ACCESS_TOKEN_KEY, tokens.token);
  if (tokens.refreshToken) await storage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function clearTokens(): Promise<void> {
  const { storage } = getApiConfig();
  await storage.remove(ACCESS_TOKEN_KEY);
  await storage.remove(REFRESH_TOKEN_KEY);
}

/** Requête publique, sans jeton. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiUrl } = getApiConfig();

  // Pas d'en-tête JSON forcé pour un FormData (upload de support) : la plateforme doit
  // poser elle-même le Content-Type multipart avec sa frontière.
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const body = payload as ApiError | null;
    throw new ApiRequestError(response.status, body?.error ?? `Erreur ${response.status}`, body?.details);
  }

  return payload as T;
}

/**
 * Une seule tentative de rafraîchissement à la fois.
 *
 * Sans ce garde-fou, un écran qui lance cinq requêtes en parallèle après expiration
 * déclencherait cinq rotations concurrentes : la première réussit, les suivantes rejouent
 * un jeton déjà tourné, ce que le serveur interprète — à raison — comme un vol et qui
 * révoquerait toute la session.
 */
let pendingRefresh: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = (async () => {
    const { storage, onSessionExpired } = getApiConfig();
    const refreshToken = await read(storage, REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new ApiRequestError(401, 'Session expirée, merci de vous reconnecter.');

    try {
      const pair = await apiFetch<{ token: string; refreshToken: string; expiresIn: number }>(
        '/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refreshToken }) }
      );
      await storeTokens(pair);
      return pair.token;
    } catch (error) {
      // Le serveur a refusé : la session est perdue pour de bon, on nettoie.
      await clearTokens();
      onSessionExpired?.();
      throw error;
    } finally {
      pendingRefresh = null;
    }
  })();

  return pendingRefresh;
}

/**
 * Requête authentifiée. Sur 401, tente un rafraîchissement puis rejoue la requête une
 * seule fois — un second 401 signifie que la session est réellement terminée.
 */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new ApiRequestError(401, 'Session expirée ou invalide, merci de vous reconnecter.');

  const withAuth = (bearer: string): RequestInit => ({
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${bearer}` },
  });

  try {
    return await apiFetch<T>(path, withAuth(token));
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 401) throw error;
    const fresh = await refreshAccessToken();
    return apiFetch<T>(path, withAuth(fresh));
  }
}

/** Réponse brute authentifiée — PDF d'attestation, fichiers de support. */
export async function authFetchRaw(path: string): Promise<Response> {
  const { apiUrl } = getApiConfig();
  const token = await getAccessToken();
  if (!token) throw new ApiRequestError(401, 'Session expirée ou invalide, merci de vous reconnecter.');

  let response = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    const fresh = await refreshAccessToken();
    response = await fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${fresh}` } });
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(response.status, body?.error ?? `Erreur ${response.status}`);
  }

  return response;
}
