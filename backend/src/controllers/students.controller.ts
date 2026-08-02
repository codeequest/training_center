import type { Enrollment, Session } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { notFound } from '../utils/errors';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Progression estimée d'une inscription : aucune colonne dédiée en base,
 * donc dérivée du statut et — une fois la place confirmée — de la position
 * de la date du jour dans la période de la session.
 */
function computeProgress(status: Enrollment['status'], session: Pick<Session, 'startDate' | 'endDate'>): number {
  if (status === 'COMPLETED') return 100;
  if (status === 'CANCELLED') return 0;
  if (status === 'REQUESTED') return 5;

  const now = Date.now();
  const start = session.startDate.getTime();
  const end = session.endDate.getTime();

  if (now <= start) return 10;
  if (now >= end) return 95; // attestation pas encore émise par l'équipe pédagogique
  return Math.round(10 + ((now - start) / (end - start)) * 85);
}

/** Prochaine échéance utile pour l'étudiant : début si à venir, sinon fin de session. */
function computeDeadline(session: Pick<Session, 'startDate' | 'endDate'>) {
  const now = Date.now();
  const target = now < session.startDate.getTime() ? session.startDate : session.endDate;
  const daysLeft = Math.ceil((target.getTime() - now) / MS_PER_DAY);

  return {
    date: target,
    label: (now < session.startDate.getTime() ? 'START' : 'END') as 'START' | 'END',
    daysLeft,
    isUrgent: daysLeft >= 0 && daysLeft <= 7,
    isPast: daysLeft < 0,
  };
}

const enrollmentInclude = {
  session: {
    include: {
      course: { select: { id: true, slug: true, titleFr: true, titleEn: true, accentColor: true, durationHours: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  certificate: { select: { id: true, serialNumber: true, issuedAt: true } },
} as const;

function shapeEnrollment(enrollment: {
  id: string;
  status: Enrollment['status'];
  createdAt: Date;
  confirmedAt: Date | null;
  completedAt: Date | null;
  session: Session & {
    course: { id: string; slug: string; titleFr: string; titleEn: string; accentColor: string; durationHours: number };
    teacher: { id: string; firstName: string; lastName: string } | null;
  };
  certificate: { id: string; serialNumber: string; issuedAt: Date } | null;
}) {
  return {
    id: enrollment.id,
    status: enrollment.status,
    registrationDate: enrollment.createdAt,
    confirmedAt: enrollment.confirmedAt,
    completedAt: enrollment.completedAt,
    course: enrollment.session.course,
    teacher: enrollment.session.teacher,
    schedule: {
      startDate: enrollment.session.startDate,
      endDate: enrollment.session.endDate,
      mode: enrollment.session.mode,
    },
    progress: computeProgress(enrollment.status, enrollment.session),
    deadline: enrollment.status === 'CANCELLED' ? null : computeDeadline(enrollment.session),
    certificate: enrollment.certificate,
  };
}

/** Tableau de bord personnel de l'étudiant connecté. */
export const getMyDashboard = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  if (!user) throw notFound('Compte introuvable.');

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'desc' },
    include: enrollmentInclude,
  });

  const courses = enrollments.map(shapeEnrollment);
  const deadlines = courses
    .filter((c) => c.deadline && !c.deadline.isPast)
    .sort((a, b) => a.deadline!.date.getTime() - b.deadline!.date.getTime());

  res.json({
    student: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      registrationDate: user.createdAt,
    },
    courses,
    deadlines,
  });
});

/**
 * Vue d'ensemble de tous les étudiants — accessible en lecture aux
 * administrateurs ET aux formateurs (aucune mutation possible depuis cette route).
 */
export const listStudentsOverview = asyncHandler(async (req, res) => {
  const { search } = req.query as { search?: string };

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      enrollments: {
        where: { status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        include: enrollmentInclude,
      },
    },
  });

  const overview = students.map((student) => {
    const courses = student.enrollments.map(shapeEnrollment);
    const nextDeadline = courses
      .filter((c) => c.deadline && !c.deadline.isPast)
      .sort((a, b) => a.deadline!.date.getTime() - b.deadline!.date.getTime())[0]?.deadline ?? null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      isActive: student.isActive,
      registrationDate: student.createdAt,
      courses,
      nextDeadline,
    };
  });

  res.json({ students: overview });
});
