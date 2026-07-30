'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { TeacherUser } from './types';

interface TeacherContextValue {
  user: TeacherUser;
  token: string;
  /** Recharge l'utilisateur courant (ex. après mise à jour de la fiche formateur). */
  refreshUser: () => Promise<void>;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

export function TeacherContextProvider({
  value,
  children,
}: {
  value: TeacherContextValue;
  children: ReactNode;
}) {
  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

/** À utiliser uniquement dans un descendant de `TeacherShell`, où le contexte est garanti présent. */
export function useTeacher(): TeacherContextValue {
  const ctx = useContext(TeacherContext);
  if (!ctx) {
    throw new Error('useTeacher() doit être appelé sous <TeacherShell>.');
  }
  return ctx;
}
