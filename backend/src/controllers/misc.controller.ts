import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

/** Témoignages publiés, pour la page d'accueil. */
export const listTestimonials = asyncHandler(async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  res.json({ testimonials });
});

/** Chiffres clés affichés sur la page d'accueil. */
export const publicStats = asyncHandler(async (_req, res) => {
  const [courses, teachers, completed, sessions] = await Promise.all([
    prisma.course.count({ where: { isPublished: true } }),
    prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
    prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.session.count({ where: { status: { in: ['DONE', 'RUNNING'] } } }),
  ]);

  res.json({ stats: { courses, teachers, graduates: completed, sessionsDelivered: sessions } });
});

/** Tableau de bord administrateur. */
export const adminStats = asyncHandler(async (_req, res) => {
  const [
    totalStudents,
    totalTeachers,
    publishedCourses,
    openSessions,
    pendingRequests,
    confirmedEnrollments,
    unreadMessages,
    byStatus,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.session.count({ where: { status: 'OPEN' } }),
    prisma.enrollment.count({ where: { status: 'REQUESTED' } }),
    prisma.enrollment.count({ where: { status: { in: ['CONFIRMED', 'PAID'] } } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enrollment.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        session: { include: { course: { select: { titleFr: true, titleEn: true } } } },
      },
    }),
  ]);

  res.json({
    stats: {
      totalStudents,
      totalTeachers,
      publishedCourses,
      openSessions,
      pendingRequests,
      confirmedEnrollments,
      unreadMessages,
    },
    enrollmentsByStatus: byStatus.map((row) => ({ status: row.status, count: row._count._all })),
    recentEnrollments,
  });
});
