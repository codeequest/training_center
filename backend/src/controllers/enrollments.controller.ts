import crypto from 'crypto';
import { EnrollmentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { streamCertificate } from '../lib/certificate';
import { layout, p, sendMail } from '../lib/mailer';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors';

export const enrollmentRequestSchema = z.object({
  sessionId: z.string().cuid("Session invalide."),
  requesterName: z.string().min(2, 'Nom trop court.').max(120),
  requesterEmail: z.string().email('Adresse email invalide.'),
  requesterPhone: z.string().min(6, 'Numéro de téléphone trop court.').max(30).optional(),
  company: z.string().max(160).optional(),
  message: z.string().max(2000).optional(),
  // Champ leurre : rempli uniquement par les robots.
  website: z.string().max(0).optional(),
});

export const enrollmentUpdateSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus).optional(),
  adminNotes: z.string().max(2000).optional().nullable(),
  studentId: z.string().cuid().optional().nullable(),
});

/**
 * Demande d'inscription publique — aucun compte requis.
 * Le statut initial est toujours REQUESTED : c'est l'équipe du centre qui confirme.
 */
export const requestEnrollment = asyncHandler(async (req, res) => {
  const { website, sessionId, requesterEmail, ...rest } =
    req.body as z.infer<typeof enrollmentRequestSchema>;

  if (website) {
    // Piège à robots : on répond 201 sans rien enregistrer.
    res.status(201).json({ message: 'Demande enregistrée.' });
    return;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      course: true,
      _count: { select: { enrollments: { where: { status: { not: 'CANCELLED' } } } } },
    },
  });

  if (!session) throw notFound('Session introuvable.');
  if (!['OPEN', 'PLANNED'].includes(session.status)) {
    throw badRequest("Cette session n'est plus ouverte aux inscriptions.");
  }
  if (session._count.enrollments >= session.capacity) {
    throw conflict('Cette session est complète. Contactez-nous pour la prochaine date.');
  }

  const email = requesterEmail.toLowerCase();

  const duplicate = await prisma.enrollment.findFirst({
    where: { sessionId, requesterEmail: email, status: { not: 'CANCELLED' } },
  });
  if (duplicate) {
    throw conflict('Une demande pour cette session existe déjà avec cet email.');
  }

  // Si un compte existe déjà pour cet email, on rattache la demande dès maintenant.
  const existingUser = await prisma.user.findUnique({ where: { email } });

  const enrollment = await prisma.enrollment.create({
    data: {
      ...rest,
      sessionId,
      requesterEmail: email,
      studentId: existingUser?.role === 'STUDENT' ? existingUser.id : null,
      status: 'REQUESTED',
    },
  });

  const courseTitle = session.course.titleFr;
  const startDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(session.startDate);

  await sendMail({
    to: email,
    subject: `Votre demande d'inscription — ${courseTitle}`,
    html: layout(
      'Demande bien reçue',
      p(`Bonjour ${rest.requesterName},`) +
        p(`Nous avons bien reçu votre demande d'inscription à la formation <strong>${courseTitle}</strong>, session du ${startDate}.`) +
        p("Notre équipe vous contacte sous 48 heures ouvrées pour confirmer votre place et vous transmettre les modalités de règlement.") +
        p('À très bientôt,<br/>L\'équipe du Centre de Formation')
    ),
  });

  await sendMail({
    to: env.contactInbox,
    subject: `[Inscription] ${courseTitle} — ${rest.requesterName}`,
    replyTo: email,
    html: layout(
      'Nouvelle demande d\'inscription',
      p(`<strong>Formation :</strong> ${courseTitle} (session du ${startDate})`) +
        p(`<strong>Nom :</strong> ${rest.requesterName}`) +
        p(`<strong>Email :</strong> ${email}`) +
        p(`<strong>Téléphone :</strong> ${rest.requesterPhone ?? '—'}`) +
        p(`<strong>Société :</strong> ${rest.company ?? '—'}`) +
        p(`<strong>Message :</strong><br/>${rest.message ?? '—'}`)
    ),
  });

  res.status(201).json({
    message: 'Votre demande a bien été enregistrée. Nous vous recontactons sous 48 heures.',
    enrollmentId: enrollment.id,
  });
});

/** Inscriptions de l'étudiant connecté. */
export const listMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: req.user!.sub },
    orderBy: { createdAt: 'desc' },
    include: {
      certificate: true,
      session: {
        include: {
          course: true,
          teacher: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      },
    },
  });
  res.json({ enrollments });
});

// --- Pipeline administrateur ---

