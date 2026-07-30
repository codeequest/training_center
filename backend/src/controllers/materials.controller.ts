import fs from 'fs/promises';
import path from 'path';
import { MaterialType, Visibility } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, forbidden, notFound } from '../utils/errors';

export const materialMetaSchema = z.object({
  title: z.string().min(2).max(200),
  sessionId: z.string().cuid().optional(),
  courseId: z.string().cuid().optional(),
  type: z.nativeEnum(MaterialType).default(MaterialType.PDF),
  visibility: z.nativeEnum(Visibility).default(Visibility.ENROLLED),
  fileUrl: z.string().url().max(1000).optional(), // pour type LINK ou VIDEO
});

/** Le formateur assigné à la session, ou un admin. */
async function assertCanManage(userId: string, role: string, sessionId?: string): Promise<void> {
  if (role === 'ADMIN') return;
  if (!sessionId) throw forbidden('Seul un administrateur peut attacher un support à une formation entière.');

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw notFound('Session introuvable.');
  if (session.teacherId !== userId) throw forbidden("Vous n'animez pas cette session.");
}

export const createMaterial = asyncHandler(async (req, res) => {
  const parsed = materialMetaSchema.parse({
    ...req.body,
    ...(req.body.visibility ? { visibility: req.body.visibility } : {}),
  });
  const { title, sessionId, courseId, type, visibility } = parsed;

  if (!sessionId && !courseId) {
    throw badRequest('Un support doit être rattaché à une session ou à une formation.');
  }

  await assertCanManage(req.user!.sub, req.user!.role, sessionId);

  const file = req.file;
  const isExternalLink = type === 'LINK' || type === 'VIDEO';

  let fileUrl: string;
  let fileSize: number | null = null;

  if (isExternalLink) {
    if (!parsed.fileUrl) throw badRequest('Une URL est requise pour un support de type LIEN ou VIDÉO.');
    fileUrl = parsed.fileUrl;
  } else {
    if (!file) throw badRequest('Aucun fichier reçu.');
    fileUrl = `/uploads/${file.filename}`;
    fileSize = file.size;
  }

  const material = await prisma.material.create({
    data: {
      title,
      type,
      visibility,
      fileUrl,
      fileSize,
      sessionId: sessionId ?? null,
      courseId: courseId ?? null,
      uploaderId: req.user!.sub,
    },
  });

  res.status(201).json({ material });
});

/**
 * Supports visibles pour l'utilisateur connecté : ceux de ses sessions
 * (inscription non annulée), plus tous les supports publics.
 */
export const listMyMaterials = asyncHandler(async (req, res) => {
  const userId = req.user!.sub;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId, status: { in: ['CONFIRMED', 'PAID', 'COMPLETED'] } },
    select: { sessionId: true, session: { select: { courseId: true } } },
  });

  const sessionIds = enrollments.map((e) => e.sessionId);
  const courseIds = enrollments.map((e) => e.session.courseId);

  const materials = await prisma.material.findMany({
    where: {
      OR: [
        { sessionId: { in: sessionIds } },
        { courseId: { in: courseIds } },
        { visibility: 'PUBLIC' },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      session: { select: { id: true, startDate: true, course: { select: { titleFr: true, titleEn: true } } } },
      course: { select: { id: true, titleFr: true, titleEn: true } },
    },
  });

  res.json({ materials });
});

export const listSessionMaterials = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user!.sub;
  const role = req.user!.role;

  if (role !== 'ADMIN') {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw notFound('Session introuvable.');

    const isTeacher = session.teacherId === userId;
    const isEnrolled =
      (await prisma.enrollment.count({
        where: { sessionId, studentId: userId, status: { in: ['CONFIRMED', 'PAID', 'COMPLETED'] } },
      })) > 0;

    if (!isTeacher && !isEnrolled) throw forbidden("Vous n'avez pas accès aux supports de cette session.");
  }

  const materials = await prisma.material.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ materials });
});

export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await prisma.material.findUnique({ where: { id: req.params.id } });
  if (!material) throw notFound('Support introuvable.');

  await assertCanManage(req.user!.sub, req.user!.role, material.sessionId ?? undefined);

  await prisma.material.delete({ where: { id: material.id } });

  // Nettoyage du fichier physique ; l'échec ne doit pas faire échouer la suppression logique.
  if (material.fileUrl.startsWith('/uploads/')) {
    const filePath = path.join(env.uploadDir, path.basename(material.fileUrl));
    await fs.unlink(filePath).catch(() => undefined);
  }

  res.json({ message: 'Support supprimé.' });
});
