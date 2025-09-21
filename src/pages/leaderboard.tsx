import { useMemo } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { Trophy } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useRemixData } from '@/context/RemixDataContext';
import { useRemixLibrary } from '@/context/RemixLibraryContext';

export default function LeaderboardPage() {
  const { remixes, loading: remixesLoading, error: remixesError } = useRemixLibrary();
  const { getNetVotes, getAggregates } = useRemixData();

  const leaderboard = useMemo(() => {
    return remixes
      .map((remix) => {
        const { upvotes, downvotes } = getAggregates(remix.id);
        const net = getNetVotes(remix.id);
        return {
          remix,
          upvotes,
          downvotes,
          net
        };
      })
      .sort((a, b) => b.net - a.net || b.upvotes - a.upvotes);
  }, [getAggregates, getNetVotes, remixes]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo
        title="Leaderboard | BronBeats"
        description="See which LeBron remixes are winning the community vote."
        openGraph={{
          title: 'Leaderboard | BronBeats',
          description: 'See which LeBron remixes are winning the community vote.'
        }}
      />
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3 rounded-full bg-lakersPurple-100 px-4 py-2 text-lakersPurple-600 sm:px-5">
            <Trophy size={20} />
            <span className=" font-semibold uppercase tracking-wide">Leaderboard</span>
          </div>
          <p className="text-base text-slate-600">
            Rankings update automatically using community upvotes minus downvotes.
            Tie breakers favor the remix with the highest total upvotes.
          </p>
          {remixesError ? (
            <p className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {remixesError}
            </p>
          ) : null}
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-12 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span className="col-span-6 text-left">Remix</span>
            <span className="col-span-2 text-center">Upvotes</span>
            <span className="col-span-2 text-center">Downvotes</span>
            <span className="col-span-2 text-center">Net</span>
          </div>
          {remixesLoading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">Loading leaderboard…</div>
          ) : leaderboard.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">No remixes available.</div>
          ) : (
            <ul>
              {leaderboard.map(({ remix, upvotes, downvotes, net }, index) => (
                <li
                  key={remix.id}
                  className={`flex flex-col gap-4 px-4 py-5 text-sm transition md:grid md:grid-cols-12 md:items-center md:gap-0 md:px-6 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4 md:col-span-6">
                    <span className="text-lg font-bold text-lakersPurple-600">#{index + 1}</span>
                    <Link
                      href={`/remixes/${remix.id}`}
                      className="text-base font-semibold text-slate-900 transition hover:text-lakersPurple-600 md:text-lg"
                    >
                      {remix.remixName}
                    </Link>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-3 text-center text-base font-semibold md:col-span-6 md:grid-cols-3 md:gap-0">
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-600 md:rounded-none md:bg-transparent md:px-0 md:py-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 md:hidden">
                        Upvotes
                      </span>
                      {upvotes}
                    </div>
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-red-600 md:rounded-none md:bg-transparent md:px-0 md:py-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 md:hidden">
                        Downvotes
                      </span>
                      {downvotes}
                    </div>
                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-800 md:rounded-none md:bg-transparent md:px-0 md:py-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 md:hidden">
                        Net
                      </span>
                      {net}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
