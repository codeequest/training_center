'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { DocumentIcon, SearchIcon, SpinnerIcon, TrashIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import {
  deleteEnrollment,
  issueCertificate,
  listAdminEnrollments,
  updateEnrollment,
  type AdminEnrollment,
  type EnrollmentStatus,
} from '@/lib/admin-api';
import { statusOrder, statusTheme } from '@/lib/status-theme';
import { useAdmin } from '../admin-context';

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' }).format(new Date(value));
}

const NEXT_STATUS: Partial<Record<EnrollmentStatus, EnrollmentStatus>> = {
  REQUESTED: 'CONFIRMED',
  CONFIRMED: 'PAID',
  PAID: 'COMPLETED',
};

export default function AdminEnrollmentsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);
  const { refreshBadges } = useAdmin();

  const [enrollments, setEnrollments] = useState<AdminEnrollment[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminEnrollment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
    setEnrollments(null);
    listAdminEnrollments({ status: statusFilter || undefined, search: search || undefined })
      .then(({ enrollments: fetched }) => setEnrollments(fetched))
      .catch((caught) => {
        setEnrollments([]);
        setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function withPending<T>(id: string, fn: () => Promise<T>): Promise<T> {
    setPendingIds((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  async function handleStatusChange(enrollment: AdminEnrollment, status: EnrollmentStatus) {
    setError(null);
    try {
      const { enrollment: updated } = await withPending(enrollment.id, () => updateEnrollment(enrollment.id, { status }));
      setEnrollments((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? prev);
      refreshBadges();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  async function handleIssueCertificate(enrollment: AdminEnrollment) {
    setError(null);
    try {
      await withPending(enrollment.id, () => issueCertificate(enrollment.id));
      setEnrollments((prev) => prev?.map((e) => (e.id === enrollment.id ? { ...e, status: e.status } : e)) ?? prev);
      load();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  async function handleNotesSave(enrollment: AdminEnrollment, notes: string) {
    setError(null);
    try {
      const { enrollment: updated } = await withPending(enrollment.id, () =>
        updateEnrollment(enrollment.id, { adminNotes: notes })
      );
      setEnrollments((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? prev);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteEnrollment(deleteTarget.id);
      setEnrollments((prev) => prev?.filter((e) => e.id !== deleteTarget.id) ?? prev);
      setDeleteTarget(null);
      refreshBadges();
    } catch (caught) {
      setDeleteError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.enrollments.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.admin.enrollments.subtitle}</p>
      </MotionDiv>

      <div className="mt-8 flex flex-wrap gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
          className="relative flex-1 min-w-[220px]"
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.admin.enrollments.searchPlaceholder}
            className="field-input pl-9"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as EnrollmentStatus | '')}
          className="field-input mt-0 w-auto"
        >
          <option value="">{t.admin.enrollments.statusFilterAll}</option>
          {statusOrder.map((status) => (
            <option key={status} value={status}>
              {t.admin.enrollments.statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {enrollments === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-genai-600" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <DocumentIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.admin.enrollments.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.admin.enrollments.emptyBody}</p>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-8 grid gap-5 lg:grid-cols-2">
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              locale={locale}
              t={t}
              isPending={pendingIds.has(enrollment.id)}
              onStatusChange={(status) => handleStatusChange(enrollment, status)}
              onIssueCertificate={() => handleIssueCertificate(enrollment)}
              onSaveNotes={(notes) => handleNotesSave(enrollment, notes)}
              onDelete={() => setDeleteTarget(enrollment)}
            />
          ))}
        </MotionUl>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={t.admin.common.confirmDeleteTitle}
        body={t.admin.enrollments.deleteConfirmBody}
        confirmLabel={t.admin.common.confirmDeleteLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={deleteError}
      />
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  locale,
  t,
  isPending,
  onStatusChange,
  onIssueCertificate,
  onSaveNotes,
  onDelete,
}: {
  enrollment: AdminEnrollment;
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
  isPending: boolean;
  onStatusChange: (status: EnrollmentStatus) => void;
  onIssueCertificate: () => void;
  onSaveNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(enrollment.adminNotes ?? '');
  const theme = statusTheme[enrollment.status];
  const title = locale === 'fr' ? enrollment.session.course.titleFr : enrollment.session.course.titleEn;
  const nextStatus = NEXT_STATUS[enrollment.status];

  const actionLabel = useMemo(() => {
    switch (nextStatus) {
      case 'CONFIRMED':
        return t.admin.enrollments.actionConfirm;
      case 'PAID':
        return t.admin.enrollments.actionMarkPaid;
      case 'COMPLETED':
        return t.admin.enrollments.actionComplete;
      default:
        return null;
    }
  }, [nextStatus, t]);

  return (
    <MotionLi variants={fadeUpItem} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">{enrollment.requesterName}</h2>
          <p className="text-sm text-ink-muted">{enrollment.requesterEmail}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}>
          {t.admin.enrollments.statusLabels[enrollment.status]}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-xs text-ink-muted">{formatDate(enrollment.session.startDate, locale)}</p>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        {enrollment.requesterPhone && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">{t.admin.enrollments.phoneLabel}</dt>
            <dd className="font-medium text-ink">{enrollment.requesterPhone}</dd>
          </div>
        )}
        {enrollment.company && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-muted">{t.admin.enrollments.companyLabel}</dt>
            <dd className="font-medium text-ink">{enrollment.company}</dd>
          </div>
        )}
      </dl>

      {enrollment.message && (
        <p className="mt-3 rounded-lg border border-slate-100 bg-white p-3 text-xs text-ink-muted">{enrollment.message}</p>
      )}

      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t.admin.enrollments.notesLabel}
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t.admin.enrollments.notesPlaceholder}
          rows={2}
          className="field-input"
        />
        {notes !== (enrollment.adminNotes ?? '') && (
          <button type="button" onClick={() => onSaveNotes(notes)} className="btn-secondary mt-2 text-xs" disabled={isPending}>
            {t.admin.enrollments.saveNotes}
          </button>
        )}
      </div>

      {enrollment.status === 'COMPLETED' && (
        <div className="mt-4">
          {enrollment.certificate ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              {t.admin.enrollments.certificateIssued} — {t.admin.enrollments.certificateSerial}: {enrollment.certificate.serialNumber}
            </p>
          ) : (
            <button type="button" onClick={onIssueCertificate} disabled={isPending} className="btn-secondary w-full text-sm">
              {isPending ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : null}
              {t.admin.enrollments.issueCertificate}
            </button>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        {actionLabel && nextStatus && (
          <button
            type="button"
            onClick={() => onStatusChange(nextStatus)}
            disabled={isPending}
            className="btn-primary text-sm"
          >
            {isPending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {actionLabel}
          </button>
        )}
        {enrollment.status !== 'CANCELLED' && enrollment.status !== 'COMPLETED' && (
          <button
            type="button"
            onClick={() => onStatusChange('CANCELLED')}
            disabled={isPending}
            className="btn-secondary text-sm"
          >
            {t.admin.enrollments.actionCancel}
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={t.admin.common.delete}
        >
          <TrashIcon />
        </button>
      </div>
    </MotionLi>
  );
}
