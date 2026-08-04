import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CoursesCatalogue from './courses-catalogue';
import { courses as staticCourses } from '@/content/courses';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { apiFetch } from '@/lib/api';
import { fromApiCourse, fromStaticCourse, type ApiCourse, type DisplayCourse } from '@/lib/courses-api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).catalogue.title };
}

async function loadCourses(locale: Locale): Promise<{ items: DisplayCourse[]; isFallback: boolean }> {
  try {
    const data = await apiFetch<{ courses: ApiCourse[] }>('/courses', { cache: 'no-store' });
    return { items: data.courses.map((course) => fromApiCourse(course, locale)), isFallback: false };
  } catch {
    return { items: staticCourses.map((course) => fromStaticCourse(course, locale)), isFallback: true };
  }
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);
  const { items, isFallback } = await loadCourses(locale);

  return <CoursesCatalogue locale={locale} t={t} courses={items} isFallback={isFallback} />;
}
