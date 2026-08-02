'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authFetch, clearToken, getToken } from '@/lib/auth';
import { SpinnerIcon } from '@/components/icons';
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
  course: { id: string; titleFr: string; titleEn: string; accentColor: string };
  deadline: Deadline | null;
}

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  registrationDate: string;
  courses: CourseEntry[];
  nextDeadline: Deadline | null;
}

export default function StudentsOverview({
  locale,
  t,
  audience,
}: {
  locale: Locale;
  t: Dictionary;
  audience: 'ADMIN' | 'TEACHER';
}) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/${locale}/login`);
      return;
    }

    let cancelled = false;
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
    authFetch<{ students: StudentRow[] }>(`/students${query}`)
      .then((payload) => {
        if (!cancelled) setStudents(payload.students);
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught?.status === 401) {
          clearToken();
          router.replace(`/${locale}/login`);
        } else if (caught?.status === 403) {
          router.replace(`/${locale}`);
        } else {
          setError(t.adminStudents.sessionExpired);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, debouncedSearch]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }),
    [locale]
  );

  const title = audience === 'ADMIN' ? t.adminStudents.titleAdmin : t.adminStudents.titleTeacher;
  const subtitle = audience === 'ADMIN' ? t.adminStudents.subtitleAdmin : t.adminStudents.subtitleTeacher;

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="container-page">
        <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{title}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{subtitle}</h1>
          </div>
          <span className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-muted">
            {t.adminStudents.readOnlyNote}
          </span>
        </div>

        <div className="animate-fade-up mt-6">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.adminStudents.searchPlaceholder}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-ink
                       placeholder:text-slate-400 focus:border-brand-600 focus:outline-none
                       focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <div className="animate-fade-up mt-6 rounded-2xl border border-slate-200 bg-white">
          {error ? (
            <p className="p-8 text-center text-sm text-red-600">{error}</p>
          ) : !students ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-ink-muted">
              <SpinnerIcon className="h-6 w-6 text-brand-600" />
              <p className="text-sm">{t.adminStudents.loading}</p>
            </div>
          ) : students.length === 0 ? (
            <p className="p-16 text-center text-sm text-ink-muted">{t.adminStudents.noStudents}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3.5 font-semibold">{t.adminStudents.columns.name}</th>
                    <th className="px-5 py-3.5 font-semibold">{t.adminStudents.columns.contact}</th>
                    <th className="px-5 py-3.5 font-semibold">{t.adminStudents.columns.registrationDate}</th>
                    <th className="px-5 py-3.5 font-semibold">{t.adminStudents.columns.courses}</th>
                    <th className="px-5 py-3.5 font-semibold">{t.adminStudents.columns.nextDeadline}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="animate-fade-up align-top transition-colors hover:bg-slate-50"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <td className="px-5 py-4 font-semibold text-ink">
                        {student.firstName} {student.lastName}
                        {!student.isActive && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            {t.adminStudents.inactive}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-ink-muted">
                        <p>{student.email}</p>
                        <p className="mt-0.5 text-xs">{student.phone || t.studentDashboard.notProvided}</p>
                      </td>
                      <td className="px-5 py-4 text-ink-muted">
                        {dateFormatter.format(new Date(student.registrationDate))}
                      </td>
                      <td className="px-5 py-4">
                        {student.courses.length === 0 ? (
                          <span className="text-ink-muted">{t.adminStudents.noCourse}</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {student.courses.map((entry) => (
                              <li key={entry.id} className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: entry.course.accentColor }}
                                />
                                <span className="text-ink">
                                  {locale === 'fr' ? entry.course.titleFr : entry.course.titleEn}
                                </span>
                                <span className="text-xs font-semibold text-ink-muted">{entry.progress}%</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {student.nextDeadline ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              student.nextDeadline.isUrgent
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-ink-muted'
                            }`}
                          >
                            {dateFormatter.format(new Date(student.nextDeadline.date))}
                          </span>
                        ) : (
                          <span className="text-ink-muted">{t.adminStudents.noDeadline}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
