export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** Origine du serveur API, sans le préfixe /api — sert à résoudre les fichiers statiques (/uploads/...). */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

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

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const body = payload as ApiError | null;
    throw new ApiRequestError(
      response.status,
      body?.error ?? `Erreur ${response.status}`,
      body?.details
    );
  }

  return payload as T;
}
