import * as SecureStore from 'expo-secure-store';
import type { TokenStorage } from '@shared/api/config';

/**
 * Magasin de jetons adossé au Keychain (iOS) / Keystore (Android).
 *
 * C'est le point où le mobile fait mieux que le web : le site range aujourd'hui son jeton
 * dans `localStorage`, lisible par tout script de la page. Ici le stockage est chiffré par
 * l'OS et inaccessible aux autres applications.
 *
 * SecureStore rejette les valeurs volumineuses (~2 ko) : sans objet ici, un JWT d'accès
 * pèse quelques centaines d'octets et le jeton de rafraîchissement 64 caractères.
 */
export const secureTokenStorage: TokenStorage = {
  async get(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // Trousseau illisible (première installation, restauration de sauvegarde) :
      // équivalent à « pas de session », l'utilisateur se reconnecte.
      return null;
    }
  },

  async set(key, value) {
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key) {
    await SecureStore.deleteItemAsync(key);
  },
};
