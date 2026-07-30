import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SessionDetail from './session-detail';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).teacher.session.roster.title, robots: { index: false } };
}

export default async function TeacherSessionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return <SessionDetail id={id} locale={locale} t={t} />;
}
