import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
    // Un envoi groupé réutilise la même connexion au lieu d'en ouvrir une par destinataire.
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });
}

/** `true` si un vrai serveur SMTP est configuré (sinon les emails sont seulement journalisés). */
export const isMailEnabled = Boolean(transporter);

/**
 * Vérifie la connexion et l'authentification SMTP. Appelé au démarrage pour que
 * des identifiants invalides se voient tout de suite, et non au premier envoi.
 */
export async function verifyMailer(): Promise<{ ok: boolean; error?: string }> {
  if (!transporter) return { ok: false, error: 'SMTP_HOST non renseigné — emails simulés.' };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email transactionnel. Sans SMTP configuré, le message est journalisé
 * plutôt qu'envoyé : le développement local reste fonctionnel hors ligne.
 * N'échoue jamais bruyamment — un email perdu ne doit pas casser une inscription.
 * Renvoie `true` si le serveur SMTP a accepté le message, afin que les appelants
 * qui rendent compte à l'utilisateur (envoi groupé) puissent annoncer un vrai total.
 */
export async function sendMail({ to, subject, html, replyTo }: MailInput): Promise<boolean> {
  if (!transporter) {
    console.info(`[mail:simulé] à=${to} sujet="${subject}"`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.mailFrom,
      // L'enveloppe force l'expéditeur réel : Gmail refuse un `From` qui n'est pas
      // le compte authentifié, on reste donc toujours sur SMTP_USER.
      envelope: { from: env.smtp.user || env.mailFrom, to },
      to,
      subject,
      html,
      replyTo,
    });
    return true;
  } catch (error) {
    console.error(`[mail:échec] à=${to} sujet="${subject}"`, error);
    return false;
  }
}

const BRAND = '#0F766E';

export function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f5f7;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <tr><td style="background:${BRAND};padding:22px 28px;color:#fff;font-size:18px;font-weight:600">Centre de Formation</td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 16px;font-size:20px;color:#111827">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f9fafb;font-size:12px;color:#6b7280">
          Cet email vous a été envoyé automatiquement, merci de ne pas y répondre directement.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const p = (text: string) =>
  `<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${text}</p>`;
