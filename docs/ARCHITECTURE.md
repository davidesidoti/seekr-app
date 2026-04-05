# Architecture

> Technical architecture, design decisions, and patterns for the Seekr app.

## High-Level Overview

```
┌─────────────────────────────────────────────────┐
│                   Seekr (iOS)                    │
│                                                  │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Screens  │  │Components │  │   Hooks      │  │
│  │ (app/)    │──│           │──│  useQuery()  │  │
│  └───────────┘  └───────────┘  └──────┬──────┘  │
│                                       │          │
│  ┌────────────┐               ┌───────▼──────┐  │
│  │  Zustand   │               │  Services    │  │
│  │  (client   │               │  (API calls) │  │
│  │   state)   │               └───────┬──────┘  │
│  └────────────┘                       │          │
│                                ┌──────▼──────┐   │
│                                │   Axios     │   │
│                                │  Instance   │   │
│                                └──────┬──────┘   │
└───────────────────────────────────────┼──────────┘
                                        │ HTTPS
                              ┌─────────▼─────────┐
                              │   Jellyseerr API   │
                              │   /api/v1          │
                              └─────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
              │  Jellyfin  │      │  Radarr   │      │  Sonarr   │
              └───────────┘      └───────────┘      └───────────┘
```

## Navigation Architecture

Seekr uses **Expo Router** with file-based routing. The navigation tree looks like this:

```
Root Layout (_layout.tsx)
├── Providers (QueryClient, Zustand hydration, Theme)
│
├── (auth) group - Stack Navigator
│   ├── index.tsx         → Server URL input
│   └── login.tsx         → Jellyfin credentials
│
├── (tabs) group - Tab Navigator
│   ├── index.tsx         → Home / Discover
│   ├── search.tsx        → Search
│   ├── requests.tsx      → My Requests
│   └── settings.tsx      → Settings
│
└── media/[id].tsx        → Media Detail (pushed on top of tabs)
```

### Root Layout Responsibility

The root `_layout.tsx` has one job: wrap the entire app in providers and handle the auth gate.

```
Root Layout
├── QueryClientProvider (TanStack Query)
├── Theme Provider (NativeWind)
└── Auth Gate
    ├── if authenticated → render (tabs)
    └── if not authenticated → redirect to (auth)
```

### Navigation Flow

1. **App launch** → Root layout checks `authStore` for persisted token
2. **No token** → Redirect to `(auth)/index` (server setup)
3. **Has token** → Validate with `GET /auth/me`
   - Valid → Show `(tabs)/index`
   - Invalid → Clear token, redirect to `(auth)/`
4. **Media tap** → Push `media/[id]` on top of current tab stack
5. **Request button** → Open bottom sheet modal (not a route)

## Data Flow Pattern

### Server State (API data)

All API data flows through this pipeline:

```
Screen → Hook → React Query → Service → Axios → Jellyseerr API
```

Example for the home screen:

```
HomeScreen
  └── useTrending('movie')
        └── useQuery(['trending', 'movie'])
              └── mediaService.getTrending('movie')
                    └── api.get('/discover/trending', { params })
                          └── GET {serverUrl}/api/v1/discover/trending
```

### Client State (app state)

Client-only state lives in Zustand stores:

```
authStore
├── serverUrl: string | null
├── apiKey: string | null
├── user: User | null
├── isAuthenticated: boolean
└── actions: login(), logout(), setServer()

settingsStore
├── language: string
├── notificationsEnabled: boolean
└── actions: update()
```

### Why This Split?

| Question | Answer | Tool |
|----------|--------|------|
| Does it come from the API? | Yes | React Query |
| Is it user input or app config? | Yes | Zustand |
| Is it only needed in one screen? | Yes | useState |

## API Client Architecture

### Axios Instance

A single Axios instance handles all API communication:

```
services/api.ts
├── Create instance with dynamic baseURL
├── Request interceptor: inject auth token/cookie
├── Response interceptor: handle 401 (redirect to login)
└── Export configured instance
```

### Service Layer

Each service file groups related API calls:

