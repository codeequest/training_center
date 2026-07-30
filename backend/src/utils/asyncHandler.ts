import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Relaie les rejets de promesse vers le middleware d'erreur d'Express. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
