import Link from 'next/link';

import Logo from './logo';
import { courses } from '@/content/courses';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export default function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-bold tracking-tight text-ink">{t.brand.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">{t.footer.about}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">{t.footer.navTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link href={`/${locale}`} className="hover:text-brand-700">
                {t.nav.home}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/courses`} className="hover:text-brand-700">
                {t.nav.courses}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} className="hover:text-brand-700">
                {t.nav.contact}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/login`} className="hover:text-brand-700">
                {t.nav.login}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">{t.footer.coursesTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {courses.map((course) => (
              <li key={course.slug}>
                <Link href={`/${locale}/courses/${course.slug}`} className="hover:text-brand-700">
                  {course.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">{t.footer.contactTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>{t.footer.address}</li>
            <li>
              <a href="tel:+21671000000" className="hover:text-brand-700">
                +216 71 000 000
              </a>
            </li>
            <li>
              <a href="mailto:contact@centre-formation.tn" className="hover:text-brand-700">
                contact@centre-formation.tn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-muted sm:flex-row">
          <p>
            © {year} {t.brand.name}. {t.footer.rights}
          </p>
          <div className="flex gap-5">
            <Link href={`/${locale}/legal`} className="hover:text-brand-700">
              {t.footer.legal}
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-brand-700">
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