export const listEnrollments = asyncHandler(async (req, res) => {
  const { status, sessionId, search } = req.query as Record<string, string | undefined>;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(status && status in EnrollmentStatus ? { status: status as EnrollmentStatus } : {}),
      ...(sessionId ? { sessionId } : {}),
      ...(search
        ? {
            OR: [
              { requesterName: { contains: search, mode: 'insensitive' as const } },
              { requesterEmail: { contains: search, mode: 'insensitive' as const } },
              { company: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      certificate: { select: { id: true, serialNumber: true } },
      session: {
        include: { course: { select: { id: true, slug: true, titleFr: true, titleEn: true } } },
      },
    },
  });

  res.json({ enrollments });
});

export const updateEnrollment = asyncHandler(async (req, res) => {
  const { status, adminNotes, studentId } = req.body as z.infer<typeof enrollmentUpdateSchema>;

  const existing = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
    include: { session: { include: { course: true } } },
  });
  if (!existing) throw notFound('Inscription introuvable.');

  const enrollment = await prisma.enrollment.update({
    where: { id: existing.id },
    data: {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(studentId !== undefined ? { studentId } : {}),
      // Les horodatages ne sont posés qu'au premier passage dans l'état concerné.
      ...(status === 'CONFIRMED' && !existing.confirmedAt ? { confirmedAt: new Date() } : {}),
      ...(status === 'COMPLETED' && !existing.completedAt ? { completedAt: new Date() } : {}),
    },
    include: { session: { include: { course: true } } },
  });

  if (status === 'CONFIRMED' && existing.status !== 'CONFIRMED') {
    const startDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
      enrollment.session.startDate
    );
    await sendMail({
      to: enrollment.requesterEmail,
      subject: `Inscription confirmée — ${enrollment.session.course.titleFr}`,
      html: layout(
        'Votre place est confirmée',
        p(`Bonjour ${enrollment.requesterName},`) +
          p(`Votre inscription à la formation <strong>${enrollment.session.course.titleFr}</strong> est confirmée.`) +
          p(`<strong>Début :</strong> ${startDate}<br/><strong>Rythme :</strong> ${enrollment.session.scheduleFr}<br/><strong>Lieu :</strong> ${enrollment.session.location ?? enrollment.session.meetingUrl ?? 'à préciser'}`) +
          p('Vos identifiants d\'accès à l\'espace stagiaire vous seront transmis séparément.')
      ),
    });
  }

  res.json({ enrollment });
});

export const deleteEnrollment = asyncHandler(async (req, res) => {
  await prisma.enrollment.delete({ where: { id: req.params.id } });
  res.json({ message: 'Inscription supprimée.' });
});

/** Émet l'attestation. Réservée aux inscriptions au statut COMPLETED. */
export const issueCertificate = asyncHandler(async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
    include: { certificate: true, session: { include: { course: true } } },
  });
  if (!enrollment) throw notFound('Inscription introuvable.');
  if (enrollment.status !== 'COMPLETED') {
    throw badRequest("L'attestation ne peut être émise que pour une formation terminée.");
  }
  if (enrollment.certificate) {
    res.json({ certificate: enrollment.certificate, message: 'Attestation déjà émise.' });
    return;
  }

  const year = new Date().getFullYear();
  const serialNumber = `CF-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const certificate = await prisma.certificate.create({
    data: { enrollmentId: enrollment.id, serialNumber },
  });

  res.status(201).json({ certificate });
});

/** Téléchargement du PDF — l'étudiant concerné, son formateur ou un admin. */
export const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: req.params.id },
    include: {
      enrollment: {
        include: {
          student: true,
          session: { include: { course: true, teacher: true } },
        },
      },
    },
  });
  if (!certificate) throw notFound('Attestation introuvable.');

  const { enrollment } = certificate;
  const isOwner = enrollment.studentId === req.user!.sub;
  const isTeacher = enrollment.session.teacherId === req.user!.sub;
  if (req.user!.role !== 'ADMIN' && !isOwner && !isTeacher) {
    throw forbidden("Cette attestation ne vous concerne pas.");
  }

  const studentName = enrollment.student
    ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
    : enrollment.requesterName;

  streamCertificate(res, {
    serialNumber: certificate.serialNumber,
    studentName,
    courseTitle: enrollment.session.course.titleFr,
    durationHours: enrollment.session.course.durationHours,
    teacherName: enrollment.session.teacher
      ? `${enrollment.session.teacher.firstName} ${enrollment.session.teacher.lastName}`
      : null,
    issuedAt: certificate.issuedAt,
    endDate: enrollment.session.endDate,
  });
});

/** Vérification publique d'une attestation par son numéro de série. */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({
    where: { serialNumber: req.params.serial },
    include: {
      enrollment: {
        include: {
          student: { select: { firstName: true, lastName: true } },
          session: { include: { course: { select: { titleFr: true, titleEn: true, durationHours: true } } } },
        },
      },
    },
  });

  if (!certificate) {
    res.status(404).json({ valid: false, error: 'Aucune attestation ne correspond à cette référence.' });
    return;
  }

  const { enrollment } = certificate;
  res.json({
    valid: true,
    certificate: {
      serialNumber: certificate.serialNumber,
      issuedAt: certificate.issuedAt,
      studentName: enrollment.student
        ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
        : enrollment.requesterName,
      course: enrollment.session.course,
      completedAt: enrollment.completedAt,
    },
  });
});
