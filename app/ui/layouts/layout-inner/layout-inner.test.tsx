import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { LayoutInner } from './layout-inner.tsx'

describe('LayoutInner', () => {
  it('caps width per size and opts out with full', async () => {
    const medium = await renderToString(<LayoutInner>x</LayoutInner>)
    const full = await renderToString(<LayoutInner size="full">x</LayoutInner>)

    assert.match(medium, /--layout-inner-width-medium/)
    assert.match(full, /max-inline-size: none/)
    // Responsive padding comes from the shared query constants.
    assert.match(medium, /@media screen and \(width >= 768px\), print/)
  })

  it('lets a caller override through styleOverrides', async () => {
    const html = await renderToString(
      <LayoutInner styleOverrides={{ maxInlineSize: '42px' }}>x</LayoutInner>
    )

    // Merged into one class, so spread order decides — not cascade order.
    assert.equal([...html.matchAll(/class="([^"]+)"/g)].length, 1)
    assert.match(html, /max-inline-size: 42px/)
  })
})
