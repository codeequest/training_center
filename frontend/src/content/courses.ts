import type { Locale } from '@/i18n/config';

/**
 * Contenu de secours pour les 4 formations du catalogue.
 * Sera remplacé par un appel à GET /api/courses une fois la base de données en place ;
 * la forme des objets est déjà alignée sur celle renvoyée par l'API.
 */
export interface CourseCard {
  slug: string;
  accentColor: string;
  durationHours: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  currency: string;
  icon: 'chart' | 'sparkles' | 'clipboard' | 'refresh';
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  highlights: Record<Locale, string[]>;
}

export const levelLabels: Record<CourseCard['level'], Record<Locale, string>> = {
  BEGINNER: { fr: 'Débutant', en: 'Beginner' },
  INTERMEDIATE: { fr: 'Intermédiaire', en: 'Intermediate' },
  ADVANCED: { fr: 'Avancé', en: 'Advanced' },
};

export const courses: CourseCard[] = [
  {
    slug: 'power-bi',
    accentColor: '#F2C811',
    durationHours: 35,
    level: 'BEGINNER',
    price: 1200,
    currency: 'TND',
    icon: 'chart',
    title: { fr: 'Power BI — Analyse de données', en: 'Power BI — Data Analysis' },
    summary: {
      fr: "Concevez des tableaux de bord fiables : modélisation, DAX, Power Query et publication sur le service Power BI.",
      en: 'Build dashboards you can trust: data modelling, DAX, Power Query and publishing to the Power BI service.',
    },
    highlights: {
      fr: ['Power Query & modélisation', 'Langage DAX', 'Data storytelling', 'Préparation PL-300'],
      en: ['Power Query & modelling', 'DAX language', 'Data storytelling', 'PL-300 preparation'],
    },
  },
  {
    slug: 'ia-generative',
    accentColor: '#7C3AED',
    durationHours: 28,
    level: 'INTERMEDIATE',
    price: 1450,
    currency: 'TND',
    icon: 'sparkles',
    title: { fr: 'IA générative en entreprise', en: 'Generative AI for Business' },
    summary: {
      fr: "Maîtrisez le prompt engineering, le RAG et l'intégration d'assistants IA dans vos processus métier.",
      en: 'Master prompt engineering, RAG, and integrating AI assistants into your business processes.',
    },
    highlights: {
      fr: ['Prompt engineering', 'RAG & bases vectorielles', "Cas d'usage métier", 'IA responsable'],
      en: ['Prompt engineering', 'RAG & vector stores', 'Business use cases', 'Responsible AI'],
    },
  },
  {
    slug: 'pmp',
    accentColor: '#2563EB',
    durationHours: 42,
    level: 'ADVANCED',
    price: 2100,
    currency: 'TND',
    icon: 'clipboard',
    title: { fr: 'PMP® — Gestion de projet', en: 'PMP® — Project Management' },
    summary: {
      fr: "Préparez la certification PMP® du PMI : les trois domaines de l'examen, 35 heures éligibles et examens blancs.",
      en: 'Prepare for the PMI PMP® certification: all three exam domains, 35 qualifying hours and mock exams.',
    },
    highlights: {
      fr: ['35 heures éligibles', 'Approches prédictive & agile', 'Examens blancs', 'Aide au dossier PMI'],
      en: ['35 qualifying hours', 'Predictive & agile approaches', 'Mock exams', 'PMI application support'],
    },
  },
  {
    slug: 'scrum-master',
    accentColor: '#059669',
    durationHours: 21,
    level: 'BEGINNER',
    price: 950,
    currency: 'TND',
    icon: 'refresh',
    title: { fr: 'Scrum Master — Agilité', en: 'Scrum Master — Agile Delivery' },
    summary: {
      fr: 'Devenez Scrum Master opérationnel : posture de facilitateur, événements Scrum et préparation à la certification PSM I.',
      en: 'Become an effective Scrum Master: facilitation stance, Scrum events, and PSM I certification preparation.',
    },
    highlights: {
      fr: ['Guide Scrum 2020', 'Facilitation & coaching', 'Métriques agiles', 'Préparation PSM I'],
      en: ['2020 Scrum Guide', 'Facilitation & coaching', 'Agile metrics', 'PSM I preparation'],
    },
  },
];
