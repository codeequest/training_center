import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ContactForm from './contact-form';
import { MailIcon, PhoneIcon, PinIcon } from '@/components/icons';
import {
  fadeUpItem,
  MotionDiv,
  MotionDl,
  revealParentProps,
  revealProps,
} from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).contact.title };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <div className="bg-slate-50">
      {/* Bandeau dégradé repris du héros d'accueil : les cartes viennent
          chevaucher la couture, la page cesse d'être un aplat gris. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 pb-24 pt-16 sm:pb-32 sm:pt-20">
        <MotionDiv
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <MotionDiv
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl"
          animate={{ x: [0, -16, 0], y: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container-page relative">
          <MotionDiv {...revealProps} className="max-w-2xl">
            <p className="eyebrow text-brand-200">{t.nav.contact}</p>
            <h1 className="section-title text-white">{t.contact.title}</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-100">{t.contact.subtitle}</p>
          </MotionDiv>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-14 pb-16 sm:-mt-20 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <MotionDiv
            {...revealProps}
            className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5"
          >
            <h2 className="text-sm font-semibold text-ink">{t.contact.formTitle}</h2>
            <div className="relative mt-6">
              <ContactForm locale={locale} t={t} />
            </div>
          </MotionDiv>

          <MotionDiv
            {...revealProps}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-ink">{t.contact.infoTitle}</h2>
            <MotionDl {...revealParentProps} className="mt-5 space-y-4 text-sm">
              {[
                {
                  icon: <PhoneIcon className="h-4 w-4" />,
                  term: t.contact.infoPhone,
                  detail: (
                    <a href="tel:+21671000000" className="transition-colors hover:text-brand-700">
                      +216 71 000 000
                    </a>
                  ),
                },
                {
                  icon: <MailIcon className="h-4 w-4" />,
                  term: t.contact.infoEmail,
                  detail: (
                    <a
                      href="mailto:contact@centre-formation.tn"
                      className="transition-colors hover:text-brand-700"
                    >
                      contact@centre-formation.tn
                    </a>
                  ),
                },
                {
                  icon: <PinIcon className="h-4 w-4" />,
                  term: t.contact.infoAddress,
                  detail: t.footer.address,
                },
              ].map((row) => (
                <MotionDiv key={row.term} variants={fadeUpItem} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    {row.icon}
                  </span>
                  <span className="min-w-0">
                    <dt className="text-xs text-ink-muted">{row.term}</dt>
                    <dd className="mt-1 font-medium text-ink">{row.detail}</dd>
                  </span>
                </MotionDiv>
              ))}
            </MotionDl>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
