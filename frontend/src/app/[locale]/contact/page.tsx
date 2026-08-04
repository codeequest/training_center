import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ContactForm from './contact-form';
import { MotionDiv, revealProps } from '@/components/motion-primitives';
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
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="container-page">
        <MotionDiv {...revealProps} className="max-w-2xl">
          <h1 className="section-title">{t.contact.title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{t.contact.subtitle}</p>
        </MotionDiv>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
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
            className="h-fit rounded-2xl border border-slate-200 bg-white p-8"
          >
            <h2 className="text-sm font-semibold text-ink">{t.contact.infoTitle}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">{t.contact.infoPhone}</dt>
                <dd className="mt-1 font-medium text-ink">
                  <a href="tel:+21671000000" className="hover:text-brand-700">
                    +216 71 000 000
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{t.contact.infoEmail}</dt>
                <dd className="mt-1 font-medium text-ink">
                  <a href="mailto:contact@centre-formation.tn" className="hover:text-brand-700">
                    contact@centre-formation.tn
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">{t.contact.infoAddress}</dt>
                <dd className="mt-1 font-medium text-ink">{t.footer.address}</dd>
              </div>
            </dl>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
