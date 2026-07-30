'use client';

import { useState, type FormEvent } from 'react';

import { apiFetch, ApiRequestError } from '@/lib/api';
import type { Dictionary } from '@/i18n/dictionaries';
import { useTeacher } from '../teacher-context';
import type { TeacherProfile } from '../types';

const emptyProfile: TeacherProfile = {
  headlineFr: '',
  headlineEn: '',
  bioFr: '',
  bioEn: '',
  certifications: [],
  linkedinUrl: '',
  yearsExperience: 0,
  isPublished: true,
};

export default function ProfileForm({ t }: { t: Dictionary }) {
  const { user, token, refreshUser } = useTeacher();
  const [form, setForm] = useState<TeacherProfile>(user.teacherProfile ?? emptyProfile);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isFirstTime = !user.teacherProfile;

  function updateField<K extends keyof TeacherProfile>(key: K, value: TeacherProfile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCertification(index: number, value: string) {
    setForm((current) => {
      const certifications = [...current.certifications];
      certifications[index] = value;
      return { ...current, certifications };
    });
  }

  function addCertification() {
    if (form.certifications.length >= 20) return;
    setForm((current) => ({ ...current, certifications: [...current.certifications, ''] }));
  }

  function removeCertification(index: number) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const payload = {
        headlineFr: form.headlineFr,
        headlineEn: form.headlineEn,
        bioFr: form.bioFr,
        bioEn: form.bioEn,
        certifications: form.certifications.map((c) => c.trim()).filter(Boolean),
        linkedinUrl: form.linkedinUrl?.trim() ? form.linkedinUrl.trim() : null,
        yearsExperience: Number(form.yearsExperience),
        isPublished: form.isPublished,
      };

      await apiFetch<{ teacherProfile: TeacherProfile }>('/me/teacher-profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      setSaved(true);
      await refreshUser();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.teacher.profile.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="animate-fade-up">
        <p className="eyebrow">{t.teacher.nav.profile}</p>
        <h2 className="section-title">{t.teacher.profile.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{t.teacher.profile.subtitle}</p>
      </div>

      {isFirstTime && (
        <p className="mt-6 animate-fade-up rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {t.teacher.profile.firstTimeNotice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="panel mt-6 animate-fade-up space-y-6">
        {error && <p className="field-error">{error}</p>}
        {saved && (
          <p className="animate-scale-in rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ {t.teacher.profile.saved}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="headlineFr">
              {t.teacher.profile.headlineFrLabel}
            </label>
            <input
              id="headlineFr"
              value={form.headlineFr}
              onChange={(e) => updateField('headlineFr', e.target.value)}
              className="field-input"
              maxLength={160}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="headlineEn">
              {t.teacher.profile.headlineEnLabel}
            </label>
            <input
              id="headlineEn"
              value={form.headlineEn}
              onChange={(e) => updateField('headlineEn', e.target.value)}
              className="field-input"
              maxLength={160}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="bioFr">
              {t.teacher.profile.bioFrLabel}
            </label>
            <textarea
              id="bioFr"
              value={form.bioFr}
              onChange={(e) => updateField('bioFr', e.target.value)}
              className="field-input min-h-[120px]"
              maxLength={4000}
            />
            <p className="mt-1 text-xs text-ink-muted">{t.teacher.profile.bioHint}</p>
          </div>
          <div>
            <label className="field-label" htmlFor="bioEn">
              {t.teacher.profile.bioEnLabel}
            </label>
            <textarea
              id="bioEn"
              value={form.bioEn}
              onChange={(e) => updateField('bioEn', e.target.value)}
              className="field-input min-h-[120px]"
              maxLength={4000}
            />
            <p className="mt-1 text-xs text-ink-muted">{t.teacher.profile.bioHint}</p>
          </div>
        </div>

        <div>
          <label className="field-label">{t.teacher.profile.certificationsLabel}</label>
          <p className="mt-1 text-xs text-ink-muted">{t.teacher.profile.certificationsHint}</p>
          <div className="mt-3 space-y-2">
            {form.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={cert}
                  onChange={(e) => updateCertification(index, e.target.value)}
                  placeholder={t.teacher.profile.certificationPlaceholder}
                  className="field-input mt-0"
                  maxLength={80}
                />
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  {t.teacher.profile.removeCertification}
                </button>
              </div>
            ))}
          </div>
          {form.certifications.length < 20 && (
            <button type="button" onClick={addCertification} className="btn-secondary mt-3">
              {t.teacher.profile.addCertification}
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="linkedinUrl">
              {t.teacher.profile.linkedinLabel} <span className="text-ink-muted">({t.teacher.common.optional})</span>
            </label>
            <input
              id="linkedinUrl"
              value={form.linkedinUrl ?? ''}
              onChange={(e) => updateField('linkedinUrl', e.target.value)}
              placeholder={t.teacher.profile.linkedinPlaceholder}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="yearsExperience">
              {t.teacher.profile.yearsLabel}
            </label>
            <input
              id="yearsExperience"
              type="number"
              min={0}
              max={60}
              value={form.yearsExperience}
              onChange={(e) => updateField('yearsExperience', Number(e.target.value))}
              className="field-input"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => updateField('isPublished', e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600/40"
          />
          <span>
            <span className="block text-sm font-medium text-ink">{t.teacher.profile.publishedLabel}</span>
            <span className="block text-xs text-ink-muted">{t.teacher.profile.publishedHint}</span>
          </span>
        </label>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t.teacher.profile.saving : t.teacher.profile.save}
        </button>
      </form>
    </div>
  );
}
