import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import TeacherShell from './teacher-shell';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export default async function TeacherLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <TeacherShell locale={locale} t={t}>
      {children}
    </TeacherShell>
  );
}
