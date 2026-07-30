import { createApp } from './app';
import { env } from './config/env';
import { disconnectPrisma, prisma } from './lib/prisma';

async function main(): Promise<void> {
  // Échouer tout de suite si la base est injoignable, plutôt qu'à la première requête.
  await prisma.$connect();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`API du centre de formation → http://localhost:${env.port}/api`);
    console.log(`Environnement : ${env.nodeEnv}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} reçu, arrêt en cours...`);
    server.close(() => {
      void disconnectPrisma().then(() => process.exit(0));
    });
    // Filet de sécurité si des connexions restent ouvertes.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(async (error) => {
  console.error('Démarrage impossible :', error);
  await disconnectPrisma();
  process.exit(1);
});
