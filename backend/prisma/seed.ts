import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@centre-formation.tn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';
const DEFAULT_PASSWORD = 'Formation123!';

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

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
    where: { email: 'yassine.student@example.com' },
    update: {},
    create: {
      email: 'yassine.student@example.com',
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: 'STUDENT',
      firstName: 'Yassine',
      lastName: 'Gharbi',
      phone: '+216 20 123 456',
    },
  });

  const courseDefs = [
    {
      slug: 'power-bi',
      titleFr: 'Power BI — Analyse de données',
      titleEn: 'Power BI — Data Analysis',
      summaryFr:
        'Concevez des tableaux de bord fiables : modélisation, DAX, Power Query et publication sur le service Power BI.',
      summaryEn:
        'Build dashboards you can trust: data modelling, DAX, Power Query and publishing to the Power BI service.',
      descriptionFr:
        "Cette formation intensive vous amène de la préparation des données à la publication de tableaux de bord Power BI en conditions réelles. Vous travaillerez sur un jeu de données d'entreprise de bout en bout : import et nettoyage avec Power Query, modélisation en étoile, mesures DAX, mise en forme et publication sur le service Power BI avec gestion des accès.",
      descriptionEn:
        'This intensive course takes you from data preparation to publishing real-world Power BI dashboards. You will work on an end-to-end business dataset: import and cleanup with Power Query, star-schema modelling, DAX measures, formatting, and publishing to the Power BI service with access management.',
      audienceFr: 'Analystes, contrôleurs de gestion, chefs de projet data souhaitant devenir autonomes sur Power BI.',
      audienceEn: 'Analysts, controllers and data project leads who want to become autonomous on Power BI.',
      prerequisitesFr: 'Bonne pratique d’Excel. Aucune connaissance préalable de Power BI requise.',
      prerequisitesEn: 'Solid Excel practice. No prior Power BI knowledge required.',
      level: 'BEGINNER' as const,
      durationHours: 35,
      price: 1200,
      accentColor: '#F2C811',
      modules: [
        ['Power Query & préparation des données', 'Power Query & data preparation'],
        ['Modélisation en étoile', 'Star-schema modelling'],
        ['Langage DAX', 'DAX language'],
        ['Data storytelling & publication', 'Data storytelling & publishing'],
      ],
    },
    {
      slug: 'ia-generative',
      titleFr: 'IA générative en entreprise',
      titleEn: 'Generative AI for Business',
      summaryFr: "Maîtrisez le prompt engineering, le RAG et l'intégration d'assistants IA dans vos processus métier.",
      summaryEn: 'Master prompt engineering, RAG, and integrating AI assistants into your business processes.',
      descriptionFr:
        "Vous apprendrez à concevoir des prompts fiables, à construire un pipeline RAG sur vos propres documents, et à intégrer un assistant IA dans un processus métier réel, avec une attention constante portée aux risques (hallucinations, confidentialité, coûts).",
      descriptionEn:
        'You will learn to design reliable prompts, build a RAG pipeline over your own documents, and integrate an AI assistant into a real business process, with constant attention to risk (hallucinations, confidentiality, cost).',
      audienceFr: 'Chefs de projet, développeurs et responsables métier souhaitant déployer l’IA générative.',
      audienceEn: 'Project leads, developers and business owners looking to deploy generative AI.',
      prerequisitesFr: 'Aisance avec les outils numériques. Aucune expérience en programmation exigée.',
      prerequisitesEn: 'Comfort with digital tools. No programming experience required.',
      level: 'INTERMEDIATE' as const,
      durationHours: 28,
      price: 1450,
      accentColor: '#7C3AED',
      modules: [
        ['Prompt engineering', 'Prompt engineering'],
        ['RAG & bases vectorielles', 'RAG & vector stores'],
        ["Cas d'usage métier", 'Business use cases'],
        ['IA responsable', 'Responsible AI'],
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
        "Formation certifiante couvrant les trois domaines de performance de l'examen PMP® (personnes, processus, environnement métier), les approches prédictive, agile et hybride, avec examens blancs hebdomadaires et accompagnement pour le dossier d'éligibilité PMI.",
      descriptionEn:
        "Certifying course covering the three PMP® exam performance domains (people, process, business environment), predictive, agile and hybrid approaches, with weekly mock exams and support for the PMI eligibility application.",
      audienceFr: 'Chefs de projet expérimentés souhaitant obtenir la certification PMP®.',
      audienceEn: 'Experienced project managers seeking the PMP® certification.',
      prerequisitesFr: "Expérience en gestion de projet recommandée (voir critères d'éligibilité PMI).",
      prerequisitesEn: 'Project management experience recommended (see PMI eligibility criteria).',
      level: 'ADVANCED' as const,
      durationHours: 42,
      price: 2100,
      accentColor: '#2563EB',
      modules: [
        ['Domaine Personnes', 'People domain'],
        ['Domaine Processus', 'Process domain'],
        ["Domaine Environnement métier", 'Business environment domain'],
        ['Examens blancs & dossier PMI', 'Mock exams & PMI application'],
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
        "Formation pratique pour endosser le rôle de Scrum Master : posture de facilitateur-serviteur, animation des événements Scrum, gestion des obstacles, métriques agiles, et préparation à l'examen PSM I via des mises en situation.",
      descriptionEn:
        'A hands-on course to take on the Scrum Master role: servant-leadership stance, facilitating Scrum events, removing impediments, agile metrics, and PSM I exam preparation through role-play scenarios.',
      audienceFr: 'Membres d’équipe agile souhaitant devenir Scrum Master.',
      audienceEn: 'Agile team members looking to become Scrum Master.',
      prerequisitesFr: 'Connaissance de base des méthodes agiles appréciée mais non obligatoire.',
      prerequisitesEn: 'Basic knowledge of agile methods is a plus but not required.',
      level: 'BEGINNER' as const,
      durationHours: 21,
      price: 950,
      accentColor: '#059669',
      modules: [
        ['Fondamentaux Scrum', 'Scrum fundamentals'],
        ['Facilitation & coaching', 'Facilitation & coaching'],
        ['Métriques agiles', 'Agile metrics'],
        ['Préparation PSM I', 'PSM I preparation'],
      ],
    },
  ];

  const courses = [];
  for (const def of courseDefs) {
    const course = await prisma.course.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        slug: def.slug,
        titleFr: def.titleFr,
        titleEn: def.titleEn,
        summaryFr: def.summaryFr,
        summaryEn: def.summaryEn,
        descriptionFr: def.descriptionFr,
        descriptionEn: def.descriptionEn,
        audienceFr: def.audienceFr,
        audienceEn: def.audienceEn,
        prerequisitesFr: def.prerequisitesFr,
        prerequisitesEn: def.prerequisitesEn,
        level: def.level,
        durationHours: def.durationHours,
        price: def.price,
        accentColor: def.accentColor,
        modules: {
          create: def.modules.map(([titleFr, titleEn], index) => ({
            position: index + 1,
            titleFr,
            titleEn,
            descriptionFr: `Atelier pratique : ${titleFr.toLowerCase()}.`,
            descriptionEn: `Hands-on workshop: ${titleEn.toLowerCase()}.`,
          })),
        },
      },
    });
    courses.push(course);
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const teacherByCourse: Record<string, string> = {
    'power-bi': teacherSofia.id,
    'ia-generative': teacherSofia.id,
    pmp: teacherKarim.id,
    'scrum-master': teacherKarim.id,
  };

  const sessions = [];
  for (const course of courses) {
    const teacherId = teacherByCourse[course.slug];

    const upcoming = await prisma.session.create({
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

    const past = await prisma.session.create({
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

    sessions.push(upcoming, past);
  }

  // Le stagiaire est inscrit à la session passée de Power BI, avec certificat.
  const pbiPastSession = sessions.find(
    (s) => courses.find((c) => c.id === s.courseId)?.slug === 'power-bi' && s.status === 'DONE'
  )!;
  await prisma.enrollment.create({
    data: {
      sessionId: pbiPastSession.id,
      studentId: student.id,
      status: 'COMPLETED',
      requesterName: `${student.firstName} ${student.lastName}`,
      requesterEmail: student.email,
      completedAt: new Date(now - 50 * day),
      certificate: {
        create: {
          serialNumber: 'CF-2026-0001',
          issuedAt: new Date(now - 50 * day),
        },
      },
    },
  });

  // Une demande d'inscription publique en attente sur la session à venir de PMP.
  const pmpUpcomingSession = sessions.find(
    (s) => courses.find((c) => c.id === s.courseId)?.slug === 'pmp' && s.status === 'OPEN'
  )!;
  await prisma.enrollment.create({
    data: {
      sessionId: pmpUpcomingSession.id,
      status: 'REQUESTED',
      requesterName: 'Nadia Chaabane',
      requesterEmail: 'nadia.chaabane@example.com',
      requesterPhone: '+216 22 987 654',
      company: 'Société Alpha',
      message: "Intéressée par la session, disponible pour un appel cette semaine.",
    },
  });

  await prisma.testimonial.createMany({
    data: [
      {
        authorName: 'Yassine Gharbi',
        authorRole: 'Analyste data, Société Beta',
        quoteFr: "Formation très concrète, j'ai pu reproduire les tableaux de bord dès le lendemain au bureau.",
        quoteEn: 'Very hands-on training, I was able to reuse the dashboards at work the very next day.',
        rating: 5,
      },
      {
        authorName: 'Nadia Chaabane',
        authorRole: 'Cheffe de projet, Société Alpha',
        quoteFr: 'Karim explique la préparation PMP® de façon claire et structurée, sans jamais être ennuyeux.',
        quoteEn: 'Karim explains PMP® prep clearly and in a structured way, never boring.',
        rating: 5,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.contactMessage.create({
    data: {
      name: 'Mohamed Ali',
      email: 'mohamed.ali@example.com',
      subject: 'Formation intra-entreprise Power BI',
      body: 'Bonjour, nous souhaitons organiser une session Power BI pour 10 personnes en intra. Merci de me recontacter.',
    },
  });

  console.log('Seed complete.');
  console.log(`Admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Teacher: sofia.trabelsi@centre-formation.tn / ${DEFAULT_PASSWORD}`);
  console.log(`Teacher: karim.mejri@centre-formation.tn / ${DEFAULT_PASSWORD}`);
  console.log(`Student: yassine.student@example.com / ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
