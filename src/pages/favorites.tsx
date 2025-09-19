import { NextSeo } from 'next-seo';
import Navbar from '@/components/navbar';
import { useAuth } from '@/context/AuthContext';
import { useRemixData } from '@/context/RemixDataContext';
import { useRemixLibrary } from '@/context/RemixLibraryContext';
import MiniRemixCard from '@/components/mini-remix-card';

export default function FavoritesPage() {
  const { isAuthenticated, initializing } = useAuth();
  const { favorites } = useRemixData();
  const { remixes, loading } = useRemixLibrary();

  const favoriteRemixes = remixes.filter((remix) => favorites.includes(remix.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo title="Favorite Remixes | BronBeats" />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <header className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-lakersPurple-600 md:text-5xl">Your Favorite Remixes</h1>
          <p className="mt-2 text-base text-slate-600">
            Saved remixes sync with your account so you can revisit them anytime.
          </p>
        </header>

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {initializing ? 'Loading your account…' : 'Sign in to view and manage your favorite remixes.'}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Loading your favorites…
          </div>
        ) : favoriteRemixes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            You have not favorited any remixes yet.
          </div>
        ) : (
          <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {favoriteRemixes.map((remix) => (
              <MiniRemixCard key={remix.id} remix={remix} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
