'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { BookIcon, PencilIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import Modal from '@/components/modal';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import {
  createCourse,
  deleteCourse,
  listAdminCourses,
  updateCourse,
  type AdminCourse,
  type AdminModule,
  type CourseInput,
  type CourseLevel,
} from '@/lib/admin-api';

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyModule(position: number): AdminModule {
  return { position, titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '' };
}

function emptyCourse(): CourseInput {
  return {
    slug: '',
    titleFr: '',
    titleEn: '',
    summaryFr: '',
    summaryEn: '',
    descriptionFr: '',
    descriptionEn: '',
    audienceFr: '',
    audienceEn: '',
    prerequisitesFr: '',
    prerequisitesEn: '',
    level: 'BEGINNER',
    durationHours: 21,
    price: 0,
    currency: 'TND',
    coverImageUrl: '',
    accentColor: '#0F766E',
    isPublished: true,
    sortOrder: 0,
    modules: [],
  };
}

export default function AdminCoursesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [courses, setCourses] = useState<AdminCourse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCourse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
    listAdminCourses()
      .then(({ courses: fetched }) => setCourses(fetched))
      .catch((caught) => {
        setCourses([]);
        setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreated(course: AdminCourse) {
    setCourses((prev) => (prev ? [course, ...prev] : [course]));
    setCreateOpen(false);
  }

  function handleUpdated(course: AdminCourse) {
    setCourses((prev) => prev?.map((c) => (c.id === course.id ? course : c)) ?? prev);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteCourse(deleteTarget.id);
      setCourses((prev) => prev?.filter((c) => c.id !== deleteTarget.id) ?? prev);
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
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.courses.title}</h1>
          <p className="mt-2 text-[15px] text-ink-muted">{t.admin.courses.subtitle}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <PlusIcon />
          {t.admin.courses.createCta}
        </button>
      </MotionDiv>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {courses === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-genai-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <BookIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.admin.courses.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.admin.courses.emptyBody}</p>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <MotionLi key={course.id} variants={fadeUpItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: course.accentColor }}>
                  <BookIcon className="h-5 w-5" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    course.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {course.isPublished ? t.admin.common.published : t.admin.common.unpublished}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink">
                {locale === 'fr' ? course.titleFr : course.titleEn}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {t.admin.courses.levelLabels[course.level]} · {course.durationHours}h · {Number(course.price)} {course.currency}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {course._count.sessions} {t.admin.courses.sessionsCount} · {course._count.modules} {t.admin.courses.modulesCount}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditTarget(course)} className="btn-secondary text-xs">
                  <PencilIcon className="h-3.5 w-3.5" />
                  {t.admin.common.edit}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(course)}
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.admin.courses.createTitle} wide>
        <CourseForm t={t} onCreated={handleCreated} />
      </Modal>

      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={t.admin.courses.editTitle} wide>
        {editTarget && <CourseForm t={t} existing={editTarget} onUpdated={handleUpdated} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={t.admin.common.confirmDeleteTitle}
        body={t.admin.courses.deleteConfirmBody}
        confirmLabel={t.admin.common.confirmDeleteLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={deleteError}
      />
    </div>
  );
}

