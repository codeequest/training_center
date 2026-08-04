'use client';

import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { BookIcon, DocumentIcon, GridIcon, LogoutIcon, SpinnerIcon, UserIcon } from '@/components/icons';
import { MotionDiv } from '@/components/motion-primitives';
import { clearToken, fetchCurrentUser, getToken, type CurrentUser } from '@/lib/auth-client';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { StudentContext } from './student-context';

type GuardStatus = 'checking' | 'ready' | 'denied';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [status, setStatus] = useState<GuardStatus>('checking');
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!getToken()) {
      router.replace(`/${locale}/login`);
      return;
    }

    fetchCurrentUser()
      .then(({ user: fetched }) => {
        if (cancelled) return;
        if (fetched.role !== 'STUDENT') {
          router.replace(`/${locale}`);
          return;
        }
        setUser(fetched);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setStatus('denied');
        router.replace(`/${locale}/login`);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  function logout() {
    clearToken();
    router.replace(`/${locale}/login`);
  }

  if (status !== 'ready' || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-slate-50">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3 text-ink-muted"
        >
          <SpinnerIcon className="h-7 w-7 animate-spin text-brand-600" />
          <p className="text-sm">{t.student.loading}</p>
        </MotionDiv>
      </div>
    );
  }

  const navItems = [
    { href: `/${locale}/student`, label: t.student.nav.overview, icon: GridIcon, exact: true },
    { href: `/${locale}/student/formations`, label: t.student.nav.formations, icon: BookIcon, exact: false },
    { href: `/${locale}/student/supports`, label: t.student.nav.materials, icon: DocumentIcon, exact: false },
    { href: `/${locale}/student/profil`, label: t.student.nav.profile, icon: UserIcon, exact: false },
  ];

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <StudentContext.Provider value={{ user, setUser }}>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                {initials}
              </span>
              <div>
                <p className="text-xs font-medium text-ink-muted">{t.student.portalLabel}</p>
                <p className="text-base font-semibold text-ink">
                  {t.student.greetingPrefix}, {user.firstName}
                </p>
              </div>
            </div>
            <button type="button" onClick={logout} className="btn-secondary text-sm">
              <LogoutIcon />
              {t.student.logout}
            </button>
          </div>

          <nav className="container-page flex gap-1 overflow-x-auto pb-3">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? 'bg-brand-700 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="container-page py-10 sm:py-14">{children}</div>
      </div>
    </StudentContext.Provider>
  );
}
