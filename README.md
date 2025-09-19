# BronBeats

Built by RezPoint Inc.

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and add Firebase credentials (see below)
3. Run the development server: `npm run dev`

## Firebase configuration

The app expects the standard Firebase web config values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

When these values are missing, Google sign-in, Firestore syncing, and real-time comments gracefully fall back to local storage so the UI still works for testing.

### Firestore data model

- `profiles/{uid}` – stores `favorites: string[]` and `votes: Record<string, 'up' | 'down'>`
- `remixStats/{remixId}` – stores aggregate `upvotes` and `downvotes` used for the leaderboard
- `remixComments/{remixId}/items/{commentId}` – each comment includes `text`, `authorId`, `authorName`, `authorAvatar`, and `createdAt`
- `remixRequests/{requestId}` – request submissions with `name`, `email`, `remixUrl`, `notes`, and `submittedAt`

## Remix catalog

Sample remixes live in `src/data/remixes.ts` with placeholder Vimeo IDs and Unsplash thumbnails. Update this list or hydrate it from Firestore when real data is available.

## Linting

Run `npm run lint` to validate TypeScript and lint rules.
