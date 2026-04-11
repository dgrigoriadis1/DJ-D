import { SetlistTrackData, TransitionScore } from '@/types'
import { toCamelot, harmonicCompatibility } from './harmonic'
import { bpmCompatibilityScore, bpmDiff } from './bpm'

/**
 * Compute a transition score between two adjacent tracks.
 *
 * Weighting:
 * - BPM compatibility: 40%
 * - Harmonic (key) compatibility: 30%
 * - Energy delta: 20% (gradual energy changes score higher)
 * - Valence match: 10%
 */
export function scoreTransition(from: SetlistTrackData, to: SetlistTrackData): TransitionScore {
  const camelotFrom = toCamelot(from.key, from.mode)
  const camelotTo = toCamelot(to.key, to.mode)

  const bpmScore = bpmCompatibilityScore(from.bpm, to.bpm)
  const keyScore = harmonicCompatibility(camelotFrom, camelotTo)

  // Energy: penalize large jumps, reward gradual progression
  const energyDelta = Math.abs(from.energy - to.energy)
  const energyScore = Math.round(Math.max(0, 100 - energyDelta * 200))

  // Valence: reward similar emotional feel
  const valenceDelta = Math.abs(from.valence - to.valence)
  const valenceScore = Math.round(Math.max(0, 100 - valenceDelta * 150))

  const score = Math.round(
    bpmScore * 0.4 +
    keyScore * 0.3 +
    energyScore * 0.2 +
    valenceScore * 0.1
  )

  const diff = bpmDiff(from.bpm, to.bpm)

  let label: TransitionScore['label']
  if (score >= 80) label = 'perfect'
  else if (score >= 60) label = 'good'
  else if (score >= 40) label = 'ok'
  else label = 'rough'

  return {
    score,
    bpmScore,
    keyScore,
    energyScore,
    valenceScore,
    camelotFrom,
    camelotTo,
    bpmDiff: diff,
    compatible: score >= 50,
    label,
  }
}

/**
 * Score all transitions in a setlist.
 * Returns an array of length (tracks.length - 1).
 */
export function scoreSetlist(tracks: SetlistTrackData[]): TransitionScore[] {
  if (tracks.length < 2) return []
  return tracks.slice(0, -1).map((track, i) => scoreTransition(track, tracks[i + 1]))
}

/**
 * Get overall set quality score (average of all transitions).
 */
export function setlistQualityScore(transitions: TransitionScore[]): number {
  if (transitions.length === 0) return 0
  const sum = transitions.reduce((acc, t) => acc + t.score, 0)
  return Math.round(sum / transitions.length)
}

/**
 * Color class for a transition score.
 */
export function transitionColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function transitionBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20 border-green-500/40'
  if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40'
  if (score >= 40) return 'bg-orange-500/20 border-orange-500/40'
  return 'bg-red-500/20 border-red-500/40'
}
