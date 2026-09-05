import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import { CACHE_BUSTER } from './env.ts'

describe('CACHE_BUSTER', () => {
  it('reads the build id from the environment', () => {
    assert.equal(CACHE_BUSTER, `ver=${process.env.BUILD_ID ?? 'dev'}`)
  })

  it('keeps the pattern in the type when interpolated', () => {
    const url = `/static/img/img.jpg?${CACHE_BUSTER}` as const
    assert.equal(url, `/static/img/img.jpg?ver=${process.env.BUILD_ID ?? 'dev'}`)
  })
})
