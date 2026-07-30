import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = getDictionary(locale);

  return {
    title: {
      default: `${t.brand.name} — ${t.brand.tagline}`,
      template: `%s | ${t.brand.name}`,
    },
    description: t.hero.subtitle,
    openGraph: {
      title: `${t.brand.name} — ${t.brand.tagline}`,
      description: t.hero.subtitle,
      locale: locale === 'fr' ? 'fr_TN' : 'en_US',
      type: 'website',
    },
    alternates: {
      languages: { fr: '/fr', en: '/en' },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale as Locale);

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <Navbar locale={locale as Locale} t={t} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale as Locale} t={t} />
      </body>
    </html>
  );
}
