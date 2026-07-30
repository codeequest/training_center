import type { ReactElement } from 'react';

import type { CourseCard } from '@/content/courses';

const paths: Record<CourseCard['icon'], ReactElement> = {
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" strokeLinecap="round" />
      <path d="M7 15v-3" strokeLinecap="round" />
      <path d="M12 15V7" strokeLinecap="round" />
      <path d="M17 15v-6" strokeLinecap="round" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3 13.6 8.4 19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" strokeLinejoin="round" />
      <path d="M18.5 15.5 19.2 17.8 21.5 18.5 19.2 19.2 18.5 21.5 17.8 19.2 15.5 18.5 17.8 17.8 18.5 15.5Z" strokeLinejoin="round" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4h6v3H9z" strokeLinejoin="round" />
      <path d="M9 5.5H6.5A1.5 1.5 0 0 0 5 7v12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V7a1.5 1.5 0 0 0-1.5-1.5H15" strokeLinejoin="round" />
      <path d="m9 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.1-4.6" strokeLinecap="round" />
      <path d="M4 13a8 8 0 0 0 14.1 4.6" strokeLinecap="round" />
      <path d="M5 3v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 21v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function CourseIcon({
  name,
  className = 'h-6 w-6',
}: {
  name: CourseCard['icon'];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
