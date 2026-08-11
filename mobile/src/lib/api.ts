import Constants from 'expo-constants';
import { configureApi } from '@shared/api/config';
import { secureTokenStorage } from './storage';

/**
 * URL de l'API.
 *
 * `EXPO_PUBLIC_API_URL` a la priorité (pratique pour pointer un serveur de recette),
 * sinon la valeur de `app.json`. Attention : sur un téléphone réel, `localhost` désigne
 * le téléphone — il faut l'adresse IP du poste qui fait tourner Express.
 */
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:4000/api';

let sessionExpiredHandler: (() => void) | null = null;

/** Branché par le fournisseur de session pour rediriger vers l'écran de connexion. */
export function onSessionExpired(handler: () => void): void {
  sessionExpiredHandler = handler;
}

configureApi({
  apiUrl: API_URL,
  storage: secureTokenStorage,
  onSessionExpired: () => sessionExpiredHandler?.(),
});
