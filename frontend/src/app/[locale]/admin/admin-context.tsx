'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@/lib/auth-client';

interface AdminContextValue {
  user: CurrentUser;
  setUser: (user: CurrentUser) => void;
  badges: { pendingRequests: number; unreadMessages: number };
  refreshBadges: () => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within the admin portal layout.');
  return ctx;
}
