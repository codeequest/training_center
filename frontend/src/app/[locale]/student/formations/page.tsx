'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DocumentIcon, DownloadIcon, SpinnerIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, hoverLift, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import { downloadProtectedFile } from '@/lib/auth-client';
import { themeForSlug } from '@/lib/course-theme';
import { statusTheme } from '@/lib/status-theme';
import { listMyEnrollments, type EnrollmentStatus, type StudentEnrollment } from '@/lib/student-api';

const PIPELINE: EnrollmentStatus[] = ['REQUESTED', 'CONFIRMED', 'PAID', 'COMPLETED'];
const PROGRESS: Record<EnrollmentStatus, number> = {
  REQUESTED: 25,
  CONFIRMED: 50,
  PAID: 75,
  COMPLETED: 100,
  CANCELLED: 0,
};

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' }).format(new Date(value));
}

export default function StudentEnrollmentsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [enrollments, setEnrollments] = useState<StudentEnrollment[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyEnrollments()
      .then(({ enrollments: fetched }) => {
        if (!cancelled) setEnrollments(fetched);
      })
      .catch(() => {
        if (!cancelled) setEnrollments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDownload(enrollment: StudentEnrollment) {
    if (!enrollment.certificate) return;
    setDownloadError(null);
    setDownloadingId(enrollment.id);
    try {
      await downloadProtectedFile(
        `/certificates/${enrollment.certificate.id}/download`,
        `attestation-${enrollment.certificate.serialNumber}.pdf`
      );
    } catch (caught) {
      setDownloadError(caught instanceof ApiRequestError ? caught.message : t.student.enrollments.downloadError);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.student.enrollments.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.student.enrollments.subtitle}</p>
      </MotionDiv>

      {downloadError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {downloadError}
        </p>
      )}

      {enrollments === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <DocumentIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.student.enrollments.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.student.enrollments.emptyBody}</p>
          <Link href={`/${locale}/courses`} className="btn-secondary mt-2">
            {t.student.enrollments.emptyCta}
          </Link>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-10 grid gap-6 lg:grid-cols-2">
          {enrollments.map((enrollment) => {
            const theme = themeForSlug(enrollment.session.course.slug);
            const title = locale === 'fr' ? enrollment.session.course.titleFr : enrollment.session.course.titleEn;
            const schedule = locale === 'fr' ? enrollment.session.scheduleFr : enrollment.session.scheduleEn;
            const isCancelled = enrollment.status === 'CANCELLED';

            return (
              <MotionLi
                key={enrollment.id}
                variants={fadeUpItem}
                {...hoverLift}
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 ${
                  isCancelled ? '' : theme.cardHover
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[17px] font-semibold leading-snug text-ink">{title}</h2>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isCancelled ? 'bg-slate-100 text-slate-500' : theme.badge
                    }`}
                  >
                    {(() => {
                      const StatusIcon = statusTheme[enrollment.status].icon;
                      return <StatusIcon className="h-3 w-3" />;
                    })()}
                    {t.student.enrollments.statusLabels[enrollment.status]}
                  </span>
                </div>

                <p className="mt-2 text-sm text-ink-muted">{formatDate(enrollment.session.startDate, locale)}</p>

                {!isCancelled && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <MotionDiv
                        className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${PROGRESS[enrollment.status]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted">
                      {PIPELINE.map((step) => (
                        <span key={step} className={step === enrollment.status ? `font-semibold ${theme.text}` : ''}>
                          {t.student.enrollments.statusLabels[step]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <dl className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">{t.student.enrollments.scheduleLabel}</dt>
                    <dd className="text-right font-medium text-ink">{schedule}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">{t.student.enrollments.locationLabel}</dt>
                    <dd className="text-right font-medium text-ink">
                      {enrollment.session.location ?? t.student.enrollments.onlineLabel}
                    </dd>
                  </div>
                  {enrollment.session.teacher && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">{t.student.enrollments.teacherLabel}</dt>
                      <dd className="text-right font-medium text-ink">
                        {enrollment.session.teacher.firstName} {enrollment.session.teacher.lastName}
                      </dd>
                    </div>
                  )}
                </dl>

                {enrollment.status === 'COMPLETED' && enrollment.certificate && (
                  <button
                    type="button"
                    onClick={() => handleDownload(enrollment)}
                    disabled={downloadingId === enrollment.id}
                    className="btn-primary mt-5 w-full"
                  >
                    {downloadingId === enrollment.id ? (
                      <SpinnerIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <DownloadIcon />
                    )}
                    {downloadingId === enrollment.id
                      ? t.student.enrollments.downloading
                      : t.student.enrollments.downloadCertificate}
                  </button>
                )}
              </MotionLi>
            );
          })}
        </MotionUl>
      )}
    </div>
  );
}
