import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken, unregisterPushToken } from '@shared/api/auth';

/**
 * Notifications push Expo.
 *
 * Le jeton est demandé à Expo puis transmis à l'API (`POST /me/push-token`), qui l'associe
 * au compte connecté. Le serveur enverra ensuite via le service Expo — voir
 * `backend/src/lib/push.ts`.
 */

let currentToken: string | null = null;

/** Le canal Android doit exister AVANT la demande de jeton (SDK 57). */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Demande la permission et enregistre l'appareil. Renvoie `null` sans rien casser si
 * l'utilisateur refuse, si l'on est sur un simulateur, ou si aucun projet EAS n'est
 * encore configuré (le push exige un `projectId` depuis le SDK 57).
 */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) {
    console.info('Push : ignoré sur simulateur, un appareil réel est nécessaire.');
    return null;
  }

  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  const granted =
    existing.granted ||
    (await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    })).granted;

  if (!granted) {
    console.info('Push : permission refusée par l\'utilisateur.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    // `eas init` n'a pas encore été lancé : on n'échoue pas, le reste de
    // l'application fonctionne sans push.
    console.warn("Push : aucun projectId EAS. Lancez `npx eas init` pour l'activer.");
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  currentToken = token;

  await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  return token;
}

/** À la déconnexion : l'appareil ne doit plus recevoir les notifications du compte quitté. */
export async function unregisterFromPush(): Promise<void> {
  if (!currentToken) return;
  try {
    await unregisterPushToken(currentToken);
  } catch {
    // Hors ligne ou session déjà expirée : le serveur nettoiera au prochain envoi
    // (Expo signale les jetons devenus invalides).
  }
  currentToken = null;
}
