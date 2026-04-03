# API Integration Reference

> Complete reference for Jellyseerr API endpoints used by Seekr.
> The Jellyseerr API follows the Overseerr API spec with additional Jellyfin/Emby support.
> Full OpenAPI spec is available at `{your-server}/api-docs`.

## Base Configuration

```
Base URL:       {serverUrl}/api/v1
Content-Type:   application/json
Auth:           Cookie session OR X-Api-Key header
```

## Authentication

Jellyseerr supports multiple auth methods. Seekr primarily uses Jellyfin auth.

### Validate Server

Before login, verify the URL points to a valid Jellyseerr instance.

```
GET /settings/public

Response 200:
{
  "initialized": true,
  "appTitle": "Jellyseerr",
  "applicationUrl": "https://requests.example.com",
  "localLogin": true,
  "movie4kEnabled": false,
  "series4kEnabled": false,
  "region": "",
  "originalLanguage": "",
  "mediaServerType": 2,        // 1 = Plex, 2 = Jellyfin, 3 = Emby
  "jellyfinHost": "..."
}
```

Use `initialized: true` to confirm the server is set up.
Use `mediaServerType` to determine which login method to show.

---

### Login (Jellyfin)

```
POST /auth/jellyfin

Body:
{
  "username": "string",
  "password": "string",
  "hostname": "string"         // Optional: override Jellyfin host from server config
}

Response 200:
{
  "id": 1,
  "email": "user@example.com",
  "username": "john",
  "userType": 2,                // 1 = Plex, 2 = Jellyfin, 3 = Local, 4 = Emby
  "permissions": 2,
  "avatar": "...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "requestCount": 5
}

Headers (set-cookie):
  connect.sid=<session_id>; Path=/; HttpOnly
```

**Important**: The response sets a `connect.sid` cookie. Axios must be configured with `withCredentials: true` to persist and send this cookie on subsequent requests.

---

### Validate Session

```
GET /auth/me

Response 200: (same User object as login)

Response 401:
{ "message": "Unauthorized" }
```

---

### Logout

```
POST /auth/logout

Response 200:
{ "status": "ok" }
```

---

## API Key Authentication (Alternative)

Instead of cookie-based sessions, requests can be authenticated with an API key:

```
Header: X-Api-Key: {apiKey}
```

The API key is found in Jellyseerr Settings > General. This method is simpler for mobile and avoids cookie management issues. Consider supporting both methods and letting the user choose during setup.

---

## Discovery / Trending

### Trending

```
GET /discover/trending

Query params:
  page:      number (default: 1)
  language:  string (ISO 639-1, e.g., "it", "en")

Response 200:
{
  "page": 1,
  "totalPages": 20,
  "totalResults": 400,
  "results": [
    {
      "id": 12345,
      "mediaType": "movie",          // "movie" or "tv"
      "popularity": 234.5,
      "posterPath": "/abc123.jpg",    // Prepend TMDB base URL
      "backdropPath": "/xyz789.jpg",
      "title": "Movie Title",        // Movies use "title"
      "name": "TV Show Name",        // TV uses "name"
      "originalTitle": "...",
      "overview": "Plot description...",
      "releaseDate": "2024-06-15",    // Movies
      "firstAirDate": "2024-03-01",   // TV
      "voteAverage": 7.8,
      "voteCount": 1234,
      "genreIds": [28, 12, 878],
      "mediaInfo": {                  // Present if media exists in Jellyseerr
        "id": 1,
        "tmdbId": 12345,
        "status": 5,                  // See Media Status enum
        "requests": [...]
      }
    }
  ]
}
```

### Discover Movies

```
GET /discover/movies

Query params:
  page:      number
  language:  string
  genre:     number (TMDB genre ID)
  studio:    number
  sortBy:    string ("popularity.desc", "vote_average.desc", "release_date.desc")
```

### Discover TV

```
GET /discover/tv

Query params:
  page:      number
  language:  string
  genre:     number
  network:   number
  sortBy:    string
```

---

## Search