function CourseForm({
  t,
  existing,
  onCreated,
  onUpdated,
}: {
  t: Dictionary;
  existing?: AdminCourse;
  onCreated?: (course: AdminCourse) => void;
  onUpdated?: (course: AdminCourse) => void;
}) {
  const [values, setValues] = useState<CourseInput>(
    existing
      ? {
          slug: existing.slug,
          titleFr: existing.titleFr,
          titleEn: existing.titleEn,
          summaryFr: existing.summaryFr,
          summaryEn: existing.summaryEn,
          descriptionFr: existing.descriptionFr,
          descriptionEn: existing.descriptionEn,
          audienceFr: existing.audienceFr,
          audienceEn: existing.audienceEn,
          prerequisitesFr: existing.prerequisitesFr,
          prerequisitesEn: existing.prerequisitesEn,
          level: existing.level,
          durationHours: existing.durationHours,
          price: Number(existing.price),
          currency: existing.currency,
          coverImageUrl: existing.coverImageUrl ?? '',
          accentColor: existing.accentColor,
          isPublished: existing.isPublished,
          sortOrder: existing.sortOrder,
          modules: existing.modules ?? [],
        }
      : emptyCourse()
  );
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addModule() {
    set('modules', [...values.modules, emptyModule(values.modules.length + 1)]);
  }

  function removeModule(index: number) {
    set(
      'modules',
      values.modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, position: i + 1 }))
    );
  }

  function updateModule(index: number, patch: Partial<AdminModule>) {
    set(
      'modules',
      values.modules.map((m, i) => (i === index ? { ...m, ...patch } : m))
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSlugError(null);

    if (!SLUG_RE.test(values.slug)) {
      setSlugError(t.admin.courses.slugInvalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CourseInput = { ...values, coverImageUrl: values.coverImageUrl || null };
      if (existing) {
        const { course } = await updateCourse(existing.id, payload);
        onUpdated?.(course);
      } else {
        const { course } = await createCourse(payload);
        onCreated?.(course);
      }
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.slugLabel}</label>
          <input
            value={values.slug}
            onChange={(event) => set('slug', event.target.value)}
            className={`field-input ${slugError ? 'field-input-error' : ''}`}
          />
          <p className="mt-1.5 text-xs text-ink-muted">{slugError ?? t.admin.courses.slugHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.levelLabel}</label>
          <select value={values.level} onChange={(event) => set('level', event.target.value as CourseLevel)} className="field-input">
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {t.admin.courses.levelLabels[level]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={t.admin.courses.titleFrLabel} value={values.titleFr} onChange={(v) => set('titleFr', v)} />
        <TextField label={t.admin.courses.titleEnLabel} value={values.titleEn} onChange={(v) => set('titleEn', v)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label={t.admin.courses.summaryFrLabel} value={values.summaryFr} onChange={(v) => set('summaryFr', v)} rows={2} />
        <TextArea label={t.admin.courses.summaryEnLabel} value={values.summaryEn} onChange={(v) => set('summaryEn', v)} rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label={t.admin.courses.descriptionFrLabel} value={values.descriptionFr} onChange={(v) => set('descriptionFr', v)} rows={4} />
        <TextArea label={t.admin.courses.descriptionEnLabel} value={values.descriptionEn} onChange={(v) => set('descriptionEn', v)} rows={4} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label={t.admin.courses.audienceFrLabel} value={values.audienceFr} onChange={(v) => set('audienceFr', v)} rows={2} />
        <TextArea label={t.admin.courses.audienceEnLabel} value={values.audienceEn} onChange={(v) => set('audienceEn', v)} rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label={t.admin.courses.prerequisitesFrLabel} value={values.prerequisitesFr} onChange={(v) => set('prerequisitesFr', v)} rows={2} />
        <TextArea label={t.admin.courses.prerequisitesEnLabel} value={values.prerequisitesEn} onChange={(v) => set('prerequisitesEn', v)} rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.durationLabel}</label>
          <input
            type="number"
            min={1}
            value={values.durationHours}
            onChange={(event) => set('durationHours', Number(event.target.value))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.priceLabel}</label>
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(event) => set('price', Number(event.target.value))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.currencyLabel}</label>
          <input value={values.currency} onChange={(event) => set('currency', event.target.value)} className="field-input" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.accentColorLabel}</label>
          <input type="color" value={values.accentColor} onChange={(event) => set('accentColor', event.target.value)} className="field-input h-11 p-1" />
        </div>
        <TextField label={t.admin.courses.coverImageLabel} value={values.coverImageUrl ?? ''} onChange={(v) => set('coverImageUrl', v)} />
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.courses.sortOrderLabel}</label>
          <input
            type="number"
            value={values.sortOrder}
            onChange={(event) => set('sortOrder', Number(event.target.value))}
            className="field-input"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(event) => set('isPublished', event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-genai-600 focus:ring-genai-500"
        />
        {t.admin.courses.publishedLabel}
      </label>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{t.admin.courses.modulesTitle}</h3>
          <button type="button" onClick={addModule} className="btn-secondary text-xs">
            <PlusIcon className="h-3.5 w-3.5" />
            {t.admin.courses.addModule}
          </button>
        </div>

        {values.modules.length === 0 ? (
          <p className="mt-3 text-xs text-ink-muted">{t.admin.courses.modulesEmpty}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {values.modules.map((module, index) => (
              <div key={index} className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-muted">
                    {t.admin.courses.modulePosition} {module.position}
                  </span>
                  <button type="button" onClick={() => removeModule(index)} className="text-xs font-semibold text-red-600 hover:underline">
                    {t.admin.courses.removeModule}
                  </button>
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <TextField label={t.admin.courses.moduleTitleFr} value={module.titleFr} onChange={(v) => updateModule(index, { titleFr: v })} />
                  <TextField label={t.admin.courses.moduleTitleEn} value={module.titleEn} onChange={(v) => updateModule(index, { titleEn: v })} />
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <TextArea rows={2} label={t.admin.courses.moduleDescFr} value={module.descriptionFr} onChange={(v) => updateModule(index, { descriptionFr: v })} />
                  <TextArea rows={2} label={t.admin.courses.moduleDescEn} value={module.descriptionEn} onChange={(v) => updateModule(index, { descriptionEn: v })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? t.admin.common.saving : existing ? t.admin.common.save : t.admin.common.create}
      </button>
    </form>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="field-input" />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="field-input" />
    </div>
  );
}
