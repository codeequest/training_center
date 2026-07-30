import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { notFound } from '../utils/errors';

export const teacherProfileSchema = z.object({
  headlineFr: z.string().min(3).max(160),
  headlineEn: z.string().min(3).max(160),
  bioFr: z.string().min(20).max(4000),
  bioEn: z.string().min(20).max(4000),
  certifications: z.array(z.string().max(80)).max(20).default([]),
  linkedinUrl: z.string().url().max(300).optional().nullable(),
  yearsExperience: z.number().int().min(0).max(60).default(0),
  isPublished: z.boolean().default(true),
});

/** Annuaire public des formateurs. */
export const listPublicTeachers = asyncHandler(async (_req, res) => {
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', isActive: true, teacherProfile: { isPublished: true } },
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      teacherProfile: true,
      taughtSessions: {
        where: { status: { in: ['OPEN', 'PLANNED', 'RUNNING'] } },
        select: {
          course: { select: { id: true, slug: true, titleFr: true, titleEn: true, accentColor: true } },
        },
      },
    },
  });

  // Un formateur peut animer plusieurs sessions du même cours : on dédoublonne.
  const withUniqueCourses = teachers.map(({ taughtSessions, ...teacher }) => ({
    ...teacher,
    courses: [...new Map(taughtSessions.map((s) => [s.course.id, s.course])).values()],
  }));

  res.json({ teachers: withUniqueCourses });
});

export const getPublicTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      role: 'TEACHER',
      isActive: true,
      teacherProfile: { isPublished: true },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      teacherProfile: true,
      taughtSessions: {
        where: { status: { in: ['OPEN', 'PLANNED'] }, startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { course: { select: { id: true, slug: true, titleFr: true, titleEn: true, accentColor: true } } },
      },
    },
  });

  if (!teacher) throw notFound('Formateur introuvable.');
  res.json({ teacher });
});

/** Création ou mise à jour de sa propre fiche formateur. */
export const upsertMyTeacherProfile = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof teacherProfileSchema>;
  const userId = req.user!.sub;

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId },
    create: { ...data, userId },
    update: data,
  });

  res.json({ teacherProfile });
});
