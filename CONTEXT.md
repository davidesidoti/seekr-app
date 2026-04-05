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
├── queryClient.ts           # Shared QueryClient instance
├── useTrending.ts           # Trending from /discover/trending
├── usePopularMovies.ts      # Popular movies, accepts sortBy param
├── usePopularTv.ts          # Popular TV, accepts sortBy param
├── useSearch.ts             # Search with 300ms debounce
├── useMediaDetails.ts       # Single movie/TV details
├── useRecommendations.ts    # Recommendations for a media item
├── useRequests.ts           # Request list with filter param
├── useCreateRequest.ts      # Mutation: create movie/TV request
└── useManageRequest.ts      # Mutations: approve + decline request (admin)
```

- Every hook that fetches data uses `useQuery` or `useMutation` from TanStack Query
- Query keys follow the pattern: `['resource', ...params]`
  - Example: `['media', 'movie', id]`, `['requests', 'mine']`, `['trending', 'movie']`

### Components

```
components/
├── ui/                      # Base UI primitives
│   ├── Button.tsx
│   ├── Input.tsx            # TextInput with label, error, icon, forwardRef
│   └── Skeleton.tsx         # Animated shimmer placeholder (number width/height only)
├── media/                   # Media-specific components
│   ├── MediaCard.tsx        # Poster card; accepts optional width prop
│   ├── MediaCardSkeleton.tsx
│   ├── MediaRow.tsx         # Horizontal FlashList row with title + skeleton
│   ├── MediaHero.tsx        # Backdrop + poster hero for detail screen
│   ├── CastList.tsx         # Horizontal cast avatars row
│   ├── StatusBadge.tsx      # Media availability badge (needs alignSelf:'flex-start')
│   └── RequestModal.tsx     # Request creation bottom sheet (movie confirm / TV season picker)
└── layout/                  # (empty — no custom layout components yet)
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

### v1.0 — Complete ✅
- [x] Project scaffolding (Expo SDK 54, dependencies, folder structure)
- [x] Theme & design system (colors, typography, NativeWind)
- [x] Auth flow — F1: server setup, F2: Jellyfin login, session persistence
- [x] Home screen — F3: trending + popular rows, sort controls (Popular/Top Rated/New)
- [x] Search screen — F4: debounced 2-column grid
- [x] Media detail screen — F5: hero, cast, recommendations, Watch Now button
- [x] Request creation — F6: bottom sheet modal (movie confirm / TV season picker)
- [x] My Requests screen — F7: filter tabs, admin approve/decline inline
- [x] Settings screen — F8: profile, server info, sign out

### v2.0 — In Progress 🚧
- [x] F10: Admin panel — approve/decline requests (in Requests tab + Media Detail)
- [x] F11: Discover filters — Sort + genre chip row on Home screen (year/network/studio/certification deferred to v3)
- [x] F12: Watch Now — opens Jellyfin web UI from Media Detail when media is available
- [x] F9: Push notifications — relay VPS + expo-notifications; token registered on login; Settings has URL + toggle

### v3.0 — Planned ❌
- [ ] F13: Multi-server support
- [ ] F14: iOS Widgets
- [ ] F15: Watchlist
- [ ] F16: iPad layout

## Known Gotchas

- Jellyseerr uses cookie-based auth by default; the app needs to persist cookies or use API key auth
- TMDB image URLs require the poster/backdrop path from the API response, they are NOT full URLs
- Some Jellyseerr instances have CSRF protection enabled, which may need to be disabled or handled
- The Jellyseerr API is largely undocumented officially; the OpenAPI spec at `/api-docs` is the best reference
- Rate limiting on TMDB side may apply for discover/trending endpoints
- `username` and other user string fields can be `null` at runtime — use `displayName ?? username ?? email ?? fallback`
- Avatar URLs from Jellyseerr may be relative paths (`/avatarproxy/...`) — prepend `serverUrl` before use
- `GET /request` does not return `posterPath` or `title` in the media object — use `useQueries` to batch-fetch details
- Permissions are a bitmask: ADMIN=2, MANAGE_REQUESTS=8; check with `(permissions & (2|8)) !== 0`
