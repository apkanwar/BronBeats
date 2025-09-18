import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    void router.push(`/songs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <NextSeo
        title="BronBeats | The beats you see on IG"
        description="Rank your favorite Lebron James Remixes"
        canonical="https://www.bronbeats.com/"
        openGraph={{
          url: 'https://www.bronbeats.com/',
          title: "BronBeats | The beats you see on IG",
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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg p-6 text-center">
          <h1 className="mb-8 text-4xl font-bold text-blue-600 font-headings">LeBron Remix</h1>
          <form onSubmit={handleSearch} className="flex flex-col items-center gap-6 font-main">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search LeBron Remixes..."
                value={searchQuery}
                className="w-full p-3 px-8 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
              />
              <div className="pointer-events-none absolute right-8 top-3 my-0.5 text-gray-500">
                <Search size={20} />
              </div>
            </div>

            <div className="flex gap-3 font-semibold">
              <button type="submit"
                className="px-6 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 text-sm"
              >
                Search Remixes
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full p-4 text-sm text-center uppercase font-semibold font-main">
        The ultimate collection of LeBron James remix songs
      </footer>
    </div>
  );
}
