import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Copiez .env.example vers .env et renseignez-la.`
    );
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const jwtSecret = required('JWT_SECRET', nodeEnv === 'production' ? undefined : 'dev-secret-not-for-production');

if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET doit faire au moins 32 caractères en production.');
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/centre_formation?schema=public'),

  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 25) * 1024 * 1024,

  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
  },
  mailFrom: process.env.MAIL_FROM ?? 'Centre de Formation <no-reply@centre-formation.tn>',
  contactInbox: process.env.CONTACT_INBOX ?? 'contact@centre-formation.tn',

  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@centre-formation.tn',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin123!',
};
