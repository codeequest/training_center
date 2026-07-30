import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

/** Redirige toute URL sans préfixe de langue vers la langue par défaut. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  // Respecte la préférence du navigateur au premier passage, sinon le français.
  const accept = request.headers.get('accept-language') ?? '';
  const preferred = accept.toLowerCase().startsWith('en') ? 'en' : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
