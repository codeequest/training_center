import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { layout, p, sendMail } from '../lib/mailer';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';

export const sendEmailSchema = z
  .object({
    subject: z.string().min(3, 'Sujet trop court.').max(200),
    body: z.string().min(1, 'Le message ne peut pas être vide.').max(10000),
    role: z.enum(['STUDENT', 'TEACHER', 'ALL']).optional(),
    userIds: z.array(z.string()).max(500).optional(),
  })
  .refine((data) => Boolean(data.role) || (data.userIds && data.userIds.length > 0), {
    message: 'Sélectionnez au moins un destinataire.',
  });

/** Échappe le texte saisi par l'administrateur avant de l'insérer dans le HTML de l'email. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Envoie un email libre, à la demande d'un administrateur, à un rôle ou à une sélection d'utilisateurs. */
export const sendBulkEmail = asyncHandler(async (req, res) => {
  const { subject, body, role, userIds } = req.body as z.infer<typeof sendEmailSchema>;

  const recipients = await prisma.user.findMany({
    where: {
      isActive: true,
      ...(userIds && userIds.length > 0
        ? { id: { in: userIds } }
        : { role: role === 'ALL' ? { in: [Role.STUDENT, Role.TEACHER] } : (role as Role) }),
    },
    select: { id: true, email: true, firstName: true },
  });

  if (recipients.length === 0) throw badRequest('Aucun destinataire actif trouvé.');

  const bodyHtml = escapeHtml(body)
    .split(/\n{2,}/)
    .map((paragraph) => p(paragraph.replace(/\n/g, '<br/>')))
    .join('');

  await Promise.all(
    recipients.map((recipient) =>
      sendMail({
        to: recipient.email,
        subject,
        html: layout(subject, p(`Bonjour ${recipient.firstName},`) + bodyHtml),
      })
    )
  );

  res.json({ message: `Email envoyé à ${recipients.length} destinataire(s).`, sentCount: recipients.length });
});
