import type { CourseCard } from '@/content/courses';

/**
 * Identité couleur par parcours de formation. Les 4 pistes connues sont
 * associées à leur slug ; tout futur slug (formation ajoutée côté API sans
 * piste dédiée) retombe sur la piste "pmp" (bleu), un choix neutre côté design.
 */
export type TrackKey = 'powerbi' | 'genai' | 'pmp' | 'scrum';

const trackBySlug: Record<string, TrackKey> = {
  'power-bi': 'powerbi',
  'ia-generative': 'genai',
  pmp: 'pmp',
  'scrum-master': 'scrum',
};

export function trackForSlug(slug: string): TrackKey {
  return trackBySlug[slug] ?? 'pmp';
}

export const trackIcon: Record<TrackKey, CourseCard['icon']> = {
  powerbi: 'chart',
  genai: 'sparkles',
  pmp: 'clipboard',
  scrum: 'refresh',
};

interface TrackTheme {
  /** Fond en dégradé pour la puce d'icône. */
  chip: string;
  /** Anneau + ombre au survol de la carte. */
  cardHover: string;
  /** Dégradé utilisé pour les accents larges (bandeaux, barres). */
  gradient: string;
  /** Texte de la couleur de piste (liens, chiffres). */
  text: string;
  /** Badge discret (fond clair + texte coloré). */
  badge: string;
  /** Carte de session sélectionnée dans le formulaire d'inscription. */
  radioSelected: string;
  /** Pastille pleine du bouton radio sélectionné. */
  radioDot: string;
}

// Toutes les classes ci-dessous sont écrites littéralement (pas de concaténation
// dynamique) afin que le scanner de contenu Tailwind les détecte sans avoir
// besoin du safelist — celui-ci ne sert que de filet de sécurité.
export const trackThemes: Record<TrackKey, TrackTheme> = {
  powerbi: {
    chip: 'bg-gradient-to-br from-powerbi-400 to-powerbi-600 text-powerbi-950',
    cardHover: 'group-hover:ring-2 group-hover:ring-powerbi-300/70 group-hover:shadow-xl group-hover:shadow-powerbi-500/15',
    gradient: 'from-powerbi-500 to-powerbi-700',
    text: 'text-powerbi-700',
    badge: 'bg-powerbi-50 text-powerbi-800',
    radioSelected: 'border-powerbi-500 ring-2 ring-powerbi-200 bg-powerbi-50',
    radioDot: 'bg-powerbi-600',
  },
  genai: {
    chip: 'bg-gradient-to-br from-genai-400 to-genai-600 text-white',
    cardHover: 'group-hover:ring-2 group-hover:ring-genai-300/70 group-hover:shadow-xl group-hover:shadow-genai-500/20',
    gradient: 'from-genai-500 to-genai-700',
    text: 'text-genai-700',
    badge: 'bg-genai-50 text-genai-700',
    radioSelected: 'border-genai-500 ring-2 ring-genai-200 bg-genai-50',
    radioDot: 'bg-genai-600',
  },
  pmp: {
    chip: 'bg-gradient-to-br from-pmp-400 to-pmp-600 text-white',
    cardHover: 'group-hover:ring-2 group-hover:ring-pmp-300/70 group-hover:shadow-xl group-hover:shadow-pmp-500/20',
    gradient: 'from-pmp-500 to-pmp-700',
    text: 'text-pmp-700',
    badge: 'bg-pmp-50 text-pmp-700',
    radioSelected: 'border-pmp-500 ring-2 ring-pmp-200 bg-pmp-50',
    radioDot: 'bg-pmp-600',
  },
  scrum: {
    chip: 'bg-gradient-to-br from-scrum-400 to-scrum-600 text-white',
    cardHover: 'group-hover:ring-2 group-hover:ring-scrum-300/70 group-hover:shadow-xl group-hover:shadow-scrum-500/20',
    gradient: 'from-scrum-500 to-scrum-700',
    text: 'text-scrum-700',
    badge: 'bg-scrum-50 text-scrum-700',
    radioSelected: 'border-scrum-500 ring-2 ring-scrum-200 bg-scrum-50',
    radioDot: 'bg-scrum-600',
  },
};

export function themeForSlug(slug: string): TrackTheme {
  return trackThemes[trackForSlug(slug)];
}
