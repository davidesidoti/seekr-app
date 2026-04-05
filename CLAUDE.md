# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seekr is a native iOS client for Jellyseerr built with React Native + Expo. It lets users browse, search, and request media from self-hosted Jellyseerr instances. v1.0 features (F1–F8) are implemented; v2.0 features (F9–F12) are in progress.

## Tech Stack

- **Framework**: React Native + Expo SDK 54+ (managed workflow)
- **Router**: Expo Router ~4 (file-based routing — the `app/` directory IS the router)
- **Language**: TypeScript (strict mode, no `any`)
- **State**: Zustand (client state) + TanStack Query (server/API state) — never Redux, never Context for frequently-changing data
- **HTTP**: Axios with shared instance, interceptors for auth
- **Styling**: NativeWind (Tailwind CSS for RN) — dark theme only, no `StyleSheet.create()` unless unavoidable
- **Icons**: Lucide React Native (24px, 1.5px stroke)
- **Images**: expo-image with `cachePolicy: 'memory-disk'`
- **Credentials**: expo-secure-store (iOS Keychain) — never AsyncStorage for secrets

## Commands

```bash
npm install --legacy-peer-deps   # radix-ui peer conflicts from expo-router require this flag
npx expo start           # Start dev server
npx expo run:ios         # Run on iOS simulator
npm test                 # Run tests (Jest, when configured)
npm run lint             # Lint (ESLint, when configured)
```

## Architecture

### Data Flow

```
Screen → Hook (useQuery/useMutation) → Service → Axios instance → Jellyseerr API (/api/v1)
```

- **Zustand stores** (`stores/`): auth (serverUrl, token, user), settings (preferences). Keep minimal — if it comes from the API, use React Query.
- **React Query hooks** (`hooks/`): wrap service calls with caching. Query keys follow `['resource', ...params]` pattern (e.g., `['media', 'movie', id]`).
- **Services** (`services/`): grouped API calls returning typed data, never raw Axios responses.
- **Screens** (`app/`): Expo Router file-based routes. Default exports required. Route groups `(auth)`, `(tabs)` don't appear in URLs.
- **Components** (`components/`): named exports. Receive data via props, never import stores directly.

### Navigation

Root layout wraps everything in providers (QueryClient, Theme) and handles the auth gate:
- Not authenticated → `(auth)/` stack (server setup → Jellyfin login)
- Authenticated → `(tabs)/` (Home, Search, Requests, Settings)
- Media detail at `media/[id].tsx` pushed on top of tabs

### Authentication

1. User enters Jellyseerr URL → validate with `GET /api/v1/settings/public`
2. Login via Jellyfin credentials → `POST /api/v1/auth/jellyfin` (sets `connect.sid` cookie)
3. Axios must use `withCredentials: true` for cookie persistence
4. Token stored in `expo-secure-store`, validated on launch with `GET /api/v1/auth/me`
5. 401 response → clear auth store → redirect to login

### Caching Strategy

| Data | Stale Time | Refetch on Focus |
|------|-----------|------------------|
| Trending/Popular | 5 min | Yes |
| Search results | 0 (always fresh) | No |
| Media details | 10 min | No |
| My requests | 1 min | Yes |

## Key Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Branches**: `feature/name`, `fix/description`, `docs/what-changed`
- **Props**: interfaces named `ComponentNameProps`
- **Enums**: use `as const` objects, not TypeScript enums
- **Lists**: prefer `FlashList` for horizontal rows; use `FlatList` for vertical lists — FlashList 2.0.2 removed `estimatedItemSize` and only supports `span` in `overrideItemLayout`, making it unreliable for variable-height vertical lists
- **Loading states**: skeleton shimmer only, no spinners
- **Haptics**: light impact on button press, medium on request submit, success on confirmed
- **No console.log** in production code

## API Gotchas

- Jellyseerr uses cookie-based auth by default; also supports `X-Api-Key` header as alternative
- TMDB image paths are relative — prepend `https://image.tmdb.org/t/p/{size}` (w342 for lists, w500 for detail posters, w1280 for backdrops, w185 for avatars)
- Search results include `"person"` mediaType — filter these out, only display movie/TV
- Movies use `title`/`releaseDate`, TV uses `name`/`firstAirDate` — handle both
- Media status enum: 1=Unknown, 2=Pending, 3=Processing, 4=PartiallyAvailable, 5=Available, 6=Deleted
- Request status enum: 1=PendingApproval, 2=Approved, 3=Declined
- Some Jellyseerr instances have CSRF protection — may need handling
- Rate limiting from TMDB side (~40 req/10sec); debounce search (300ms), cache discover endpoints

## Runtime Gotchas

- **Pressable + NativeWind**: Never put layout props (`flexDirection`, `alignItems`) in a `style` callback on `Pressable` — css-interop doesn't apply them. Put layout on a child `View`; keep only `opacity` in the callback.
- **Horizontal ScrollView sizing**: Set both `flexGrow: 0` AND `flexShrink: 0` to prevent the bar from expanding or compressing when a sibling has `flex: 1`.
- **Axios 1.x spaces**: Default serializer encodes spaces as `+`; Jellyseerr expects `%20`. A custom `paramsSerializer` using `encodeURIComponent` is already set in `services/api.ts`.
- **Expo SDK**: Project targets SDK 54 for Expo Go compatibility — do not upgrade to SDK 55+.
- **Jellyseerr avatar URLs**: May be relative paths (`/avatarproxy/...`) — prepend `serverUrl` before passing to `expo-image`.
- **`/request` endpoint**: Does not return `posterPath` or `title` in the `media` object — use `useQueries` to batch-fetch media details when titles/posters are needed.
- **Jellyseerr user fields**: `username` and other string fields can be `null` at runtime despite TypeScript typing them as `string`. For display names use `displayName ?? username ?? email ?? \`User #${id}\`` — Jellyseerr may populate `displayName` even when `username` is null.
- **Jellyseerr permissions** (bitmask): ADMIN = 2, MANAGE_REQUESTS = 8. Check: `(user.permissions & (2 | 8)) !== 0`.
- **`expo-image` in `app.json`**: Do NOT add it to the `plugins` array — it causes a PluginError at startup.

## Documentation

Detailed specs live in these files — read them before implementing the relevant feature:

| File | Contents |
|------|----------|
| `CONTEXT.md` | Architecture rules, state management, file structure conventions |
| `ARCHITECTURE.md` | Data flow, navigation tree, caching strategy, error handling |
| `FEATURES.md` | Feature specs with user stories and acceptance criteria (F1–F16) |
| `DESIGN SYSTEM.md` | Color palette, typography, spacing, component specs, animation guidelines |
| `API INTEGRATION.md` | Full Jellyseerr API endpoint reference with request/response examples |
