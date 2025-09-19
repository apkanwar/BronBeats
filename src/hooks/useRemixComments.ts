import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { firebaseServices } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

export type RemixComment = {
  id: string;
  text: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
};

type CommentsHook = {
  comments: RemixComment[];
  loading: boolean;
  error: string | null;
  addComment: (text: string) => Promise<void>;
  isFirestoreBacked: boolean;
};

const LOCAL_COMMENTS_PREFIX = 'bronbeats:comments:';

function readLocalComments(remixId: string): RemixComment[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(`${LOCAL_COMMENTS_PREFIX}${remixId}`);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RemixComment[];
    return parsed.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
    }));
  } catch (error) {
    console.error('Failed to parse local comments', error);
    return [];
  }
}

function writeLocalComments(remixId: string, comments: RemixComment[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(`${LOCAL_COMMENTS_PREFIX}${remixId}`, JSON.stringify(comments));
  } catch (error) {
    console.error('Failed to persist local comments', error);
  }
}

export function useRemixComments(remixId: string): CommentsHook {
  const { firestore, isConfigured } = firebaseServices;
  const { user } = useAuth();

  const [comments, setComments] = useState<RemixComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!remixId) {
      return undefined;
    }

    setLoading(true);
    setError(null);

    if (!firestore) {
      const local = readLocalComments(remixId);
      setComments(local);
      setLoading(false);
      return undefined;
    }

    const commentsRef = collection(firestore, 'remixComments', remixId, 'items');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const nextComments: RemixComment[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Partial<RemixComment> & { createdAt?: { toDate?: () => Date } };
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

          return {
            id: doc.id,
            text: data.text ?? '',
            createdAt,
            authorId: data.authorId ?? 'anonymous',
            authorName: data.authorName ?? 'BronBeats Fan',
            authorAvatar: data.authorAvatar ?? null
          };
        });

        setComments(nextComments);
        setLoading(false);
      },
      (subscriptionError) => {
        console.error('Failed to load comments', subscriptionError);
        setError('Unable to load comments right now.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [firestore, remixId]);

  const addComment = useMemo(
    () =>
      async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }

        if (!user) {
          throw new Error('You must be signed in to comment.');
        }

        if (!firestore) {
          const newComment: RemixComment = {
            id: `${Date.now()}`,
            text: trimmed,
            createdAt: new Date(),
            authorId: user.uid,
            authorName: user.displayName ?? 'BronBeats Fan',
            authorAvatar: user.photoURL
          };
          const updated = [newComment, ...comments];
          setComments(updated);
          writeLocalComments(remixId, updated);
          return;
        }

        const commentsRef = collection(firestore, 'remixComments', remixId, 'items');
        await addDoc(commentsRef, {
          text: trimmed,
          authorId: user.uid,
          authorName: user.displayName ?? 'BronBeats Fan',
          authorAvatar: user.photoURL ?? null,
          createdAt: serverTimestamp()
        });
      },
    [comments, firestore, remixId, user]
  );

  return {
    comments,
    loading,
    error,
    addComment,
    isFirestoreBacked: isConfigured
  };
}
