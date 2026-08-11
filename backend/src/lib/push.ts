import { prisma } from './prisma';

/**
 * Notifications push via le service Expo.
 *
 * Pas de dépendance ni de clé à gérer : Expo expose un simple POST JSON, et c'est lui
 * qui parle à APNs et FCM. Les jetons devenus invalides (application désinstallée) sont
 * signalés dans la réponse et supprimés ici même, sinon la table grossit indéfiniment.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export interface PushMessage {
  title: string;
  body: string;
  /** Chemin applicatif à ouvrir au tap — même convention que `href` des notifications. */
  data?: Record<string, unknown>;
}

interface ExpoTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

/** Envoie à tous les appareils enregistrés d'un utilisateur. Ne lève jamais. */
export async function sendPushToUser(userId: string, message: PushMessage): Promise<number> {
  const devices = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });
  if (devices.length === 0) return 0;
  return sendPushToTokens(
    devices.map((d) => d.token),
    message
  );
}

/** Envoie à une liste de jetons, par lots de 100 comme recommandé par Expo. */
export async function sendPushToTokens(tokens: string[], message: PushMessage): Promise<number> {
  let delivered = 0;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          batch.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data ?? {},
            sound: 'default',
          }))
        ),
      });

      if (!response.ok) {
        console.warn(`Push Expo : réponse ${response.status} pour ${batch.length} appareil(s).`);
        continue;
      }

      const payload = (await response.json()) as { data?: ExpoTicket[] };
      const tickets = payload.data ?? [];
      const stale: string[] = [];

      tickets.forEach((ticket, index) => {
        if (ticket.status === 'ok') {
          delivered += 1;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          stale.push(batch[index]);
        } else {
          console.warn(`Push Expo refusé : ${ticket.message ?? 'raison inconnue'}`);
        }
      });

      if (stale.length > 0) {
        await prisma.deviceToken.deleteMany({ where: { token: { in: stale } } });
      }
    } catch (error) {
      // Une panne du service push ne doit jamais faire échouer l'action métier
      // (validation d'inscription, émission d'attestation) qui l'a déclenchée.
      console.warn('Push Expo injoignable :', error instanceof Error ? error.message : error);
    }
  }

  return delivered;
}
