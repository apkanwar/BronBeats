import { NextSeo } from 'next-seo';
import Navbar from '@/components/navbar';
import { useAuth } from '@/context/AuthContext';
import { useRemixData } from '@/context/RemixDataContext';
import { useRemixLibrary } from '@/context/RemixLibraryContext';
import MiniRemixCard from '@/components/mini-remix-card';

export default function VotesPage() {
  const { isAuthenticated, initializing } = useAuth();
  const { votes } = useRemixData();
  const { remixes, loading } = useRemixLibrary();

  const upvotedIds = Object.entries(votes)
    .filter(([, direction]) => direction === 'up')
    .map(([id]) => id);
  const downvotedIds = Object.entries(votes)
    .filter(([, direction]) => direction === 'down')
    .map(([id]) => id);

  const upvotedRemixes = remixes.filter((remix) => upvotedIds.includes(remix.id));
  const downvotedRemixes = remixes.filter((remix) => downvotedIds.includes(remix.id));

  const renderList = (title: string, items: typeof remixes) => (
    <section>
      <h2 className="mb-4 text-2xl font-semibold text-slate-800">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {items.map((remix) => (
            <MiniRemixCard key={remix.id} remix={remix} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo title="Your Votes | BronBeats" />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-lakersPurple-600 sm:text-4xl md:text-5xl">Your Votes</h1>
          <p className="text-base text-slate-600">
            Track which remixes you’ve boosted or dropped.
          </p>
        </header>

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {initializing ? 'Loading your account…' : 'Sign in to view your voting history.'}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Loading your votes…
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {renderList('Upvoted remixes', upvotedRemixes)}
            {renderList('Downvoted remixes', downvotedRemixes)}
          </div>
        )}
      </main>
    </div>
  );
}
