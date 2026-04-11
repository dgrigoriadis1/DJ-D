# DJ-D — AI DJ Set Planner

The journey to creating a proper AI DJ that knows how to create a banger set.

## What it does

- **Import from Spotify** — connect your Spotify account and import any playlist as a setlist
- **Audio analysis** — BPM, key (Camelot notation), energy, danceability, and valence for every track
- **Transition scoring** — every adjacent pair of songs gets a 0-100 compatibility score based on BPM diff, harmonic compatibility, and energy flow
- **Visual set flow** — energy curve and BPM timeline charts across your full set
- **AI analysis** — Claude AI analyzes your set, identifies weak transitions, and recommends specific songs to fill gaps

---

## Tech stack

| Layer | Tech |
|-------|------|
| Full-stack framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) via Prisma |
| Auth | NextAuth.js (Spotify OAuth) |
| AI | Claude API (`claude-sonnet-4-6`) |
| Charts | Recharts |
| Drag & drop | dnd-kit |
| Deployment | Vercel |

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd DJ-D
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

**Spotify API** — [developer.spotify.com](https://developer.spotify.com)
1. Log in → Dashboard → Create app → Name it "DJ-D"
2. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
3. Copy `Client ID` and `Client Secret`

**Anthropic API** — [console.anthropic.com](https://console.anthropic.com)
1. Sign in → API Keys → Create Key
2. Copy the key (shown only once)

**NextAuth secret**
```bash
openssl rand -base64 32
```

**Supabase** — [supabase.com](https://supabase.com)
1. Create a new project
2. Go to: Settings → Database → Connection String → URI mode
3. Copy the connection string (use port 6543 for `DATABASE_URL`, port 5432 for `DIRECT_URL`)

### 3. Set up the database

```bash
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect with Spotify.

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — it will build and deploy automatically

---

## Roadmap

### Phase 1 (current) — Visual Set Planner
- [x] Spotify OAuth login
- [x] Track search with audio features
- [x] Playlist import
- [x] Setlist editor with drag-and-drop reordering
- [x] Per-track BPM, Camelot key, energy display
- [x] Transition scoring between adjacent tracks
- [x] Energy curve visualization
- [x] BPM timeline visualization
- [x] Claude AI setlist analysis + song recommendations

### Phase 2 — Audio Previews
- [ ] 30-second crossfade preview at transition points
- [ ] Waveform display (Web Audio API)
- [ ] Local file BPM detection (Essentia.js)

### Phase 3 — Advanced
- [ ] Export optimized setlist back to Spotify
- [ ] Public shareable setlist links
- [ ] Set arc templates (warmup, peak hour, closing)
