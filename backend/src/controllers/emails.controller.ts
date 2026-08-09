import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { isMailEnabled, layout, p, sendMail } from '../lib/mailer';
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

  // Envoi par petits lots : un fournisseur SMTP (Gmail en particulier) limite le débit
  // et coupe la connexion si on lui pousse des centaines de messages d'un coup.
  const BATCH_SIZE = 10;
  let sentCount = 0;

  for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
    const results = await Promise.all(
      recipients.slice(index, index + BATCH_SIZE).map((recipient) =>
        sendMail({
          to: recipient.email,
          subject,
          html: layout(escapeHtml(subject), p(`Bonjour ${escapeHtml(recipient.firstName)},`) + bodyHtml),
        })
      )
    );
    sentCount += results.filter(Boolean).length;
  }

  const failedCount = recipients.length - sentCount;

  if (!isMailEnabled) {
    return res.json({
      message: `SMTP non configuré : ${recipients.length} email(s) simulé(s), aucun envoi réel.`,
      sentCount: 0,
      failedCount: 0,
      simulated: true,
    });
  }

  res.json({
    message:
      failedCount === 0
        ? `Email envoyé à ${sentCount} destinataire(s).`
        : `Email envoyé à ${sentCount} destinataire(s), ${failedCount} échec(s).`,
    sentCount,
    failedCount,
    simulated: false,
  });
});
