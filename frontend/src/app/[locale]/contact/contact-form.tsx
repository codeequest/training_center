'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useState, type FormEvent } from 'react';

import { CheckCircleIcon, SpinnerIcon } from '@/components/icons';
import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  website: string;
}

type FieldErrors = Partial<Record<keyof Omit<FormValues, 'website'>, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialValues: FormValues = { name: '', email: '', phone: '', subject: '', body: '', website: '' };

export default function ContactForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shakeControls = useAnimationControls();

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (values.name.trim().length < 2) next.name = t.contact.nameRequired;
    if (!values.email.trim()) next.email = t.contact.emailRequired;
    else if (!EMAIL_RE.test(values.email)) next.email = t.contact.emailInvalid;
    if (values.subject.trim().length < 3) next.subject = t.contact.subjectRequired;
    if (values.body.trim().length < 10) next.body = t.contact.bodyRequired;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = validate();
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          subject: values.subject,
          body: values.body,
          website: values.website,
        }),
      });
      setIsSuccess(true);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        if (caught.details && caught.details.length > 0) {
          const mapped: FieldErrors = {};
          for (const detail of caught.details) {
            if (detail.field in initialValues) mapped[detail.field as keyof FieldErrors] = detail.message;
          }
          setFieldErrors(mapped);
        }
        setError(caught.message || t.contact.genericError);
      } else {
        setError(t.contact.networkError);
      }
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3 py-10 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <CheckCircleIcon className="h-9 w-9" />
        </motion.span>
        <p className="text-lg font-semibold text-ink">{t.contact.successTitle}</p>
        <p className="max-w-xs text-sm text-ink-muted">{t.contact.successBody}</p>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setIsSuccess(false);
          }}
          className="btn-secondary mt-2"
        >
          {t.contact.successCta}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form onSubmit={handleSubmit} animate={shakeControls} className="space-y-5" noValidate>
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Piège anti-robot : invisible et ignoré par les humains, ne pas retirer. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => update('website', event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label={t.contact.nameLabel}
          placeholder={t.contact.namePlaceholder}
          value={values.name}
          error={fieldErrors.name}
          onChange={(v) => update('name', v)}
        />
        <Field
          id="email"
          type="email"
          label={t.contact.emailLabel}
          placeholder={t.contact.emailPlaceholder}
          value={values.email}
          error={fieldErrors.email}
          onChange={(v) => update('email', v)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="phone"
          type="tel"
          label={t.contact.phoneLabel}
          placeholder={t.contact.phonePlaceholder}
          value={values.phone}
          onChange={(v) => update('phone', v)}
        />
        <Field
          id="subject"
          label={t.contact.subjectLabel}
          placeholder={t.contact.subjectPlaceholder}
          value={values.subject}
          error={fieldErrors.subject}
          onChange={(v) => update('subject', v)}
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-ink">
          {t.contact.bodyLabel}
        </label>
        <textarea
          id="body"
          rows={5}
          value={values.body}
          onChange={(event) => update('body', event.target.value)}
          placeholder={t.contact.bodyPlaceholder}
          className={`field-input resize-none ${fieldErrors.body ? 'field-input-error' : ''}`}
        />
        <FieldError message={fieldErrors.body} />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? t.contact.submitting : t.contact.submit}
      </button>
    </motion.form>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  error,
  type = 'text',
  onChange,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`field-input ${error ? 'field-input-error' : ''}`}
      />
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1.5 text-xs text-red-600"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
