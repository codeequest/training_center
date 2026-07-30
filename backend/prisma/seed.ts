import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const courses = [
  {
    slug: 'power-bi',
    titleFr: 'Power BI — Analyse de données',
    titleEn: 'Power BI — Data Analysis',
    summaryFr:
      'Concevez des tableaux de bord fiables : modélisation, DAX, Power Query et publication sur le service Power BI.',
    summaryEn: 'Build dashboards you can trust: data modelling, DAX, Power Query and publishing to the Power BI service.',
    descriptionFr:
      'Formation intensive de 35 heures pour maîtriser Power BI de bout en bout : préparation des données avec Power Query, modélisation en étoile, mesures DAX avancées et publication sécurisée sur le service Power BI.',
    descriptionEn:
      'A 35-hour intensive course to master Power BI end to end: data preparation with Power Query, star-schema modelling, advanced DAX measures and secure publishing to the Power BI service.',
    audienceFr: 'Analystes, contrôleurs de gestion, chefs de projet data.',
    audienceEn: 'Analysts, management controllers, data project leads.',
    prerequisitesFr: 'Bases Excel recommandées.',
    prerequisitesEn: 'Basic Excel knowledge recommended.',
    level: 'BEGINNER' as const,
    durationHours: 35,
    price: 1200,
    accentColor: '#F2C811',
    sortOrder: 0,
    modules: [
      { titleFr: 'Power Query & modélisation', titleEn: 'Power Query & modelling' },
      { titleFr: 'Langage DAX', titleEn: 'DAX language' },
      { titleFr: 'Data storytelling', titleEn: 'Data storytelling' },
      { titleFr: 'Préparation PL-300', titleEn: 'PL-300 preparation' },
    ],
  },
  {
    slug: 'ia-generative',
    titleFr: 'IA générative en entreprise',
    titleEn: 'Generative AI for Business',
    summaryFr: "Maîtrisez le prompt engineering, le RAG et l'intégration d'assistants IA dans vos processus métier.",
    summaryEn: 'Master prompt engineering, RAG, and integrating AI assistants into your business processes.',
    descriptionFr:
      "Formation de 28 heures orientée cas d'usage réels : prompt engineering avancé, architectures RAG avec bases vectorielles, intégration d'assistants IA et cadre de gouvernance responsable.",
    descriptionEn:
      'A 28-hour course focused on real use cases: advanced prompt engineering, RAG architectures with vector stores, AI assistant integration and a responsible-AI governance framework.',
    audienceFr: 'Chefs de produit, développeurs, responsables innovation.',
    audienceEn: 'Product managers, developers, innovation leads.',
    prerequisitesFr: 'Aucun prérequis technique strict.',
    prerequisitesEn: 'No strict technical prerequisite.',
    level: 'INTERMEDIATE' as const,
    durationHours: 28,
    price: 1450,
    accentColor: '#7C3AED',
    sortOrder: 1,
    modules: [
      { titleFr: 'Prompt engineering', titleEn: 'Prompt engineering' },
      { titleFr: 'RAG & bases vectorielles', titleEn: 'RAG & vector stores' },
      { titleFr: "Cas d'usage métier", titleEn: 'Business use cases' },
      { titleFr: 'IA responsable', titleEn: 'Responsible AI' },
    ],
  },
  {
    slug: 'pmp',
    titleFr: 'PMP® — Gestion de projet',
    titleEn: 'PMP® — Project Management',
    summaryFr:
      "Préparez la certification PMP® du PMI : les trois domaines de l'examen, 35 heures éligibles et examens blancs.",
    summaryEn: 'Prepare for the PMI PMP® certification: all three exam domains, 35 qualifying hours and mock exams.',
    descriptionFr:
      "Programme complet de 42 heures couvrant les domaines Personnes, Processus et Environnement d'affaires du PMBOK, avec approches prédictive et agile, examens blancs et accompagnement pour le dossier PMI.",
    descriptionEn:
      "A comprehensive 42-hour programme covering the People, Process and Business Environment domains of the PMBOK, with predictive and agile approaches, mock exams and support for the PMI application.",
    audienceFr: 'Chefs de projet expérimentés visant la certification PMP®.',
    audienceEn: 'Experienced project managers aiming for PMP® certification.',
    prerequisitesFr: "Expérience en gestion de projet recommandée (voir critères d'éligibilité PMI).",
    prerequisitesEn: 'Project management experience recommended (see PMI eligibility criteria).',
    level: 'ADVANCED' as const,
    durationHours: 42,
    price: 2100,
    accentColor: '#2563EB',
    sortOrder: 2,
    modules: [
      { titleFr: '35 heures éligibles', titleEn: '35 qualifying hours' },
      { titleFr: 'Approches prédictive & agile', titleEn: 'Predictive & agile approaches' },
      { titleFr: 'Examens blancs', titleEn: 'Mock exams' },
      { titleFr: 'Aide au dossier PMI', titleEn: 'PMI application support' },
    ],
  },
  {
    slug: 'scrum-master',
    titleFr: 'Scrum Master — Agilité',
    titleEn: 'Scrum Master — Agile Delivery',
    summaryFr:
      'Devenez Scrum Master opérationnel : posture de facilitateur, événements Scrum et préparation à la certification PSM I.',
    summaryEn: 'Become an effective Scrum Master: facilitation stance, Scrum events, and PSM I certification preparation.',
    descriptionFr:
      "Formation de 21 heures centrée sur la pratique : posture du Scrum Master, animation des événements Scrum, métriques agiles et préparation ciblée à la certification PSM I.",
    descriptionEn:
      "A 21-hour hands-on course: the Scrum Master stance, facilitating Scrum events, agile metrics and focused preparation for the PSM I certification.",
    audienceFr: 'Chefs de projet, product owners, équipes en transition agile.',
    audienceEn: 'Project managers, product owners, teams transitioning to agile.',
    prerequisitesFr: 'Aucun prérequis.',
    prerequisitesEn: 'No prerequisite.',
    level: 'BEGINNER' as const,
    durationHours: 21,
    price: 950,
    accentColor: '#059669',
    sortOrder: 3,
    modules: [
      { titleFr: 'Guide Scrum 2020', titleEn: '2020 Scrum Guide' },
      { titleFr: 'Facilitation & coaching', titleEn: 'Facilitation & coaching' },
      { titleFr: 'Métriques agiles', titleEn: 'Agile metrics' },
      { titleFr: 'Préparation PSM I', titleEn: 'PSM I preparation' },
    ],
  },
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@centre-formation.tn').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Centre',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'formateur.demo@centre-formation.tn' },
    update: {},
    create: {
      email: 'formateur.demo@centre-formation.tn',
      passwordHash: await bcrypt.hash('Formateur123!', 10),
      role: 'TEACHER',
      firstName: 'Sami',
      lastName: 'Trabelsi',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'etudiant.demo@centre-formation.tn' },
    update: {},
    create: {
      email: 'etudiant.demo@centre-formation.tn',
      passwordHash: await bcrypt.hash('Etudiant123!', 10),
      role: 'STUDENT',
      firstName: 'Yasmine',
      lastName: 'Gharbi',
    },
  });

  for (const { modules, ...courseData } of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: courseData,
      create: courseData,
    });

    await prisma.module.deleteMany({ where: { courseId: course.id } });
    await prisma.module.createMany({
      data: modules.map((module, index) => ({
        courseId: course.id,
        position: index + 1,
        titleFr: module.titleFr,
        titleEn: module.titleEn,
        descriptionFr: '',
        descriptionEn: '',
      })),
    });

    const existingSession = await prisma.session.findFirst({ where: { courseId: course.id } });
    if (!existingSession) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 21 + course.sortOrder * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

      await prisma.session.create({
        data: {
          courseId: course.id,
          teacherId: teacher.id,
          startDate,
          endDate,
          scheduleFr: 'Jeudi et vendredi, 9h–17h',
          scheduleEn: 'Thursday and Friday, 9am–5pm',
          mode: 'ONSITE',
          location: 'Tunis, Les Berges du Lac',
          capacity: 15,
          status: 'OPEN',
        },
      });
    }
  }

  // Données de test pour l'espace stagiaire : une inscription confirmée et une terminée avec attestation.
  const powerBiCourse = await prisma.course.findUnique({ where: { slug: 'power-bi' } });
  const scrumCourse = await prisma.course.findUnique({ where: { slug: 'scrum-master' } });
  const powerBiSession = powerBiCourse
    ? await prisma.session.findFirst({ where: { courseId: powerBiCourse.id } })
    : null;
  const scrumSession = scrumCourse ? await prisma.session.findFirst({ where: { courseId: scrumCourse.id } }) : null;

  if (powerBiSession) {
    await prisma.enrollment.upsert({
      where: { sessionId_studentId: { sessionId: powerBiSession.id, studentId: student.id } },
      update: { status: 'CONFIRMED', confirmedAt: new Date() },
      create: {
        sessionId: powerBiSession.id,
        studentId: student.id,
        requesterName: `${student.firstName} ${student.lastName}`,
        requesterEmail: student.email,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  }

  if (scrumSession) {
    const completedEnrollment = await prisma.enrollment.upsert({
      where: { sessionId_studentId: { sessionId: scrumSession.id, studentId: student.id } },
      update: { status: 'COMPLETED', confirmedAt: new Date(), completedAt: new Date() },
      create: {
        sessionId: scrumSession.id,
        studentId: student.id,
        requesterName: `${student.firstName} ${student.lastName}`,
        requesterEmail: student.email,
        status: 'COMPLETED',
        confirmedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await prisma.certificate.upsert({
      where: { enrollmentId: completedEnrollment.id },
      update: {},
      create: {
        enrollmentId: completedEnrollment.id,
        serialNumber: `CF-${new Date().getFullYear()}-DEMO01`,
      },
    });

    const existingMaterial = await prisma.material.findFirst({
      where: { sessionId: scrumSession.id, title: 'Slides — Scrum Master' },
    });
    if (!existingMaterial) {
      await prisma.material.create({
        data: {
          sessionId: scrumSession.id,
          title: 'Slides — Scrum Master',
          type: 'LINK',
          fileUrl: 'https://example.com/scrum-master-slides',
          visibility: 'ENROLLED',
          uploaderId: teacher.id,
        },
      });
    }
  }

  console.log('Seed terminé : 4 formations, 1 formateur, 1 administrateur, 1 stagiaire de démonstration.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
