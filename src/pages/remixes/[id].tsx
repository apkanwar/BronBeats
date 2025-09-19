import { useState, FormEvent } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { ArrowDown, ArrowUp, Heart, HeartOff, MessageSquarePlus, UserCircle2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Remix, remixMap, remixes } from '@/data/remixes';
import { useAuth } from '@/context/AuthContext';
import { useRemixData } from '@/context/RemixDataContext';
import { RemixComment, useRemixComments } from '@/hooks/useRemixComments';

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
    stats,
    getNetVotes,
    loading: remixDataLoading,
    error: remixDataError
  } = useRemixData();
  const { comments, loading: commentsLoading, error: commentsError, addComment, isFirestoreBacked } =
    useRemixComments(remix.id);
  const [commentText, setCommentText] = useState<string>('');
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(null);

  const currentVote = getVote(remix.id);
  const favorite = isFavorite(remix.id);
  const { upvotes = 0, downvotes = 0 } = stats[remix.id] ?? { upvotes: 0, downvotes: 0 };
  const netVotes = getNetVotes(remix.id);

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
      await vote(remix.id, direction);
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
      await toggleFavorite(remix.id);
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
        title={`${remix.remixName} | BronBeats`}
        description={remix.description}
        openGraph={{
          title: `${remix.remixName} | BronBeats`,
          description: remix.description,
          images: [
            {
              url: remix.thumbnailUrl,
              width: 1200,
              height: 675,
              alt: `${remix.remixName} thumbnail`
            }
          ]
        }}
      />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
        <header className="flex flex-col gap-4">
          <p className="font-main text-sm uppercase tracking-widest text-lakersPurple-600">Remix Spotlight</p>
          <h1 className="font-headings text-4xl font-bold text-slate-900 md:text-5xl">{remix.remixName}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>By {remix.createdBy}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-500 md:inline-block" />
            <span>Original song: {remix.originalSongTitle}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-500 md:inline-block" />
            <span>Net votes: {netVotes}</span>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-6">
            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
              <iframe
                src={`https://player.vimeo.com/video/${remix.vimeoId}`}
                title={`${remix.remixName} Vimeo player`}
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

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleVote('up')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  currentVote === 'up'
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
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  currentVote === 'down'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-red-500 hover:text-red-600'
                } ${remixDataLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                disabled={remixDataLoading}
              >
                <ArrowDown size={18} />
                Downvote
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{downvotes}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleFavorite()}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  favorite
                    ? 'border-pink-600 bg-pink-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-pink-600 hover:text-pink-600'
                } ${remixDataLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                disabled={remixDataLoading}
              >
                {favorite ? <Heart size={18} /> : <HeartOff size={18} />}
                {favorite ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>

            {!isAuthenticated && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                Sign in with Google to vote on remixes, save favorites, and sync your activity across devices.
              </div>
            )}

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-headings text-2xl font-semibold text-slate-900">About this remix</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">{remix.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-lakersPurple-600">
                {remix.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-lakersPurple-50 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-headings text-2xl font-semibold text-slate-900">Comments</h2>
                <span className="text-sm font-semibold text-slate-500">{comments.length} total</span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isFirestoreBacked
                        ? 'Comments sync in real time via Firestore.'
                        : 'Comments are stored locally until Firebase is configured.'}
                    </span>
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
                  <button
                    type="button"
                    onClick={() =>
                      void signInWithGoogle().catch((error) => {
                        console.error('Sign-in failed', error);
                      })
                    }
                    className="rounded-full bg-lakersPurple-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700"
                    disabled={!isFirebaseReady}
                  >
                    Sign In with Google
                  </button>
                  {!isFirebaseReady ? (
                    <p className="text-xs text-slate-500">
                      Firebase environment variables are missing. Comments are available once they are provided.
                    </p>
                  ) : null}
                </div>
              )}

              {commentsLoading ? (
                <p className="text-sm text-slate-500">Loading comments...</p>
              ) : comments.length > 0 ? (
                <ul className="space-y-4">{comments.map((comment) => renderComment(comment))}</ul>
              ) : (
                <p className="text-sm text-slate-500">Be the first to leave a comment on this remix.</p>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-headings text-2xl font-semibold text-slate-900">Remix Stats</h2>
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
                <p>
                  <span className="font-semibold text-slate-800">Released:</span> {remix.releaseYear}
                </p>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-headings text-2xl font-semibold text-slate-900">Original Song</h2>
              <p className="text-sm text-slate-600">
                {remix.originalSongTitle} — {remix.originalArtist}
              </p>
              <a
                href={remix.originalSongUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-lakersPurple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700"
              >
                Listen to original
              </a>
              <a
                href={remix.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-lakersPurple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-lakersPurple-600 transition hover:bg-lakersPurple-600 hover:text-white"
              >
                View remix source
              </a>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = remixes.map((remix) => ({
    params: { id: remix.id }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<RemixPageProps> = async ({ params }) => {
  const id = params?.id;

  if (typeof id !== 'string') {
    return {
      notFound: true
    };
  }

  const remix = remixMap[id];

  if (!remix) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      remix
    }
  };
};
