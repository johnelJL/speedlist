# SpeedList Mobile

A lightweight Expo (React Native) client for browsing SpeedList categories and listings.

## Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo`)
- iOS Simulator (Xcode) or Android Emulator (Android Studio)

## Environment
Set the API base URL for local development:

```bash
export EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"
```

The client expects the server running from this repository (start with `npm start` in the root).

## Installation

```bash
cd mobile
npm install
```

> If your network blocks the npm registry, configure an alternative registry mirror before installing.

## Running the app

```bash
npm run start       # start the Expo dev server
npm run ios         # launch iOS simulator (Mac only)
npm run android     # launch Android emulator
npm run web         # optional web preview
```

## Testing

```bash
npm test            # unit tests (Jest / Testing Library)
npm run test:e2e    # placeholder hook for Detox / Expo Test Runner
npm run lint        # ESLint
npm run format      # Prettier
```

## Features
- Bottom-tab navigation with stack-based item flows.
- Category discovery with paginated loading.
- Category detail with search-based filtering and navigation into item detail views.
- Item detail screens showing description, category, and basic metrics.
- Shared UI components (cards, list items, search bar, loading/error states) aligned to the SpeedList palette.
- React Query caching for offline-friendly reads.
