import Link from 'next/link';
import { notFound } from 'next/navigation';

import AnimatedStat from '@/components/animated-stat';
import { ArrowIcon, CheckIcon, CourseIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, hoverLift, revealParentProps, revealProps } from '@/components/motion-primitives';
import { courses, levelLabels } from '@/content/courses';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { themeForSlug } from '@/lib/course-theme';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);

  return (
    <>
      {/* ---------------------------------------------------------- Héros */}
      <section className="relative overflow-hidden bg-brand-900">
        {/* Halos décoratifs */}
        <MotionDiv
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl"
          animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <MotionDiv
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container-page relative grid gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-brand-50">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
              {t.hero.badge}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              {t.hero.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100">{t.hero.subtitle}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/courses`} className="btn bg-white text-brand-900 hover:bg-brand-50">
                {t.hero.primaryCta}
                <ArrowIcon />
              </Link>
              <Link href={`/${locale}/contact`} className="btn-ghost-light">
                {t.hero.secondaryCta}
              </Link>
            </div>

            <p className="mt-6 text-sm text-brand-200">{t.hero.note}</p>
          </MotionDiv>

          {/* Aperçu du catalogue */}
          <MotionUl
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          >
            {courses.map((course) => {
              const theme = themeForSlug(course.slug);
              return (
                <MotionLi
                  key={course.slug}
                  variants={fadeUpItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-panel flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.12]"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${theme.chip}`}>
                    <CourseIcon name={course.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {course.title[locale]}
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-200">
                      {course.durationHours} {t.courses.hours} · {levelLabels[course.level][locale]}
                    </span>
                  </span>
                </MotionLi>
              );
            })}
          </MotionUl>
        </div>
      </section>

      {/* -------------------------------------------------------- Chiffres */}
      <section className="border-b border-slate-200 bg-white">
        <MotionUl {...revealParentProps} className="container-page grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
          {t.stats.items.map((stat) => (
            <MotionLi key={stat.label} variants={fadeUpItem} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
                <AnimatedStat value={stat.value} locale={locale} />
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{stat.label}</p>
            </MotionLi>
          ))}
        </MotionUl>
      </section>

      {/* ---------------------------------------------------- Le centre */}
      <section id="about" className="py-20 sm:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
          <MotionDiv {...revealProps}>
            <p className="eyebrow">{t.about.eyebrow}</p>
            <h2 className="section-title">{t.about.title}</h2>
            {t.about.body.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-[15px] leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </MotionDiv>

          <MotionUl {...revealParentProps} className="grid gap-5 sm:grid-cols-2">
            {t.about.pillars.map((pillar) => (
              <MotionLi
                key={pillar.title}
                variants={fadeUpItem}
                {...hoverLift}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-transparent transition-shadow hover:shadow-md hover:ring-brand-100"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <CheckIcon />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pillar.description}</p>
              </MotionLi>
            ))}
          </MotionUl>
        </div>
      </section>

      {/* -------------------------------------------------- Les formations */}
      <section id="courses" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="container-page">
          <MotionDiv {...revealProps} className="max-w-2xl">
            <p className="eyebrow">{t.courses.eyebrow}</p>
            <h2 className="section-title">{t.courses.title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{t.courses.subtitle}</p>
          </MotionDiv>

          <MotionUl {...revealParentProps} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => {
              const theme = themeForSlug(course.slug);
              return (
                <MotionLi
                  key={course.slug}
                  variants={fadeUpItem}
                  {...hoverLift}
                  className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 ${theme.cardHover}`}
                >
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${theme.chip}`}>
                    <CourseIcon name={course.icon} />
                  </span>

                  <h3 className="mt-5 text-[17px] font-semibold leading-snug text-ink">
                    {course.title[locale]}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{course.summary[locale]}</p>

                  <ul className="mt-5 space-y-2">
                    {course.highlights[locale].map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-sm text-ink-muted">
                        <CheckIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.text}`} />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-6 flex items-center gap-5 border-t border-slate-100 pt-5 text-xs">
                    <div>
                      <dt className="text-ink-muted">{t.courses.durationLabel}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">
                        {course.durationHours} {t.courses.hours}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">{t.courses.levelLabel}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{levelLabels[course.level][locale]}</dd>
                    </div>
                  </dl>

                  <Link
                    href={`/${locale}/courses/${course.slug}`}
                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${theme.text} transition-colors hover:opacity-80`}
                  >
                    {t.courses.cta}
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </MotionLi>
              );
            })}
          </MotionUl>

          <div className="mt-12 text-center">
            <Link href={`/${locale}/courses`} className="btn-secondary">
              {t.courses.allCta}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Pourquoi nous */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <MotionDiv {...revealProps} className="max-w-2xl">
            <p className="eyebrow">{t.why.eyebrow}</p>
            <h2 className="section-title">{t.why.title}</h2>
          </MotionDiv>

          <MotionUl {...revealParentProps} className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, index) => (
              <MotionLi key={item.title} variants={fadeUpItem}>
                <span className="text-sm font-bold text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
              </MotionLi>
            ))}
          </MotionUl>
        </div>
      </section>

      {/* --------------------------------------------------- Témoignages */}
      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="container-page">
          <MotionDiv {...revealProps} className="max-w-2xl">
            <p className="eyebrow">{t.testimonials.eyebrow}</p>
            <h2 className="section-title">{t.testimonials.title}</h2>
          </MotionDiv>

          <MotionUl {...revealParentProps} className="mt-12 grid gap-6 lg:grid-cols-3">
            {t.testimonials.items.map((item) => (
              <MotionLi
                key={item.author}
                variants={fadeUpItem}
                {...hoverLift}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex gap-0.5 text-brand-500" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg key={index} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path d="m10 1.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L10 1.6Z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-5 text-[15px] leading-relaxed text-ink">
                  “{item.quote}”
                </blockquote>
                <footer className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-ink">{item.author}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{item.role}</p>
                </footer>
              </MotionLi>
            ))}
          </MotionUl>
        </div>
      </section>

      {/* ---------------------------------------------------- Appel final */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-900 py-16 sm:py-20">
        <MotionDiv
          {...revealProps}
          className="container-page flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left"
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t.cta.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-100">{t.cta.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/contact`} className="btn bg-white text-brand-900 hover:bg-brand-50">
              {t.cta.primary}
            </Link>
            <Link href={`/${locale}/courses`} className="btn-ghost-light">
              {t.cta.secondary}
            </Link>
          </div>
        </MotionDiv>
      </section>
    </>
  );
}
