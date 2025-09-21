import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { ArrowDown, ArrowUp, Heart, HeartOff, MessageSquarePlus, UserCircle2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Remix, remixFromFirestoreRecord } from '@/data/remixes';
import { useAuth } from '@/context/AuthContext';
import { useRemixData } from '@/context/RemixDataContext';
import { RemixComment, useRemixComments } from '@/hooks/useRemixComments';
import { useRemixLibrary } from '@/context/RemixLibraryContext';
import { getAdminDb } from '@/lib/firebase/admin';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

type RemixPageProps = {
  remix: Remix;
};

export default function RemixDetailPage({ remix }: RemixPageProps) {
  const { isAuthenticated, signInWithGoogle, isFirebaseReady } = useAuth();
  const {
    isFavorite,
    toggleFavorite,
    getVote,
    vote,
    getNetVotes,
    loading: remixDataLoading,
    error: remixDataError,
    getAggregates
  } = useRemixData();
  const { remixes: libraryRemixes } = useRemixLibrary();
  const liveRemix = useMemo(() => libraryRemixes.find((item) => item.id === remix.id), [libraryRemixes, remix.id]);
  const remixData = liveRemix ?? remix;
  const relatedRemixes = useMemo(
    () => libraryRemixes.filter((item) => item.id !== remix.id).slice(0, 3),
    [libraryRemixes, remix.id]
  );

  const { comments, loading: commentsLoading, error: commentsError, addComment, isFirestoreBacked } =
    useRemixComments(remixData.id);
  const [commentText, setCommentText] = useState<string>('');
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(null);

  const currentVote = getVote(remixData.id);
  const favorite = isFavorite(remixData.id);
  const { upvotes, downvotes } = getAggregates(remixData.id);
  const netVotes = getNetVotes(remixData.id);

  const handleVote = async (direction: 'up' | 'down') => {
    if (remixDataLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (isFirebaseReady) {
        try {
          await signInWithGoogle();
          return;
        } catch (error) {
          console.error('Sign-in failed', error);
        }
      }
    }

    try {
      await vote(remixData.id, direction);
    } catch (error) {
      console.error('Failed to register vote', error);
    }
  };

  const handleFavorite = async () => {
    if (remixDataLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (isFirebaseReady) {
        try {
          await signInWithGoogle();
          return;
        } catch (error) {
          console.error('Sign-in failed', error);
        }
      }
    }

    try {
      await toggleFavorite(remixData.id);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommentSubmitError(null);

    try {
      await addComment(commentText);
      setCommentText('');
    } catch (error) {
      setCommentSubmitError(error instanceof Error ? error.message : 'Unable to add comment.');
    }
  };

  const renderComment = (comment: RemixComment) => (
    <li key={comment.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {comment.authorAvatar ? (
        <Image
          src={comment.authorAvatar}
          alt={`${comment.authorName} avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <UserCircle2 size={40} className="text-slate-400" />
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">{comment.authorName}</span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {dateFormatter.format(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{comment.text}</p>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo
        title={`${remixData.remixName} | BronBeats`}
        description={remixData.description}
        openGraph={{
          title: `${remixData.remixName} | BronBeats`,
          description: remixData.description,
          images: [
            {
              url: remixData.thumbnailUrl,
              width: 1200,
              height: 675,
              alt: `${remixData.remixName} thumbnail`
            }
          ]
        }}
      />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-16 pt-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-widest text-lakersPurple-600">Remix Spotlight</p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">{remixData.remixName}</h1>
        </header>

        <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-6">
            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
              <iframe
                src={`https://player.vimeo.com/video/${remixData.vimeoId}`}
                title={`${remixData.remixName} Vimeo player`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
                loading="lazy"
              />
            </div>

            {remixDataError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {remixDataError}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className='flex flex-row gap-3'>
                <button
                  type="button"
                  onClick={() => void handleVote('up')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${currentVote === 'up'
                    ? 'border-lakersPurple-600 bg-lakersPurple-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-lakersPurple-600 hover:text-lakersPurple-600'
                    } ${remixDataLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                  disabled={remixDataLoading}
                >
                  <ArrowUp size={18} />
                  Upvote
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{upvotes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleVote('down')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${currentVote === 'down'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-red-500 hover:text-red-600'
                    } ${remixDataLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                  disabled={remixDataLoading}
                >
                  <ArrowDown size={18} />
                  Downvote
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{downvotes}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleFavorite()}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${favorite
                  ? 'border-pink-600 bg-pink-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-pink-600 hover:text-pink-600'
                  } ${remixDataLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                disabled={remixDataLoading}
              >
                <Heart size={18} />
                {favorite ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                Sign in with Google to vote on remixes, save favorites, and sync your activity across devices.
              </div>
            )}

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">About this remix</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                {remixData.description || 'No description provided.'}
              </p>
              {remixData.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-lakersPurple-600">
                  {remixData.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-lakersPurple-50 px-3 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className=" text-2xl font-semibold text-slate-900">Comments</h2>
              </div>

              {commentsError ? (
                <p className="text-sm text-red-600">{commentsError}</p>
              ) : null}

              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
                  <label htmlFor="comment-input" className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <MessageSquarePlus size={18} />
                    Add your thoughts
                  </label>
                  <textarea
                    id="comment-input"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Drop a bar about this remix..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100"
                    rows={3}
                  />
                  {commentSubmitError ? <p className="text-xs text-red-600">{commentSubmitError}</p> : null}
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      className="rounded-full bg-lakersPurple-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-100 p-4 text-sm text-slate-700">
                  <p>Sign in with Google to join the conversation.</p>
                  {!isFirebaseReady ? (
                    <p className="text-xs text-slate-500">
                      DB Failed to Load Comments. Comments will be available once Issue is Fixed.
                    </p>
                  ) : null}
                </div>
              )}

              {commentsLoading ? (
                <p className="text-sm text-slate-500">Loading Comments...</p>
              ) : comments.length > 0 ? (
                <ul className="space-y-4">{comments.map((comment) => renderComment(comment))}</ul>
              ) : (
                <p className="text-sm text-slate-500">Be the first to leave a comment on this Remix.</p>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            {/* <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Remix Stats</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Upvotes:</span> {upvotes}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Downvotes:</span> {downvotes}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Net Score:</span> {netVotes}
                </p>
              </div>
            </div> */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Related Videos</h2>
              {relatedRemixes.length === 0 ? (
                <p className="text-sm text-slate-500">More remixes will appear here as they’re added.</p>
              ) : (
                <ul className="space-y-4">
                  {relatedRemixes.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <Link href={`/remixes/${item.id}`} className="group relative h-12 w-20 overflow-hidden rounded-lg">
                        <Image
                          src={item.thumbnailUrl}
                          alt={`${item.remixName} thumbnail`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link
                          href={`/remixes/${item.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-lakersGold-600"
                        >
                          {item.remixName}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description || 'No description provided.'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

async function fetchRemixFromFirestore(id: string): Promise<Remix | null> {
  try {
    const db = getAdminDb();
    const docSnapshot = await db.collection('remixes').doc(id).get();
    return remixFromFirestoreRecord(id, docSnapshot.data() as Partial<Remix> | undefined);
  } catch (error) {
    console.error('Failed to Fetch Remix', error);
    return null;
  }
}

export const getStaticProps: GetStaticProps<RemixPageProps> = async ({ params }) => {
  const id = params?.id;

  if (typeof id !== 'string') {
    return {
      notFound: true
    };
  }

  const remix = await fetchRemixFromFirestore(id);

  if (!remix) {
    return { notFound: true };
  }

  return {
    props: {
      remix
    }
  };
};
