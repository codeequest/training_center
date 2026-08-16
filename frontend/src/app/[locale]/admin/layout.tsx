'use client';

import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import {
  BookIcon,
  CalendarIcon,
  DocumentIcon,
  GridIcon,
  MailIcon,
  SendIcon,
  SpinnerIcon,
  UsersIcon,
} from '@/components/icons';
import { MotionDiv } from '@/components/motion-primitives';
import { clearToken, fetchCurrentUser, getToken, type CurrentUser } from '@/lib/auth-client';
import { getAdminStats } from '@/lib/admin-api';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { AdminContext } from './admin-context';

type GuardStatus = 'checking' | 'ready' | 'denied';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [status, setStatus] = useState<GuardStatus>('checking');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [badges, setBadges] = useState({ pendingRequests: 0, unreadMessages: 0 });

  const refreshBadges = useCallback(() => {
    getAdminStats()
      .then(({ stats }) => {
        setBadges({ pendingRequests: stats.pendingRequests, unreadMessages: stats.unreadMessages });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!getToken()) {
      router.replace(`/${locale}/login`);
      return;
    }

    fetchCurrentUser()
      .then(({ user: fetched }) => {
        if (cancelled) return;
        if (fetched.role !== 'ADMIN') {
          router.replace(`/${locale}`);
          return;
        }
        setUser(fetched);
        setStatus('ready');
        refreshBadges();
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
          <p className="text-sm">{t.admin.loading}</p>
        </MotionDiv>
      </div>
    );
  }

  const navItems = [
    { href: `/${locale}/admin`, label: t.admin.nav.dashboard, icon: GridIcon, exact: true, badge: 0 },
    { href: `/${locale}/admin/inscriptions`, label: t.admin.nav.enrollments, icon: DocumentIcon, exact: false, badge: badges.pendingRequests },
    { href: `/${locale}/admin/formations`, label: t.admin.nav.courses, icon: BookIcon, exact: false, badge: 0 },
    { href: `/${locale}/admin/sessions`, label: t.admin.nav.sessions, icon: CalendarIcon, exact: false, badge: 0 },
    { href: `/${locale}/admin/utilisateurs`, label: t.admin.nav.users, icon: UsersIcon, exact: false, badge: 0 },
    { href: `/${locale}/admin/messages`, label: t.admin.nav.messages, icon: MailIcon, exact: false, badge: badges.unreadMessages },
    { href: `/${locale}/admin/emails`, label: t.admin.nav.emails, icon: SendIcon, exact: false, badge: 0 },
  ];

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <AdminContext.Provider value={{ user, setUser, badges, refreshBadges }}>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-genai-500 to-genai-700 text-sm font-bold text-white">
                {initials}
              </span>
              <div>
                <p className="text-xs font-medium text-ink-muted">{t.admin.portalLabel}</p>
                <p className="text-base font-semibold text-ink">
                  {t.admin.greetingPrefix}, {user.firstName}
                </p>
              </div>
            </div>
          </div>

          {/*
            Sept onglets débordent sous `sm` : le dégradé de masque sur le bord
            droit signale qu'il reste des onglets à faire défiler, au lieu de
            les couper net sur le fond blanc.
          */}
          <nav
            className="container-page flex gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage: 'linear-gradient(to right, black calc(100% - 28px), transparent)',
              WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 28px), transparent)',
            }}
          >
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active ? 'bg-genai-700 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span
                      className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[11px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="container-page py-10 sm:py-14">{children}</div>
      </div>
    </AdminContext.Provider>
  );
}
