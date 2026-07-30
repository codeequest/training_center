import type { EnrollmentStatus, MaterialType, SessionMode, SessionStatus } from './types';

/** Classes de couleur par statut de session — réutilisées tableau de bord + détail de session. */
export const sessionStatusClasses: Record<SessionStatus, string> = {
  PLANNED: 'bg-slate-100 text-slate-700',
  OPEN: 'bg-brand-50 text-brand-700',
  FULL: 'bg-amber-50 text-amber-700',
  RUNNING: 'bg-sky-50 text-sky-700',
  DONE: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-red-50 text-red-700',
};

export const enrollmentStatusClasses: Record<EnrollmentStatus, string> = {
  REQUESTED: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-brand-50 text-brand-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-sky-50 text-sky-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export const materialTypeClasses: Record<MaterialType, string> = {
  PDF: 'bg-red-50 text-red-700',
  SLIDES: 'bg-amber-50 text-amber-700',
  LINK: 'bg-sky-50 text-sky-700',
  VIDEO: 'bg-violet-50 text-violet-700',
};

export const sessionModeClasses: Record<SessionMode, string> = {
  ONSITE: 'bg-slate-100 text-slate-700',
  ONLINE: 'bg-sky-50 text-sky-700',
  HYBRID: 'bg-violet-50 text-violet-700',
};

export function formatDateRange(startIso: string, endIso: string, locale: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const startLabel = start.toLocaleDateString(locale, opts);
  const endLabel = end.toLocaleDateString(locale, opts);
  return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`;
}

export function formatFileSize(bytes: number | null, unknownLabel: string): string {
  if (bytes === null || Number.isNaN(bytes)) return unknownLabel;
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}
