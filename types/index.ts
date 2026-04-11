// Spotify API types
export interface SpotifyTrackSimple {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; width: number; height: number }[]
  }
  duration_ms: number
  preview_url: string | null
  explicit: boolean
}

export interface SpotifyAudioFeatures {
  id: string
  tempo: number           // BPM
  key: number             // 0-11 (C=0, C#=1, ... B=11), -1 = unknown
  mode: number            // 0 = minor, 1 = major
  energy: number          // 0.0-1.0
  danceability: number    // 0.0-1.0
  valence: number         // 0.0-1.0 (musical positiveness)
  loudness: number        // dB, typically -60 to 0
  acousticness: number    // 0.0-1.0
  instrumentalness: number // 0.0-1.0
  speechiness: number     // 0.0-1.0
  time_signature: number  // beats per bar
  liveness: number        // 0.0-1.0
  duration_ms: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  tracks: { total: number }
  owner: { display_name: string }
}

// Internal setlist track (after merging Spotify track + audio features)
export interface SetlistTrackData {
  id: string
  setlistId: string
  spotifyId: string
  name: string
  artist: string
  album: string
  albumArt: string | null
  duration: number        // milliseconds
  bpm: number
  key: number
  mode: number
  energy: number
  danceability: number
  valence: number
  loudness: number
  position: number
}

// Transition analysis between two adjacent tracks
export interface TransitionScore {
  score: number           // 0-100, higher = better transition
  bpmScore: number        // 0-100
  keyScore: number        // 0-100
  energyScore: number     // 0-100
  valenceScore: number    // 0-100
  camelotFrom: string     // e.g., "8A"
  camelotTo: string       // e.g., "8B"
  bpmDiff: number         // absolute BPM difference
  compatible: boolean     // whether transition is considered workable
  label: 'perfect' | 'good' | 'ok' | 'rough'
}

// A setlist with its tracks
export interface SetlistData {
  id: string
  name: string
  description: string | null
  tracks: SetlistTrackData[]
  createdAt: string
  updatedAt: string
}

// Claude AI analysis response
export interface AIAnalysis {
  overview: string
  energyArcAnalysis: string
  weakTransitions: {
    position: number    // index of the transition (between track[position] and track[position+1])
    reason: string
    suggestion: string
  }[]
  recommendations: SongRecommendation[]
  generalTips: string[]
}

export interface SongRecommendation {
  spotifyQuery: string    // search query to find the song
  name: string
  artist: string
  reason: string
  suggestedPosition: number  // where to insert (0 = start, tracks.length = end)
  expectedBPM?: number
  expectedKey?: string    // Camelot notation
}

// For use when enriching a search result with audio features
export interface EnrichedTrack extends SpotifyTrackSimple {
  audioFeatures: SpotifyAudioFeatures | null
}
