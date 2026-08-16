import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EnrollmentForm from './enrollment-form';
import { ArrowIcon, CheckIcon, CourseIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps, revealProps } from '@/components/motion-primitives';
import { courses as staticCourses, levelLabels } from '@/content/courses';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { apiFetch, ApiRequestError } from '@/lib/api';
import { themeForSlug, trackForSlug, trackIcon } from '@/lib/course-theme';
import { formatPrice, type ApiCourse } from '@/lib/courses-api';

interface CourseDetailData {
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationHours: number;
  price: number;
  currency: string;
  modules: { id: string; title: string; description: string }[];
  sessions: {
    id: string;
    startDate: string;
    schedule: string;
    mode: 'ONSITE' | 'ONLINE' | 'HYBRID';
    location: string | null;
    teacherName: string | null;
  }[];
  materials: { id: string; title: string }[];
  isFallback: boolean;
}

async function loadCourse(slug: string, locale: Locale): Promise<CourseDetailData | null> {
  try {
    const data = await apiFetch<{ course: ApiCourse }>(`/courses/${slug}`, { cache: 'no-store' });
    const course = data.course;
    return {
      slug: course.slug,
      title: locale === 'fr' ? course.titleFr : course.titleEn,
      summary: locale === 'fr' ? course.summaryFr : course.summaryEn,
      description: locale === 'fr' ? course.descriptionFr : course.descriptionEn,
      level: course.level,
      durationHours: course.durationHours,
      price: typeof course.price === 'string' ? parseFloat(course.price) : course.price,
      currency: course.currency,
      modules: (course.modules ?? []).map((module) => ({
        id: module.id,
        title: locale === 'fr' ? module.titleFr : module.titleEn,
        description: locale === 'fr' ? module.descriptionFr : module.descriptionEn,
      })),
      sessions: (course.sessions ?? []).map((session) => ({
        id: session.id,
        startDate: session.startDate,
        schedule: locale === 'fr' ? session.scheduleFr : session.scheduleEn,
        mode: session.mode,
        location: session.location,
        teacherName: session.teacher ? `${session.teacher.firstName} ${session.teacher.lastName}` : null,
      })),
      materials: (course.materials ?? []).map((material) => ({ id: material.id, title: material.title })),
      isFallback: false,
    };
  } catch (caught) {
    if (caught instanceof ApiRequestError && caught.status === 404) return null;

    // API injoignable : on retombe sur le contenu statique si le slug y figure.
    const fallback = staticCourses.find((course) => course.slug === slug);
    if (!fallback) return null;

    return {
      slug: fallback.slug,
      title: fallback.title[locale],
      summary: fallback.summary[locale],
      description: fallback.summary[locale],
      level: fallback.level,
      durationHours: fallback.durationHours,
      price: fallback.price,
      currency: fallback.currency,
      modules: fallback.highlights[locale].map((highlight, index) => ({
        id: `${fallback.slug}-${index}`,
        title: highlight,
        description: '',
      })),
      sessions: [],
      materials: [],
      isFallback: true,
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const course = await loadCourse(slug, locale as Locale);
  return course ? { title: course.title } : {};
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const t = getDictionary(locale);
  const course = await loadCourse(slug, locale);

  if (!course) notFound();

  const theme = themeForSlug(course.slug);
  const icon = trackIcon[trackForSlug(course.slug)];
  const dateFormatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="py-16 sm:py-20">
      <div className="container-page max-w-4xl">
        <Link href={`/${locale}/courses`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700">
          <ArrowIcon className="h-4 w-4 rotate-180" />
          {t.courseDetail.back}
        </Link>

        <MotionDiv {...revealProps} className="mt-6 flex items-start gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${theme.chip}`}>
            <CourseIcon name={icon} className="h-7 w-7" />
          </span>
          <div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}>
              {t.courseDetail.levelLabel}: {levelLabels[course.level][locale]}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{course.summary}</p>
          </div>
        </MotionDiv>

        <MotionDiv {...revealProps} className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-ink-muted">{t.courseDetail.durationLabel}</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {course.durationHours} {t.courses.hours}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-ink-muted">{t.courseDetail.priceLabel}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{formatPrice(course.price, course.currency, locale)}</p>
          </div>
          <div className={`rounded-xl border border-slate-200 bg-gradient-to-br p-5 text-white ${theme.gradient}`}>
            <p className="text-xs text-white/80">{t.courseDetail.enrollCta}</p>
            <Link href={`/${locale}/contact`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              {t.courseDetail.enrollCta}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </MotionDiv>

        {course.description && (
          <MotionDiv {...revealProps} className="mt-10 text-[15px] leading-relaxed text-ink-muted">
            {course.description}
          </MotionDiv>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-ink">{t.courseDetail.modulesTitle}</h2>
          {course.modules.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{t.courseDetail.modulesEmpty}</p>
          ) : (
            <MotionUl {...revealParentProps} className="mt-5 space-y-3">
              {course.modules.map((module, index) => (
                <MotionLi
                  key={module.id}
                  variants={fadeUpItem}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${theme.badge}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{module.title}</h3>
                    {module.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{module.description}</p>
                    )}
                  </div>
                </MotionLi>
              ))}
            </MotionUl>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-ink">{t.courseDetail.sessionsTitle}</h2>
          {course.sessions.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{t.courseDetail.sessionsEmpty}</p>
          ) : (
            <MotionUl {...revealParentProps} className="mt-5 grid gap-4 sm:grid-cols-2">
              {course.sessions.map((session) => (
                <MotionLi
                  key={session.id}
                  variants={fadeUpItem}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-sm font-semibold text-ink">{dateFormatter.format(new Date(session.startDate))}</p>
                  <p className="mt-1 text-sm text-ink-muted">{session.schedule}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${theme.badge}`}>
                      {t.courseDetail.modeLabels[session.mode]}
                    </span>
                    {session.location && <span>{session.location}</span>}
                  </div>
                  {session.teacherName && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                      <CheckIcon className={`h-3.5 w-3.5 ${theme.text}`} />
                      {t.courseDetail.teacherLabel}: {session.teacherName}
                    </p>
                  )}
                </MotionLi>
              ))}
            </MotionUl>
          )}
        </section>

        {course.materials.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink">{t.courseDetail.materialsTitle}</h2>
            <MotionUl {...revealParentProps} className="mt-5 space-y-2">
              {course.materials.map((material) => (
                <MotionLi
                  key={material.id}
                  variants={fadeUpItem}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
                >
                  {material.title}
                </MotionLi>
              ))}
            </MotionUl>
          </section>
        )}

        {/*
          Sans session ouverte il n'y a rien à demander : on retombe sur le
          formulaire de contact, seul cas où il reste le bon outil.
        */}
        {course.sessions.length > 0 ? (
          <MotionDiv {...revealProps} className="mt-14">
            <EnrollmentForm slug={course.slug} sessions={course.sessions} locale={locale} t={t} />
          </MotionDiv>
        ) : (
          <MotionDiv
            {...revealProps}
            className={`mt-14 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left ${theme.gradient}`}
          >
            <p className="text-[15px] leading-relaxed">{t.courseDetail.enrollNote}</p>
            <Link href={`/${locale}/contact`} className="btn shrink-0 bg-white text-ink hover:bg-slate-50">
              {t.courseDetail.enrollCta}
              <ArrowIcon />
            </Link>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
