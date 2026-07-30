import type { EnrollmentStatus } from './admin-api';

/**
 * Palette d'inscription validée par le script dataviz (ΔE CVD/normal-vision
 * OK dans cet ordre de pipeline) : ambre/ciel/violet/émeraude/rouge.
 * Le contraste sur fond clair est sous le seuil 3:1 pour plusieurs teintes :
 * ces couleurs ne portent jamais l'information seules, toujours accompagnées
 * d'un libellé texte visible.
 */
export const statusTheme: Record<EnrollmentStatus, { bar: string; text: string; badge: string }> = {
  REQUESTED: { bar: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800' },
  CONFIRMED: { bar: 'bg-sky-500', text: 'text-sky-700', badge: 'bg-sky-50 text-sky-800' },
  PAID: { bar: 'bg-violet-500', text: 'text-violet-700', badge: 'bg-violet-50 text-violet-800' },
  COMPLETED: { bar: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-800' },
  CANCELLED: { bar: 'bg-red-600', text: 'text-red-700', badge: 'bg-red-50 text-red-700' },
};

export const statusOrder: EnrollmentStatus[] = ['REQUESTED', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];
