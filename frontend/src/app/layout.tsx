import type { ReactNode } from 'react';
import './globals.css';

/**
 * Racine minimale : les balises <html>/<body> localisées sont posées
 * par le layout de src/app/[locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
