import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StudentsOverview from '@/components/students-overview';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).adminStudents.titleTeacher, robots: { index: false } };
}

export default async function TeacherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return <StudentsOverview locale={locale} t={t} audience="TEACHER" />;
}
