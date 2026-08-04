'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/auth-client';

interface StudentContextValue {
  user: CurrentUser;
  setUser: (user: CurrentUser) => void;
}

export const StudentContext = createContext<StudentContextValue | null>(null);

export function useStudent(): StudentContextValue {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within the student portal layout.');
  return ctx;
}
