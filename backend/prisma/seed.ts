import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@centre-formation.tn').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';
const DEFAULT_PASSWORD = 'Formation123!';

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

const courseDefs = [
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
  console.log('Seeding database...');

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash: await hash(ADMIN_PASSWORD),
      role: 'ADMIN',
      firstName: 'Amine',
      lastName: 'Bouzid',
    },
  });

  const teacherSofia = await prisma.user.upsert({
    where: { email: 'sofia.trabelsi@centre-formation.tn' },
    update: {},
    create: {
      email: 'sofia.trabelsi@centre-formation.tn',
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: 'TEACHER',
      firstName: 'Sofia',
      lastName: 'Trabelsi',
      teacherProfile: {
        create: {
          headlineFr: 'Consultante BI & data storytelling',
          headlineEn: 'BI consultant & data storytelling specialist',
          bioFr:
            "Sofia accompagne depuis 8 ans des équipes data dans la conception de tableaux de bord Power BI fiables et exploitables, du modèle de données jusqu'à la publication. Certifiée PL-300.",
          bioEn:
            'Sofia has spent 8 years helping data teams design reliable, actionable Power BI dashboards, from data modelling to publishing. PL-300 certified.',
          certifications: ['Microsoft PL-300', 'Microsoft PL-900'],
          linkedinUrl: 'https://www.linkedin.com/in/sofia-trabelsi',
          yearsExperience: 8,
        },
      },
    },
  });

  const teacherKarim = await prisma.user.upsert({
    where: { email: 'karim.mejri@centre-formation.tn' },
    update: {},
    create: {
      email: 'karim.mejri@centre-formation.tn',
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: 'TEACHER',
      firstName: 'Karim',
      lastName: 'Mejri',
      teacherProfile: {
        create: {
          headlineFr: 'Chef de projet certifié PMP® et Scrum Master',
          headlineEn: 'PMP® certified project manager & Scrum Master',
          bioFr:
            "Karim a dirigé une quarantaine de projets IT en Tunisie et en Europe avant de se consacrer à la formation. Il prépare ses stagiaires aux certifications PMP® et PSM I avec une approche très pratique.",
          bioEn:
            'Karim led about forty IT projects across Tunisia and Europe before moving into training. He prepares trainees for the PMP® and PSM I certifications with a hands-on approach.',
          certifications: ['PMP®', 'PSM I'],
          linkedinUrl: 'https://www.linkedin.com/in/karim-mejri',
          yearsExperience: 12,
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'etudiant.demo@centre-formation.tn' },
    update: {},
    create: {
      email: 'etudiant.demo@centre-formation.tn',
      passwordHash: await hash('Etudiant123!'),
      role: 'STUDENT',
      firstName: 'Yasmine',
      lastName: 'Gharbi',
    },
  });

  const teacherByCourse: Record<string, string> = {
    'power-bi': teacherSofia.id,
    'ia-generative': teacherSofia.id,
    pmp: teacherKarim.id,
    'scrum-master': teacherKarim.id,
  };

  const courses = [];
  for (const { modules, ...courseData } of courseDefs) {
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

    courses.push(course);
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Une session à venir (ouverte aux inscriptions) et une session passée (terminée)
  // par formation, pour donner à l'espace formateur de quoi afficher un tableau de
  // bord réaliste (sessions en cours et historique).
  const sessions: Record<
    string,
    { upcoming: Awaited<ReturnType<typeof prisma.session.create>>; past: Awaited<ReturnType<typeof prisma.session.create>> }
  > = {};
  for (const course of courses) {
    const teacherId = teacherByCourse[course.slug];

    let upcoming = await prisma.session.findFirst({ where: { courseId: course.id, status: 'OPEN' } });
    if (!upcoming) {
      upcoming = await prisma.session.create({
        data: {
          courseId: course.id,
          teacherId,
          startDate: new Date(now + 14 * day),
          endDate: new Date(now + 14 * day + (course.durationHours / 7) * day),
          scheduleFr: 'Lun-Ven, 9h-16h',
          scheduleEn: 'Mon-Fri, 9am-4pm',
          mode: 'ONSITE',
          location: 'Tunis, Centre-ville',
          capacity: 15,
          status: 'OPEN',
        },
      });
    }

    let past = await prisma.session.findFirst({ where: { courseId: course.id, status: 'DONE' } });
    if (!past) {
      past = await prisma.session.create({
        data: {
          courseId: course.id,
          teacherId,
          startDate: new Date(now - 60 * day),
          endDate: new Date(now - 55 * day),
          scheduleFr: 'Lun-Ven, 9h-16h',
          scheduleEn: 'Mon-Fri, 9am-4pm',
          mode: 'HYBRID',
          location: 'Tunis, Centre-ville',
          meetingUrl: 'https://meet.centre-formation.tn/session',
          capacity: 15,
          status: 'DONE',
        },
      });
    }

    sessions[course.slug] = { upcoming, past };
  }

  // Le stagiaire est inscrit (confirmé) à la session à venir de Power BI...
  const powerBiUpcoming = sessions['power-bi'].upcoming;
  await prisma.enrollment.upsert({
    where: { sessionId_studentId: { sessionId: powerBiUpcoming.id, studentId: student.id } },
    update: { status: 'CONFIRMED', confirmedAt: new Date() },
    create: {
      sessionId: powerBiUpcoming.id,
      studentId: student.id,
      requesterName: `${student.firstName} ${student.lastName}`,
      requesterEmail: student.email,
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  // ...et a terminé la session passée de Scrum Master, avec attestation et un
  // support de cours déjà déposé (pour tester le panneau matériaux dès le premier lancement).
  const scrumPast = sessions['scrum-master'].past;
  const completedEnrollment = await prisma.enrollment.upsert({
    where: { sessionId_studentId: { sessionId: scrumPast.id, studentId: student.id } },
    update: { status: 'COMPLETED', confirmedAt: new Date(now - 58 * day), completedAt: new Date(now - 50 * day) },
    create: {
      sessionId: scrumPast.id,
      studentId: student.id,
      requesterName: `${student.firstName} ${student.lastName}`,
      requesterEmail: student.email,
      status: 'COMPLETED',
      confirmedAt: new Date(now - 58 * day),
      completedAt: new Date(now - 50 * day),
    },
  });

  await prisma.certificate.upsert({
    where: { enrollmentId: completedEnrollment.id },
    update: {},
    create: {
      enrollmentId: completedEnrollment.id,
      serialNumber: 'CF-2026-0001',
      issuedAt: new Date(now - 50 * day),
    },
  });

  const existingMaterial = await prisma.material.findFirst({
    where: { sessionId: scrumPast.id, title: 'Slides — Scrum Master' },
  });
  if (!existingMaterial) {
    await prisma.material.create({
      data: {
        sessionId: scrumPast.id,
        title: 'Slides — Scrum Master',
        type: 'LINK',
        fileUrl: 'https://example.com/scrum-master-slides',
        visibility: 'ENROLLED',
        uploaderId: teacherKarim.id,
      },
    });
  }

  // Une demande d'inscription publique en attente sur la session à venir de PMP
  // (pour tester la file d'attente des inscriptions côté admin).
  const pmpUpcoming = sessions['pmp'].upcoming;
  const existingRequest = await prisma.enrollment.findFirst({
    where: { sessionId: pmpUpcoming.id, requesterEmail: 'nadia.chaabane@example.com' },
  });
  if (!existingRequest) {
    await prisma.enrollment.create({
      data: {
        sessionId: pmpUpcoming.id,
        status: 'REQUESTED',
        requesterName: 'Nadia Chaabane',
        requesterEmail: 'nadia.chaabane@example.com',
        requesterPhone: '+216 22 987 654',
        company: 'Société Alpha',
        message: "Intéressée par la session, disponible pour un appel cette semaine.",
      },
    });
  }

  await prisma.testimonial.createMany({
    data: [
      {
        authorName: 'Yasmine Gharbi',
        authorRole: 'Analyste data, Société Beta',
        quoteFr: "Formation très concrète, j'ai pu reproduire les tableaux de bord dès le lendemain au bureau.",
        quoteEn: 'Very hands-on training, I was able to reuse the dashboards at work the very next day.',
        rating: 5,
        sortOrder: 0,
      },
      {
        authorName: 'Nadia Chaabane',
        authorRole: 'Cheffe de projet, Société Alpha',
        quoteFr: 'Karim explique la préparation PMP® de façon claire et structurée, sans jamais être ennuyeux.',
        quoteEn: 'Karim explains PMP® prep clearly and in a structured way, never boring.',
        rating: 5,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  const existingContactMessage = await prisma.contactMessage.findFirst({
    where: { email: 'mohamed.ali@example.com', subject: 'Formation intra-entreprise Power BI' },
  });
  if (!existingContactMessage) {
    await prisma.contactMessage.create({
      data: {
        name: 'Mohamed Ali',
        email: 'mohamed.ali@example.com',
        subject: 'Formation intra-entreprise Power BI',
        body: 'Bonjour, nous souhaitons organiser une session Power BI pour 10 personnes en intra. Merci de me recontacter.',
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Teacher: sofia.trabelsi@centre-formation.tn / ${DEFAULT_PASSWORD}`);
  console.log(`Teacher: karim.mejri@centre-formation.tn / ${DEFAULT_PASSWORD}`);
  console.log(`Student: etudiant.demo@centre-formation.tn / Etudiant123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
