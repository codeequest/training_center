import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Fichier trop volumineux (maximum ${Math.round(env.maxUploadBytes / 1024 / 1024)} Mo).`
        : `Erreur de téléversement : ${err.message}`;
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'champ';
      res.status(409).json({ error: `Cette valeur existe déjà (${target}).` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Ressource introuvable.' });
      return;
    }
  }

  console.error('[erreur non gérée]', err);
  res.status(500).json({
    error: 'Une erreur interne est survenue.',
    ...(env.isProduction ? {} : { debug: err instanceof Error ? err.message : String(err) }),
  });
}
