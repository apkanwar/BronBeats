# BronBeats

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in credentials (see below)
3. Run the dev server: `npm run dev`

## Required environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase analytics measurement ID |
| `NEXT_PUBLIC_VIMEO_ACCESS_TOKEN` | Vimeo personal access token with library read scope |
| `FIREBASE_ADMIN_CREDENTIALS` | JSON string of a Firebase service account (used for server-side Firestore access & scripts) |

## Firestore data model

- `remixes/{remixId}` — canonical remix metadata sourced from Vimeo. Each document should include:
  - `remixName`, `description`, `vimeoId`, `sourceUrl`, `thumbnailUrl`, `tags`, `createdBy`
  - `upvotes`, `downvotes`, `createdAt`, `updatedAt`
- `profiles/{uid}` — user specific state
  - `favorites: string[]`
  - `votes: Record<string, 'up' | 'down'>`
- `remixComments/{remixId}/items/{commentId}` — remix comments with `text`, `authorId`, `authorName`, `authorAvatar`, `createdAt`

Only remixes stored in Firestore are rendered in the app. The client listens to the `remixes` collection in real time for catalogue and leaderboard data.

## Vimeo → Firestore sync script

Fetch your Vimeo library and upsert the documents into Firestore:

```bash
npm run sync:vimeo
```

The script expects `NEXT_PUBLIC_VIMEO_ACCESS_TOKEN` and `FIREBASE_ADMIN_CREDENTIALS` to be set (the latter should be a JSON string for a Firebase service account with Firestore access).

Running the script will:

- Fetch every video from `https://api.vimeo.com/me/videos`
- Upsert matching docs in `remixes/{vimeoId}` with the allowed fields
- Preserve existing `upvotes` / `downvotes`

## Voting and favorites

- Users must sign in with Google to vote or favorite
- Votes update the `profiles/{uid}` document and atomically increment the corresponding `remixes/{remixId}` counters
- Favorites are stored under the same profile document
- Leaderboard rankings come from Firestore aggregate counts (no seed data fallbacks)

## Development notes

- Remix detail pages use on-demand static generation (fallback blocking) and read directly from Firestore. A 404 will be rendered if a remix does not exist in the collection.
- Ensure the Firebase client configuration is available in the Next.js environment before starting the dev server. EOF
