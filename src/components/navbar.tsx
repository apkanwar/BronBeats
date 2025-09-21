import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { MouseEvent, ReactElement } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Menu, UserCircle2, X } from 'lucide-react';
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isFirebaseReady) {
      console.warn('Firebase is not configured. Skipping auth action.');
      return;
    }

    try {
      if (isAuthenticated) {
        await signOut();
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      } else {
        await signInWithGoogle();
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Authentication failed', error);
    }
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((previous) => !previous);
  };

  const closeProfileMenu = () => setProfileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((previous) => !previous);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const desktopNavLinkClass = (isActive: boolean) =>
    `${
      isActive
        ? 'bg-lakersPurple-600 text-white'
        : 'bg-white hover:bg-lakersPurple-600 hover:text-white'
    } rounded-full border border-lakersPurple-600 px-6 py-2 text-sm text-lakersPurple-600 transition`;

  const mobileNavLinkClass = (isActive: boolean) =>
    `${
      isActive ? 'bg-white text-darkMode' : 'bg-white/10 text-white hover:bg-white/20'
    } rounded-xl px-4 py-3 font-semibold uppercase tracking-wide transition`;

  return (
    <header className="cursor-default select-none text-darkMode">
      <nav className="bg-darkMode text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between gap-4 py-4 md:hidden">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 font-semibold text-white transition hover:bg-white/20"
            >
              <Image width={36} height={36} src="/logo.png" alt="BronBeats Logo" className="rounded-full" />
              <span className="text-lg">BronBeats</span>
            </Link>

            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center justify-center gap-4 py-6">
              <Link href="/" className="flex flex-1 items-center text-xl">
                <div className="flex items-center gap-4 rounded-full bg-white p-1 pr-5 font-semibold text-darkMode">
                  <Image width={40} height={40} src="/logo.png" alt="BronBeats Logo" className="rounded-full" />
                  <span>BronBeats</span>
                </div>
              </Link>

              <div className="flex flex-1 items-center justify-end gap-2 text-lg font-medium text-white">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleProfileMenu}
                      className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-1 text-white"
                    >
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
                      {profileMenuOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {profileMenuOpen ? (
                      <div
                        className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-white/20 bg-darkMode p-3 text-sm text-white shadow-lg"
                        onMouseLeave={closeProfileMenu}
                      >
                        <Link
                          href="/favorites"
                          className="block rounded-lg px-3 py-2 hover:bg-white/10"
                          onClick={closeProfileMenu}
                        >
                          Favorited Remixes
                        </Link>
                        <Link
                          href="/votes"
                          className="block rounded-lg px-3 py-2 hover:bg-white/10"
                          onClick={closeProfileMenu}
                        >
                          Your Votes
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {isAuthenticated ? (
                  <button
                    onClick={handleAuthClick}
                    disabled={initializing}
                    className="flex flex-row justify-center gap-2 rounded-full bg-google p-[2px] font-main"
                  >
                    <span className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-1 font-semibold text-darkMode transition hover:bg-gray-100">
                      Sign Out
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    disabled={initializing}
                    className="flex flex-row justify-center gap-2 rounded-full bg-google p-[2px] font-main"
                  >
                    <span className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-1 font-semibold text-darkMode transition hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.63 0 6.4 5.38 2.56 13.22l7.98 6.19C12.43 13.24 17.74 9.5 24 9.5z" />
                        <path fill="#34A853" d="M46.5 24.5c0-1.58-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.23 5.47-4.72 7.16l7.24 5.63C43.74 38.44 46.5 31.96 46.5 24.5z" />
                        <path fill="#FBBC05" d="M10.53 28.41A14.48 14.48 0 0 1 9.5 24c0-1.52.26-2.98.74-4.36l-7.98-6.19C.82 16.76 0 20.29 0 24c0 3.71.82 7.24 2.26 10.55l8.27-6.14z" />
                        <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.13 15.88-5.81l-7.24-5.63c-2.01 1.35-4.59 2.14-8.64 2.14-6.26 0-11.57-3.74-13.46-9.03l-8.27 6.14C6.4 42.62 14.63 48 24 48z" />
                      </svg>
                      Sign In
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-darkMode/95 px-4 pb-6 pt-2 text-sm shadow-inner md:hidden">
            <nav className="flex flex-col gap-2" aria-label="Primary Mobile">
              {links.map((link) => {
                const isActive = link.href === '/' ? router.pathname === '/' : router.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={mobileNavLinkClass(isActive)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-3">
              {isAuthenticated && user ? (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName ?? 'Profile avatar'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <UserCircle2 size={32} className="text-white" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{user.displayName ?? 'Remix Fan'}</p>
                      <p className="text-xs text-white/70">Signed in with Google</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/favorites"
                      onClick={closeMobileMenu}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-white/20"
                    >
                      Favorited Remixes
                    </Link>
                    <Link
                      href="/votes"
                      onClick={closeMobileMenu}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-white/20"
                    >
                      Your Votes
                    </Link>
                  </div>
                </div>
              ) : null}

              <button
                onClick={handleAuthClick}
                disabled={initializing}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-darkMode transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAuthenticated ? (
                  'Sign Out'
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.63 0 6.4 5.38 2.56 13.22l7.98 6.19C12.43 13.24 17.74 9.5 24 9.5z" />
                      <path fill="#34A853" d="M46.5 24.5c0-1.58-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.23 5.47-4.72 7.16l7.24 5.63C43.74 38.44 46.5 31.96 46.5 24.5z" />
                      <path fill="#FBBC05" d="M10.53 28.41A14.48 14.48 0 0 1 9.5 24c0-1.52.26-2.98.74-4.36l-7.98-6.19C.82 16.76 0 20.29 0 24 c0 3.71.82 7.24 2.26 10.55l8.27-6.14z" />
                      <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.13 15.88-5.81l-7.24-5.63c-2.01 1.35-4.59 2.14-8.64 2.14-6.26 0-11.57-3.74-13.46-9.03l-8.27 6.14C6.4 42.62 14.63 48 24 48z" />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="hidden px-8 py-3 md:block">
        <div className="mx-auto flex max-w-7xl gap-4">
          <nav className="flex gap-8 text-xl leading-6" aria-label="Primary">
            {links.map((link) => {
              const isActive = link.href === '/' ? router.pathname === '/' : router.pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} className={desktopNavLinkClass(isActive)}>
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
