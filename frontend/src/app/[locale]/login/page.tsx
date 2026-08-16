import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import LoginForm from './login-form';
import Logo from '@/components/logo';
import { MotionDiv } from '@/components/motion-primitives';
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
    // Bande dégradée courte plutôt qu'un aplat gris : la carte de connexion
    // vient se poser sur la couture, comme les cartes de la page contact.
    <div className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      {/* Bande dégradée cantonnée au haut de page : la carte la chevauche,
          le reste retombe sur le gris de fond habituel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-900 to-slate-50"
      />
      <MotionDiv
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="container-page relative z-10 max-w-md">
        <MotionDiv
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5"
        >
          <div className="flex flex-col items-center text-center">
            <Logo className="h-11 w-11" />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.login.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.login.subtitle}</p>
          </div>

          <div className="mt-8">
            <LoginForm locale={locale} t={t} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 rounded-xl border border-slate-200 border-l-4 border-l-brand-500 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-ink">{t.login.noAccountTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.login.noAccountBody}</p>
          <Link
            href={`/${locale}/contact`}
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            {t.login.noAccountCta}
          </Link>
        </MotionDiv>

        <p className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-ink-muted hover:text-brand-700">
            ← {t.login.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
