import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { forbidden, unauthorized } from '../utils/errors';

export interface AuthPayload {
  sub: string;
  role: Role;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  return cookieToken ?? null;
}

/** Décode le jeton s'il est présent, sans jamais bloquer la requête. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
    } catch {
      // Jeton invalide ou expiré : la requête continue en tant qu'anonyme.
    }
  }
  next();
}

/** Exige un jeton valide. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (!token) return next(unauthorized());

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    next(unauthorized('Session expirée ou invalide, merci de vous reconnecter.'));
  }
}

/** Exige un jeton valide portant l'un des rôles autorisés. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, (err?: unknown) => {
      if (err) return next(err);
      if (!req.user || !roles.includes(req.user.role)) {
        return next(forbidden("Vous n'avez pas les droits nécessaires pour cette action."));
      }
      next();
    });
  };
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}
