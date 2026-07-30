import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { badRequest } from '../utils/errors';

type Source = 'body' | 'query' | 'params';

/** Valide et remplace la partie ciblée de la requête par la donnée typée. */
export function validate(schema: ZodTypeAny, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === 'query') {
        // req.query est en lecture seule sur Express 5 ; on stocke à part par sûreté.
        Object.defineProperty(req, 'validatedQuery', { value: parsed, writable: true });
      }
      (req as unknown as Record<Source, unknown>)[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.') || '(racine)',
          message: e.message,
        }));
        return next(badRequest('Les données envoyées sont invalides.', details));
      }
      next(error);
    }
  };
}
