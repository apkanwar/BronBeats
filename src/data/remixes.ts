import type { DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { FetchVimeoVideo } from '@/lib/vimeo/types';

export type RemixTag = string;

export type Remix = {
  id: string;
  remixName: string;
  description: string;
  vimeoId: string;
  sourceUrl: string;
  thumbnailUrl: string;
  tags: RemixTag[];
  upvotes: number;
  downvotes: number;
  createdAt?: string;
  updatedAt?: string;
};

export function remixesFromVimeo(videos: FetchVimeoVideo[]): Remix[] {
  return videos
    .map((video) => createRemixFromVideo(video))
    .filter((item): item is Remix => Boolean(item))
    .sort((a, b) => a.remixName.localeCompare(b.remixName));
}

export function createRemixFromVideo(video: FetchVimeoVideo): Remix | null {
  const id = video.uri.split('/').pop();
  if (!id) {
    return null;
  }

  const bestThumbnail =
    video.pictures?.sizes
      ?.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
      .find((size) => Boolean(size.link))?.link ?? '';

  return normalizeRemix(id, {
    remixName: video.name,
    description: video.description ?? '',
    vimeoId: id,
    sourceUrl: video.link ?? '#',
    thumbnailUrl: bestThumbnail || '/logo.png',
    tags: video.tags?.map((tag) => tag.tag).filter(Boolean) ?? [],
    upvotes: 0,
    downvotes: 0
  });
}

export function remixesFromFirestore(snapshot: QuerySnapshot): Remix[] {
  return snapshot.docs
    .map((docSnapshot) => normalizeRemix(docSnapshot.id, docSnapshot.data()))
    .filter((item): item is Remix => Boolean(item));
}

export function remixFromFirestoreRecord(id: string, data: DocumentData | undefined): Remix | null {
  if (!data) {
    return null;
  }

  return normalizeRemix(id, data);
}

type FirestoreRemixData = {
  remixName?: string;
  description?: string;
  vimeoId?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  tags?: RemixTag[];
  upvotes?: number;
  downvotes?: number;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeRemix(id: string, data: FirestoreRemixData): Remix | null {
  const vimeoId = data.vimeoId ?? id;
  if (!vimeoId) {
    return null;
  }

  return {
    id,
    remixName: data.remixName ?? `Remix ${id}`,
    description: data.description ?? '',
    vimeoId,
    sourceUrl: data.sourceUrl ?? '#',
    thumbnailUrl: data.thumbnailUrl ?? '/logo.png',
    tags: data.tags ?? [],
    upvotes: Number(data.upvotes ?? 0),
    downvotes: Number(data.downvotes ?? 0),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  } satisfies Remix;
}

export function searchRemixes(query: string, remixList: Remix[] = []): Remix[] {
  if (!query.trim()) {
    return remixList;
  }

  const lowered = query.trim().toLowerCase();

  return remixList.filter((remix) => {
    const haystack = [remix.remixName, remix.description, ...remix.tags]
      .join(' ')
      .toLowerCase();

    return haystack.includes(lowered);
  });
}
