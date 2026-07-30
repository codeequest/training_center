'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { apiFetch, ApiRequestError } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { useTeacher } from './teacher-context';
import type { TeacherSession } from './types';
import { formatDateRange, sessionModeClasses, sessionStatusClasses } from './ui';

type LoadState = 'loading' | 'ready' | 'error';

export default function TeacherDashboard({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { token } = useTeacher();
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await apiFetch<{ sessions: TeacherSession[] }>('/me/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(data.sessions);
      setState('ready');
    } catch (caught) {
      setErrorMessage(caught instanceof ApiRequestError ? caught.message : t.teacher.common.networkError);
      setState('error');
    }
  }, [token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="animate-fade-up">
        <p className="eyebrow">{t.teacher.dashboard.sectionTitle}</p>
        <h2 className="section-title">{t.teacher.dashboard.title}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {t.teacher.dashboard.subtitle}
        </p>
      </div>

      <div className="mt-8">
        {state === 'loading' && <SessionGridSkeleton />}

        {state === 'error' && (
          <div className="panel flex flex-col items-center gap-4 py-14 text-center">
            <p className="text-sm font-medium text-red-700">
              {t.teacher.dashboard.errorTitle}
              {errorMessage ? ` — ${errorMessage}` : ''}
            </p>
            <button type="button" onClick={() => void load()} className="btn-secondary">
              {t.teacher.common.retry}
            </button>
          </div>
        )}

        {state === 'ready' && sessions.length === 0 && (
          <div className="panel flex animate-fade-up flex-col items-center gap-3 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
              <CalendarIcon className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold text-ink">{t.teacher.dashboard.empty.title}</h3>
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
              {t.teacher.dashboard.empty.body}
            </p>
          </div>
        )}

        {state === 'ready' && sessions.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, index) => (
              <SessionCard key={session.id} session={session} locale={locale} t={t} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  locale,
  t,
  index,
}: {
  session: TeacherSession;
  locale: Locale;
  t: Dictionary;
  index: number;
}) {
  const title = locale === 'fr' ? session.course.titleFr : session.course.titleEn;
  const schedule = locale === 'fr' ? session.scheduleFr : session.scheduleEn;
  const enrolled = session._count.enrollments;
  const fillRatio = session.capacity > 0 ? Math.min(1, enrolled / session.capacity) : 0;

  return (
    <Link
      href={`/${locale}/teacher/sessions/${session.id}`}
      className="panel panel-hover group flex animate-fade-up flex-col gap-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: session.course.accentColor }}
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold leading-snug text-ink group-hover:text-brand-700">
            {title}
          </h3>
        </div>
        <span className={`badge shrink-0 ${sessionStatusClasses[session.status]}`}>
          {t.teacher.statusLabels[session.status]}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-ink-muted">
        <p>{formatDateRange(session.startDate, session.endDate, locale)}</p>
        <p>{schedule}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`badge ${sessionModeClasses[session.mode]}`}>
            {t.teacher.modeLabels[session.mode]}
          </span>
          {session.location && session.mode !== 'ONLINE' && <span>{session.location}</span>}
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>
            {enrolled} / {session.capacity} {t.teacher.dashboard.enrolledLabel}
          </span>
          <span>
            {session._count.materials} {t.teacher.dashboard.materialsCountLabel}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
            style={{ width: `${fillRatio * 100}%` }}
          />
        </div>
      </div>

      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        {t.teacher.dashboard.viewSession}
        <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SessionGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="panel animate-pulse space-y-4">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function CalendarIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
