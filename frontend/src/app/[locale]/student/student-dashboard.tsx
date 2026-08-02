'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { authFetch, clearToken, getToken } from '@/lib/auth';
import { CheckIcon, SpinnerIcon } from '@/components/icons';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

type EnrollmentStatus = 'REQUESTED' | 'CONFIRMED' | 'PAID' | 'COMPLETED';

interface Deadline {
  date: string;
  label: 'START' | 'END';
  daysLeft: number;
  isUrgent: boolean;
  isPast: boolean;
}

interface CourseEntry {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  course: { id: string; titleFr: string; titleEn: string; accentColor: string; durationHours: number };
  teacher: { id: string; firstName: string; lastName: string } | null;
  schedule: { startDate: string; endDate: string; mode: string };
  deadline: Deadline | null;
}

interface DashboardData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    registrationDate: string;
  };
  courses: CourseEntry[];
  deadlines: CourseEntry[];
}

const statusStyles: Record<EnrollmentStatus, string> = {
  REQUESTED: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-brand-50 text-brand-700',
  PAID: 'bg-indigo-50 text-indigo-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
};

export default function StudentDashboard({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/${locale}/login`);
      return;
    }

    let cancelled = false;
    authFetch<DashboardData>('/me/dashboard')
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught?.status === 401 || caught?.status === 403) {
          clearToken();
          router.replace(`/${locale}/login`);
        } else {
          setError(t.studentDashboard.sessionExpired);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }),
    [locale]
  );

  function handleLogout() {
    clearToken();
    router.push(`/${locale}/login`);
  }

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-20 text-ink-muted">
        <SpinnerIcon className="h-6 w-6 text-brand-600" />
        <p className="text-sm">{t.studentDashboard.loading}</p>
      </div>
    );
  }

  const { student, courses, deadlines } = data;

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="container-page">
        <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{t.studentDashboard.title}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t.studentDashboard.welcomeBack} {student.firstName}
            </h1>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            {t.studentDashboard.logout}
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Informations personnelles */}
          <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
            <h2 className="text-sm font-semibold text-ink">{t.studentDashboard.personalInfoTitle}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-ink-muted">{t.register.firstNameLabel} / {t.register.lastNameLabel}</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {student.firstName} {student.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">{t.studentDashboard.emailLabel}</dt>
                <dd className="mt-0.5 font-semibold text-ink">{student.email}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{t.studentDashboard.phoneLabel}</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {student.phone || t.studentDashboard.notProvided}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">{t.studentDashboard.registrationDateLabel}</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {dateFormatter.format(new Date(student.registrationDate))}
                </dd>
              </div>
            </dl>
          </section>

          <div className="space-y-6 lg:col-span-2">
            {/* Formations */}
            <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-ink">{t.studentDashboard.coursesTitle}</h2>

              {courses.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm text-ink-muted">{t.studentDashboard.noCourses}</p>
                  <Link href={`/${locale}/courses`} className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    {t.studentDashboard.browseCourses}
                  </Link>
                </div>
              ) : (
                <ul className="mt-5 space-y-4">
                  {courses.map((entry, index) => (
                    <li
                      key={entry.id}
                      className="animate-fade-up rounded-xl border border-slate-200 p-5"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
                            style={{ backgroundColor: entry.course.accentColor }}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-[15px] font-semibold text-ink">
                              {locale === 'fr' ? entry.course.titleFr : entry.course.titleEn}
                            </p>
                            {entry.teacher && (
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {entry.teacher.firstName} {entry.teacher.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[entry.status]}`}>
                          {t.studentDashboard.statusLabels[entry.status]}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span>{t.studentDashboard.progressLabel}</span>
                          <span className="font-semibold text-ink">{entry.progress}%</span>
                        </div>
                        <ProgressBar value={entry.progress} color={entry.course.accentColor} />
                      </div>

                      <p className="mt-3 text-xs text-ink-muted">
                        {dateFormatter.format(new Date(entry.schedule.startDate))} →{' '}
                        {dateFormatter.format(new Date(entry.schedule.endDate))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Échéances */}
            <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-ink">{t.studentDashboard.deadlinesTitle}</h2>

              {deadlines.length === 0 ? (
                <p className="mt-4 text-sm text-ink-muted">{t.studentDashboard.noDeadlines}</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {deadlines.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {locale === 'fr' ? entry.course.titleFr : entry.course.titleEn}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {entry.deadline!.label === 'START'
                            ? t.studentDashboard.deadlineStart
                            : t.studentDashboard.deadlineEnd}{' '}
                          — {dateFormatter.format(new Date(entry.deadline!.date))}
                        </p>
                      </div>
                      {entry.deadline!.isUrgent && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {t.studentDashboard.urgentBadge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-[900ms] ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}
