import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TeacherDashboard from './dashboard';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).teacher.dashboard.title, robots: { index: false } };
}

export default async function TeacherDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return <TeacherDashboard locale={locale} t={t} />;
}
