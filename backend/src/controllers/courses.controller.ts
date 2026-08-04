import { Level } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, notFound } from '../utils/errors';

const moduleSchema = z.object({
  position: z.number().int().min(1),
  titleFr: z.string().min(2).max(200),
  titleEn: z.string().min(2).max(200),
  descriptionFr: z.string().max(2000).default(''),
  descriptionEn: z.string().max(2000).default(''),
});

export const courseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit être en minuscules avec des tirets.'),
  titleFr: z.string().min(2).max(200),
  titleEn: z.string().min(2).max(200),
  summaryFr: z.string().min(10).max(400),
  summaryEn: z.string().min(10).max(400),
  descriptionFr: z.string().min(10),
  descriptionEn: z.string().min(10),
  audienceFr: z.string().default(''),
  audienceEn: z.string().default(''),
  prerequisitesFr: z.string().default(''),
  prerequisitesEn: z.string().default(''),
  level: z.nativeEnum(Level).default(Level.BEGINNER),
  durationHours: z.number().int().min(1).max(1000),
  price: z.number().min(0),
  currency: z.string().length(3).default('TND'),
  coverImageUrl: z.string().max(500).optional().nullable(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0F766E'),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  modules: z.array(moduleSchema).default([]),
});

export const courseUpdateSchema = courseSchema.partial();

const upcoming = {
  where: { status: { in: ['OPEN' as const, 'PLANNED' as const] }, startDate: { gte: new Date() } },
  orderBy: { startDate: 'asc' as const },
  include: {
    teacher: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    _count: { select: { enrollments: true } },
  },
};

/** Catalogue public : uniquement les formations publiées. */
export const listPublicCourses = asyncHandler(async (req, res) => {
  const { level, search } = req.query as { level?: string; search?: string };

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(level && level in Level ? { level: level as Level } : {}),
      ...(search
        ? {
            OR: [
              { titleFr: { contains: search, mode: 'insensitive' as const } },
              { titleEn: { contains: search, mode: 'insensitive' as const } },
              { summaryFr: { contains: search, mode: 'insensitive' as const } },
              { summaryEn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { titleFr: 'asc' }],
    include: {
      _count: { select: { sessions: true } },
      sessions: { ...upcoming, take: 1 },
    },
  });

  res.json({ courses });
});

export const getPublicCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { slug: req.params.slug, isPublished: true },
    include: {
      modules: { orderBy: { position: 'asc' } },
      sessions: upcoming,
      materials: {
        where: { visibility: 'PUBLIC' },
        select: { id: true, title: true, type: true, fileUrl: true },
      },
    },
  });

  if (!course) throw notFound('Cette formation est introuvable.');
  res.json({ course });
});

// --- Administration ---

/**
 * Forme unique d'une formation côté back-office. Toutes les routes qui renvoient
 * une formation à l'administration partagent cet `include` : le front type ses
 * réponses avec `AdminCourse` (`_count` compris) et plante au rendu si une
 * création ou une modification renvoie un objet plus pauvre que la liste.
 *
 * Les modules en font partie : le formulaire d'édition s'initialise à partir de
 * cet objet, et sans eux il renverrait un programme vide qui effacerait les
 * modules existants à l'enregistrement.
 */
const adminCourseInclude = {
  _count: { select: { sessions: true, modules: true } },
  modules: { orderBy: { position: 'asc' } },
} as const;

export const listAllCourses = asyncHandler(async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: adminCourseInclude,
  });
  res.json({ courses });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { modules, price, ...rest } = req.body as z.infer<typeof courseSchema>;

  const course = await prisma.course.create({
    data: {
      ...rest,
      price,
      modules: { create: modules },
    },
    include: adminCourseInclude,
  });

  res.status(201).json({ course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { modules, ...rest } = req.body as z.infer<typeof courseUpdateSchema>;
  const { id } = req.params;

  const course = await prisma.$transaction(async (tx) => {
    // Les modules sont remplacés en bloc : l'ordre et la numérotation restent cohérents.
    if (modules) {
      await tx.module.deleteMany({ where: { courseId: id } });
      await tx.module.createMany({ data: modules.map((m) => ({ ...m, courseId: id })) });
    }
    return tx.course.update({
      where: { id },
      data: rest,
      include: adminCourseInclude,
    });
  });

  res.json({ course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // La cascade en base va de Course vers Sessions, Inscriptions puis Attestations :
  // sans ce garde-fou, supprimer une formation effacerait silencieusement des
  // attestations déjà délivrées et casserait leur vérification publique.
  const [sessionCount, enrollmentCount] = await Promise.all([
    prisma.session.count({ where: { courseId: id } }),
    prisma.enrollment.count({ where: { session: { courseId: id } } }),
  ]);

  if (sessionCount > 0) {
    throw badRequest(
      `Impossible de supprimer : ${sessionCount} session(s) et ${enrollmentCount} inscription(s) y sont rattachées. Dépubliez la formation à la place.`
    );
  }

  await prisma.course.delete({ where: { id } });
  res.json({ message: 'Formation supprimée.' });
});
