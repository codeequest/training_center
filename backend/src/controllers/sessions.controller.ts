import { SessionMode, SessionStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, forbidden, notFound } from '../utils/errors';

export const sessionSchema = z
  .object({
    courseId: z.string().cuid(),
    teacherId: z.string().cuid().optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    scheduleFr: z.string().min(2).max(200),
    scheduleEn: z.string().min(2).max(200),
    mode: z.nativeEnum(SessionMode).default(SessionMode.ONSITE),
    location: z.string().max(300).optional().nullable(),
    meetingUrl: z.string().url().max(500).optional().nullable(),
    capacity: z.number().int().min(1).max(500).default(15),
    status: z.nativeEnum(SessionStatus).default(SessionStatus.OPEN),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La date de fin doit être postérieure à la date de début.',
    path: ['endDate'],
  });

export const sessionUpdateSchema = sessionSchema.innerType().partial();

const teacherSelect = {
  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
} as const;

/**
 * Forme unique d'une session côté back-office, partagée par la liste, la création
 * et la modification : le front type ses réponses avec `AdminSession` (`_count`
 * compris) et plante au rendu si une écriture renvoie un objet plus pauvre.
 */
const adminSessionInclude = {
  course: { select: { id: true, slug: true, titleFr: true, titleEn: true } },
  teacher: teacherSelect,
  _count: { select: { enrollments: true } },
} as const;

/** Sessions ouvertes à l'inscription, toutes formations confondues. */
export const listUpcomingSessions = asyncHandler(async (_req, res) => {
  const sessions = await prisma.session.findMany({
    where: { status: { in: ['OPEN', 'PLANNED'] }, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    include: {
      course: { select: { id: true, slug: true, titleFr: true, titleEn: true, accentColor: true } },
      teacher: teacherSelect,
      _count: { select: { enrollments: true } },
    },
  });
  res.json({ sessions });
});

export const listAllSessions = asyncHandler(async (req, res) => {
  const { courseId, status } = req.query as { courseId?: string; status?: string };

  const sessions = await prisma.session.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(status && status in SessionStatus ? { status: status as SessionStatus } : {}),
    },
    orderBy: { startDate: 'desc' },
    include: adminSessionInclude,
  });
  res.json({ sessions });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: {
      course: { include: { modules: { orderBy: { position: 'asc' } } } },
      teacher: teacherSelect,
      _count: { select: { enrollments: true } },
    },
  });
  if (!session) throw notFound('Session introuvable.');
  res.json({ session });
});

async function assertTeacherIsValid(teacherId?: string | null): Promise<void> {
  if (!teacherId) return;
  const teacher = await prisma.user.findFirst({ where: { id: teacherId, role: 'TEACHER' } });
  if (!teacher) throw badRequest("Le formateur sélectionné n'existe pas.");
}

export const createSession = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof sessionSchema>;
  await assertTeacherIsValid(data.teacherId);

  const session = await prisma.session.create({
    data,
    include: adminSessionInclude,
  });
  res.status(201).json({ session });
});

export const updateSession = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof sessionUpdateSchema>;
  await assertTeacherIsValid(data.teacherId);

  const existing = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound('Session introuvable.');

  const start = data.startDate ?? existing.startDate;
  const end = data.endDate ?? existing.endDate;
  if (end < start) throw badRequest('La date de fin doit être postérieure à la date de début.');

  const session = await prisma.session.update({
    where: { id: req.params.id },
    data,
    include: adminSessionInclude,
  });
  res.json({ session });
});

export const deleteSession = asyncHandler(async (req, res) => {
  const count = await prisma.enrollment.count({ where: { sessionId: req.params.id } });
  if (count > 0) {
    throw badRequest(
      `Impossible de supprimer : ${count} inscription(s) y sont rattachées. Annulez la session à la place.`
    );
  }
  await prisma.session.delete({ where: { id: req.params.id } });
  res.json({ message: 'Session supprimée.' });
});

/** Sessions animées par le formateur connecté, avec la liste de ses stagiaires. */
export const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { teacherId: req.user!.sub },
    orderBy: { startDate: 'desc' },
    include: {
      course: { select: { id: true, slug: true, titleFr: true, titleEn: true, accentColor: true } },
      _count: { select: { enrollments: true, materials: true } },
    },
  });
  res.json({ sessions });
});

/** Liste des stagiaires d'une session — réservée au formateur assigné et aux admins. */
export const listSessionRoster = asyncHandler(async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { course: { select: { titleFr: true, titleEn: true } } },
  });
  if (!session) throw notFound('Session introuvable.');

  const isOwner = session.teacherId === req.user!.sub;
  if (req.user!.role !== 'ADMIN' && !isOwner) {
    throw forbidden("Vous n'animez pas cette session.");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { sessionId: session.id, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'asc' },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
      certificate: { select: { id: true, serialNumber: true, issuedAt: true } },
    },
  });

  res.json({ session, enrollments });
});
