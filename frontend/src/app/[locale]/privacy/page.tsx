import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps, revealProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).privacy.title, robots: { index: false } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <div className="py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <MotionDiv {...revealProps}>
          <h1 className="section-title">{t.privacy.title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{t.privacy.intro}</p>
        </MotionDiv>

        <MotionUl {...revealParentProps} className="mt-10 space-y-8">
          {t.privacy.sections.map((section) => (
            <MotionLi key={section.heading} variants={fadeUpItem} className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{section.body}</p>
            </MotionLi>
          ))}
        </MotionUl>
      </div>
    </div>
  );
}
