import type { ReactElement } from 'react';

import { CheckCircleIcon, CheckIcon, ClockIcon, CoinIcon, XCircleIcon } from '@/components/icons';

import type { EnrollmentStatus } from './admin-api';

/**
 * Palette d'inscription validée par le script dataviz (ΔE CVD/normal-vision
 * OK dans cet ordre de pipeline) : ambre/ciel/violet/émeraude/rouge.
 * Le contraste sur fond clair est sous le seuil 3:1 pour plusieurs teintes :
 * ces couleurs ne portent jamais l'information seules, toujours accompagnées
 * d'un libellé texte visible.
 *
 * `icon` ajoute un second signal, non chromatique : glyphe simple pour un état
 * en cours, glyphe cerclé pour un état terminal (positif ou négatif). La forme
 * seule distingue donc « en mouvement » de « terminé », y compris là où la
 * couleur est le seul repère (pastille, barre) — ambre et rouge se confondent
 * en vision deutéranope/protanope.
 */
export const statusTheme: Record<
  EnrollmentStatus,
  { bar: string; text: string; badge: string; icon: (props: { className?: string }) => ReactElement }
> = {
  REQUESTED: { bar: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800', icon: ClockIcon },
  CONFIRMED: { bar: 'bg-sky-500', text: 'text-sky-700', badge: 'bg-sky-50 text-sky-800', icon: CheckIcon },
  PAID: { bar: 'bg-violet-500', text: 'text-violet-700', badge: 'bg-violet-50 text-violet-800', icon: CoinIcon },
  COMPLETED: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800',
    icon: CheckCircleIcon,
  },
  CANCELLED: { bar: 'bg-red-600', text: 'text-red-700', badge: 'bg-red-50 text-red-700', icon: XCircleIcon },
};

export const statusOrder: EnrollmentStatus[] = ['REQUESTED', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];
