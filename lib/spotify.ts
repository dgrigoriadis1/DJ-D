import { SpotifyTrackSimple, SpotifyAudioFeatures, SpotifyPlaylist } from '@/types'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export class SpotifyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(
        `Spotify API error ${response.status}: ${error?.error?.message ?? response.statusText}`
      )
    }

    return response.json()
  }

  /** Search for tracks */
  async searchTracks(query: string, limit = 20): Promise<SpotifyTrackSimple[]> {
    const params = new URLSearchParams({ q: query, type: 'track', limit: String(limit) })
    const data = await this.fetch<{ tracks: { items: SpotifyTrackSimple[] } }>(
      `/search?${params}`
    )
    return data.tracks.items
  }

  /** Get audio features for up to 100 track IDs */
  async getAudioFeatures(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    if (trackIds.length === 0) return []
    const ids = trackIds.slice(0, 100).join(',')
    const data = await this.fetch<{ audio_features: (SpotifyAudioFeatures | null)[] }>(
      `/audio-features?ids=${ids}`
    )
    return data.audio_features.filter(Boolean) as SpotifyAudioFeatures[]
  }

  /** Get a single track's audio features */
  async getAudioFeature(trackId: string): Promise<SpotifyAudioFeatures | null> {
    try {
      return await this.fetch<SpotifyAudioFeatures>(`/audio-features/${trackId}`)
    } catch {
      return null
    }
  }

  /** Get current user's playlists */
  async getUserPlaylists(limit = 50): Promise<SpotifyPlaylist[]> {
    const data = await this.fetch<{ items: SpotifyPlaylist[] }>(
      `/me/playlists?limit=${limit}`
    )
    return data.items
  }

  /** Get all tracks from a playlist */
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrackSimple[]> {
    const tracks: SpotifyTrackSimple[] = []
    let offset = 0
    const limit = 100

    while (true) {
      const data = await this.fetch<{
        items: { track: SpotifyTrackSimple | null }[]
        next: string | null
      }>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists,album,duration_ms,preview_url,explicit)),next`)

      const items = data.items
        .map((item) => item.track)
        .filter((track): track is SpotifyTrackSimple => track !== null && track.id !== null)

      tracks.push(...items)

      if (!data.next || tracks.length >= 500) break // cap at 500 tracks
      offset += limit
    }

    return tracks
  }

  /** Get the current user's Spotify profile */
  async getMe(): Promise<{ id: string; display_name: string; email: string; images: { url: string }[] }> {
    return this.fetch('/me')
  }
}

/** Build a SpotifyClient from a session access token */
export function createSpotifyClient(accessToken: string): SpotifyClient {
  return new SpotifyClient(accessToken)
}
