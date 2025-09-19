import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseServices } from '@/lib/firebase/client';

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  isFirebaseReady: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, googleProvider, isConfigured } = firebaseServices;
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add Firebase environment variables.');
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user ?? null;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/popup-closed-by-user') {
        return null;
      }

      throw error;
    }
  }, [auth, googleProvider]);

  const handleSignOut = useCallback(async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      signInWithGoogle,
      signOut: handleSignOut,
      isFirebaseReady: isConfigured
    }),
    [handleSignOut, initializing, isConfigured, signInWithGoogle, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
