import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import { BREAKPOINTS, type BreakpointKey } from './breakpoints.ts'

const KEYS: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

describe('breakpoints', () => {
  it('ascends, so reverse and between ranges cannot overlap', () => {
    const values = KEYS.map((key) => BREAKPOINTS[key])
    assert.deepEqual(
      values,
      [...values].sort((a, b) => a - b)
    )
  })
})
