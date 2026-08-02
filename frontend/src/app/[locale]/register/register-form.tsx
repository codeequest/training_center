'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { ApiRequestError, apiFetch } from '@/lib/api';
import { CheckIcon, SpinnerIcon } from '@/components/icons';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9 ()-]{6,20}$/;

interface SessionOption {
  id: string;
  startDate: string;
  endDate: string;
  scheduleFr: string;
  scheduleEn: string;
  capacity: number;
  _count: { enrollments: number };
  course: { id: string; titleFr: string; titleEn: string; accentColor: string };
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sessionId: string;
  company: string;
  message: string;
  consent: boolean;
  website: string; // champ leurre anti-robot, doit rester vide
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sessionId: '',
  company: '',
  message: '',
  consent: false,
  website: '',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function RegisterForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sessions, setSessions] = useState<SessionOption[] | null>(null);
  const [sessionsError, setSessionsError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ sessions: SessionOption[] }>('/sessions/upcoming')
      .then((data) => {
        if (!cancelled) setSessions(data.sessions);
      })
      .catch(() => {
        if (!cancelled) setSessionsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' }),
    [locale]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (form.firstName.trim().length < 2) next.firstName = t.register.errors.required;
    if (form.lastName.trim().length < 2) next.lastName = t.register.errors.required;
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = t.register.errors.invalidEmail;
    if (!PHONE_REGEX.test(form.phone.trim())) next.phone = t.register.errors.invalidPhone;
    if (!form.sessionId) next.sessionId = t.register.errors.formationRequired;
    if (!form.consent) next.consent = t.register.errors.consentRequired;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/enrollments/request', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: form.sessionId,
          requesterName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          requesterEmail: form.email.trim(),
          requesterPhone: form.phone.trim(),
          company: form.company.trim() || undefined,
          message: form.message.trim() || undefined,
          website: form.website,
        }),
      });
      setIsDone(true);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setSubmitError(caught.message || t.register.genericError);
      } else {
        setSubmitError(t.register.networkError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="animate-scale-in rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-ink">{t.register.successTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.register.successBody}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setForm(initialState);
              setIsDone(false);
            }}
            className="btn-secondary"
          >
            {t.register.backToForm}
          </button>
          <a href={`/${locale}`} className="btn-primary">
            {t.register.backHome}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <p
          role="alert"
          className="animate-shake rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {submitError}
        </p>
      )}

      {/* Champ leurre : invisible et ignoré par les humains, rempli par les robots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update('website', event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label={t.register.firstNameLabel}
          placeholder={t.register.firstNamePlaceholder}
          value={form.firstName}
          onChange={(value) => update('firstName', value)}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Field
          id="lastName"
          label={t.register.lastNameLabel}
          placeholder={t.register.lastNamePlaceholder}
          value={form.lastName}
          onChange={(value) => update('lastName', value)}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="email"
          type="email"
          label={t.register.emailLabel}
          placeholder={t.register.emailPlaceholder}
          value={form.email}
          onChange={(value) => update('email', value)}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          id="phone"
          type="tel"
          label={t.register.phoneLabel}
          placeholder={t.register.phonePlaceholder}
          value={form.phone}
          onChange={(value) => update('phone', value)}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="sessionId" className="block text-sm font-medium text-ink">
          {t.register.formationLabel}
        </label>
        <select
          id="sessionId"
          value={form.sessionId}
          onChange={(event) => update('sessionId', event.target.value)}
          disabled={!sessions || sessions.length === 0}
          className={`mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-ink focus:outline-none
                     focus:ring-2 focus:ring-brand-600/20 disabled:bg-slate-50 disabled:text-slate-400
                     ${errors.sessionId ? 'border-red-300' : 'border-slate-300 focus:border-brand-600'}`}
        >
          <option value="">
            {!sessions && !sessionsError
              ? t.register.loadingSessions
              : sessions && sessions.length === 0
                ? t.register.noSessionsAvailable
                : t.register.formationPlaceholder}
          </option>
          {sessions?.map((session) => {
            const spotsLeft = session.capacity - session._count.enrollments;
            const title = locale === 'fr' ? session.course.titleFr : session.course.titleEn;
            const schedule = locale === 'fr' ? session.scheduleFr : session.scheduleEn;
            return (
              <option key={session.id} value={session.id} disabled={spotsLeft <= 0}>
                {title} — {dateFormatter.format(new Date(session.startDate))} ({schedule})
                {spotsLeft <= 0 ? ' · complet' : ''}
              </option>
            );
          })}
        </select>
        {errors.sessionId && <p className="mt-1.5 animate-shake text-xs text-red-600">{errors.sessionId}</p>}
      </div>

      <Field
        id="company"
        label={t.register.companyLabel}
        placeholder={t.register.companyPlaceholder}
        value={form.company}
        onChange={(value) => update('company', value)}
        autoComplete="organization"
      />

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          {t.register.messageLabel}
        </label>
        <textarea
          id="message"
          rows={3}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder={t.register.messagePlaceholder}
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-ink
                     placeholder:text-slate-400 focus:border-brand-600 focus:outline-none
                     focus:ring-2 focus:ring-brand-600/20"
        />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => update('consent', event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-700 focus:ring-brand-600/40"
          />
          <span>{t.register.consentLabel}</span>
        </label>
        {errors.consent && <p className="mt-1.5 animate-shake text-xs text-red-600">{errors.consent}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <SpinnerIcon className="h-4 w-4" />}
        {isSubmitting ? t.register.submitting : t.register.submit}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`mt-2 w-full rounded-lg border px-4 py-2.5 text-sm text-ink placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-brand-600/20
                   ${error ? 'border-red-300' : 'border-slate-300 focus:border-brand-600'}`}
      />
      {error && <p className="mt-1.5 animate-shake text-xs text-red-600">{error}</p>}
    </div>
  );
}
