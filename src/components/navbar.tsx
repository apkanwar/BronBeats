import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { MouseEvent, ReactElement } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/remixes', label: 'All Remixes' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/requests', label: 'Request a Remix' }
];

export default function Navbar(): ReactElement {
  const router = useRouter();
  const { isAuthenticated, signInWithGoogle, signOut, user, isFirebaseReady, initializing } = useAuth();

  const handleAuthClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isFirebaseReady) {
      console.warn('Firebase is not configured. Skipping auth action.');
      return;
    }

    try {
      if (isAuthenticated) {
        await signOut();
      } else {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('Authentication failed', error);
    }
  };

  return (
    <header className="cursor-default select-none text-darkMode">
      <nav className="bg-darkMode p-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
          <Link href="/ " className="flex flex-1 items-center font-headings text-xl">
            <div className="flex items-center gap-4 rounded-full bg-white p-1 pr-5 font-semibold text-darkMode">
              <Image width={40} height={40} src="/logo.png" alt="BronBeats Logo" className="rounded-full" />
              <span>BronBeats</span>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2 font-main text-lg font-medium">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 rounded-full bg-white/10 pr-5 p-2 text-white">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? 'Profile avatar'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <UserCircle2 size={28} className="text-white" />
                )}
                <span className="text-sm font-semibold">{user.displayName ?? 'Remix Fan'}</span>
              </div>
            ) : null}
            <button onClick={handleAuthClick} disabled={initializing}
              className="flex flex-row justify-center gap-2 bg-google rounded-full font-main p-[2px] text-sm">
              {!isAuthenticated ? (
                <span className="bg-white rounded-full flex items-center gap-2 px-4 py-1 hover:bg-gray-200 w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.63 0 6.4 5.38 2.56 13.22l7.98 6.19C12.43 13.24 17.74 9.5 24 9.5z" />
                    <path fill="#34A853" d="M46.5 24.5c0-1.58-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.23 5.47-4.72 7.16l7.24 5.63C43.74 38.44 46.5 31.96 46.5 24.5z" />
                    <path fill="#FBBC05" d="M10.53 28.41A14.48 14.48 0 0 1 9.5 24c0-1.52.26-2.98.74-4.36l-7.98-6.19C.82 16.76 0 20.29 0 24c0 3.71.82 7.24 2.26 10.55l8.27-6.14z" />
                    <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.13 15.88-5.81l-7.24-5.63c-2.01 1.35-4.59 2.14-8.64 2.14-6.26 0-11.57-3.74-13.46-9.03l-8.27 6.14C6.4 42.62 14.63 48 24 48z" />
                  </svg>
                  Sign In
                </span>
              ) : (
                <span className="bg-white rounded-full flex items-center gap-2 px-4 py-1 hover:bg-gray-200 w-full">
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="px-8 py-3">
        <div className="mx-auto flex max-w-7xl gap-4">
          <nav className="flex gap-8 font-headings text-xl leading-6" aria-label="Primary">
            {links.map((link) => {
              const isActive = router.pathname.endsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${isActive ? 'bg-lakersPurple-600 text-white' : 'bg-white hover:bg-lakersPurple-600'} 
                    rounded-full border border-lakersPurple-600 px-6 py-2 text-sm text-lakersPurple-600 transition hover:bg-lakersPurple-600 hover:text-white`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
