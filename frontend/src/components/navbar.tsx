'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import Logo from './logo';
import { ApiRequestError } from '@/lib/api';
import { clearToken, fetchCurrentUser, getToken, type CurrentUser } from '@/lib/auth-client';
import { locales, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface NavbarProps {
  locale: Locale;
  t: Dictionary;
}

/** État de session tel que l'en-tête public le connaît. */
type Session =
  | { status: 'checking' }
  | { status: 'guest' }
  | { status: 'authed'; user: CurrentUser };

/** Page d'accueil de l'espace personnel correspondant au rôle. */
function accountHref(locale: Locale, role: CurrentUser['role']): string {
  if (role === 'ADMIN') return `/${locale}/admin`;
  if (role === 'TEACHER') return `/${locale}/teacher`;
  return `/${locale}/student`;
}

export default function Navbar({ locale, t }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // 'checking' au premier rendu (serveur comme client) : évite toute divergence d'hydratation
  // et surtout d'afficher « Connexion » l'espace d'un instant à un utilisateur déjà connecté.
  const [session, setSession] = useState<Session>({ status: 'checking' });

  const readSession = useCallback(() => {
    if (!getToken()) {
      setSession({ status: 'guest' });
      return () => {};
    }

    let cancelled = false;
    fetchCurrentUser()
      .then(({ user }) => {
        if (!cancelled) setSession({ status: 'authed', user });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // Seul un jeton refusé justifie de fermer la session : une API injoignable
        // ou une erreur serveur ne doit pas déconnecter l'utilisateur.
        if (error instanceof ApiRequestError && (error.status === 401 || error.status === 403)) {
          clearToken();
          setSession({ status: 'guest' });
          return;
        }
        setSession({ status: 'checking' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Revalidé à chaque changement de route : l'en-tête reflète immédiatement
  // une connexion ou une déconnexion faite ailleurs dans l'application.
  useEffect(() => readSession(), [pathname, readSession]);

  // Connexion ou déconnexion depuis un autre onglet.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'token') readSession();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [readSession]);

  const logout = useCallback(() => {
    clearToken();
    setSession({ status: 'guest' });
    setIsOpen(false);
    router.push(`/${locale}`);
  }, [locale, router]);

  const links = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/courses`, label: t.nav.courses },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  // Ombre portée uniquement après défilement : l'en-tête reste léger en haut de page.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Le menu mobile ne doit jamais rester ouvert après une navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  /** Conserve la page courante en changeant seulement le segment de langue. */
  const localeHref = (target: Locale) => {
    const rest = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');
    return `/${target}${rest}`;
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur transition-shadow ${
        isScrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label={t.brand.name}>
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Logo />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-ink">{t.brand.name}</span>
            <span className="mt-0.5 text-[11px] font-medium text-ink-muted">{t.brand.tagline}</span>
          </span>
        </Link>

        {/* Navigation bureau */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-700'
                    : 'text-ink-muted hover:bg-slate-50 hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher current={locale} hrefFor={localeHref} label={t.nav.languageLabel} />
          {session.status === 'checking' ? (
            <span aria-hidden className="h-9 w-28 animate-pulse rounded-lg bg-slate-100" />
          ) : session.status === 'authed' ? (
            <>
              <Link
                href={accountHref(locale, session.user.role)}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                {t.nav.myAccount}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-slate-50 hover:text-ink"
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              {t.nav.login}
            </Link>
          )}
        </div>

        {/* Bascule mobile */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-ink md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <motion.path
              d="M4 7h16"
              animate={isOpen ? { d: 'm5 5 14 14', opacity: 1 } : { d: 'M4 7h16', opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M4 12h16"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.path
              d="M4 17h16"
              animate={isOpen ? { d: 'm19 5-14 14', opacity: 1 } : { d: 'M4 17h16', opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        </button>
      </nav>

      {/* Panneau mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <ul className="container-page flex flex-col py-2">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`block rounded-md px-3 py-3 text-sm font-medium ${
                      isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="container-page flex items-center justify-between gap-3 border-t border-slate-100 py-4">
              <LocaleSwitcher current={locale} hrefFor={localeHref} label={t.nav.languageLabel} />
              {session.status === 'checking' ? (
                <span aria-hidden className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
              ) : session.status === 'authed' ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={accountHref(locale, session.user.role)}
                    className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    {t.nav.myAccount}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LocaleSwitcher({
  current,
  hrefFor,
  label,
}: {
  current: Locale;
  hrefFor: (locale: Locale) => string;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center rounded-lg border border-slate-200 p-0.5"
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          aria-current={locale === current ? 'true' : undefined}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
            locale === current ? 'bg-brand-700 text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
