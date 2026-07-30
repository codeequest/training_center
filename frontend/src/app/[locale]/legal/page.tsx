import { notFound } from 'next/navigation';

import ComingSoon from '@/components/coming-soon';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <ComingSoon locale={locale as Locale} title={getDictionary(locale).footer.legal} />;
}
