import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Music2 } from 'lucide-react';
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
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{remix.createdBy}</p>
            <h3 className="text-xl font-semibold text-gray-900">{remix.remixName}</h3>
          </header>
          <p className="text-sm leading-relaxed text-gray-600">{remix.description}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-lakersPurple-600">
            {remix.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-lakersPurple-50 px-3 py-1 uppercase tracking-wide">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <footer className="mt-auto flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm font-medium text-lakersPurple-600">
        <span className="text-xs uppercase tracking-wide text-gray-500">OG: {remix.originalSongTitle}</span>
        <div className="flex items-center gap-3 text-lakersPurple-600">
          <a
            href={remix.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-lakersPurple-200 px-3 py-1 transition hover:bg-lakersPurple-600 hover:text-white"
            aria-label="Open remix source"
          >
            <ExternalLink size={16} />
            <span className="text-xs font-semibold">Source</span>
          </a>
          <a
            href={remix.originalSongUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-lakersPurple-200 px-3 py-1 transition hover:bg-lakersPurple-600 hover:text-white"
            aria-label="Listen to original song"
          >
            <Music2 size={16} />
            <span className="text-xs font-semibold">OG Song</span>
          </a>
        </div>
      </footer>
    </article>
  );
}
