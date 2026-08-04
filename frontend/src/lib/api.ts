export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Origine du serveur API (sans le suffixe /api), pour résoudre les chemins
// relatifs renvoyés par le backend (ex. /uploads/xxx.pdf).
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Transforme un chemin de fichier renvoyé par l'API (relatif ou absolu) en URL absolue. */
export function resolveFileUrl(fileUrl: string): string {
  return fileUrl.startsWith('/') ? `${API_ORIGIN}${fileUrl}` : fileUrl;
}

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
  // Pas d'en-tête JSON forcé pour un FormData (upload de support) : le navigateur
  // doit poser lui-même le Content-Type multipart avec sa frontière.
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
