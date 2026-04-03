# CONTEXT.md -- Seekr Project

> This document serves as the single source of truth for AI-assisted development sessions.
> Read this file first before making any changes to the codebase.

## Project Overview

**Seekr** is a native iOS client for Jellyseerr, built with React Native and Expo.
It allows users to browse, search, and request media from their self-hosted Jellyseerr instance.

- **Target platform**: iOS (iPhone primary, iPad secondary)
- **Framework**: React Native + Expo SDK 54+
- **Router**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **API**: Jellyseerr REST API v1 (base path: `/api/v1`)

## Architecture Rules

### File Structure Convention

This project uses **Expo Router** with file-based routing. The `app/` directory IS the router.

```
app/
├── _layout.tsx              # Root layout: wraps everything in providers
├── (auth)/
│   ├── _layout.tsx          # Auth stack layout
│   ├── index.tsx            # Server URL input screen
│   └── login.tsx            # Jellyfin credentials screen
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator layout
│   ├── index.tsx            # Home / Discover
│   ├── search.tsx           # Search
│   ├── requests.tsx         # My Requests
│   └── settings.tsx         # Settings
└── media/
    └── [id].tsx             # Dynamic route: media detail
```

- Route groups in parentheses `(auth)`, `(tabs)` do NOT appear in the URL
- `[id].tsx` is a dynamic segment, accessed via `useLocalSearchParams()`
- Each `_layout.tsx` defines the navigator type (Stack, Tabs, etc.)

### State Management

- **Zustand** for global client state (auth, user preferences, server config)
- **TanStack Query (React Query)** for all server state (API data, caching, refetching)
- Do NOT use React Context for data that changes frequently
- Do NOT use Redux

### Stores (Zustand)

```
stores/
├── authStore.ts             # Server URL, API key, auth tokens, user info
├── settingsStore.ts         # App preferences (language, notifications, theme)
```

Keep stores minimal. If data comes from the API, it belongs in React Query, not Zustand.

### API Client

```
services/
├── api.ts                   # Axios instance with base URL + interceptors
├── auth.ts                  # Login, logout, session validation
├── media.ts                 # Movie/TV search, details, discover
├── request.ts               # Create, list, update, delete requests
├── user.ts                  # User profile, settings
└── types.ts                 # API response types (shared)
```

- All API calls go through the shared Axios instance in `api.ts`
- The instance reads `serverUrl` and `apiKey`/`authToken` from `authStore`
- Every service function returns typed data, never raw Axios responses
- Use React Query hooks in `hooks/` to wrap service calls

### Hooks

```
hooks/
├── useAuth.ts               # Login flow, session check, logout
├── useTrending.ts           # Trending movies/TV from discover
├── useSearch.ts             # Search with debounce
├── useMediaDetails.ts       # Single movie/TV details
├── useRequests.ts           # User's request list
├── useCreateRequest.ts      # Mutation: create new request
```

- Every hook that fetches data uses `useQuery` or `useMutation` from TanStack Query
- Query keys follow the pattern: `['resource', ...params]`
  - Example: `['media', 'movie', id]`, `['requests', 'mine']`, `['trending', 'movie']`

### Components

```
components/
├── ui/                      # Base UI primitives
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Skeleton.tsx
│   └── SafeAreaView.tsx
├── media/                   # Media-specific components
│   ├── MediaCard.tsx        # Poster card (used in grids/carousels)
│   ├── MediaRow.tsx         # Horizontal scrollable row
│   ├── MediaHero.tsx        # Backdrop hero on detail screen
│   ├── CastList.tsx         # Horizontal cast avatars
│   └── StatusBadge.tsx      # Request status indicator
├── requests/
│   ├── RequestCard.tsx      # Single request item
│   └── RequestModal.tsx     # Request creation bottom sheet
└── layout/
    ├── Header.tsx           # Screen header with blur
    └── TabBar.tsx           # Custom tab bar
```

- Every component is a named export (not default) except screen files
- Screen files (`app/**/*.tsx`) use default exports (Expo Router requirement)
- Components receive data via props, never import stores directly
- Use `expo-image` for all image rendering (poster, backdrop, avatar)