```
GET /search

Query params:
  query:     string (search term)
  page:      number (default: 1)
  language:  string

Response 200:
{
  "page": 1,
  "totalPages": 5,
  "totalResults": 100,
  "results": [
    {
      "id": 12345,
      "mediaType": "movie",           // or "tv" or "person"
      "title": "...",
      "posterPath": "/...",
      "releaseDate": "...",
      "overview": "...",
      "mediaInfo": { ... }            // null if not in library/requested
    }
  ]
}
```

**Note**: Search results include `"person"` type results. Filter these out in the app since we only display movie/TV.

---

## Media Details

### Movie Details

```
GET /movie/{tmdbId}

Response 200:
{
  "id": 12345,
  "title": "Movie Title",
  "originalTitle": "...",
  "overview": "Full plot synopsis...",
  "posterPath": "/...",
  "backdropPath": "/...",
  "releaseDate": "2024-06-15",
  "runtime": 142,
  "voteAverage": 7.8,
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 878, "name": "Science Fiction" }
  ],
  "credits": {
    "cast": [
      {
        "id": 1,
        "name": "Actor Name",
        "character": "Character Name",
        "profilePath": "/..."
      }
    ]
  },
  "mediaInfo": {
    "id": 1,
    "status": 5,
    "requests": [
      {
        "id": 1,
        "status": 2,
        "requestedBy": { "id": 1, "username": "john" },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "relatedVideos": [...],
  "collection": { ... }
}
```

### TV Show Details

```
GET /tv/{tmdbId}

Response 200:
{
  "id": 67890,
  "name": "TV Show Name",
  "overview": "...",
  "posterPath": "/...",
  "backdropPath": "/...",
  "firstAirDate": "2024-03-01",
  "episodeRunTime": [45],
  "status": "Returning Series",
  "numberOfSeasons": 3,
  "numberOfEpisodes": 24,
  "genres": [...],
  "credits": { "cast": [...] },
  "seasons": [
    {
      "id": 1,
      "seasonNumber": 1,
      "episodeCount": 8,
      "name": "Season 1",
      "airDate": "2024-03-01",
      "posterPath": "/..."
    }
  ],
  "mediaInfo": {
    "id": 2,
    "status": 4,                        // PARTIALLY_AVAILABLE
    "seasons": [
      { "seasonNumber": 1, "status": 5 },   // Season 1: AVAILABLE
      { "seasonNumber": 2, "status": 3 },   // Season 2: PROCESSING
      { "seasonNumber": 3, "status": 1 }    // Season 3: UNKNOWN
    ],
    "requests": [...]
  }
}
```

### Recommendations

```
GET /movie/{tmdbId}/recommendations
GET /tv/{tmdbId}/recommendations

Response: same format as discover/trending results
```

---

## Requests

### Create Request

```
POST /request

Body (Movie):
{
  "mediaType": "movie",
  "mediaId": 12345,               // TMDB ID
  "is4k": false,
  "serverId": 0,                  // Radarr server ID (0 = default)
  "profileId": 0,                 // Quality profile (0 = default)
  "rootFolder": ""                // Root folder (empty = default)
}

Body (TV):
{
  "mediaType": "tv",
  "mediaId": 67890,
  "is4k": false,
  "seasons": [1, 3],              // Array of season numbers to request
  "serverId": 0,
  "profileId": 0,
  "rootFolder": ""
}

Response 201:
{
  "id": 42,
  "status": 1,                    // PENDING_APPROVAL
  "media": { ... },
  "requestedBy": { ... },
  "createdAt": "2024-06-15T12:00:00.000Z"
}
```

### List Requests

