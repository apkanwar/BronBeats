import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Play, Youtube } from 'lucide-react';
import { Remix } from '@/data/remixes';

type RemixCardProps = {
  remix: Remix;
};

export default function MiniRemixCard({ remix }: RemixCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/remixes/${remix.id}`} className="group">
        <div className="flex flex-col gap-2 px-5 py-4 text-left">
          <h3 className="text-xl font-semibold text-gray-900">{remix.remixName}</h3>
          <p className="text-gray-600 text-sm">{remix.description}</p>
        </div>
      </Link>
      <footer className="mt-auto flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm font-medium text-lakersPurple-600">
        <Link href={`/remixes/${remix.id}`} className='flex cursor-pointer flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg items-center'><Play /> Watch</Link>
        <div className='flex flex-row gap-2 items-center'>
          {remix.ogSong && (
            <Link href={remix.ogSong} target='_blank' className='flex flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg'>
              <Youtube />
            </Link>
          )}
          <Link href={remix.igLink || "#"} target='_blank' className={`${remix.igLink ? "" : "invisible"} flex flex-row gap-1 hover:bg-lakersPurple-200 p-2 rounded-lg`}>
            <Instagram />
          </Link>
        </div>
      </footer>
    </article>
  );
}
