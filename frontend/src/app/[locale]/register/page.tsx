import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import RegisterForm from './register-form';
import Logo from '@/components/logo';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).register.title };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <div className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-300/20 blur-3xl"
      />

      <div className="container-page relative max-w-xl">
        <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logo className="h-11 w-11" />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.register.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.register.subtitle}</p>
          </div>

          <div className="mt-8">
            <RegisterForm locale={locale} t={t} />
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-ink-muted hover:text-brand-700">
            ← {t.register.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
