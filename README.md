# Seekr

**A native iOS client for Jellyseerr -- browse, search, and request media from your self-hosted server.**

Seekr brings the full Jellyseerr experience to your iPhone with a clean, dark-themed UI inspired by the Jellyseerr web interface. Request movies and TV shows, track request statuses, and discover trending content, all from a fast, native mobile app.

## Why Seekr?

Jellyseerr is an incredible tool for managing media requests, but as of today there is no dedicated iOS app. The web UI works, but it's not ideal on mobile: no push notifications, no native navigation, no offline caching. Seekr fills that gap.

## Features (MVP - v1.0)

- **Server setup** -- Connect to any Jellyseerr instance via URL + API key or Jellyfin credentials
- **Home feed** -- Trending, popular, and recently added media
- **Search** -- Full-text search for movies and TV shows via TMDB
- **Media details** -- Poster, backdrop, overview, cast, genres, availability status
- **Request system** -- Request movies or specific TV seasons with quality profile selection
- **Request tracking** -- View your requests with real-time status (pending/approved/available/declined)
- **Dark theme** -- Faithful to Jellyseerr's signature dark UI with indigo accents

## Features (Planned - v2.0+)

- Push notifications (request approved, media available)
- Admin panel (approve/reject requests from other users)
- Discover by genre, year, network, studio
- Deep link to Jellyfin app for direct playback
- iOS widgets (trending, recent requests)
- Multi-server support
- Watchlist management
- iPad layout support

## Tech Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Framework          | React Native + Expo (SDK 54+)       |
| Navigation         | Expo Router (file-based)            |
| Language           | TypeScript                          |
| State management   | Zustand                             |
| API client         | Axios + React Query (TanStack)      |
| Styling            | NativeWind (Tailwind for RN)        |
| Icons              | Lucide React Native                 |
| Image caching      | expo-image                          |
| Secure storage     | expo-secure-store                   |
| Notifications      | expo-notifications                  |

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npx expo`)
- Xcode 15+ (for iOS simulator)
- A running Jellyseerr instance (for testing)
- Apple Developer account (for App Store distribution, not needed for development)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/seekr-app.git
cd seekr-app

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Or scan the QR code with Expo Go on your iPhone
```

## Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture breakdown.

```
seekr-app/
├── app/                     # Expo Router file-based routing
│   ├── _layout.tsx          # Root layout (providers, theme)
│   ├── (auth)/              # Auth flow (login, server setup)
│   ├── (tabs)/              # Main tab navigation
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── index.tsx        # Home (discover/trending)
│   │   ├── search.tsx       # Search screen
│   │   ├── requests.tsx     # My requests
│   │   └── settings.tsx     # Settings & account
│   └── media/
│       └── [id].tsx         # Media detail (movie or TV)
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks
├── services/                # API client & data layer
├── stores/                  # Zustand state stores
├── theme/                   # Colors, typography, spacing
├── types/                   # TypeScript type definitions
├── utils/                   # Helper functions
├── assets/                  # Static assets (icons, splash)
├── docs/                    # Project documentation
├── app.json                 # Expo configuration
├── tsconfig.json            # TypeScript config
├── CONTEXT.md               # Claude Code handoff document
└── README.md                # This file
```

## Documentation

| Document | Description |
|----------|-------------|
| [CONTEXT.md](CONTEXT.md) | AI-assisted development handoff context |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture & patterns |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature specifications & user stories |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | UI/UX design system & component library |
| [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md) | Jellyseerr API integration reference |

## Contributing

This project is currently in early development. Contribution guidelines will be added once the MVP is stable.

## License

GNU General Public License v3.0 -- see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Jellyseerr](https://github.com/fallenbagel/jellyseerr) for the incredible media request platform
- [Overseerr](https://overseerr.dev/) for the original project and API design
- [TMDB](https://www.themoviedb.org/) for the media metadata API
