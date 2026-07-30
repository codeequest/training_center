/** Erreur applicative dont le message est destiné au client. */
export class AppError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, message, details);
export const unauthorized = (message = 'Authentification requise.') => new AppError(401, message);
export const forbidden = (message = 'Accès refusé.') => new AppError(403, message);
export const notFound = (message = 'Ressource introuvable.') => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
