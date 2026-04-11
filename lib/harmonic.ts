/**
 * Camelot Wheel harmonic mixing logic
 *
 * The Camelot wheel maps musical keys to numbers 1-12 with A (minor) and B (major) suffixes.
 * Compatible transitions: same number, ±1 number, or same number switching A/B.
 *
 * Spotify key encoding: 0=C, 1=C#/Db, 2=D, 3=D#/Eb, 4=E, 5=F,
 *                       6=F#/Gb, 7=G, 8=G#/Ab, 9=A, 10=A#/Bb, 11=B
 * Spotify mode: 0=minor, 1=major
 */

// Maps [key][mode] → Camelot notation
const CAMELOT_MAP: Record<number, Record<number, string>> = {
  0:  { 0: '10A', 1: '8B'  }, // C minor, C major
  1:  { 0: '5A',  1: '3B'  }, // C#/Db minor, C#/Db major
  2:  { 0: '12A', 1: '10B' }, // D minor, D major
  3:  { 0: '7A',  1: '5B'  }, // D#/Eb minor, D#/Eb major
  4:  { 0: '2A',  1: '12B' }, // E minor, E major
  5:  { 0: '9A',  1: '7B'  }, // F minor, F major
  6:  { 0: '4A',  1: '2B'  }, // F#/Gb minor, F#/Gb major
  7:  { 0: '11A', 1: '9B'  }, // G minor, G major
  8:  { 0: '6A',  1: '4B'  }, // G#/Ab minor, G#/Ab major
  9:  { 0: '1A',  1: '11B' }, // A minor, A major
  10: { 0: '8A',  1: '6B'  }, // A#/Bb minor, A#/Bb major
  11: { 0: '3A',  1: '1B'  }, // B minor, B major
}

const KEY_NAMES: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B',
}

export function toCamelot(key: number, mode: number): string {
  if (key === -1) return '?'
  return CAMELOT_MAP[key]?.[mode] ?? '?'
}

export function camelotNumber(camelot: string): number {
  return parseInt(camelot.replace(/[AB]/g, ''), 10)
}

export function camelotSuffix(camelot: string): string {
  return camelot.slice(-1) // 'A' or 'B'
}

/**
 * Score the harmonic compatibility between two Camelot positions.
 * Returns 0-100.
 */
export function harmonicCompatibility(from: string, to: string): number {
  if (from === '?' || to === '?') return 50 // unknown key = neutral score

  const fromNum = camelotNumber(from)
  const fromSuffix = camelotSuffix(from)
  const toNum = camelotNumber(to)
  const toSuffix = camelotSuffix(to)

  // Perfect match — same key
  if (from === to) return 100

  // Relative major/minor — same number, different suffix (e.g., 8A → 8B)
  if (fromNum === toNum && fromSuffix !== toSuffix) return 90

  // Adjacent on wheel — same suffix, ±1 (e.g., 8A → 9A or 7A)
  const numDiff = Math.abs(fromNum - toNum)
  const wrappedDiff = Math.min(numDiff, 12 - numDiff) // handles 1↔12 wrap
  if (wrappedDiff === 1 && fromSuffix === toSuffix) return 80

  // One step diagonal — adjacent number, different suffix
  if (wrappedDiff === 1 && fromSuffix !== toSuffix) return 60

  // Two steps away — manageable with some energy shift
  if (wrappedDiff === 2 && fromSuffix === toSuffix) return 40

  // Everything else — clashing keys
  return 10
}

export function getKeyName(key: number, mode: number): string {
  if (key === -1) return 'Unknown'
  const name = KEY_NAMES[key]
  return `${name} ${mode === 1 ? 'maj' : 'min'}`
}

/**
 * Returns whether two keys are harmonically compatible enough for a DJ mix.
 */
export function isHarmonicallyCompatible(from: string, to: string): boolean {
  return harmonicCompatibility(from, to) >= 60
}
