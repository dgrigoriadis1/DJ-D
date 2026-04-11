import Anthropic from '@anthropic-ai/sdk'
import { SetlistTrackData, AIAnalysis } from '@/types'
import { toCamelot, getKeyName } from './harmonic'
import { scoreSetlist } from './transitions'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function buildSetlistContext(tracks: SetlistTrackData[]): string {
  const transitions = scoreSetlist(tracks)

  const trackList = tracks
    .map((track, i) => {
      const camelot = toCamelot(track.key, track.mode)
      const keyName = getKeyName(track.key, track.mode)
      const transitionScore = transitions[i]
        ? ` → Transition to next: ${transitions[i].score}/100 (BPM diff: ${transitions[i].bpmDiff.toFixed(1)}, Key: ${transitions[i].camelotFrom}→${transitions[i].camelotTo})`
        : ''

      return `${i + 1}. "${track.name}" by ${track.artist}
   BPM: ${track.bpm.toFixed(1)} | Key: ${keyName} (Camelot: ${camelot}) | Energy: ${Math.round(track.energy * 100)}% | Danceability: ${Math.round(track.danceability * 100)}% | Valence: ${Math.round(track.valence * 100)}%${transitionScore}`
    })
    .join('\n')

  return trackList
}

export async function analyzeSetlist(
  tracks: SetlistTrackData[],
  setlistName: string
): Promise<AIAnalysis> {
  const setlistContext = buildSetlistContext(tracks)
  const transitions = scoreSetlist(tracks)
  const avgScore = transitions.length > 0
    ? Math.round(transitions.reduce((a, t) => a + t.score, 0) / transitions.length)
    : 0

  const prompt = `You are an expert DJ and music analyst. Analyze this setlist and provide actionable feedback.

SETLIST: "${setlistName}" (${tracks.length} tracks, Average transition score: ${avgScore}/100)

${setlistContext}

Provide your analysis in the following JSON format exactly (no markdown, just raw JSON):
{
  "overview": "2-3 sentence overall assessment of the set's flow, energy arc, and vibe",
  "energyArcAnalysis": "Describe the energy journey through the set — does it build, peak, drop correctly? Is it suitable for a DJ set?",
  "weakTransitions": [
    {
      "position": <number — index of transition, 0 = between track 1 and 2>,
      "reason": "why this transition is weak",
      "suggestion": "specific DJ technique or what kind of song would help bridge this gap"
    }
  ],
  "recommendations": [
    {
      "spotifyQuery": "artist:X track:Y",
      "name": "Song Name",
      "artist": "Artist Name",
      "reason": "Why this song would improve the set",
      "suggestedPosition": <number — insert before this index, 0 = start, ${tracks.length} = end>,
      "expectedBPM": <approximate BPM>,
      "expectedKey": "Camelot notation like 8A or 9B"
    }
  ],
  "generalTips": ["tip 1", "tip 2", "tip 3"]
}

Focus only on transitions with scores below 65. Recommend 2-4 songs max. Be specific and actionable.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response from Claude')

  try {
    const parsed = JSON.parse(content.text) as AIAnalysis
    return parsed
  } catch {
    // If JSON parsing fails, return a structured error response
    return {
      overview: content.text.slice(0, 300),
      energyArcAnalysis: 'Analysis unavailable — please try again.',
      weakTransitions: [],
      recommendations: [],
      generalTips: [],
    }
  }
}

export async function getRecommendations(
  tracks: SetlistTrackData[],
  targetPosition: number,
  genre?: string
): Promise<AIAnalysis['recommendations']> {
  const prevTrack = tracks[targetPosition - 1]
  const nextTrack = tracks[targetPosition]

  const contextBefore = prevTrack
    ? `Previous track: "${prevTrack.name}" by ${prevTrack.artist} (BPM: ${prevTrack.bpm.toFixed(1)}, Key: ${toCamelot(prevTrack.key, prevTrack.mode)}, Energy: ${Math.round(prevTrack.energy * 100)}%)`
    : 'This would be the opening track'

  const contextAfter = nextTrack
    ? `Next track: "${nextTrack.name}" by ${nextTrack.artist} (BPM: ${nextTrack.bpm.toFixed(1)}, Key: ${toCamelot(nextTrack.key, nextTrack.mode)}, Energy: ${Math.round(nextTrack.energy * 100)}%)`
    : 'This would be the closing track'

  const prompt = `You are an expert DJ. Recommend 3-5 songs that would fit perfectly at position ${targetPosition + 1} in a DJ set.

Context:
- ${contextBefore}
- ${nextTrack ? contextAfter : ''}
${genre ? `- Preferred genre/style: ${genre}` : ''}

Provide recommendations in JSON format (no markdown):
{
  "recommendations": [
    {
      "spotifyQuery": "artist:X track:Y",
      "name": "Song Name",
      "artist": "Artist Name",
      "reason": "Why this fits perfectly here",
      "suggestedPosition": ${targetPosition},
      "expectedBPM": <approximate BPM>,
      "expectedKey": "Camelot notation"
    }
  ]
}

Prioritize harmonic and BPM compatibility with adjacent tracks.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') return []

  try {
    const parsed = JSON.parse(content.text) as { recommendations: AIAnalysis['recommendations'] }
    return parsed.recommendations
  } catch {
    return []
  }
}
