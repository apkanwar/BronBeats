import { FirebaseError } from 'firebase/app';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, Unsubscribe } from 'firebase/firestore';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseServices } from '@/lib/firebase/client';
import { useRemixLibrary } from '@/context/RemixLibraryContext';
import { useAuth } from './AuthContext';

type VoteValue = 'up' | 'down';

type VoteMap = Record<string, VoteValue>;

type RemixDataContextValue = {
  favorites: string[];
  votes: VoteMap;
  loading: boolean;
  error: string | null;
  isFavorite: (remixId: string) => boolean;
  getVote: (remixId: string) => VoteValue | null;
  toggleFavorite: (remixId: string) => Promise<void>;
  vote: (remixId: string, direction: VoteValue) => Promise<void>;
  getNetVotes: (remixId: string) => number;
  getAggregates: (remixId: string) => { upvotes: number; downvotes: number };
  clearError: () => void;
};

const RemixDataContext = createContext<RemixDataContextValue | undefined>(undefined);

function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

export function RemixDataProvider({ children }: { children: ReactNode }) {
  const { firestore, isConfigured } = firebaseServices;
  const { user } = useAuth();
  const { remixes } = useRemixLibrary();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [votes, setVotes] = useState<VoteMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubUserDoc: Unsubscribe | undefined;
    let canceled = false;

    setLoading(true);
    setError(null);

    if (!firestore || !isConfigured) {
      setFavorites([]);
      setVotes({});
      setError('Voting, favorites, and leaderboard stats require Firebase configuration.');
      setLoading(false);
      return () => undefined;
    }

    let profileLoaded = !user;

    const markLoaded = () => {
      if (!canceled && profileLoaded) {
        setLoading(false);
      }
    };

    if (user) {
      const profileDocRef = doc(firestore, 'profiles', user.uid);

      const ensureProfile = async () => {
        try {
          const snapshot = await getDoc(profileDocRef);
          if (!snapshot.exists()) {
            await setDoc(
              profileDocRef,
              {
                favorites: [],
                votes: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              },
              { merge: false }
            );
          }
        } catch (creationError) {
          console.error('Failed to ensure profile document', creationError);
          setError('Unable to access your remix profile.');
        }
      };

      void ensureProfile();

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
    } else {
      setFavorites([]);
      setVotes({});
      profileLoaded = true;
      markLoaded();
    }

    return () => {
      canceled = true;
      unsubUserDoc?.();
    };
  }, [firestore, isConfigured, user]);

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
      const optimisticVotes: VoteMap = { ...previousVotes };

      if (nextVote) {
        optimisticVotes[remixId] = nextVote;
      } else {
        delete optimisticVotes[remixId];
      }

      setVotes(optimisticVotes);
      try {
        const profileDocRef = doc(firestore, 'profiles', user.uid);
        const remixDocRef = doc(firestore, 'remixes', remixId);

        const committedVotes = await runTransaction(firestore, async (transaction) => {
          const remixSnapshot = await transaction.get(remixDocRef);
          if (!remixSnapshot.exists()) {
            throw new Error('Remix not available in Firestore');
          }

          const profileSnapshot = await transaction.get(profileDocRef);
          const firestoreVotes = profileSnapshot.exists()
            ? ((profileSnapshot.data() as { votes?: VoteMap }).votes ?? {})
            : {};

          const previousVoteInStore = firestoreVotes[remixId];
          const isSameInStore = previousVoteInStore === direction;
          const nextVoteInStore = isSameInStore ? undefined : direction;

          const updatedVotesInStore: VoteMap = { ...firestoreVotes };
          if (nextVoteInStore) {
            updatedVotesInStore[remixId] = nextVoteInStore;
          } else {
            delete updatedVotesInStore[remixId];
          }

          const data = remixSnapshot.data() as {
            upvotes?: number;
            downvotes?: number;
          };

          let upvotes = Number(data.upvotes ?? 0);
          let downvotes = Number(data.downvotes ?? 0);

          if (previousVoteInStore === 'up') {
            upvotes = Math.max(0, upvotes - 1);
          }

          if (previousVoteInStore === 'down') {
            downvotes = Math.max(0, downvotes - 1);
          }

          if (nextVoteInStore === 'up') {
            upvotes += 1;
          }

          if (nextVoteInStore === 'down') {
            downvotes += 1;
          }

          transaction.set(remixDocRef, { upvotes, downvotes }, { merge: true });
          transaction.set(profileDocRef, { votes: updatedVotesInStore }, { merge: true });

          return updatedVotesInStore;
        });

        setVotes(committedVotes);
      } catch (voteError) {
        console.error('Failed to update vote', voteError);
        setVotes(previousVotes);
        setError('Unable to record your vote. Please try again.');
      }
    },
    [firestore, isConfigured, user, votes]
  );

  const isFavorite = useCallback(
    (remixId: string): boolean => favorites.includes(remixId),
    [favorites]
  );

  const getVote = useCallback(
    (remixId: string): VoteValue | null => votes[remixId] ?? null,
    [votes]
  );

  const getAggregates = useCallback(
    (remixId: string): { upvotes: number; downvotes: number } => {
      const remix = remixes.find((item) => item.id === remixId);
      if (!remix) {
        return { upvotes: 0, downvotes: 0 };
      }
      return { upvotes: remix.upvotes, downvotes: remix.downvotes };
    },
    [remixes]
  );

  const getNetVotes = useCallback(
    (remixId: string): number => {
      const { upvotes, downvotes } = getAggregates(remixId);
      return upvotes - downvotes;
    },
    [getAggregates]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<RemixDataContextValue>(
    () => ({
      favorites,
      votes,
      loading,
      error,
      isFavorite,
      getVote,
      toggleFavorite,
      vote,
      getNetVotes,
      getAggregates,
      clearError
    }),
    [clearError, error, favorites, getAggregates, getNetVotes, getVote, isFavorite, loading, toggleFavorite, vote, votes]
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
