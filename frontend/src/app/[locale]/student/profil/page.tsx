'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { CheckCircleIcon, SpinnerIcon } from '@/components/icons';
import { MotionDiv } from '@/components/motion-primitives';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import { changePassword, updateProfile } from '@/lib/auth-client';
import { useStudent } from '../student-context';

export default function StudentProfilePage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.student.profile.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.student.profile.subtitle}</p>
      </MotionDiv>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-ink">{t.student.profile.sectionInfo}</h2>
          <div className="mt-5">
            <ProfileForm t={t} />
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-ink">{t.student.profile.sectionPassword}</h2>
          <div className="mt-5">
            <PasswordForm t={t} />
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}

function ProfileForm({ t }: { t: Dictionary }) {
  const { user, setUser } = useStudent();
  const [values, setValues] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    avatarUrl: user.avatarUrl ?? '',
    locale: user.locale,
  });
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const shakeControls = useAnimationControls();

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setIsSuccess(false);
    if (key in fieldErrors) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors: typeof fieldErrors = {};
    if (values.firstName.trim().length < 2) nextErrors.firstName = t.student.profile.firstNameRequired;
    if (values.lastName.trim().length < 2) nextErrors.lastName = t.student.profile.lastNameRequired;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      return;
    }

    setIsSubmitting(true);
    try {
      const { user: updated } = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
        avatarUrl: values.avatarUrl || null,
        locale: values.locale,
      });
      setUser(updated);
      setIsSuccess(true);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.student.profile.networkError);
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="firstName"
          label={t.student.profile.firstNameLabel}
          value={values.firstName}
          error={fieldErrors.firstName}
          onChange={(v) => update('firstName', v)}
        />
        <TextField
          id="lastName"
          label={t.student.profile.lastNameLabel}
          value={values.lastName}
          error={fieldErrors.lastName}
          onChange={(v) => update('lastName', v)}
        />
      </div>

      <TextField
        id="phone"
        type="tel"
        label={t.student.profile.phoneLabel}
        placeholder={t.student.profile.phonePlaceholder}
        value={values.phone}
        onChange={(v) => update('phone', v)}
      />

      <TextField
        id="avatarUrl"
        type="url"
        label={t.student.profile.avatarLabel}
        placeholder={t.student.profile.avatarPlaceholder}
        value={values.avatarUrl}
        onChange={(v) => update('avatarUrl', v)}
      />

      <div>
        <label htmlFor="locale" className="block text-sm font-medium text-ink">
          {t.student.profile.localeLabel}
        </label>
        <select
          id="locale"
          value={values.locale}
          onChange={(event) => update('locale', event.target.value as Locale)}
          className="field-input"
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {code === 'fr' ? 'Français' : 'English'}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton isSubmitting={isSubmitting} isSuccess={isSuccess} idle={t.student.profile.save} busy={t.student.profile.saving} success={t.student.profile.saveSuccess} />
    </motion.form>
  );
}

function PasswordForm({ t }: { t: Dictionary }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const shakeControls = useAnimationControls();

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setIsSuccess(false);
    if (key in fieldErrors) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors: typeof fieldErrors = {};
    if (!values.currentPassword) nextErrors.currentPassword = t.student.profile.currentPasswordRequired;
    if (values.newPassword.length < 8) nextErrors.newPassword = t.student.profile.newPasswordTooShort;
    if (values.confirmPassword !== values.newPassword) nextErrors.confirmPassword = t.student.profile.confirmMismatch;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSuccess(true);
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.student.profile.networkError);
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
    } finally {
      setIsSubmitting(false);
    }
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

      <TextField
        id="currentPassword"
        type="password"
        label={t.student.profile.currentPasswordLabel}
        value={values.currentPassword}
        error={fieldErrors.currentPassword}
        onChange={(v) => update('currentPassword', v)}
      />
      <TextField
        id="newPassword"
        type="password"
        label={t.student.profile.newPasswordLabel}
        value={values.newPassword}
        error={fieldErrors.newPassword}
        onChange={(v) => update('newPassword', v)}
      />
      <TextField
        id="confirmPassword"
        type="password"
        label={t.student.profile.confirmPasswordLabel}
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(v) => update('confirmPassword', v)}
      />

      <SubmitButton
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
        idle={t.student.profile.changePassword}
        busy={t.student.profile.changingPassword}
        success={t.student.profile.passwordSuccess}
      />
    </motion.form>
  );
}

function SubmitButton({
  isSubmitting,
  isSuccess,
  idle,
  busy,
  success,
}: {
  isSubmitting: boolean;
  isSuccess: boolean;
  idle: string;
  busy: string;
  success: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? busy : idle}
      </button>
      <AnimatePresence>
        {isSuccess && !isSubmitting && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {success}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextField({
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
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-xs text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
