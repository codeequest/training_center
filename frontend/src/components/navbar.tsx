'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import Logo from './logo';
import { locales, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface NavbarProps {
  locale: Locale;
  t: Dictionary;
}

export default function Navbar({ locale, t }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          <Link
            href={`/${locale}/login`}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {t.nav.login}
          </Link>
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
            {isOpen ? (
              <>
                <path d="m5 5 14 14" />
                <path d="m19 5-14 14" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Panneau mobile */}
      {isOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <ul className="container-page flex flex-col py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`block rounded-md px-3 py-3 text-sm font-medium ${
                    isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-muted'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="container-page flex items-center justify-between gap-3 border-t border-slate-100 py-4">
            <LocaleSwitcher current={locale} hrefFor={localeHref} label={t.nav.languageLabel} />
            <Link
              href={`/${locale}/login`}
              className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      )}
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
