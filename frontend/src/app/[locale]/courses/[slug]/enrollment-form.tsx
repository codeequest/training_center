'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { CheckCircleIcon, SpinnerIcon } from '@/components/icons';
import { MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { ApiRequestError, apiFetch } from '@/lib/api';
import { themeForSlug } from '@/lib/course-theme';

export interface EnrollmentSession {
  id: string;
  startDate: string;
  schedule: string;
  mode: 'ONSITE' | 'ONLINE' | 'HYBRID';
  location: string | null;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  website: string;
}

type FieldErrors = Partial<Record<'session' | 'name' | 'email' | 'phone', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialValues: FormValues = { name: '', email: '', phone: '', company: '', message: '', website: '' };

/**
 * Demande d'inscription publique (POST /enrollments/request).
 *
 * La session n'est pas choisie dans une liste déroulante abstraite : chaque
 * session ouverte est une carte radio, si bien que le stagiaire s'inscrit à la
 * date qu'il a sous les yeux. Le statut initial reste REQUESTED — c'est
 * l'équipe du centre qui confirme, il n'y a aucun paiement en ligne.
 */
export default function EnrollmentForm({
  slug,
  sessions,
  locale,
  t,
}: {
  slug: string;
  sessions: EnrollmentSession[];
  locale: Locale;
  t: Dictionary;
}) {
  const theme = themeForSlug(slug);
  const copy = t.courseDetail.enroll;

  const [selected, setSelected] = useState<string | null>(sessions.length === 1 ? sessions[0].id : null);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  /** Lien de secours proposé sous l'erreur (session complète, doublon). */
  const [errorAction, setErrorAction] = useState<{ href: string; label: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shakeControls = useAnimationControls();

  const dateFormatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'long',
  });

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!selected) next.session = copy.pickSessionRequired;
    if (values.name.trim().length < 2) next.name = copy.nameRequired;
    if (!values.email.trim()) next.email = copy.emailRequired;
    else if (!EMAIL_RE.test(values.email)) next.email = copy.emailInvalid;
    // Le back-end tolère l'absence de téléphone, mais la confirmation se fait
    // par appel : sans numéro la demande est difficilement exploitable.
    if (values.phone.trim().length < 6) next.phone = copy.phoneRequired;
    return next;
  }

  function shake() {
    shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorAction(null);

    const validation = validate();
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      shake();
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/enrollments/request', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: selected,
          requesterName: values.name,
          requesterEmail: values.email,
          requesterPhone: values.phone || undefined,
          company: values.company || undefined,
          message: values.message || undefined,
          website: values.website,
        }),
      });
      setIsSuccess(true);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(caught.message || copy.genericError);
        // Une demande déjà enregistrée signifie souvent que le stagiaire a
        // déjà un compte ; une session complète appelle une autre date.
        if (caught.status === 409) {
          setErrorAction(
            /email/i.test(caught.message)
              ? { href: `/${locale}/login`, label: copy.duplicateCta }
              : { href: `/${locale}/contact`, label: copy.fullCta }
          );
        }
      } else {
        setError(copy.networkError);
      }
      shake();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 px-6 py-12 text-center sm:px-8"
        >
          <span className={`relative grid h-16 w-16 place-items-center rounded-full ${theme.chip}`}>
            <motion.span
              aria-hidden
              className={`absolute inset-0 rounded-full ${theme.radioSelected}`}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: 2, ease: 'easeOut' }}
            />
            <CheckCircleIcon className="relative h-9 w-9" />
          </span>
          <p className="text-lg font-semibold text-ink">{copy.successTitle}</p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{copy.successBody}</p>
          <button
            type="button"
            onClick={() => {
              setValues(initialValues);
              setSelected(null);
              setIsSuccess(false);
            }}
            className="btn-secondary mt-2"
          >
            {copy.successCta}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="inscription" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Filet dégradé : identité couleur du parcours sans teinter toute la carte. */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

      <motion.form
        onSubmit={handleSubmit}
        animate={shakeControls}
        noValidate
        className="p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold tracking-tight text-ink">{copy.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{copy.subtitle}</p>

        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p>{error}</p>
              {errorAction && (
                <Link href={errorAction.href} className="mt-1.5 inline-block font-semibold underline">
                  {errorAction.label}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Piège anti-robot : invisible et ignoré par les humains, ne pas retirer. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="enroll-website">Website</label>
          <input
            id="enroll-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => update('website', event.target.value)}
          />
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink">{copy.pickSession}</legend>
          <MotionUl
            {...revealParentProps}
            role="radiogroup"
            aria-label={copy.pickSession}
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {sessions.map((session) => {
              const isPicked = selected === session.id;
              return (
                <MotionLi key={session.id} variants={fadeUpItem}>
                  <motion.label
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex h-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      isPicked ? theme.radioSelected : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="session"
                      value={session.id}
                      checked={isPicked}
                      onChange={() => {
                        setSelected(session.id);
                        setFieldErrors((prev) => ({ ...prev, session: undefined }));
                      }}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                        isPicked ? theme.radioSelected : 'border-slate-300'
                      }`}
                    >
                      {isPicked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className={`h-2 w-2 rounded-full ${theme.radioDot}`}
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {dateFormatter.format(new Date(session.startDate))}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {session.schedule} · {t.courseDetail.modeLabels[session.mode]}
                        {session.location ? ` · ${session.location}` : ''}
                      </span>
                    </span>
                  </motion.label>
                </MotionLi>
              );
            })}
          </MotionUl>
          <FieldError message={fieldErrors.session} />
        </fieldset>

        <div className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="enroll-name"
              label={copy.nameLabel}
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              value={values.name}
              error={fieldErrors.name}
              onChange={(v) => update('name', v)}
            />
            <Field
              id="enroll-email"
              type="email"
              label={copy.emailLabel}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              value={values.email}
              error={fieldErrors.email}
              onChange={(v) => update('email', v)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="enroll-phone"
              type="tel"
              label={copy.phoneLabel}
              placeholder={copy.phonePlaceholder}
              autoComplete="tel"
              value={values.phone}
              error={fieldErrors.phone}
              onChange={(v) => update('phone', v)}
            />
            <Field
              id="enroll-company"
              label={copy.companyLabel}
              placeholder={copy.companyPlaceholder}
              autoComplete="organization"
              value={values.company}
              onChange={(v) => update('company', v)}
            />
          </div>

          <div>
            <label htmlFor="enroll-message" className="block text-sm font-medium text-ink">
              {copy.messageLabel}
            </label>
            <textarea
              id="enroll-message"
              rows={3}
              value={values.message}
              onChange={(event) => update('message', event.target.value)}
              placeholder={copy.messagePlaceholder}
              className="field-input resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn mt-7 w-full text-white shadow-md transition hover:brightness-110 disabled:opacity-60 sm:w-auto bg-gradient-to-r ${theme.gradient}`}
        >
          {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </motion.form>
    </div>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
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
        autoComplete={autoComplete}
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
