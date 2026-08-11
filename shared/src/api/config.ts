/**
 * Configuration injectée par l'application hôte.
 *
 * Le code partagé ne peut pas lire `process.env.NEXT_PUBLIC_*` (absent en React Native)
 * ni `localStorage` (absent aussi). Chaque application fournit donc son URL d'API et son
 * magasin de jetons au démarrage : `localStorage` côté web, SecureStore côté mobile.
 */

/** Magasin de jetons. Les méthodes peuvent être synchrones ou asynchrones : tout est attendu. */
export interface TokenStorage {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
  remove(key: string): void | Promise<void>;
}

export interface ApiConfig {
  /** Racine de l'API, préfixe /api inclus — ex. http://192.168.1.13:4000/api */
  apiUrl: string;
  storage: TokenStorage;
  /** Appelé quand la session est définitivement perdue (rafraîchissement refusé). */
  onSessionExpired?: () => void;
}

export const ACCESS_TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';

let config: ApiConfig | null = null;

export function configureApi(next: ApiConfig): void {
  config = next;
}

export function getApiConfig(): ApiConfig {
  if (!config) {
    throw new Error(
      "API non configurée : appelez configureApi({ apiUrl, storage }) au démarrage de l'application."
    );
  }
  return config;
}

/** Origine du serveur sans le préfixe /api — sert à résoudre /uploads/... */
export function apiOrigin(): string {
  return getApiConfig().apiUrl.replace(/\/api\/?$/, '');
}

export function resolveFileUrl(fileUrl: string): string {
  return fileUrl.startsWith('/') ? `${apiOrigin()}${fileUrl}` : fileUrl;
}