### Styling

- **NativeWind** (Tailwind CSS for React Native) for all styling
- Dark theme only (matching Jellyseerr's aesthetic)
- Color tokens defined in `theme/colors.ts`
- Typography scale defined in `theme/typography.ts`
- No inline `StyleSheet.create()` unless NativeWind can't handle the case

### TypeScript Rules

- Strict mode enabled
- No `any` types (use `unknown` if truly needed, then narrow)
- All API responses have explicit types in `services/types.ts` or `types/`
- Props interfaces named as `ComponentNameProps`
- Use `as const` for enum-like objects

## Key Dependencies

| Package | Purpose | Why this one |
|---------|---------|--------------|
| `expo` ~54 | Core framework | Managed workflow, OTA updates |
| `expo-router` ~4 | File-based routing | Convention over configuration |
| `zustand` | Client state | Minimal boilerplate, no providers |
| `@tanstack/react-query` | Server state | Caching, deduplication, refetch |
| `axios` | HTTP client | Interceptors, clean API |
| `nativewind` | Styling | Tailwind syntax in RN |
| `expo-image` | Image rendering | Fast, cached, blurhash support |
| `expo-secure-store` | Credential storage | Keychain on iOS |
| `expo-notifications` | Push notifications | Managed by Expo |
| `expo-haptics` | Haptic feedback | Native feel |
| `lucide-react-native` | Icons | Consistent, lightweight |
| `react-native-reanimated` | Animations | Smooth, native-thread animations |

## Authentication Flow

1. User enters Jellyseerr server URL (e.g., `https://requests.mydomain.com`)
2. App calls `GET /api/v1/settings/public` to validate server
3. User logs in via Jellyfin credentials (POST `/api/v1/auth/jellyfin`)
4. Server returns a session cookie or auth token
5. Token is stored in `expo-secure-store`
6. On app launch, token is loaded and validated with `GET /api/v1/auth/me`
7. If invalid, redirect to `(auth)/` flow

## API Base Configuration

```
Base URL: {userServerUrl}/api/v1
Auth: Cookie-based session OR X-Api-Key header
Content-Type: application/json
```

## Media Status Enum

These values come from the Jellyseerr API and are used throughout the app:

```
1 = UNKNOWN
2 = PENDING
3 = PROCESSING
4 = PARTIALLY_AVAILABLE
5 = AVAILABLE
6 = DELETED
```

## Request Status Enum

```
1 = PENDING_APPROVAL
2 = APPROVED
3 = DECLINED
```

## Image URLs

Media images (posters, backdrops) come from TMDB:
- Poster: `https://image.tmdb.org/t/p/w500{posterPath}`
- Backdrop: `https://image.tmdb.org/t/p/w1280{backdropPath}`
- Avatar: `https://image.tmdb.org/t/p/w185{profilePath}`

## Development Conventions

- Branch naming: `feature/feature-name`, `fix/bug-description`, `docs/what-changed`
- Commit messages: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- No console.log in production code (use a logger utility or remove before commit)
- Error boundaries on every screen-level component

## Current Status

- [ ] Project scaffolding (Expo init, dependencies, folder structure)
- [ ] Theme & design system setup
- [ ] Auth flow (server setup + Jellyfin login)
- [ ] Home screen (trending/popular)
- [ ] Search screen
- [ ] Media detail screen
- [ ] Request creation flow
- [ ] My Requests screen
- [ ] Settings screen
- [ ] Push notifications
- [ ] App Store submission

## Known Gotchas

- Jellyseerr uses cookie-based auth by default; the app needs to persist cookies or use API key auth
- TMDB image URLs require the poster/backdrop path from the API response, they are NOT full URLs
- Some Jellyseerr instances have CSRF protection enabled, which may need to be disabled or handled
- The Jellyseerr API is largely undocumented officially; the OpenAPI spec at `/api-docs` is the best reference
- Rate limiting on TMDB side may apply for discover/trending endpoints
