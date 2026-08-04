import type { Locale } from '@/i18n/config';
import type { CourseCard } from '@/content/courses';

/** Formes renvoyées par l'API Express (voir backend/src/controllers/courses.controller.ts). */
export interface ApiTeacher {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ApiSession {
  id: string;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  mode: 'ONSITE' | 'ONLINE' | 'HYBRID';
  location: string | null;
  meetingUrl: string | null;
  capacity: number;
  status: 'PLANNED' | 'OPEN' | 'FULL' | 'RUNNING' | 'DONE' | 'CANCELLED';
  teacher: ApiTeacher | null;
  _count?: { enrollments: number };
}

export interface ApiModule {
  id: string;
  position: number;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export interface ApiMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'SLIDES' | 'LINK' | 'VIDEO';
  fileUrl: string;
}

export interface ApiCourse {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  descriptionFr: string;
  descriptionEn: string;
  audienceFr: string;
  audienceEn: string;
  prerequisitesFr: string;
  prerequisitesEn: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationHours: number;
  price: string | number;
  currency: string;
  accentColor: string;
  _count?: { sessions: number };
  sessions?: ApiSession[];
  modules?: ApiModule[];
  materials?: ApiMaterial[];
}

/** Forme normalisée consommée par les composants d'affichage, quelle que soit la source (API ou secours statique). */
export interface DisplayCourse {
  slug: string;
  title: string;
  summary: string;
  level: CourseCard['level'];
  durationHours: number;
  price: number;
  currency: string;
  sessionsCount: number;
  nextSessionDate: string | null;
}

export function fromApiCourse(course: ApiCourse, locale: Locale): DisplayCourse {
  return {
    slug: course.slug,
    title: locale === 'fr' ? course.titleFr : course.titleEn,
    summary: locale === 'fr' ? course.summaryFr : course.summaryEn,
    level: course.level,
    durationHours: course.durationHours,
    price: typeof course.price === 'string' ? parseFloat(course.price) : course.price,
    currency: course.currency,
    sessionsCount: course._count?.sessions ?? course.sessions?.length ?? 0,
    nextSessionDate: course.sessions?.[0]?.startDate ?? null,
  };
}

export function fromStaticCourse(course: CourseCard, locale: Locale): DisplayCourse {
  return {
    slug: course.slug,
    title: course.title[locale],
    summary: course.summary[locale],
    level: course.level,
    durationHours: course.durationHours,
    price: course.price,
    currency: course.currency,
    sessionsCount: 0,
    nextSessionDate: null,
  };
}

export function formatPrice(price: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-TN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}