```
GET /request

Query params:
  take:         number (items per page, default: 10)
  skip:         number (offset)
  filter:       string ("all", "approved", "available", "pending", "processing", "unavailable", "failed")
  sort:         string ("added", "modified")
  requestedBy:  number (user ID, for filtering own requests)

Response 200:
{
  "pageInfo": {
    "pages": 5,
    "pageSize": 10,
    "results": 48,
    "page": 1
  },
  "results": [
    {
      "id": 42,
      "status": 2,
      "media": {
        "tmdbId": 12345,
        "mediaType": "movie",
        "status": 3
      },
      "requestedBy": {
        "id": 1,
        "username": "john",
        "avatar": "..."
      },
      "createdAt": "2024-06-15T12:00:00.000Z",
      "updatedAt": "2024-06-16T08:00:00.000Z"
    }
  ]
}
```

### Request Count

```
GET /request/count

Response 200:
{
  "total": 48,
  "movie": 30,
  "tv": 18,
  "pending": 5,
  "approved": 35,
  "declined": 3,
  "processing": 2,
  "available": 3
}
```

---

## User

### Get Profile

```
GET /user/{userId}

Response 200:
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "avatar": "...",
  "userType": 2,
  "permissions": 2,
  "requestCount": 42,
  "createdAt": "..."
}
```

### Get Request Quota

```
GET /user/{userId}/quota

Response 200:
{
  "movie": {
    "limit": 10,
    "used": 3,
    "remaining": 7,
    "days": 7
  },
  "tv": {
    "limit": 5,
    "used": 1,
    "remaining": 4,
    "days": 7
  }
}
```

---

## TMDB Image URLs

Jellyseerr returns relative image paths from TMDB. Build full URLs like this:

```
Base URL:  https://image.tmdb.org/t/p/

Sizes:
  Poster:    w92, w154, w185, w342, w500, w780, original
  Backdrop:  w300, w780, w1280, original
  Profile:   w45, w185, h632, original

Examples:
  Poster (list):     https://image.tmdb.org/t/p/w342/abc123.jpg
  Poster (detail):   https://image.tmdb.org/t/p/w500/abc123.jpg
  Backdrop (hero):   https://image.tmdb.org/t/p/w1280/xyz789.jpg
  Cast avatar:       https://image.tmdb.org/t/p/w185/def456.jpg
```

---

## Enums Reference

### Media Status

| Value | Name | Description |
|-------|------|-------------|
| 1 | UNKNOWN | Not in library, not requested |
| 2 | PENDING | Requested but not yet processed |
| 3 | PROCESSING | Being downloaded/processed |
| 4 | PARTIALLY_AVAILABLE | Some episodes/seasons available |
| 5 | AVAILABLE | Fully available in library |
| 6 | DELETED | Was available but has been removed |

### Request Status

| Value | Name | Description |
|-------|------|-------------|
| 1 | PENDING_APPROVAL | Awaiting admin approval |
| 2 | APPROVED | Approved, sent to Radarr/Sonarr |
| 3 | DECLINED | Rejected by admin |

### Media Type

| Value | Description |
|-------|-------------|
| `"movie"` | Film |
| `"tv"` | Television series |
| `"person"` | Cast/crew member (search only) |

### User Type

| Value | Description |
|-------|-------------|
| 1 | Plex user |
| 2 | Jellyfin user |
| 3 | Local user |
| 4 | Emby user |

---

## Error Handling

### Common Error Responses

```
401 Unauthorized:
{ "message": "Unauthorized" }
→ Token expired or invalid. Clear auth, redirect to login.

403 Forbidden:
{ "message": "Forbidden" }
→ User lacks permissions for this action.

404 Not Found:
{ "message": "Not found" }
→ Media or resource doesn't exist.

409 Conflict:
{ "message": "Request already exists" }
→ Duplicate request. Show "Already Requested" state.

422 Validation Error:
{ "message": "Validation failed", "errors": [...] }
→ Invalid request body. Show field-level errors.

429 Too Many Requests:
→ Rate limited. Implement exponential backoff.
```

---

## Rate Limiting Notes

- Jellyseerr itself does not impose strict rate limits
- TMDB API (used internally by Jellyseerr) has rate limits (~40 requests per 10 seconds)
- Discovery and trending endpoints may be slower due to TMDB cascading calls
- Implement client-side debouncing (search) and caching (trending/popular) to minimize unnecessary calls
