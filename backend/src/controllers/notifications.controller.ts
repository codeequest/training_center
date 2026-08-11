import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

const MAX_ITEMS = 8;

/**
 * Notifications par rôle — aucune table dédiée : on relit les signaux déjà en base.
 * ADMIN se base sur ContactMessage.isRead (déjà utilisé par l'onglet Messages).
 * TEACHER/STUDENT se basent sur User.notificationsSeenAt, avancé à chaque ouverture du menu.
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { role, sub } = req.user!;

  if (role === 'ADMIN') {
    const [items, count] = await Promise.all([
      prisma.contactMessage.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: MAX_ITEMS,
        select: { id: true, name: true, subject: true, createdAt: true },
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

    res.json({
      count,
      items: items.map((m) => ({
        id: m.id,
        kind: 'contact_message' as const,
        createdAt: m.createdAt,
        href: '/admin/messages',
        name: m.name,
        subject: m.subject,
      })),
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { notificationsSeenAt: true },
  });
  const since = user?.notificationsSeenAt ?? new Date(0);

  if (role === 'TEACHER') {
    const where = {
      createdAt: { gt: since },
      status: { not: 'CANCELLED' as const },
      session: { teacherId: sub },
    };

    const [enrollments, count] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: MAX_ITEMS,
        include: {
          session: { select: { id: true, course: { select: { titleFr: true, titleEn: true } } } },
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    res.json({
      count,
      items: enrollments.map((e) => ({
        id: e.id,
        kind: 'new_enrollment' as const,
        createdAt: e.createdAt,
        href: `/teacher/sessions/${e.session.id}`,
        requesterName: e.requesterName,
        courseTitleFr: e.session.course.titleFr,
        courseTitleEn: e.session.course.titleEn,
      })),
    });
    return;
  }

  // STUDENT : changement de statut d'inscription ou attestation nouvellement émise.
  const where = { studentId: sub, updatedAt: { gt: since } };

  const [enrollments, count] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: MAX_ITEMS,
      include: {
        certificate: { select: { issuedAt: true } },
        session: { select: { course: { select: { titleFr: true, titleEn: true } } } },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  res.json({
    count,
    items: enrollments.map((e) => ({
      id: e.id,
      kind: (e.certificate && e.certificate.issuedAt > since ? 'certificate' : 'enrollment_status') as
        | 'certificate'
        | 'enrollment_status',
      createdAt: e.updatedAt,
      href: '/student/formations',
      status: e.status,
      courseTitleFr: e.session.course.titleFr,
      courseTitleEn: e.session.course.titleEn,
    })),
  });
});

/** Avance le curseur "vu" au moment présent — n'affecte que TEACHER/STUDENT (voir ci-dessus). */
export const markNotificationsSeen = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: { notificationsSeenAt: new Date() },
    select: { notificationsSeenAt: true },
  });
  res.json({ notificationsSeenAt: user.notificationsSeenAt });
});
