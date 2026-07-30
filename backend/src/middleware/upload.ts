import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';
import { badRequest } from '../utils/errors';

fs.mkdirSync(env.uploadDir, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.png', '.jpg', '.jpeg', '.webp', '.csv', '.txt',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    // Nom aléatoire : le nom d'origine ne doit jamais atteindre le disque.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

export const uploadMaterial = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(badRequest(`Extension de fichier non autorisée : ${ext || '(aucune)'}`));
      return;
    }
    cb(null, true);
  },
});
