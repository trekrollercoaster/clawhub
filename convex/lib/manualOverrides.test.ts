import { describe, expect, it } from 'vitest'
import type { Id } from '../_generated/dataModel'
import {
  applyManualOverrideToSkillPatch,
  isManualOverrideReason,
} from './manualOverrides'

function userId(value: string) {
  return value as Id<'users'>
}

describe('manualOverrides', () => {
  it('detects manual override reasons', () => {
    expect(isManualOverrideReason('manual.override.clean')).toBe(true)
    expect(isManualOverrideReason('scanner.vt.suspicious')).toBe(false)
    expect(isManualOverrideReason(undefined)).toBe(false)
  })

  it('applies clean/caution overrides as non-suspicious active skill state', () => {
    const now = 1_700_000_000_000
    const patch = applyManualOverrideToSkillPatch({
      basePatch: {
        moderationReasonCodes: ['suspicious.dynamic_code_execution'],
      },
      override: {
        verdict: 'caution',
        note: 'security tool false positive',
        reviewerUserId: userId('users:reviewer'),
        updatedAt: now,
      },
      now,
    })

    expect(patch).toMatchObject({
      moderationStatus: 'active',
      moderationReason: 'manual.override.caution',
      moderationVerdict: 'caution',
      moderationFlags: undefined,
      moderationSummary: 'Manual override (caution): security tool false positive',
      moderationEvaluatedAt: now,
      isSuspicious: false,
      updatedAt: now,
    })
    expect(patch.moderationReasonCodes).toEqual(['suspicious.dynamic_code_execution'])
  })
})
