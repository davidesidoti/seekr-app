# Design System

> Visual language, color palette, typography, spacing, and component guidelines for Seekr.
> The goal is to faithfully replicate Jellyseerr's dark, cinematic aesthetic in a native mobile context.

## Design Philosophy

Seekr's UI should feel like a **premium streaming app** -- think Jellyseerr meets the Netflix/Plex app experience. Dark, immersive, content-first. The media (posters, backdrops) should be the star; the UI should frame it, not compete with it.

### Principles

1. **Content-first** -- large images, minimal chrome
2. **Dark by default** -- no light theme (matches Jellyseerr)
3. **Familiar** -- Jellyseerr users should feel at home immediately
4. **Native feel** -- respect iOS conventions (swipe back, haptics, safe areas)
5. **Accessible** -- minimum WCAG AA contrast ratios even in dark mode

---

## Color Palette

### Core Colors

```
Background (primary):    #0f0f1a    -- deepest dark, used for screen backgrounds
Background (card):       #1a1a2e    -- slightly lighter, used for cards and surfaces
Background (elevated):   #242440    -- modals, bottom sheets, dropdowns
Background (input):      #2a2a45    -- input fields, search bars

Text (primary):          #f1f1f3    -- main text, titles
Text (secondary):        #9ca3af    -- subtitles, metadata, timestamps
Text (muted):            #6b7280    -- placeholder text, disabled states

Accent (primary):        #6366f1    -- indigo, primary brand color (buttons, active states)
Accent (hover):          #818cf8    -- lighter indigo, hover/pressed states
Accent (subtle):         rgba(99, 102, 241, 0.15)  -- tinted backgrounds

Border:                  #2d2d50    -- subtle borders, dividers
```

### Status Colors

```
Available:               #10b981    -- emerald green
Partially Available:     #f59e0b    -- amber/yellow
Pending:                 #6366f1    -- indigo (same as accent)
Processing:              #3b82f6    -- blue
Declined:                #ef4444    -- red
Unknown:                 #6b7280    -- gray
```

### Gradient

The signature Jellyseerr gradient used on hero sections and overlays:

```
Hero overlay:   linear-gradient(to top, #0f0f1a 0%, transparent 60%)
Card hover:     linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)
```

---

## Typography

Using the system font stack for performance and native feel.

### Scale

```
Display:      32px / bold      -- hero title on media detail
Heading 1:    24px / bold      -- screen titles
Heading 2:    20px / semibold  -- section titles ("Trending Movies")
Heading 3:    17px / semibold  -- card titles, list headers
Body:         15px / regular   -- standard text, descriptions
Body Small:   13px / regular   -- metadata, timestamps, badges
Caption:      11px / medium    -- tiny labels, status indicators
```

### Font Weight Mapping

```
Regular:    400 (System default)
Medium:     500 (System-Medium)
Semibold:   600 (System-Semibold)
Bold:       700 (System-Bold)
```

### Line Heights

- Headings: 1.2x font size
- Body text: 1.5x font size
- Single-line labels: 1x font size

---

## Spacing

Using a 4px base grid:

```
xs:     4px
sm:     8px
md:     12px
lg:     16px
xl:     20px
2xl:    24px
3xl:    32px
4xl:    40px
5xl:    48px
```

### Screen Padding

- Horizontal padding: 16px (lg)
- Vertical padding between sections: 24px (2xl)
- Card gap in grids: 12px (md)

---

## Border Radius

```
sm:       6px     -- badges, small elements
md:       8px     -- cards, inputs
lg:       12px    -- larger cards, modals
xl:       16px    -- bottom sheets, images
full:     9999px  -- pills, avatars
```

---

## Shadows & Elevation

In dark mode, shadows are subtle. Use opacity and background color shifts instead.

```
Level 0 (flat):      background: #0f0f1a
Level 1 (card):      background: #1a1a2e
Level 2 (elevated):  background: #242440
Level 3 (overlay):   background: #242440 + backdrop blur
```

Use `backdrop-filter: blur(20px)` (or React Native equivalent) for modals and bottom sheets.

---

## Component Specifications

### MediaCard

The primary content unit. Used in horizontal rows and search results.

```
Dimensions:
  - Width: 130px (compact) / 150px (standard)
  - Height: aspect ratio 2:3 (poster ratio)
  - Border radius: 8px (md)

Content:
  - Poster image (full bleed, rounded corners)
  - Title below (max 2 lines, ellipsis)
  - Year below title
  - Optional: status badge overlay (top-right corner)

States:
  - Loading: skeleton placeholder (animated shimmer)
  - Loaded: poster + text
  - Error: gray placeholder with film icon
```

### MediaRow

Horizontal scrollable row of MediaCards.

