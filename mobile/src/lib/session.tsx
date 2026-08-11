import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as apiLogin, logout as apiLogout } from '@shared/api/auth';
import { getAccessToken } from '@shared/api/client';
import type { CurrentUser } from '@shared/types';
import { onSessionExpired } from './api';
import { registerForPush, unregisterFromPush } from './push';

type Status = 'loading' | 'authed' | 'anon';

interface SessionValue {
  status: Status;
  user: CurrentUser | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);

  const forget = useCallback(() => {
    setUser(null);
    setStatus('anon');
  }, []);

  /**
   * Restauration au démarrage. Un jeton d'accès présent ne suffit pas : il peut être
   * expiré. On interroge donc `/auth/me`, ce qui déclenche au besoin le
   * rafraîchissement transparent du client partagé.
   */
  useEffect(() => {
    onSessionExpired(forget);

    let cancelled = false;

    (async () => {
      if (!(await getAccessToken())) {
        if (!cancelled) setStatus('anon');
        return;
      }

      try {
        const { user: restored } = await fetchCurrentUser();
        if (cancelled) return;
        setUser(restored);
        setStatus('authed');
        void registerForPush();
      } catch {
        if (!cancelled) forget();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forget]);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await apiLogin(email, password);
    setUser(signedIn);
    setStatus('authed');
    // Le push est accessoire : son échec ne doit pas faire échouer la connexion.
    void registerForPush();
  }, []);

  const signOut = useCallback(async () => {
    await unregisterFromPush();
    await apiLogout();
    forget();
  }, [forget]);

  const value = useMemo<SessionValue>(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession doit être utilisé dans un SessionProvider.');
  return value;
}
