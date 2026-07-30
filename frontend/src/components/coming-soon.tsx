import Link from 'next/link';

import type { Locale } from '@/i18n/config';

/**
 * Réservation de route : les pages Formations et Contact seront développées
 * à l'étape suivante. Évite les liens morts dans la barre de navigation.
 */
const copy = {
  fr: {
    badge: 'En cours de développement',
    body: 'Cette page sera disponible très prochainement. En attendant, notre équipe reste joignable par téléphone ou par email.',
    back: "Retour à l'accueil",
  },
  en: {
    badge: 'Under construction',
    body: 'This page is coming shortly. In the meantime our team is reachable by phone or email.',
    back: 'Back to home',
  },
} as const;

export default function ComingSoon({ locale, title }: { locale: Locale; title: string }) {
  const t = copy[locale];

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
        {t.badge}
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">{t.body}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/${locale}`} className="btn-secondary">
          ← {t.back}
        </Link>
        <a href="mailto:contact@centre-formation.tn" className="btn-primary">
          contact@centre-formation.tn
        </a>
      </div>
    </div>
  );
}
