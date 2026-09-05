import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { css } from 'remix/ui'
import { renderToString } from 'remix/ui/server'

import { BREAKPOINTS } from './breakpoints.ts'
import {
  CONTAINER_QUERY,
  CONTAINER_QUERY_BETWEEN,
  MEDIA_QUERY,
  MEDIA_QUERY_BETWEEN,
  MEDIA_QUERY_REVERSE,
} from './media-query.ts'

describe('media and container queries', () => {
  it('derives its numbers from BREAKPOINTS', () => {
    assert.equal(MEDIA_QUERY.MD, `@media screen and (width >= ${BREAKPOINTS.md}px), print`)
    assert.equal(MEDIA_QUERY_REVERSE.MD, `@media screen and (width < ${BREAKPOINTS.md}px)`)
    assert.equal(CONTAINER_QUERY.SM, `@container (width >= ${BREAKPOINTS.sm}px)`)
  })

  it('leaves feature queries independent of the scale', () => {
    assert.equal(MEDIA_QUERY.HOVER, '@media (any-hover: hover)')
    assert.equal(MEDIA_QUERY.REDUCED_MOTION, '@media (prefers-reduced-motion: reduce)')
  })

  it('bounds between ranges so neighbours cannot overlap', () => {
    assert.equal(
      MEDIA_QUERY_BETWEEN.SM_LG,
      '@media screen and (width >= 576px) and (width < 992px)'
    )
    assert.equal(CONTAINER_QUERY_BETWEEN.SM_LG, '@container (width >= 576px) and (width < 992px)')
    // SM_MD stops exactly where MD starts, with no width in between — the whole
    // point of an exclusive upper bound rather than `<= (breakpoint - 1)`.
    assert.equal(MEDIA_QUERY_BETWEEN.SM_MD.includes(`width < ${BREAKPOINTS.md}px`), true)
    assert.equal(MEDIA_QUERY.MD.includes(`width >= ${BREAKPOINTS.md}px`), true)
  })

  it('drops straight into a css(...) computed key', async () => {
    // This is the whole reason these are constants and not functions: a helper
    // returning `string` fails to typecheck in this position.
    const style = css({
      color: 'red',
      [MEDIA_QUERY.MD]: { color: 'blue' },
      [MEDIA_QUERY_REVERSE.SM]: { color: 'purple' },
      [CONTAINER_QUERY.SM]: { color: 'green' },
    })
    const html = await renderToString(<span mix={style}>x</span>)

    assert.match(html, /@media screen and \(width >= 768px\), print \{/)
    assert.match(html, /@media screen and \(width < 576px\) \{/)
    assert.match(html, /@container \(width >= 576px\) \{/)
    assert.match(html, /@layer rmx\./)
  })
})
