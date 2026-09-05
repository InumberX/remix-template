import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import { BREAKPOINTS, BREAKPOINTS_MAX, type BreakpointKey } from './breakpoints.ts'

const KEYS: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

describe('breakpoints', () => {
  it('keeps BREAKPOINTS_MAX exactly one below BREAKPOINTS', () => {
    // The two objects are written out separately because TypeScript cannot
    // subtract in a type. This is what stops them drifting apart.
    for (const key of KEYS) {
      assert.equal(BREAKPOINTS_MAX[key], BREAKPOINTS[key] - 1, key)
    }
  })

  it('ascends, so reverse and between ranges cannot overlap', () => {
    const values = KEYS.map((key) => BREAKPOINTS[key])
    assert.deepEqual(
      values,
      [...values].sort((a, b) => a - b)
    )
  })
})
