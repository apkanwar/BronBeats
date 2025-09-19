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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3 rounded-full bg-lakersPurple-100 px-5 py-2 text-lakersPurple-600">
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
          <div className="grid grid-cols-12 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className={`grid grid-cols-12 items-center px-6 py-5 text-sm transition ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                >
                  <div className="col-span-6 flex items-center gap-4">
                    <span className=" text-lg font-bold text-lakersPurple-600">#{index + 1}</span>
                    <div>
                      <Link
                        href={`/remixes/${remix.id}`}
                        className=" text-lg font-semibold text-slate-900 hover:text-lakersPurple-600"
                      >
                        {remix.remixName}
                      </Link>
                    </div>
                  </div>
                  <span className="col-span-2 text-center font-semibold text-green-600">{upvotes}</span>
                  <span className="col-span-2 text-center font-semibold text-red-600">{downvotes}</span>
                  <span className="col-span-2 text-center font-semibold text-slate-800">{net}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
