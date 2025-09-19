import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Search, XCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import RemixCard from '@/components/remix-card';
import { remixes, searchRemixes } from '@/data/remixes';

function getQueryValue(value: string | string[] | undefined): string {
  if (!value) {
    return '';
  }

  return Array.isArray(value) ? value[0] ?? '' : value;
}

export default function RemixesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState<string>('');

  const searchQuery = useMemo(() => getQueryValue(router.query.search), [router.query.search]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const results = useMemo(() => searchRemixes(searchQuery), [searchQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    void router.push({
      pathname: '/remixes',
      query: trimmed ? { search: trimmed } : {}
    });
  };

  const handleClear = () => {
    setSearchInput('');
    void router.push({ pathname: '/remixes', query: {} });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo
        title="All LeBron Remixes | BronBeats"
        description="Browse every LeBron James remix and find new favorites."
        openGraph={{
          title: 'All LeBron Remixes | BronBeats',
          description: 'Browse every LeBron James remix and find new favorites.'
        }}
      />
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-10">
        <header className="flex flex-col gap-6 text-center md:text-left">
          <div>
            <h1 className="font-headings text-4xl font-bold text-lakersPurple-600 md:text-5xl">All Remixes</h1>
            <p className="mt-2 font-main text-lg text-slate-600">
              Dig through the entire BronBeats vault. Filter by remix name, original song, or tags to find the exact
              vibe you need.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border-[1.5px] border-slate-300 bg-white px-4 py-2 shadow-sm group focus-within:border-lakersPurple-600"
          >
            <Search size={20} className="text-slate-500 transition-colors group-focus-within:text-lakersPurple-600" aria-hidden />
            <input
              className="h-12 flex-1 border-none bg-transparent text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none caret-lakersPurple-600"
              value={searchInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value)}
              placeholder="Search remixes by song, artist, or tag..."
              aria-label="Search remixes"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-200"
              >
                <XCircle size={14} />
                Clear
              </button>
            )}
            <button
              type="submit"
              className="rounded-full bg-lakersPurple-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700"
            >
              Search
            </button>
          </form>
          <p className="font-main text-sm text-slate-500">
            Showing {results.length} remix{results.length === 1 ? '' : 'es'}{' '}
            {searchQuery ? `for "${searchQuery}"` : 'from the BronBeats library'}
          </p>
        </header>

        <section>
          {results.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {results.map((remix) => (
                <RemixCard key={remix.id} remix={remix} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="font-headings text-2xl font-semibold text-slate-700">No remixes found</h2>
              <p className="font-main text-base text-slate-500">
                Try a different search term or explore by tags like <span className="font-semibold">highlight</span>,
                <span className="font-semibold"> trap</span>, or <span className="font-semibold"> anthem</span>.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full bg-lakersPurple-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
