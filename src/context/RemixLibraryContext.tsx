import { collection, onSnapshot, orderBy, query, Unsubscribe } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { remixesFromFirestore, Remix } from '@/data/remixes';
import { firebaseServices } from '@/lib/firebase/client';

export type RemixLibraryContextValue = {
  remixes: Remix[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const RemixLibraryContext = createContext<RemixLibraryContextValue | undefined>(undefined);

export function RemixLibraryProvider({ children }: { children: ReactNode }) {
  const { firestore, isConfigured } = firebaseServices;
  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !isConfigured) {
      setError('Firestore is not configured.');
      setRemixes([]);
      setLoading(false);
      return () => undefined;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe | undefined;

    const remixesQuery = query(collection(firestore, 'remixes'), orderBy('remixName'));

    unsubscribe = onSnapshot(
      remixesQuery,
      (snapshot) => {
        const parsed = remixesFromFirestore(snapshot);
        setRemixes(parsed);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Failed to load remixes from Firestore', snapshotError);
        setError('Unable to load remixes from Firestore.');
        setRemixes([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [firestore, isConfigured]);

  const refresh = useCallback(async () => {
    setError(null);
    // Real-time listener keeps data fresh, so refresh is a no-op placeholder.
  }, []);

  const value = useMemo<RemixLibraryContextValue>(
    () => ({ remixes, loading, error, refresh }),
    [error, loading, refresh, remixes]
  );

  return <RemixLibraryContext.Provider value={value}>{children}</RemixLibraryContext.Provider>;
}

export function useRemixLibrary(): RemixLibraryContextValue {
  const context = useContext(RemixLibraryContext);
  if (!context) {
    throw new Error('useRemixLibrary must be used within a RemixLibraryProvider');
  }

  return context;
}
