import { Popover } from '@headlessui/react'
import Link from 'next/link'
import Image from 'next/image';

export default function Navbar() {
    return (
        <header className="text-dm-black cursor-default select-none">
            <nav className="bg-dm-black p-8">
                <div className='max-w-7xl mx-auto flex items-center justify-center gap-4'>
                    {/* Logo */}
                    <Link href={'/'} className='flex flex-1 items-center font-headings text-xl'>
                        <div className="flex items-center gap-4 bg-artic-blue rounded-full p-1 pr-3 font-medium cursor-pointer">
                            <Image width={40} height={40} src="/favicon.ico" alt="BronBeats Logo" className='rounded-full' />
                            <span>BronBeats</span>
                        </div>
                    </Link>

                    {/* Right Buttons */}
                    <div className="flex flex-1 items-center justify-end gap-4 font-medium font-main text-lg">
                        <button onClick={(e) => { e.stopPropagation(); handleSignOut(); }} className="bg-artic-blue rounded-full p-1 px-3 cursor-pointer hover:bg-blue-600 hover:text-white">
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>
            <div className='px-8 py-3'>
                <div className='max-w-7xl mx-auto flex gap-4'>
                    {/* Middle Icons */}
                    <Popover.Group className="flex gap-8 leading-6 font-main text-xl">
                        <a href={"/all-songs"} className="flex items-center gap-4 bg-dm-black text-white rounded-full py-1 px-6 cursor-pointer border-4 border-dm-black hover:bg-blue-600">
                            All Remixes
                        </a>
                        <a href={"/leaderboard"} className="flex items-center gap-4 bg-dm-black text-white rounded-full py-1 px-6 cursor-pointer border-4 border-dm-black hover:bg-blue-600">
                            Leaderboard
                        </a>
                    </Popover.Group>
                </div>
            </div>
        </header>
    )
}