import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { subscriptionService } from '../services/subscription.service';
import type { AccessStatus } from '../services/subscription.service';
import { useAuthStore } from '../stores/auth.store';

interface SubscriptionContextValue {
  accessStatus: AccessStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  accessStatus: null,
  loading: true,
  refresh: async () => {},
});

const POLL_INTERVAL_MS = 30_000;

// Códigos que redirecionam para a tela de planos
const BLOCKED_CODES: string[] = [
  'SUBSCRIPTION_REQUIRED',
  'SUBSCRIPTION_EXPIRED',
  'SUBSCRIPTION_CANCELED',
  'TRIAL_EXPIRED',
  'PAST_DUE_EXPIRED',
];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const status = await subscriptionService.getAccessStatus();
      if (!mountedRef.current) return;
      setAccessStatus(status);
    } catch {
      // Silencioso — não bloquear UX por falha de rede
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Polling a cada 30s quando autenticado
  useEffect(() => {
    mountedRef.current = true;

    if (isAuthenticated) {
      setLoading(true);
      fetchStatus();
      intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    } else {
      setAccessStatus(null);
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, fetchStatus]);

  // Interceptor de 403 — redireciona para /plans quando bloqueado
  useEffect(() => {
    if (!accessStatus) return;
    if (!accessStatus.canAccess && accessStatus.status) {
      const code = accessStatus.status;
      if (BLOCKED_CODES.includes(code)) {
        router.replace('/plans');
      }
    }
  }, [accessStatus, router]);

  return (
    <SubscriptionContext.Provider value={{ accessStatus, loading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}
