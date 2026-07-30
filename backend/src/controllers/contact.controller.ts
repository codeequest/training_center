import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { layout, p, sendMail } from '../lib/mailer';
import { asyncHandler } from '../utils/asyncHandler';

export const contactSchema = z.object({
  name: z.string().min(2, 'Nom trop court.').max(120),
  email: z.string().email('Adresse email invalide.'),
  phone: z.string().max(30).optional(),
  subject: z.string().min(3, 'Sujet trop court.').max(200),
  body: z.string().min(10, 'Votre message est trop court.').max(4000),
  website: z.string().max(0).optional(), // champ leurre anti-robot
});

/** Le message est enregistré en base ET envoyé par email : rien n'est perdu si le SMTP tombe. */
export const submitContact = asyncHandler(async (req, res) => {
  const { website, email, ...rest } = req.body as z.infer<typeof contactSchema>;

  if (website) {
    res.status(201).json({ message: 'Message envoyé.' });
    return;
  }

  const message = await prisma.contactMessage.create({
    data: { ...rest, email: email.toLowerCase() },
  });

  await sendMail({
    to: env.contactInbox,
    replyTo: email,
    subject: `[Contact] ${rest.subject}`,
    html: layout(
      'Nouveau message depuis le site',
      p(`<strong>De :</strong> ${rest.name} (${email})`) +
        p(`<strong>Téléphone :</strong> ${rest.phone ?? '—'}`) +
        p(`<strong>Sujet :</strong> ${rest.subject}`) +
        p(`<strong>Message :</strong><br/>${rest.body.replace(/\n/g, '<br/>')}`)
    ),
  });

  await sendMail({
    to: email,
    subject: 'Nous avons bien reçu votre message',
    html: layout(
      'Message bien reçu',
      p(`Bonjour ${rest.name},`) +
        p('Merci de nous avoir écrit. Notre équipe vous répond sous 48 heures ouvrées.') +
        p("L'équipe du Centre de Formation")
    ),
  });

  res.status(201).json({
    message: 'Votre message a bien été envoyé. Nous vous répondons sous 48 heures.',
    id: message.id,
  });
});

// --- Administration ---

export const listContactMessages = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query as { unreadOnly?: string };

  const messages = await prisma.contactMessage.findMany({
    where: unreadOnly === 'true' ? { isRead: false } : {},
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
  });

  res.json({ messages, unreadCount: messages.filter((m) => !m.isRead).length });
});

export const markContactRead = asyncHandler(async (req, res) => {
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { isRead: req.body.isRead !== false },
  });
  res.json({ message });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  res.json({ message: 'Message supprimé.' });
});