```
Layout:
  - Section title (Heading 2) with optional "See All" link
  - Horizontal ScrollView with snap behavior
  - Left padding: 16px (matches screen padding)
  - Card spacing: 12px
  - Right padding: 16px (so last card isn't cut off)
```

### MediaHero

Full-width hero on the media detail screen.

```
Layout:
  - Backdrop image (full width, ~60% screen height)
  - Gradient overlay (bottom fade to background)
  - Poster thumbnail (left-aligned, overlapping backdrop bottom)
  - Title, year, rating (right of poster)
  - Genre tags below

Interactions:
  - Parallax scroll effect (backdrop scrolls slower than content)
  - iOS status bar: transparent over backdrop
```

### StatusBadge

Small pill showing media/request status.

```
Variants:
  - Available     → green bg, white text, "Available"
  - Partial       → amber bg, white text, "Partially Available"
  - Pending       → indigo bg, white text, "Pending"
  - Processing    → blue bg, white text, "Processing"
  - Declined      → red bg, white text, "Declined"
  - Requested     → indigo bg, white text, "Requested"

Size:
  - Padding: 4px 8px
  - Font: Caption (11px, medium)
  - Border radius: full (pill shape)
```

### RequestCard

Used in the "My Requests" list.

```
Layout:
  - Poster thumbnail (left, 60x90px, rounded)
  - Title + year (top-right of poster)
  - Type info: "Movie" or "TV - Season 1, 2" (below title)
  - Status badge (below type)
  - Request date (bottom-right, muted text)

  - Full width, horizontal layout
  - Background: card color (#1a1a2e)
  - Border radius: 12px (lg)
  - Padding: 12px
```

### Button

```
Variants:
  - Primary:    bg accent (#6366f1), white text
  - Secondary:  bg transparent, border accent, accent text
  - Danger:     bg red (#ef4444), white text
  - Ghost:      bg transparent, no border, accent text

Sizes:
  - Large:  height 48px, font 17px, padding 0 24px
  - Medium: height 40px, font 15px, padding 0 16px
  - Small:  height 32px, font 13px, padding 0 12px

States:
  - Default, Pressed (opacity 0.8), Disabled (opacity 0.5), Loading (spinner)

All buttons have haptic feedback on press (light impact).
```

### Input

```
Style:
  - Background: input color (#2a2a45)
  - Border: 1px border color (#2d2d50)
  - Border on focus: accent (#6366f1)
  - Text: primary text color
  - Placeholder: muted text color
  - Border radius: 8px (md)
  - Height: 48px
  - Padding: 0 16px

Variants:
  - With icon (left or right)
  - With clear button (search)
  - Error state (red border, error message below)
```

### TabBar

Custom bottom tab bar to match the Jellyseerr aesthetic.

```
Style:
  - Background: elevated (#242440) with blur
  - Height: standard iOS tab bar height
  - Icons: Lucide icons
  - Active: accent color (#6366f1)
  - Inactive: muted color (#6b7280)
  - Labels below icons (small font)
  - Safe area padding for home indicator

Tabs:
  1. Home (house icon)
  2. Search (search icon)
  3. Requests (inbox icon)
  4. Settings (settings/cog icon)
```

### Skeleton / Loading State

```
Style:
  - Background: shimmer animation between #1a1a2e and #2a2a45
  - Same dimensions as the real component
  - Rounded corners matching the real component
  - No spinners anywhere (skeletons only)
```

---

## Animation Guidelines

- **Screen transitions**: use Expo Router's default Stack/Tab animations
- **List items**: subtle fade-in on appear (100ms delay per item, max 5)
- **Bottom sheets**: spring animation (damping: 20, stiffness: 300)
- **Haptics**: light impact on button press, medium on request submit, success on confirmed
- **Pull to refresh**: native iOS refresh control (not custom)
- **Skeleton shimmer**: 1.5s loop, ease-in-out

---

## Iconography

Use **Lucide React Native** for all icons. Consistent 24px size, 1.5px stroke width.

### Tab Bar Icons

```
Home:       Home
Search:     Search
Requests:   Inbox
Settings:   Settings
```

### Action Icons

```
Request:    Plus
Back:       ChevronLeft
Close:      X
Filter:     SlidersHorizontal
Share:      Share2
Star:       Star
Clock:      Clock
Check:      CheckCircle
Alert:      AlertCircle
```

---

## Accessibility

- All interactive elements have minimum 44x44pt touch target
- All images have alt text (title of the media)
- Status badges use both color AND text (not color alone)
- Contrast ratios: at least 4.5:1 for body text, 3:1 for large text
- Support Dynamic Type (iOS text size scaling) where feasible
- VoiceOver labels on all interactive elements
