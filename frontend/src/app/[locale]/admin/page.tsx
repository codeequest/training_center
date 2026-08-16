'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import AnimatedStat from '@/components/animated-stat';
import { DocumentIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import {
  getAdminStats,
  type AdminStats,
  type EnrollmentStatusCount,
  type RecentEnrollment,
} from '@/lib/admin-api';
import { statusOrder, statusTheme } from '@/lib/status-theme';

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [breakdown, setBreakdown] = useState<EnrollmentStatusCount[]>([]);
  const [recent, setRecent] = useState<RecentEnrollment[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAdminStats().then((data) => {
      if (cancelled) return;
      setStats(data.stats);
      setBreakdown(data.enrollmentsByStatus);
      setRecent(data.recentEnrollments);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /*
    Le tableau garde toujours ses 7 entrées, même avant l'arrivée des données :
    le conteneur `revealParentProps` se révèle une seule fois (`viewport.once`),
    donc des enfants montés après coup resteraient figés sur la variante
    `hidden` — invisibles. Seule la valeur est différée.
  */
  const tiles = [
    { label: t.admin.dashboard.statStudents, value: stats?.totalStudents },
    { label: t.admin.dashboard.statTeachers, value: stats?.totalTeachers },
    { label: t.admin.dashboard.statCourses, value: stats?.publishedCourses },
    { label: t.admin.dashboard.statOpenSessions, value: stats?.openSessions },
    { label: t.admin.dashboard.statPending, value: stats?.pendingRequests },
    { label: t.admin.dashboard.statConfirmed, value: stats?.confirmedEnrollments },
    { label: t.admin.dashboard.statUnreadMessages, value: stats?.unreadMessages },
  ];

  const countByStatus = Object.fromEntries(breakdown.map((row) => [row.status, row.count])) as Record<string, number>;
  const maxCount = Math.max(1, ...breakdown.map((row) => row.count));

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.dashboard.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.admin.dashboard.subtitle}</p>
      </MotionDiv>

      <MotionUl {...revealParentProps} className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {tiles.map((tile) => (
          <MotionLi
            key={tile.label}
            variants={fadeUpItem}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-3xl font-bold tracking-tight text-genai-700">
              {tile.value === undefined ? '—' : <AnimatedStat value={String(tile.value)} locale={locale} />}
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">{tile.label}</p>
          </MotionLi>
        ))}
      </MotionUl>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="text-base font-semibold text-ink">{t.admin.dashboard.breakdownTitle}</h2>
          <ul className="mt-5 space-y-4">
            {statusOrder.map((status) => {
              const count = countByStatus[status] ?? 0;
              const theme = statusTheme[status];
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${theme.text}`}>{t.admin.enrollments.statusLabels[status]}</span>
                    <span className="font-semibold text-ink">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <MotionDiv
                      className={`h-full rounded-full ${theme.bar}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(count / maxCount) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">{t.admin.dashboard.recentTitle}</h2>
            <Link href={`/${locale}/admin/inscriptions`} className="text-sm font-semibold text-genai-700 hover:underline">
              {t.admin.dashboard.viewAll}
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <DocumentIcon className="h-6 w-6" />
              </span>
              <p className="text-sm text-ink-muted">{t.admin.dashboard.recentEmpty}</p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100">
              {recent.map((enrollment) => {
                const theme = statusTheme[enrollment.status];
                const title = locale === 'fr' ? enrollment.session.course.titleFr : enrollment.session.course.titleEn;
                return (
                  <li key={enrollment.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{enrollment.requesterName}</p>
                      <p className="text-xs text-ink-muted">
                        {title} · {formatDate(enrollment.createdAt, locale)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}
                    >
                      <theme.icon className="h-3 w-3" />
                      {t.admin.enrollments.statusLabels[enrollment.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </MotionDiv>
      </div>
    </div>
  );
}
