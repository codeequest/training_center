import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@centre-formation.tn';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Centre',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@centre-formation.tn' },
    update: {},
    create: {
      email: 'teacher@centre-formation.tn',
      passwordHash: await bcrypt.hash('Teacher123!', 12),
      role: 'TEACHER',
      firstName: 'Nadia',
      lastName: 'Trabelsi',
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'power-bi' },
    update: {},
    create: {
      slug: 'power-bi',
      titleFr: 'Power BI — Analyse de données',
      titleEn: 'Power BI — Data Analysis',
      summaryFr: 'Concevez des tableaux de bord fiables.',
      summaryEn: 'Build dashboards you can trust.',
      descriptionFr: 'Modélisation, DAX, Power Query et publication.',
      descriptionEn: 'Data modelling, DAX, Power Query and publishing.',
      audienceFr: 'Analystes et contrôleurs de gestion.',
      audienceEn: 'Analysts and management controllers.',
      prerequisitesFr: 'Aucun prérequis technique.',
      prerequisitesEn: 'No technical prerequisite.',
      level: 'BEGINNER',
      durationHours: 35,
      price: 1200,
      accentColor: '#F2C811',
    },
  });

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const existingSession = await prisma.session.findFirst({
    where: { courseId: course.id, status: 'OPEN', startDate: { gte: new Date() } },
  });

  if (!existingSession) {
    await prisma.session.create({
      data: {
        courseId: course.id,
        teacherId: teacher.id,
        startDate: new Date(now + 5 * DAY),
        endDate: new Date(now + 12 * DAY),
        scheduleFr: 'Lun/Mer/Ven — 18h-21h',
        scheduleEn: 'Mon/Wed/Fri — 6pm-9pm',
        mode: 'ONLINE',
        capacity: 15,
        status: 'OPEN',
      },
    });
  }

  console.log('Seed terminé :', { adminEmail, adminPassword });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
