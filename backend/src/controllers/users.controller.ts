import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { layout, p, sendMail } from '../lib/mailer';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, conflict, notFound } from '../utils/errors';

export const createUserSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(2).max(60),
  role: z.nativeEnum(Role).default(Role.STUDENT),
  phone: z.string().max(30).optional().nullable(),
  locale: z.enum(['fr', 'en']).default('fr'),
  // Omis : un mot de passe provisoire est généré et envoyé par email.
  password: z.string().min(8).max(100).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(60).optional(),
  lastName: z.string().min(2).max(60).optional(),
  role: z.nativeEnum(Role).optional(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  locale: z.enum(['fr', 'en']).optional(),
  isActive: z.boolean().optional(),
});

const publicUser = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  locale: true,
  isActive: true,
  createdAt: true,
} as const;

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query as { role?: string; search?: string };

  const users = await prisma.user.findMany({
    where: {
      ...(role && role in Role ? { role: role as Role } : {}),
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
    orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
    select: {
      ...publicUser,
      teacherProfile: { select: { id: true, headlineFr: true, isPublished: true } },
      _count: { select: { enrollments: true, taughtSessions: true } },
    },
  });

  res.json({ users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      ...publicUser,
      teacherProfile: true,
      enrollments: {
        include: { session: { include: { course: { select: { titleFr: true, titleEn: true } } } } },
      },
    },
  });
  if (!user) throw notFound('Utilisateur introuvable.');
  res.json({ user });
});

/** Crée un compte et transmet un mot de passe provisoire par email. */
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, ...rest } = req.body as z.infer<typeof createUserSchema>;
  const normalizedEmail = email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) {
    throw conflict('Un compte existe déjà avec cette adresse email.');
  }

  const temporaryPassword = password ?? `${crypto.randomBytes(6).toString('base64url')}A1!`;

  const user = await prisma.user.create({
    data: {
      ...rest,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
    },
    select: publicUser,
  });

  // Rattache les demandes d'inscription déjà déposées avec cet email.
  if (user.role === 'STUDENT') {
    await prisma.enrollment.updateMany({
      where: { requesterEmail: normalizedEmail, studentId: null },
      data: { studentId: user.id },
    });
  }

  await sendMail({
    to: normalizedEmail,
    subject: 'Votre accès à l\'espace du Centre de Formation',
    html: layout(
      'Votre compte est prêt',
      p(`Bonjour ${rest.firstName},`) +
        p('Un accès à votre espace personnel vient d\'être créé.') +
        p(`<strong>Email :</strong> ${normalizedEmail}<br/><strong>Mot de passe provisoire :</strong> ${temporaryPassword}`) +
        p('Merci de modifier ce mot de passe dès votre première connexion.')
    ),
  });

  res.status(201).json({
    user,
    // Renvoyé une seule fois pour permettre une transmission manuelle si l'email n'arrive pas.
    temporaryPassword: password ? undefined : temporaryPassword,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof updateUserSchema>;

  if (data.isActive === false && req.params.id === req.user!.sub) {
    throw badRequest('Vous ne pouvez pas désactiver votre propre compte.');
  }
  if (data.role && data.role !== 'ADMIN' && req.params.id === req.user!.sub) {
    throw badRequest('Vous ne pouvez pas retirer votre propre rôle administrateur.');
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: publicUser,
  });
  res.json({ user });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw notFound('Utilisateur introuvable.');

  const temporaryPassword = `${crypto.randomBytes(6).toString('base64url')}A1!`;

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(temporaryPassword, 12) },
  });

  await sendMail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    html: layout(
      'Nouveau mot de passe provisoire',
      p(`Bonjour ${user.firstName},`) +
        p(`<strong>Mot de passe provisoire :</strong> ${temporaryPassword}`) +
        p('Modifiez-le dès votre prochaine connexion depuis votre profil.')
    ),
  });

  res.json({ message: 'Mot de passe réinitialisé.', temporaryPassword });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user!.sub) {
    throw badRequest('Vous ne pouvez pas supprimer votre propre compte.');
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'Utilisateur supprimé.' });
});
