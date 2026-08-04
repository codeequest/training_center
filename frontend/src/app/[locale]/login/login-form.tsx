'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { CheckCircleIcon, SpinnerIcon } from '@/components/icons';
import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface LoginResponse {
  token: string;
  user: { id: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN'; firstName: string };
}

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shakeControls = useAnimationControls();

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = t.login.emailRequired;
    else if (!EMAIL_RE.test(email)) next.email = t.login.emailInvalid;
    if (!password) next.password = t.login.passwordRequired;
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
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Stockage provisoire : à remplacer par un cookie httpOnly quand
      // l'espace personnel sera développé.
      window.localStorage.setItem('token', data.token);
      setIsSuccess(true);

      const destination =
        data.user.role === 'ADMIN' ? 'admin' : data.user.role === 'TEACHER' ? 'teacher' : 'student';

      window.setTimeout(() => {
        router.push(`/${locale}/${destination}`);
      }, 900);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(caught.message || t.login.genericError);
      } else {
        setError(t.login.networkError);
      }
      shakeControls.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <CheckCircleIcon className="h-8 w-8" />
        </motion.span>
        <p className="text-base font-semibold text-ink">{t.login.successTitle}</p>
        <p className="text-sm text-ink-muted">{t.login.successBody}</p>
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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          {t.login.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder={t.login.emailPlaceholder}
          className={`field-input ${fieldErrors.email ? 'field-input-error' : ''}`}
        />
        <AnimatePresence>
          {fieldErrors.email && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 text-xs text-red-600"
            >
              {fieldErrors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            {t.login.passwordLabel}
          </label>
          <a href={`/${locale}/contact`} className="text-xs font-medium text-brand-700 hover:underline">
            {t.login.forgot}
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder={t.login.passwordPlaceholder}
          className={`field-input ${fieldErrors.password ? 'field-input-error' : ''}`}
        />
        <AnimatePresence>
          {fieldErrors.password && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 text-xs text-red-600"
            >
              {fieldErrors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? t.login.submitting : t.login.submit}
      </button>
    </motion.form>
  );
}
