'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnimatedStat from '@/components/animated-stat';
import { BookIcon, DocumentIcon, UserIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, hoverLift, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { listMyEnrollments, listMyMaterials, type StudentEnrollment, type StudentMaterial } from '@/lib/student-api';
import { useStudent } from './student-context';

export default function StudentOverviewPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);
  const { user } = useStudent();

  const [enrollments, setEnrollments] = useState<StudentEnrollment[] | null>(null);
  const [materials, setMaterials] = useState<StudentMaterial[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMyEnrollments(), listMyMaterials()])
      .then(([e, m]) => {
        if (cancelled) return;
        setEnrollments(e.enrollments);
        setMaterials(m.materials);
      })
      .catch(() => {
        if (cancelled) return;
        setEnrollments([]);
        setMaterials([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const isLoading = enrollments === null || materials === null;
  const activeCount = enrollments?.filter((e) => e.status === 'CONFIRMED' || e.status === 'PAID').length ?? 0;
  const completedCount = enrollments?.filter((e) => e.status === 'COMPLETED').length ?? 0;
  const certificatesCount = enrollments?.filter((e) => e.certificate).length ?? 0;
  const materialsCount = materials?.length ?? 0;

  const stats = [
    { label: t.student.overview.statActive, value: activeCount },
    { label: t.student.overview.statCompleted, value: completedCount },
    { label: t.student.overview.statCertificates, value: certificatesCount },
    { label: t.student.overview.statMaterials, value: materialsCount },
  ];

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.student.overview.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.student.overview.subtitle}</p>
      </MotionDiv>

      {!isLoading && enrollments.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <DocumentIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.student.overview.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.student.overview.emptyBody}</p>
          <Link href={`/${locale}/courses`} className="btn-secondary mt-2">
            {t.student.overview.emptyCta}
          </Link>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
            <MotionLi
              key={stat.label}
              variants={fadeUpItem}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-3xl font-bold tracking-tight text-brand-700">
                {isLoading ? '—' : <AnimatedStat value={String(stat.value)} locale={locale} />}
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{stat.label}</p>
            </MotionLi>
          ))}
        </MotionUl>
      )}

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {t.student.overview.shortcutsTitle}
        </h2>
        <MotionUl {...revealParentProps} className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { href: `/${locale}/student/formations`, label: t.student.overview.goToFormations, icon: BookIcon },
            { href: `/${locale}/student/supports`, label: t.student.overview.goToMaterials, icon: DocumentIcon },
            { href: `/${locale}/student/profil`, label: t.student.overview.goToProfile, icon: UserIcon },
          ].map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <MotionLi key={shortcut.href} variants={fadeUpItem} {...hoverLift}>
                <Link
                  href={shortcut.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:ring-1 hover:ring-brand-100"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{shortcut.label}</span>
                </Link>
              </MotionLi>
            );
          })}
        </MotionUl>
      </div>
    </div>
  );
}
