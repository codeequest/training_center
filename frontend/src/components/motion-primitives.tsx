'use client';

import { motion, type Variants } from 'framer-motion';

/**
 * Primitives d'animation partagées. Exportées depuis un module client :
 * elles peuvent être importées et rendues directement dans des Server
 * Components (composition standard Next.js), tout en gardant la logique
 * d'animation — hooks, refs — côté client.
 */

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionUl = motion.ul;
export const MotionLi = motion.li;
export const MotionDl = motion.dl;

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** À étaler sur un conteneur (ul/section/div) pour révéler ses enfants au scroll. */
export const revealParentProps = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: staggerParent,
} as const;

/** À étaler sur un bloc unique (pas de stagger d'enfants). */
export const revealProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
} as const;

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const } },
  whileTap: { y: 0, scale: 0.99 },
};
