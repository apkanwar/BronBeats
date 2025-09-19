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
          <Link href="/" className="flex flex-1 items-center font-headings text-xl">
            <div className="flex items-center gap-4 rounded-full bg-arcticBlue p-1 pr-3 font-semibold text-darkMode">
              <Image width={40} height={40} src="/logo.png" alt="BronBeats Logo" className="rounded-full" />
              <span>BronBeats</span>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4 font-main text-lg font-medium">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-1 text-white">
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
            <button
              type="button"
              className="cursor-pointer rounded-full bg-arcticBlue px-4 py-1 text-darkMode transition hover:bg-lakersPurple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAuthClick}
              disabled={initializing}
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </nav>

      <div className="px-8 py-3">
        <div className="mx-auto flex max-w-7xl gap-4">
          <nav className="flex gap-8 font-headings text-xl leading-6" aria-label="Primary">
            {links.map((link) => {
              const isActive = router.pathname.startsWith(link.href);
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
