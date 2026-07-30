'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface LoginResponse {
  token: string;
  user: { id: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN'; firstName: string };
}

export default function LoginForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Stockage provisoire : à remplacer par un cookie httpOnly quand
      // l'espace personnel sera développé.
      window.localStorage.setItem('token', data.token);

      const destination =
        data.user.role === 'ADMIN' ? 'admin' : data.user.role === 'TEACHER' ? 'teacher' : 'student';
      router.push(`/${locale}/${destination}`);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(caught.message || t.login.genericError);
      } else {
        setError(t.login.networkError);
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          {t.login.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.login.emailPlaceholder}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-ink
                     placeholder:text-slate-400 focus:border-brand-600 focus:outline-none
                     focus:ring-2 focus:ring-brand-600/20"
        />
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
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t.login.passwordPlaceholder}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-ink
                     placeholder:text-slate-400 focus:border-brand-600 focus:outline-none
                     focus:ring-2 focus:ring-brand-600/20"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? t.login.submitting : t.login.submit}
      </button>
    </form>
  );
}
