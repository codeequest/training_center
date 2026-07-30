'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { CalendarIcon, PencilIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import Modal from '@/components/modal';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import {
  createSession,
  deleteSession,
  listAdminCourses,
  listAdminSessions,
  listAdminUsers,
  updateSession,
  type AdminCourse,
  type AdminSession,
  type AdminUser,
  type SessionInput,
  type SessionMode,
  type SessionStatus,
} from '@/lib/admin-api';

const MODES: SessionMode[] = ['ONSITE', 'ONLINE', 'HYBRID'];
const STATUSES: SessionStatus[] = ['PLANNED', 'OPEN', 'FULL', 'RUNNING', 'DONE', 'CANCELLED'];

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminSessionsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSession | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listAdminCourses().then(({ courses: fetched }) => setCourses(fetched));
    listAdminUsers({ role: 'TEACHER' }).then(({ users: fetched }) => setTeachers(fetched));
  }, []);

  function load() {
    listAdminSessions({ courseId: courseFilter || undefined, status: statusFilter || undefined })
      .then(({ sessions: fetched }) => setSessions(fetched))
      .catch((caught) => {
        setSessions([]);
        setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilter, statusFilter]);

  function handleCreated(session: AdminSession) {
    setSessions((prev) => (prev ? [session, ...prev] : [session]));
    setCreateOpen(false);
  }

  function handleUpdated(session: AdminSession) {
    setSessions((prev) => prev?.map((s) => (s.id === session.id ? session : s)) ?? prev);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteSession(deleteTarget.id);
      setSessions((prev) => prev?.filter((s) => s.id !== deleteTarget.id) ?? prev);
      setDeleteTarget(null);
    } catch (caught) {
      setDeleteError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  return (
    <div>
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.sessions.title}</h1>
          <p className="mt-2 text-[15px] text-ink-muted">{t.admin.sessions.subtitle}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary" disabled={courses.length === 0}>
          <PlusIcon />
          {t.admin.sessions.createCta}
        </button>
      </MotionDiv>

      <div className="mt-8 flex flex-wrap gap-3">
        <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="field-input mt-0 w-auto">
          <option value="">{t.admin.sessions.filterCourseAll}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {locale === 'fr' ? course.titleFr : course.titleEn}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as SessionStatus | '')} className="field-input mt-0 w-auto">
          <option value="">{t.admin.sessions.filterStatusAll}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t.admin.sessions.statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {sessions === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-genai-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <CalendarIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.admin.sessions.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.admin.sessions.emptyBody}</p>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <MotionLi key={session.id} variants={fadeUpItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink">
                  {locale === 'fr' ? session.course.titleFr : session.course.titleEn}
                </p>
                <span className="shrink-0 rounded-full bg-genai-50 px-2.5 py-1 text-[11px] font-semibold text-genai-700">
                  {t.admin.sessions.statusLabels[session.status]}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {formatDate(session.startDate, locale)} → {formatDate(session.endDate, locale)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {t.admin.sessions.teacherLabel}: {session.teacher ? `${session.teacher.firstName} ${session.teacher.lastName}` : t.admin.sessions.noTeacher}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {session._count.enrollments} / {session.capacity} {t.admin.sessions.enrollmentsCount}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditTarget(session)} className="btn-secondary text-xs">
                  <PencilIcon className="h-3.5 w-3.5" />
                  {t.admin.common.edit}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(session)}
                  className="ml-auto rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={t.admin.common.delete}
                >
                  <TrashIcon />
                </button>
              </div>
            </MotionLi>
          ))}
        </MotionUl>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.admin.sessions.createTitle} wide>
        <SessionForm t={t} courses={courses} teachers={teachers} onCreated={handleCreated} />
      </Modal>

      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={t.admin.sessions.editTitle} wide>
        {editTarget && <SessionForm t={t} courses={courses} teachers={teachers} existing={editTarget} onUpdated={handleUpdated} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={t.admin.common.confirmDeleteTitle}
        body={t.admin.sessions.deleteConfirmBody}
        confirmLabel={t.admin.common.confirmDeleteLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={deleteError}
      />
    </div>
  );
}

