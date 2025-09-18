import Link from 'next/link';
import Image from 'next/image';
import type { MouseEvent, ReactElement } from 'react';

const links: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/all-songs', label: 'All Remixes' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const handleAuthClick = (event: MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation();
  // TODO: replace with authentication logic when available.
};

export default function Navbar(): ReactElement {
  return (
    <header className="text-darkMode cursor-default select-none">
      <nav className="bg-darkMode p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <Link href="/" className="flex flex-1 items-center font-headings text-xl">
            <div className="flex items-center gap-4 bg-arcticBlue rounded-full p-1 pr-3 font-semibold cursor-pointer">
              <Image width={40} height={40} src="/favicon.ico" alt="BronBeats Logo" className="rounded-full" />
              <span>BronBeats</span>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4 font-medium font-main text-lg">
            <button
              type="button"
              className="bg-arcticBlue rounded-full p-1 px-3 cursor-pointer hover:bg-blue-600 hover:text-white"
              onClick={handleAuthClick}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>
      <div className="px-8 py-3">
        <div className="max-w-7xl mx-auto flex gap-4">
          <nav className="flex gap-8 leading-6 font-headings text-xl" aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 bg-darkMode text-white rounded-full py-1 px-6 cursor-pointer border-4 border-darkMode hover:bg-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
