import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import LoginForm from './login-form';
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
  return { title: getDictionary(locale).login.title, robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="container-page max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logo className="h-11 w-11" />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.login.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.login.subtitle}</p>
          </div>

          <div className="mt-8">
            <LoginForm locale={locale} t={t} />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-ink">{t.login.noAccountTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.login.noAccountBody}</p>
          <Link
            href={`/${locale}/contact`}
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            {t.login.noAccountCta}
          </Link>
        </div>

        <p className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-ink-muted hover:text-brand-700">
            ← {t.login.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