function SessionForm({
  t,
  courses,
  teachers,
  existing,
  onCreated,
  onUpdated,
}: {
  t: Dictionary;
  courses: AdminCourse[];
  teachers: AdminUser[];
  existing?: AdminSession;
  onCreated?: (session: AdminSession) => void;
  onUpdated?: (session: AdminSession) => void;
}) {
  const [values, setValues] = useState({
    courseId: existing?.courseId ?? courses[0]?.id ?? '',
    teacherId: existing?.teacherId ?? '',
    startDate: existing ? toLocalInput(existing.startDate) : '',
    endDate: existing ? toLocalInput(existing.endDate) : '',
    scheduleFr: existing?.scheduleFr ?? '',
    scheduleEn: existing?.scheduleEn ?? '',
    mode: existing?.mode ?? ('ONSITE' as SessionMode),
    location: existing?.location ?? '',
    meetingUrl: existing?.meetingUrl ?? '',
    capacity: existing?.capacity ?? 15,
    status: existing?.status ?? ('OPEN' as SessionStatus),
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (new Date(values.endDate) < new Date(values.startDate)) {
      setError(t.admin.sessions.endBeforeStart);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SessionInput = {
        courseId: values.courseId,
        teacherId: values.teacherId || null,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        scheduleFr: values.scheduleFr,
        scheduleEn: values.scheduleEn,
        mode: values.mode,
        location: values.location || null,
        meetingUrl: values.meetingUrl || null,
        capacity: values.capacity,
        status: values.status,
      };
      if (existing) {
        const { session } = await updateSession(existing.id, payload);
        onUpdated?.(session);
      } else {
        const { session } = await createSession(payload);
        onCreated?.(session);
      }
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.courseLabel}</label>
          <select
            value={values.courseId}
            onChange={(event) => setValues((prev) => ({ ...prev, courseId: event.target.value }))}
            className="field-input"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.titleFr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.teacherLabel}</label>
          <select
            value={values.teacherId}
            onChange={(event) => setValues((prev) => ({ ...prev, teacherId: event.target.value }))}
            className="field-input"
          >
            <option value="">{t.admin.sessions.noTeacher}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.startDateLabel}</label>
          <input
            type="datetime-local"
            value={values.startDate}
            onChange={(event) => setValues((prev) => ({ ...prev, startDate: event.target.value }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.endDateLabel}</label>
          <input
            type="datetime-local"
            value={values.endDate}
            onChange={(event) => setValues((prev) => ({ ...prev, endDate: event.target.value }))}
            className="field-input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.scheduleFrLabel}</label>
          <input
            value={values.scheduleFr}
            onChange={(event) => setValues((prev) => ({ ...prev, scheduleFr: event.target.value }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.scheduleEnLabel}</label>
          <input
            value={values.scheduleEn}
            onChange={(event) => setValues((prev) => ({ ...prev, scheduleEn: event.target.value }))}
            className="field-input"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-muted">{t.admin.sessions.scheduleHint}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.modeLabel}</label>
          <select
            value={values.mode}
            onChange={(event) => setValues((prev) => ({ ...prev, mode: event.target.value as SessionMode }))}
            className="field-input"
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {t.admin.sessions.modeLabels[mode]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.capacityLabel}</label>
          <input
            type="number"
            min={1}
            value={values.capacity}
            onChange={(event) => setValues((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.statusLabel}</label>
          <select
            value={values.status}
            onChange={(event) => setValues((prev) => ({ ...prev, status: event.target.value as SessionStatus }))}
            className="field-input"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.admin.sessions.statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.locationLabel}</label>
          <input
            value={values.location}
            onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.sessions.meetingUrlLabel}</label>
          <input
            value={values.meetingUrl}
            onChange={(event) => setValues((prev) => ({ ...prev, meetingUrl: event.target.value }))}
            className="field-input"
          />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? t.admin.common.saving : existing ? t.admin.common.save : t.admin.common.create}
      </button>
    </form>
  );
}
