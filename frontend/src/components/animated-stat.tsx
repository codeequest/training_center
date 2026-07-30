'use client';

import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Anime un chiffre-clé de 0 vers sa valeur cible dès qu'il entre dans le
 * viewport. Le format d'origine ("850+", "96 %", "12") est décomposé en
 * préfixe / nombre / suffixe pour que le compteur ne rejoue que la partie
 * numérique.
 */
export default function AnimatedStat({ value, locale }: { value: string; locale: string }) {
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(match ? '0' : value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!match) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const target = parseFloat(match[2].replace(',', '.'));
    const decimals = match[2].includes(',') || match[2].includes('.') ? 1 : 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        const controls = animate(0, target, {
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (latest) => {
            setDisplay(
              new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals,
              }).format(latest)
            );
          },
        });
        return () => controls.stop();
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [match, locale]);

  if (!match) return <>{value}</>;

  return (
    <span ref={ref}>
      {match[1]}
      {display}
      {match[3]}
    </span>
  );
}
