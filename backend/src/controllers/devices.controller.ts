import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Enregistrement des appareils pour les notifications push.
 * Ressource propre à un utilisateur : chaque écriture est filtrée sur
 * `req.user.sub`, jamais sur le seul identifiant fourni par le client (cf. CLAUDE.md).
 */

export const pushTokenSchema = z.object({
  token: z
    .string()
    .min(10)
    .max(200)
    // Format Expo : ExponentPushToken[…] ou ExpoPushToken[…].
    .regex(/^Expo(nent)?PushToken\[.+\]$/, 'Jeton push Expo invalide.'),
  platform: z.enum(['ios', 'android']).optional(),
});

/**
 * Enregistre ou réaffecte un jeton d'appareil.
 * `upsert` sur le jeton : si l'appareil servait à un autre compte (téléphone partagé,
 * changement de compte), il est réaffecté au titulaire courant plutôt que dupliqué —
 * sinon l'ancien titulaire continuerait de recevoir les notifications de ce téléphone.
 */
export const registerPushToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body as z.infer<typeof pushTokenSchema>;

  const device = await prisma.deviceToken.upsert({
    where: { token },
    create: { token, platform: platform ?? null, userId: req.user!.sub },
    update: { platform: platform ?? null, userId: req.user!.sub },
    select: { id: true, platform: true, createdAt: true },
  });

  res.status(201).json({ device });
});

/**
 * Désenregistre un appareil (déconnexion).
 * Le filtre porte sur `token` ET `userId` : présenter le jeton d'un autre utilisateur
 * ne supprime rien, ce qui évite qu'un tiers coupe les notifications d'autrui.
 */
export const deletePushToken = asyncHandler(async (req, res) => {
  const { count } = await prisma.deviceToken.deleteMany({
    where: { token: req.params.token, userId: req.user!.sub },
  });

  res.json({ removed: count });
});
