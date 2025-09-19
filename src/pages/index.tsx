import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '@/components/navbar';
import Image from 'next/image';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    void router.push(`/remixes?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="flex h-screen flex-col">
      <NextSeo
        title="BronBeats | The beats you see on IG"
        description="Rank your favorite Lebron James Remixes"
        canonical="https://www.bronbeats.com/"
        openGraph={{
          url: 'https://www.bronbeats.com/',
          title: 'BronBeats | The beats you see on IG',
          description: 'Rank your favorite Lebron James Remixes',
          images: [
            {
              url: '/logo.png',
              width: 500,
              height: 500,
              alt: 'BronBeats Logo',
              type: 'image/png'
            }
          ],
          siteName: 'BronBeats'
        }}
      />

      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg p-6 text-center">
          <Image src={'/logo.png'} alt="BronBeats Logo" width={200} height={200} className="mx-auto mb-4 rounded-2xl" />
          <form onSubmit={handleSearch} className="mt-8 flex flex-col items-center gap-6 ">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border-[1.5px] border-slate-300 bg-white px-4 py-2 shadow-sm group focus-within:border-lakersPurple-600">
              <div className="pointer-events-none my-0.5 text-gray-500 transition-colors group-focus-within:text-lakersPurple-600">
                <Search size={20} />
              </div>
              <input
                className="h-8 flex-1 border-none bg-transparent text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none caret-lakersPurple-600"
                value={searchQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                placeholder="Search Remixes"
                aria-label="Search remixes"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 font-semibold">
              <button
                type="submit"
                className="rounded-full border border-gray-300 bg-gray-100 px-6 py-2 text-sm hover:bg-gray-200"
              >
                Search Remixes
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full p-4 text-center text-sm font-semibold  uppercase">
        The ultimate collection of LeBron James remix songs
      </footer>
    </div>
  );
}
