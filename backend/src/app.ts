import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

export function createApp() {
  const app = express();

  // Nécessaire derrière un reverse proxy pour que le rate limiting voie la vraie IP.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // Les fichiers de /uploads sont servis vers le frontend Next.js (autre origine).
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Autorise les appels serveur-à-serveur (SSR Next.js, outils CLI) qui n'ont pas d'Origin.
        if (!origin || env.corsOrigin.includes(origin)) return callback(null, true);
        callback(new Error(`Origine non autorisée par CORS : ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use('/uploads', express.static(env.uploadDir, { maxAge: '7d', index: false }));
  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
