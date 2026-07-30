import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, notFound, unauthorized } from '../utils/errors';

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(60).optional(),
  lastName: z.string().min(2).max(60).optional(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  locale: z.enum(['fr', 'en']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.')
    .max(100),
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
  createdAt: true,
} as const;

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Message identique dans les deux cas : ne pas révéler quels emails existent.
  const invalid = unauthorized('Email ou mot de passe incorrect.');
  if (!user) {
    // Hachage factice pour égaliser le temps de réponse et empêcher l'énumération des comptes.
    await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    throw invalid;
  }
  if (!user.isActive) throw unauthorized('Ce compte est désactivé. Contactez le centre.');
  if (!(await bcrypt.compare(password, user.passwordHash))) throw invalid;

  const token = signToken({ sub: user.id, role: user.role, email: user.email });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
      createdAt: user.createdAt,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { ...publicUser, teacherProfile: true },
  });
  if (!user) throw notFound('Compte introuvable.');
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof updateProfileSchema>;
  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data,
    select: publicUser,
  });
  res.json({ user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw notFound('Compte introuvable.');

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest('Le mot de passe actuel est incorrect.');
  }
  if (currentPassword === newPassword) {
    throw badRequest("Le nouveau mot de passe doit être différent de l'actuel.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  res.json({ message: 'Mot de passe mis à jour.' });
});
