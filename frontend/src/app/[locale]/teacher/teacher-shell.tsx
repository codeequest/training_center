'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { apiFetch } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { TeacherContextProvider } from './teacher-context';
import type { TeacherUser } from './types';

type Status = 'checking' | 'ready';

export default function TeacherShell({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('checking');
  const [user, setUser] = useState<TeacherUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const goToLogin = useCallback(() => {
    window.localStorage.removeItem('token');
    router.replace(`/${locale}/login`);
  }, [locale, router]);

  const loadUser = useCallback(
    async (activeToken: string) => {
      try {
        const data = await apiFetch<{ user: TeacherUser }>('/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (data.user.role !== 'TEACHER' && data.user.role !== 'ADMIN') {
          goToLogin();
          return;
        }
        setUser(data.user);
        setToken(activeToken);
        setStatus('ready');
      } catch {
        goToLogin();
      }
    },
    [goToLogin]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem('token');
    if (!stored) {
      goToLogin();
      return;
    }
    void loadUser(stored);
    // Volontairement exécuté une seule fois au montage : la vérification de session
    // n'a pas à se relancer à chaque changement de route interne à l'espace formateur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) await loadUser(token);
  }, [token, loadUser]);

  if (status !== 'ready' || !user || !token) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-20">
        <span
          className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
          aria-hidden="true"
        />
        <p className="text-sm text-ink-muted">{t.teacher.shell.loading}</p>
      </div>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const navItems = [
    { href: `/${locale}/teacher`, label: t.teacher.nav.dashboard },
    { href: `/${locale}/teacher/profile`, label: t.teacher.nav.profile },
  ];
  const isActive = (href: string) =>
    href === `/${locale}/teacher` ? pathname === href : pathname.startsWith(href);

  return (
    <TeacherContextProvider value={{ user, token, refreshUser }}>
      <div className="min-h-[70vh] bg-slate-50">
        <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
          <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex animate-fade-up items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur">
                {initials}
              </span>
              <div>
                <p className="eyebrow text-brand-100">{t.teacher.shell.badge}</p>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {t.teacher.shell.greeting}, {user.firstName}
                </h1>
              </div>
            </div>

            <div
              className="flex animate-fade-up flex-wrap items-center gap-2"
              style={{ animationDelay: '80ms' }}
            >
              <nav className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'bg-white text-brand-800' : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={goToLogin}
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {t.teacher.nav.logout}
              </button>
            </div>
          </div>
        </div>

        <div className="container-page py-10">{children}</div>
      </div>
    </TeacherContextProvider>
  );
}
