import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Play, Youtube } from 'lucide-react';
import { Remix } from '@/data/remixes';

type RemixCardProps = {
  remix: Remix;
};

export default function RemixCard({ remix }: RemixCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/remixes/${remix.id}`} className="group">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={remix.thumbnailUrl}
            alt={`${remix.remixName} thumbnail`}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
        <div className="flex flex-col gap-3 px-5 py-4 text-left">
          <header className="flex flex-row justify-between px-2">
            <h3 className="text-xl font-semibold text-gray-900">{remix.remixName}</h3>
          </header>
        </div>
      </Link>
      <footer className="mt-auto flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm font-medium text-lakersPurple-600">
        <span className='flex cursor-pointer flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg items-center'><Play /> Watch</span>
        <div className='flex flex-row gap-2 items-center'>
          <Link href={'/'} className='flex flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg'><Youtube /></Link>
          <Link href={'/'} className='flex flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg'><Instagram /></Link>
        </div>
      </footer>
    </article>
  );
}
