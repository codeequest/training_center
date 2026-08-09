/**
 * Diagnostic SMTP — vérifie la configuration email sans passer par l'application.
 *
 *   npm run smtp:check                    # teste seulement la connexion + l'authentification
 *   npm run smtp:check -- destinataire@exemple.com   # envoie en plus un email de test
 */
import { env } from '../src/config/env';
import { isMailEnabled, layout, p, sendMail, verifyMailer } from '../src/lib/mailer';

async function main(): Promise<void> {
  console.log('--- Configuration ---');
  console.log(`  SMTP_HOST     : ${env.smtp.host || '(vide)'}`);
  console.log(`  SMTP_PORT     : ${env.smtp.port}`);
  console.log(`  SMTP_SECURE   : ${env.smtp.secure}`);
  console.log(`  SMTP_USER     : ${env.smtp.user || '(vide)'}`);
  console.log(`  SMTP_PASSWORD : ${env.smtp.password ? `renseigné (${env.smtp.password.length} caractères)` : '(vide)'}`);
  console.log(`  MAIL_FROM     : ${env.mailFrom}`);

  if (!isMailEnabled) {
    console.error('\n✗ SMTP_HOST est vide : les emails seront simulés, pas envoyés.');
    process.exit(1);
  }

  console.log('\n--- Connexion ---');
  const { ok, error } = await verifyMailer();
  if (!ok) {
    console.error(`✗ Échec : ${error}`);
    if (/username and password not accepted|invalid login|BadCredentials/i.test(error ?? '')) {
      console.error(
        "\n  Google refuse les identifiants. SMTP_PASSWORD doit être un mot de passe\n" +
          "  d'application (16 caractères, sans espaces), pas le mot de passe du compte :\n" +
          '  https://myaccount.google.com/apppasswords'
      );
    }
    process.exit(1);
  }
  console.log(`✓ Connecté et authentifié sur ${env.smtp.host}:${env.smtp.port}`);

  const recipient = process.argv[2];
  if (!recipient) {
    console.log("\n(Ajoutez une adresse en argument pour envoyer un email de test.)");
    return;
  }

  console.log(`\n--- Envoi de test vers ${recipient} ---`);
  const sent = await sendMail({
    to: recipient,
    subject: 'Test SMTP — Centre de Formation',
    html: layout('Test SMTP', p("Si vous lisez ceci, l'envoi d'emails depuis l'application fonctionne.")),
  });
  console.log(sent ? '✓ Message accepté par le serveur.' : '✗ Envoi refusé (voir l\'erreur ci-dessus).');
  process.exit(sent ? 0 : 1);
}

void main();
