'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { apiFetch, ApiRequestError } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { useTeacher } from '../../teacher-context';
import type { RosterEnrollment, RosterSession } from '../../types';
import {
  enrollmentStatusClasses,
  formatDateRange,
  sessionModeClasses,
  sessionStatusClasses,
} from '../../ui';
import MaterialsPanel from './materials-panel';

type LoadState = 'loading' | 'ready' | 'error';

export default function SessionDetail({ id, locale, t }: { id: string; locale: Locale; t: Dictionary }) {
  const { token } = useTeacher();
  const [state, setState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<RosterSession | null>(null);
  const [enrollments, setEnrollments] = useState<RosterEnrollment[]>([]);

  const load = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await apiFetch<{ session: RosterSession; enrollments: RosterEnrollment[] }>(
        `/sessions/${id}/roster`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSession(data.session);
      setEnrollments(data.enrollments);
      setState('ready');
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        if (caught.status === 404) setErrorMessage(t.teacher.session.notFound);
        else if (caught.status === 403) setErrorMessage(t.teacher.session.forbidden);
        else setErrorMessage(caught.message);
      } else {
        setErrorMessage(t.teacher.common.networkError);
      }
      setState('error');
    }
  }, [id, token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="panel h-40 animate-pulse" />
        <div className="panel h-64 animate-pulse" />
      </div>
    );
  }

  if (state === 'error' || !session) {
    return (
      <div className="panel flex flex-col items-center gap-4 py-14 text-center">
        <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        <Link href={`/${locale}/teacher`} className="btn-secondary">
          {t.teacher.session.backToDashboard}
        </Link>
      </div>
    );
  }

  const title = locale === 'fr' ? session.course.titleFr : session.course.titleEn;
  const schedule = locale === 'fr' ? session.scheduleFr : session.scheduleEn;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link
          href={`/${locale}/teacher`}
          className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
        >
          {t.teacher.session.backToDashboard}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{formatDateRange(session.startDate, session.endDate, locale)}</p>
          </div>
          <span className={`badge ${sessionStatusClasses[session.status]}`}>
            {t.teacher.statusLabels[session.status]}
          </span>
        </div>
      </div>

      <div className="panel grid animate-fade-up gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: '60ms' }}>
        <InfoBlock label={t.teacher.session.scheduleLabel} value={schedule} />
        <InfoBlock
          label={t.teacher.session.locationLabel}
          value={session.mode === 'ONLINE' ? t.teacher.session.onlineLabel : session.location || '—'}
        />
        <InfoBlock
          label={t.teacher.session.capacityLabel}
          value={`${enrollments.length} / ${session.capacity}`}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t.teacher.session.formatLabel}
          </p>
          <span className={`badge mt-1 ${sessionModeClasses[session.mode]}`}>
            {t.teacher.modeLabels[session.mode]}
          </span>
        </div>
      </div>

      {session.mode !== 'ONSITE' && session.meetingUrl && (
        <div className="-mt-4 animate-fade-up text-sm" style={{ animationDelay: '90ms' }}>
          <span className="font-medium text-ink-muted">{t.teacher.session.meetingLinkLabel}: </span>
          <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">
            {session.meetingUrl}
          </a>
        </div>
      )}

      <RosterPanel enrollments={enrollments} t={t} />

      <MaterialsPanel sessionId={id} token={token} t={t} />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function RosterPanel({ enrollments, t }: { enrollments: RosterEnrollment[]; t: Dictionary }) {
  return (
    <div className="panel animate-fade-up" style={{ animationDelay: '120ms' }}>
      <h3 className="text-lg font-semibold text-ink">{t.teacher.session.roster.title}</h3>

      {enrollments.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{t.teacher.session.roster.empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th className="py-2.5 pr-4">{t.teacher.session.roster.studentHeader}</th>
                <th className="py-2.5 pr-4">{t.teacher.session.roster.emailHeader}</th>
                <th className="py-2.5 pr-4">{t.teacher.session.roster.phoneHeader}</th>
                <th className="py-2.5 pr-4">{t.teacher.session.roster.statusHeader}</th>
                <th className="py-2.5">{t.teacher.session.roster.certificateHeader}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment, index) => (
                <tr
                  key={enrollment.id}
                  className="animate-fade-up border-b border-slate-100 last:border-0"
                  style={{ animationDelay: `${140 + index * 40}ms` }}
                >
                  <td className="py-3 pr-4 font-medium text-ink">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">{enrollment.student.email}</td>
                  <td className="py-3 pr-4 text-ink-muted">
                    {enrollment.student.phone || t.teacher.session.roster.noPhone}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${enrollmentStatusClasses[enrollment.status]}`}>
                      {t.teacher.enrollmentStatusLabels[enrollment.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    {enrollment.certificate ? (
                      <span className="badge bg-emerald-50 text-emerald-700">
                        {t.teacher.session.roster.certificateIssued} · {enrollment.certificate.serialNumber}
                      </span>
                    ) : (
                      <span className="text-ink-muted">{t.teacher.session.roster.certificateNone}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