```
services/
├── api.ts        → Axios instance with paramsSerializer (encodeURIComponent for %20)
├── auth.ts       → loginWithJellyfin, logout, validateSession, getPublicSettings
├── media.ts      → getTrending, getPopularMovies/Tv (sortBy), search, getMovie/TvDetails, getRecommendations
├── request.ts    → createRequest, getRequests, approveRequest, declineRequest, deleteRequest
└── user.ts       → getProfile, getQuota
```

Services return **typed data**, not raw Axios responses:

```typescript
// Good
async function getTrending(type: 'movie' | 'tv'): Promise<PaginatedResponse<Media>>

// Bad
async function getTrending(type: string): Promise<AxiosResponse>
```

### React Query Hooks

Each hook wraps a service call with caching and refetch logic:

```
hooks/
├── useTrending.ts        → useQuery(['trending'])
├── usePopularMovies.ts   → useQuery(['popular', 'movies', sortBy])
├── usePopularTv.ts       → useQuery(['popular', 'tv', sortBy])
├── useSearch.ts          → useQuery(['search', query], enabled: query.length >= 3)
├── useMediaDetails.ts    → useQuery(['media', type, id])
├── useRecommendations.ts → useQuery(['recommendations', type, id])
├── useRequests.ts        → useQuery(['requests', filter])
├── useCreateRequest.ts   → useMutation → invalidates ['media'] + ['requests']
└── useManageRequest.ts   → approve + decline mutations → invalidates ['media'] + ['requests']
```

## Caching Strategy

| Data | Stale time | Cache time | Refetch on focus |
|------|-----------|------------|------------------|
| Trending/Popular | 5 min | 30 min | Yes |
| Search results | 0 (always fresh) | 5 min | No |
| Media details | 10 min | 1 hour | No |
| My requests | 1 min | 10 min | Yes |
| User profile | 30 min | 1 hour | No |

## Error Handling Strategy

### Network Errors

- React Query retries failed requests 3 times with exponential backoff
- On persistent failure, show an error state with "Retry" button
- No silent failures: every error is visible to the user

### Auth Errors (401)

- Axios response interceptor catches 401
- Clears auth store
- Redirects to `(auth)/` login flow
- Shows toast: "Session expired, please log in again"

### Server Unreachable

- During server setup: show inline validation error
- During normal use: show full-screen error with server URL and "Retry" / "Change Server" options

### Validation Errors (422)

- Show field-level errors on forms
- Map API error messages to user-friendly strings

## Performance Considerations

### Image Loading

- Use `expo-image` with `cachePolicy: 'memory-disk'`
- Provide `placeholder` prop with blurhash (Jellyseerr returns this for some media)
- Use appropriate TMDB image sizes:
  - Thumbnails in lists: `w342`
  - Detail poster: `w500`
  - Backdrop: `w1280`
  - Cast avatar: `w185`

### List Performance

- Use `FlashList` for horizontal rows (MediaRow); use `FlatList` for vertical lists — FlashList 2.0.2 removed `estimatedItemSize` and only supports `span` in `overrideItemLayout`, making it unreliable for variable-height vertical lists
- Skeleton loading states (no spinners)

### Bundle Size

- Tree-shake icon imports from lucide
- Lazy load screens that aren't in the initial tab (Expo Router handles this)
- No unnecessary polyfills

## Security

### Credential Storage

- Server URL: `expo-secure-store` (encrypted at rest via iOS Keychain)
- Auth token / API key: `expo-secure-store`
- Never store credentials in AsyncStorage (unencrypted)
- Never log credentials

### Network Security

- HTTPS only (warn user if they enter an HTTP URL, but allow it for local networks)
- Certificate pinning not implemented (users may use self-signed certs with reverse proxies)
- No sensitive data in URL query params

## Testing Strategy (Future)

| Layer | Tool | What to test |
|-------|------|-------------|
| Unit | Jest | Utility functions, store logic |
| Component | React Native Testing Library | Component rendering, props |
| Integration | MSW (Mock Service Worker) | API flow mocking |
| E2E | Detox or Maestro | Full user flows |

Priority: Integration tests on auth flow and request creation are more valuable than unit tests on UI components.
