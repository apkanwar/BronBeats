export type RemixTag =
  | 'highlight'
  | 'vintage'
  | 'trap'
  | 'orchestral'
  | 'classic'
  | 'modern'
  | 'anthem'
  | 'mashup'
  | 'energy'
  | 'story';

export type Remix = {
  id: string;
  remixName: string;
  description: string;
  vimeoId: string;
  thumbnailUrl: string;
  sourceUrl: string;
  originalSongUrl: string;
  originalSongTitle: string;
  originalArtist: string;
  tags: RemixTag[];
  createdBy: string;
  releaseYear: number;
};

export const remixes: Remix[] = [
  {
    id: 'skyhook-serenade',
    remixName: 'Skyhook Serenade',
    description:
      'Vintage LeBron clips layered with shimmering synths and pulsing drums for a late-night highlight vibe.',
    vimeoId: '76979871',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.instagram.com/bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/3nAq2hCr1oWsIU54tS98pY',
    originalSongTitle: 'Flashing Lights',
    originalArtist: 'Kanye West',
    tags: ['highlight', 'vintage', 'orchestral'],
    createdBy: 'DJ Courtside',
    releaseYear: 2021
  },
  {
    id: 'game-7-symphony',
    remixName: 'Game 7 Symphony',
    description:
      'Strings build with every possession until the final dagger three caps a cinematic finale.',
    vimeoId: '395212534',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.tiktok.com/@bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5',
    originalSongTitle: 'Seven Nation Army',
    originalArtist: 'The White Stripes',
    tags: ['orchestral', 'anthem', 'highlight'],
    createdBy: 'Court Composer',
    releaseYear: 2022
  },
  {
    id: 'miami-heatwave',
    remixName: 'Miami Heatwave',
    description:
      'South Beach horns and trap drums fuel a blistering fast-break montage from the Big Three era.',
    vimeoId: '148751763',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1547955922-85912e2585f2?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.youtube.com/@bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/6ktkjwwzv38TIYMWB1SPh0',
    originalSongTitle: 'All of the Lights',
    originalArtist: 'Kanye West',
    tags: ['trap', 'energy', 'mashup'],
    createdBy: 'Heatwave Collective',
    releaseYear: 2020
  },
  {
    id: 'akron-anthem',
    remixName: 'Akron Anthem',
    description:
      'Gospel choirs and brass celebrate The Kid from Akron with storybook narration woven throughout.',
    vimeoId: '22439234',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.twitter.com/bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/7EQGXaVSYD7oTU4SoVnuXb',
    originalSongTitle: 'Glory',
    originalArtist: 'John Legend & Common',
    tags: ['anthem', 'story', 'classic'],
    createdBy: 'Summit Choir',
    releaseYear: 2019
  },
  {
    id: 'chase-down',
    remixName: 'Chase Down',
    description:
      "A tense build-up erupts into a bass drop timed with LeBron's iconic block in Game 7.",
    vimeoId: '1084537',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.instagram.com/bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/1qD53snTFgDy3EulqTVQDA',
    originalSongTitle: 'Lose Yourself',
    originalArtist: 'Eminem',
    tags: ['modern', 'energy', 'highlight'],
    createdBy: 'Baseline Breakers',
    releaseYear: 2023
  },
  {
    id: 'return-of-the-king',
    remixName: 'Return of the King',
    description:
      'An uplifting mashup chronicling the 2016 comeback with storytelling samples and arena ambiance.',
    vimeoId: '357274789',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1546512565-39d4dc75e556?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.youtube.com/@bronbeats',
    originalSongUrl: 'https://open.spotify.com/track/3a1lNhkSLSkpJE4MSHpDu9',
    originalSongTitle: 'Godspeed',
    originalArtist: 'Frank Ocean',
    tags: ['story', 'mashup', 'classic'],
    createdBy: "King's Guard",
    releaseYear: 2024
  }
];

export const remixMap = remixes.reduce<Record<string, Remix>>((map, remix) => {
  map[remix.id] = remix;
  return map;
}, {});

export function searchRemixes(query: string): Remix[] {
  if (!query.trim()) {
    return remixes;
  }

  const lowered = query.trim().toLowerCase();

  return remixes.filter((remix) => {
    const haystack = [
      remix.remixName,
      remix.description,
      remix.originalArtist,
      remix.originalSongTitle,
      ...remix.tags
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(lowered);
  });
}
