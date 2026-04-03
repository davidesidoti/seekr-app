# Feature Specifications

> Detailed feature breakdown with user stories and acceptance criteria.

## Release Plan

### v1.0 -- MVP

Core functionality to replace the mobile web experience.

### v2.0 -- Enhanced

Admin features, notifications, and deeper integrations.

### v3.0 -- Power User

Multi-server, widgets, Shortcuts, and advanced discovery.

---

## v1.0 Features

### F1: Server Setup

**User story**: As a user, I want to connect to my Jellyseerr instance so I can manage my media requests.

**Flow**:
1. App opens to a clean welcome screen with Seekr branding
2. User enters their Jellyseerr server URL
3. App validates the URL by calling `GET /api/v1/settings/public`
4. On success, proceed to login; on failure, show error with suggestions

**Acceptance criteria**:
- Accepts URLs with or without protocol (auto-prepend `https://`)
- Accepts URLs with or without trailing slash
- Shows clear error if server is unreachable or not a Jellyseerr instance
- Persists server URL in secure storage
- Supports local network URLs (e.g., `http://192.168.1.100:5055`)

**Edge cases**:
- Server behind reverse proxy with sub-path (e.g., `https://mydomain.com/jellyseerr`)
- Self-signed certificates (show warning but allow)
- Server requires VPN (user's responsibility, but show helpful error)

---

### F2: Authentication

**User story**: As a user, I want to log in with my Jellyfin account so my requests are tied to my identity.

**Flow**:
1. Login screen shows Jellyfin login form (username + password)
2. App calls `POST /api/v1/auth/jellyfin` with credentials
3. On success, store auth token and navigate to home
4. On failure, show error message

**Acceptance criteria**:
- Jellyfin auth works correctly
- Auth token persisted in `expo-secure-store`
- Auto-login on subsequent app launches
- Graceful session expiry handling (redirect to login, not crash)
- "Forgot password" is NOT in scope (handled by Jellyfin directly)

**API endpoints**:
- `POST /api/v1/auth/jellyfin` -- login
- `GET /api/v1/auth/me` -- validate session
- `POST /api/v1/auth/logout` -- end session

---

### F3: Home / Discover Screen

**User story**: As a user, I want to see trending and popular media when I open the app so I can discover new content.

**Sections** (in order):
1. **Continue Watching** (if Jellyfin integration supports it, otherwise skip)
2. **Trending Movies** -- horizontal scroll row
3. **Trending TV Shows** -- horizontal scroll row
4. **Popular Movies** -- horizontal scroll row
5. **Popular TV Shows** -- horizontal scroll row
6. **Recently Added** -- horizontal scroll row

**Acceptance criteria**:
- Each row shows poster cards with title and year
- Tapping a card navigates to media detail
- Pull-to-refresh reloads all sections
- Skeleton loading state while data loads
- Each row is independently loaded (one failing doesn't block others)

**API endpoints**:
- `GET /api/v1/discover/trending` -- params: `page`, `language`
- `GET /api/v1/discover/movies` -- popular movies
- `GET /api/v1/discover/tv` -- popular TV
- `GET /api/v1/media?filter=allavailable&sort=mediaAdded` -- recently added

---

### F4: Search

**User story**: As a user, I want to search for movies and TV shows so I can find specific content to request.

**Flow**:
1. Tap search tab, focus on search input
2. Type at least 3 characters
3. Results appear in a grid below (debounced, 300ms)
4. Each result shows poster, title, year, and availability badge
5. Tap result to open media detail

**Acceptance criteria**:
- Debounced search (300ms delay after last keystroke)
- Shows "No results" state when search returns empty
- Recent searches persisted locally (last 10)
- Clear search button in input
- Keyboard dismisses on scroll

**API endpoints**:
- `GET /api/v1/search` -- params: `query`, `page`, `language`

---

### F5: Media Detail

**User story**: As a user, I want to see full details about a movie or TV show so I can decide whether to request it.

**Layout**:
1. **Hero section** -- backdrop image with gradient overlay, poster, title, year, rating
2. **Status section** -- availability badge (Available / Partially Available / Not Available / Requested)
3. **Action section** -- "Request" button (or status if already requested)
4. **Overview** -- plot synopsis
5. **Info row** -- genres, runtime, network/studio
6. **Cast** -- horizontal scroll of cast members with photo + name
7. **Seasons** (TV only) -- list of seasons with episode count
8. **Recommendations** -- horizontal row of similar titles

**Acceptance criteria**:
- Handles both movie and TV types
- Shows correct availability status from user's Jellyseerr
- "Request" button opens request modal (see F6)
- If already requested, show request status instead of button
- Back navigation returns to previous screen
- Smooth hero image parallax on scroll (nice-to-have for v1)

**API endpoints**:
- `GET /api/v1/movie/{id}` -- movie details
- `GET /api/v1/tv/{id}` -- TV show details
- `GET /api/v1/movie/{id}/recommendations` -- similar movies
- `GET /api/v1/tv/{id}/recommendations` -- similar shows

---

### F6: Request Creation

**User story**: As a user, I want to request a movie or specific TV seasons so they get added to my media library.

**Flow (Movie)**:
1. Tap "Request" on media detail
2. Bottom sheet opens with quality profile selection (if multiple profiles configured)
3. Confirm request
4. Show success animation/toast
5. Media detail updates to show "Requested" status

**Flow (TV)**:
1. Tap "Request" on media detail
2. Bottom sheet opens with season selector (checkboxes)
3. Option to "Request All Seasons" or select specific ones
4. Confirm request
5. Show success animation/toast

**Acceptance criteria**:
- Movie requests are single-action (one tap after profile selection)
- TV requests allow granular season selection
- Already-available seasons are shown but not selectable
- Already-requested seasons are shown with their status
- Success feedback is immediate and clear
- Optimistic UI update (show "Requested" immediately, revert on API failure)

**API endpoints**:
- `POST /api/v1/request` -- create request

---

### F7: My Requests

**User story**: As a user, I want to see all my requests and their current status.

**Layout**:
- Filter tabs: All / Pending / Approved / Available / Declined
- List of request cards, each showing:
  - Poster thumbnail
  - Title + year
  - Request type (Movie / TV + season info)
  - Status badge (color-coded)
  - Request date

**Acceptance criteria**:
- Pull-to-refresh
- Filter by status
- Tap request opens media detail
- Empty state for each filter
- Requests sorted by date (newest first)

**API endpoints**:
- `GET /api/v1/request` -- params: `filter`, `sort`, `requestedBy`
- `GET /api/v1/request/count` -- request count by status

---

### F8: Settings

**User story**: As a user, I want to manage my connection and app preferences.

**Sections**:
1. **Account** -- avatar, username, email (read-only from Jellyseerr)
2. **Server** -- current server URL, connection status, "Change Server" button
3. **Notifications** -- toggle push notifications (v2 actual implementation)
4. **About** -- app version, links to Jellyseerr and Seekr repos
5. **Logout** -- clear session and return to auth flow

**Acceptance criteria**:
- Account info loaded from `GET /api/v1/auth/me`
- Server connection status (green/red dot)
- Logout clears all stored credentials
- Version number auto-read from app config

---

## v2.0 Features (Planned)

### F9: Push Notifications

- Notification when a request is approved
- Notification when requested media becomes available
- Requires Expo push token registration with a lightweight backend (or polling fallback)

### F10: Admin Panel

- Approve/reject pending requests from other users
- View all users' requests
- Only visible to users with admin/manage permissions

### F11: Discover Filters

- Browse by genre, year, network, studio
- Sort by popularity, rating, release date
- Certification filter (G, PG, PG-13, R, etc.)

### F12: Deep Link to Jellyfin

- "Watch Now" button on available media
- Opens Jellyfin iOS app directly to that title
- Fallback to Jellyfin web if app not installed

---

## v3.0 Features (Planned)

### F13: Multi-Server Support

- Add multiple Jellyseerr instances
- Switch between servers from settings
- Separate request lists per server

### F14: iOS Widgets

- Small widget: latest request status
- Medium widget: trending movie/show of the day
- Uses WidgetKit via expo-widgets or native module

### F15: Watchlist

- Save media to a personal watchlist (synced with Jellyseerr)
- Quick access from home screen

### F16: iPad Layout

- Side-by-side list + detail view
- Responsive grid layouts
- Keyboard shortcut support
