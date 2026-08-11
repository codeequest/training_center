import crypto from 'crypto';
import type { Role, User } from '@prisma/client';
import { env } from '../config/env';
import { signToken } from '../middleware/auth';
import { unauthorized } from '../utils/errors';
import { prisma } from './prisma';

/**
 * Jetons d'accès et de rafraîchissement.
 *
 * Le jeton d'accès reste un JWT court, vérifié sans accès base (voir `middleware/auth`).
 * Le jeton de rafraîchissement est au contraire opaque et stocké en base sous forme de
 * hachage : il est donc révocable, ce qu'un JWT ne permet pas. C'est ce qui autorise une
 * session mobile longue sans garder un jeton d'accès valide pendant des jours.
 */

export interface TokenPair {
  token: string;
  refreshToken: string;
  /** Durée de vie du jeton d'accès, en secondes — le client planifie son renouvellement. */
  expiresIn: number;
}

/** SHA-256 suffit ici : le jeton est déjà 384 bits d'aléa, il n'y a rien à forcer. */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Traduit '15m' / '7d' / '3600' en secondes, pour informer le client. */
function accessTokenSeconds(): number {
  const raw = String(env.jwtExpiresIn).trim();
  const match = /^(\d+)\s*([smhd])?$/i.exec(raw);
  if (!match) return 900;

  const value = Number(match[1]);
  switch (match[2]?.toLowerCase()) {
    case 'd':
      return value * 86400;
    case 'h':
      return value * 3600;
    case 'm':
      return value * 60;
    default:
      return value;
  }
}

function refreshExpiry(): Date {
  return new Date(Date.now() + env.refreshTokenDays * 86400 * 1000);
}

type AuthUser = Pick<User, 'id' | 'email'> & { role: Role };

/** Émet une paire neuve et enregistre le jeton de rafraîchissement. */
export async function issueTokenPair(user: AuthUser, device?: string | null): Promise<TokenPair> {
  const refreshToken = crypto.randomBytes(48).toString('base64url');

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiry(),
      device: device ?? null,
    },
  });

  return {
    token: signToken({ sub: user.id, role: user.role, email: user.email }),
    refreshToken,
    expiresIn: accessTokenSeconds(),
  };
}

/**
 * Échange un jeton de rafraîchissement contre une paire neuve (rotation systématique).
 *
 * Rejouer un jeton déjà tourné est le signe d'un vol : dans ce cas toute la famille de
 * jetons de l'utilisateur est révoquée, ce qui déconnecte l'attaquant et le porteur
 * légitime — lequel se reconnectera avec son mot de passe.
 */
export async function rotateRefreshToken(presented: string): Promise<TokenPair> {
  const expired = unauthorized('Session expirée, merci de vous reconnecter.');
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(presented) },
    include: { user: true },
  });

  if (!stored) throw expired;

  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw unauthorized('Session invalidée pour raison de sécurité, merci de vous reconnecter.');
  }

  if (stored.expiresAt <= new Date()) throw expired;
  if (!stored.user.isActive) throw unauthorized('Ce compte est désactivé. Contactez le centre.');

  const next = await issueTokenPair(stored.user, stored.device);

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: {
      revokedAt: new Date(),
      replacedById: (
        await prisma.refreshToken.findUnique({
          where: { tokenHash: hashToken(next.refreshToken) },
          select: { id: true },
        })
      )?.id,
    },
  });

  return next;
}

/** Déconnexion : révoque le jeton présenté. Idempotent, et silencieux s'il est inconnu. */
export async function revokeRefreshToken(presented: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(presented), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Révoque toutes les sessions d'un compte — changement de mot de passe, désactivation. */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
