'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CourseIcon } from '@/components/icons';
import { MotionLi, MotionUl, fadeUpItem, hoverLift, revealParentProps, revealProps, MotionDiv } from '@/components/motion-primitives';
import { levelLabels, type CourseCard } from '@/content/courses';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { formatPrice, type DisplayCourse } from '@/lib/courses-api';
import { themeForSlug, trackForSlug, trackIcon } from '@/lib/course-theme';

const LEVELS: CourseCard['level'][] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function CoursesCatalogue({
  locale,
  t,
  courses,
  isFallback,
}: {
  locale: Locale;
  t: Dictionary;
  courses: DisplayCourse[];
  isFallback: boolean;
}) {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<CourseCard['level'] | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = level === 'ALL' || course.level === level;
      const matchesSearch =
        query.length === 0 ||
        course.title.toLowerCase().includes(query) ||
        course.summary.toLowerCase().includes(query);
      return matchesLevel && matchesSearch;
    });
  }, [courses, search, level]);

  return (
    <div className="py-16 sm:py-20">
      <div className="container-page">
        <MotionDiv {...revealProps} className="max-w-2xl">
          <p className="eyebrow">{t.catalogue.eyebrow}</p>
          <h1 className="section-title">{t.catalogue.title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{t.catalogue.subtitle}</p>
        </MotionDiv>

        {isFallback && (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.catalogue.offlineNotice}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.catalogue.searchPlaceholder}
            className="field-input sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLevel('ALL')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                level === 'ALL' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
              }`}
            >
              {t.catalogue.levelAll}
            </button>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  level === lvl ? 'bg-brand-700 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                }`}
              >
                {levelLabels[lvl][locale]}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-muted sm:ml-auto">
            {filtered.length} {filtered.length > 1 ? t.catalogue.resultPlural : t.catalogue.resultSingular}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
              <CourseIcon name="chart" className="h-7 w-7" />
            </span>
            <p className="text-sm text-ink-muted">{t.catalogue.noResults}</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setLevel('ALL');
              }}
              className="btn-secondary"
            >
              {t.catalogue.resetFilters}
            </button>
          </div>
        ) : (
          <MotionUl {...revealParentProps} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => {
              const theme = themeForSlug(course.slug);
              const icon = trackIcon[trackForSlug(course.slug)];
              return (
                <MotionLi
                  key={course.slug}
                  variants={fadeUpItem}
                  {...hoverLift}
                  className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 ${theme.cardHover}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid h-12 w-12 place-items-center rounded-xl ${theme.chip}`}>
                      <CourseIcon name={icon} />
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}>
                      {levelLabels[course.level][locale]}
                    </span>
                  </div>

                  <h2 className="mt-5 text-[17px] font-semibold leading-snug text-ink">{course.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{course.summary}</p>

                  <dl className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-5 text-xs">
                    <div>
                      <dt className="text-ink-muted">{t.courseDetail.durationLabel}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">
                        {course.durationHours} {t.courses.hours}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">{t.courseDetail.priceLabel}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{formatPrice(course.price, course.currency, locale)}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-xs font-medium text-ink-muted">
                    {course.sessionsCount > 0
                      ? `${course.sessionsCount} ${course.sessionsCount > 1 ? t.catalogue.sessionPlural : t.catalogue.sessionSingular}`
                      : t.catalogue.noSessions}
                  </p>

                  <Link
                    href={`/${locale}/courses/${course.slug}`}
                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${theme.text} transition-colors hover:opacity-80`}
                  >
                    {t.courses.cta}
                  </Link>
                </MotionLi>
              );
            })}
          </MotionUl>
        )}
      </div>
    </div>
  );
}
