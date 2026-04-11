/**
 * BPM compatibility logic for DJ transitions.
 *
 * DJ mixing rules:
 * - Within ±3 BPM: Seamless, no pitch correction needed
 * - Within ±6 BPM: Easy transition, minor pitch adjustment
 * - Half/double time (64→128 etc.): Acceptable creative transition
 * - Within ±10 BPM: Manageable with skill
 * - >10 BPM: Hard transition, requires a break or drop
 */

export function bpmCompatibilityScore(bpmA: number, bpmB: number): number {
  const diff = Math.abs(bpmA - bpmB)

  // Check half/double time compatibility first
  const halfDiff = Math.abs(bpmA - bpmB * 2)
  const doubleDiff = Math.abs(bpmA * 2 - bpmB)
  const isHalfDouble = halfDiff <= 3 || doubleDiff <= 3

  if (isHalfDouble) return 70 // Creative half/double time — good but unusual

  if (diff <= 3) return 100   // Seamless
  if (diff <= 6) return 85    // Easy
  if (diff <= 10) return 65   // Manageable
  if (diff <= 15) return 40   // Difficult
  if (diff <= 20) return 20   // Very rough
  return 5                    // Incompatible
}

export function bpmDiff(bpmA: number, bpmB: number): number {
  return Math.abs(bpmA - bpmB)
}

export function bpmLabel(diff: number): string {
  if (diff <= 3) return 'seamless'
  if (diff <= 6) return 'easy'
  if (diff <= 10) return 'manageable'
  if (diff <= 15) return 'difficult'
  return 'very rough'
}

export function isHalfOrDoubleTime(bpmA: number, bpmB: number): boolean {
  return Math.abs(bpmA - bpmB * 2) <= 3 || Math.abs(bpmA * 2 - bpmB) <= 3
}

/**
 * Format BPM for display — rounds to 1 decimal
 */
export function displayBPM(bpm: number): string {
  return bpm.toFixed(1)
}
