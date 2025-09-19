import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  Unsubscribe
} from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseServices } from '@/lib/firebase/client';
import { useAuth } from './AuthContext';

type VoteValue = 'up' | 'down';

type VoteMap = Record<string, VoteValue>;

type RemixStats = {
  upvotes: number;
  downvotes: number;
};

type RemixDataContextValue = {
  favorites: string[];
  votes: VoteMap;
  stats: Record<string, RemixStats>;
  loading: boolean;
  error: string | null;
  isFavorite: (remixId: string) => boolean;
  getVote: (remixId: string) => VoteValue | null;
  toggleFavorite: (remixId: string) => Promise<void>;
  vote: (remixId: string, direction: VoteValue) => Promise<void>;
  getNetVotes: (remixId: string) => number;
  clearError: () => void;
};

const RemixDataContext = createContext<RemixDataContextValue | undefined>(undefined);

const defaultStats: RemixStats = { upvotes: 0, downvotes: 0 };

function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

export function RemixDataProvider({ children }: { children: ReactNode }) {
  const { firestore, isConfigured } = firebaseServices;
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [votes, setVotes] = useState<VoteMap>({});
  const [stats, setStats] = useState<Record<string, RemixStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubUserDoc: Unsubscribe | undefined;
    let unsubStats: Unsubscribe | undefined;
    let canceled = false;

    setLoading(true);
    setError(null);

    if (!firestore || !isConfigured) {
      setFavorites([]);
      setVotes({});
      setStats({});
      setError('Voting, favorites, and leaderboard stats require Firebase configuration.');
      setLoading(false);
      return () => undefined;
    }

    let statsLoaded = false;
    let profileLoaded = !user;

    const markLoaded = () => {
      if (!canceled && statsLoaded && profileLoaded) {
        setLoading(false);
      }
    };

    try {
      unsubStats = onSnapshot(
        collection(firestore, 'remixStats'),
        (snapshot) => {
          if (canceled) {
            return;
          }

          const nextStats: Record<string, RemixStats> = {};
          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data() as Partial<RemixStats>;
            nextStats[docSnapshot.id] = {
              upvotes: Number(data.upvotes ?? 0),
              downvotes: Number(data.downvotes ?? 0)
            };
          });
          setStats(nextStats);
          statsLoaded = true;
          markLoaded();
        },
        (statsError) => {
          if (canceled) {
            return;
          }

          statsLoaded = true;
          markLoaded();
          console.warn('Failed to subscribe to remix stats', statsError);
          if (isFirebaseError(statsError) && statsError.code === 'permission-denied') {
            setError('You do not have permission to view community vote totals yet.');
          } else {
            setError('Unable to load community votes right now.');
          }
        }
      );
    } catch (statsInitError) {
      console.warn('Unable to start remix stats listener', statsInitError);
      statsLoaded = true;
      markLoaded();
      if (isFirebaseError(statsInitError) && statsInitError.code === 'permission-denied') {
        setError('You do not have permission to view community vote totals yet.');
      } else {
        setError('Unable to load community votes right now.');
      }
    }

    if (user) {
      try {
        const profileDocRef = doc(firestore, 'profiles', user.uid);
        unsubUserDoc = onSnapshot(
          profileDocRef,
          (docSnapshot) => {
            if (canceled) {
              return;
            }

            const data = docSnapshot.data() as { favorites?: string[]; votes?: VoteMap } | undefined;
            setFavorites(data?.favorites ?? []);
            setVotes(data?.votes ?? {});
            profileLoaded = true;
            markLoaded();
          },
          (subscriptionError) => {
            if (canceled) {
              return;
            }

            console.warn('Failed to subscribe to profile document', subscriptionError);
            setFavorites([]);
            setVotes({});
            profileLoaded = true;
            markLoaded();
            if (isFirebaseError(subscriptionError) && subscriptionError.code === 'permission-denied') {
              setError('You do not have permission to access your remix profile.');
            } else {
              setError('Unable to load your remix profile right now.');
            }
          }
        );
      } catch (profileInitError) {
        console.warn('Unable to start profile listener', profileInitError);
        setFavorites([]);
        setVotes({});
        profileLoaded = true;
        markLoaded();
        if (isFirebaseError(profileInitError) && profileInitError.code === 'permission-denied') {
          setError('You do not have permission to access your remix profile.');
        } else {
          setError('Unable to load your remix profile right now.');
        }
      }
    } else {
      setFavorites([]);
      setVotes({});
      profileLoaded = true;
      markLoaded();
    }

    return () => {
      canceled = true;
      unsubUserDoc?.();
      unsubStats?.();
    };
  }, [firestore, isConfigured, user]);

  const adjustStats = useCallback((remixId: string, previousVote?: VoteValue, nextVote?: VoteValue) => {
    setStats((current) => {
      const currentStats = current[remixId] ?? defaultStats;
      let { upvotes, downvotes } = currentStats;

      if (previousVote === 'up') {
        upvotes = Math.max(0, upvotes - 1);
      }

      if (previousVote === 'down') {
        downvotes = Math.max(0, downvotes - 1);
      }

      if (nextVote === 'up') {
        upvotes += 1;
      }

      if (nextVote === 'down') {
        downvotes += 1;
      }

      return {
        ...current,
        [remixId]: { upvotes, downvotes }
      };
    });
  }, []);

  const toggleFavorite = useCallback(
    async (remixId: string) => {
      setError(null);

      if (!firestore || !isConfigured) {
        setError('Firebase is not configured. Favorites require a connected account.');
        return;
      }

      if (!user) {
        setError('Sign in to save remixes to your favorites.');
        return;
      }

      const previousFavorites = favorites;
      const exists = previousFavorites.includes(remixId);
      const updated = exists
        ? previousFavorites.filter((id) => id !== remixId)
        : [...previousFavorites, remixId];

      setFavorites(updated);

      try {
        const profileDocRef = doc(firestore, 'profiles', user.uid);
        await setDoc(profileDocRef, { favorites: updated }, { merge: true });
      } catch (favoriteError) {
        console.error('Failed to update favorites', favoriteError);
        setFavorites(previousFavorites);
        setError('Could not update favorites. Please try again.');
      }
    },
    [favorites, firestore, isConfigured, user]
  );

  const vote = useCallback(
    async (remixId: string, direction: VoteValue) => {
      setError(null);

       if (!firestore || !isConfigured) {
        setError('Firebase is not configured. Voting requires a connected account.');
        return;
      }

      if (!user) {
        setError('Sign in to vote on remixes.');
        return;
      }

      const previousVotes = votes;
      const previousVote = previousVotes[remixId];
      const isSameDirection = previousVote === direction;
      const nextVote = isSameDirection ? undefined : direction;
      const updatedVotes: VoteMap = { ...previousVotes };

      if (nextVote) {
        updatedVotes[remixId] = nextVote;
      } else {
        delete updatedVotes[remixId];
      }

      setVotes(updatedVotes);
      adjustStats(remixId, previousVote, nextVote);

      try {
        const profileDocRef = doc(firestore, 'profiles', user.uid);
        const statsDocRef = doc(firestore, 'remixStats', remixId);

        await runTransaction(firestore, async (transaction) => {
          transaction.set(profileDocRef, { votes: updatedVotes }, { merge: true });

          const statsSnapshot = await transaction.get(statsDocRef);
          const statsData = statsSnapshot.exists()
            ? (statsSnapshot.data() as RemixStats)
            : defaultStats;

          let { upvotes, downvotes } = statsData;

          if (previousVote === 'up') {
            upvotes = Math.max(0, upvotes - 1);
          }

          if (previousVote === 'down') {
            downvotes = Math.max(0, downvotes - 1);
          }

          if (nextVote === 'up') {
            upvotes += 1;
          }

          if (nextVote === 'down') {
            downvotes += 1;
          }

          transaction.set(
            statsDocRef,
            {
              upvotes,
              downvotes
            },
            { merge: true }
          );
        });
      } catch (voteError) {
        console.error('Failed to update vote', voteError);
        setVotes(previousVotes);
        adjustStats(remixId, nextVote, previousVote);
        setError('Unable to record your vote. Please try again.');
      }
    },
    [adjustStats, firestore, isConfigured, user, votes]
  );

  const isFavorite = useCallback(
    (remixId: string): boolean => favorites.includes(remixId),
    [favorites]
  );

  const getVote = useCallback(
    (remixId: string): VoteValue | null => votes[remixId] ?? null,
    [votes]
  );

  const getNetVotes = useCallback(
    (remixId: string): number => {
      const remixStats = stats[remixId] ?? defaultStats;
      return remixStats.upvotes - remixStats.downvotes;
    },
    [stats]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<RemixDataContextValue>(
    () => ({
      favorites,
      votes,
      stats,
      loading,
      error,
      isFavorite,
      getVote,
      toggleFavorite,
      vote,
      getNetVotes,
      clearError
    }),
    [clearError, error, favorites, getNetVotes, getVote, isFavorite, loading, stats, toggleFavorite, vote, votes]
  );

  return <RemixDataContext.Provider value={value}>{children}</RemixDataContext.Provider>;
}

export function useRemixData(): RemixDataContextValue {
  const context = useContext(RemixDataContext);

  if (!context) {
    throw new Error('useRemixData must be used within a RemixDataProvider');
  }

  return context;
}
