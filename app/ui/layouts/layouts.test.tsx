import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { LayoutInner } from './layout-inner/layout-inner.tsx'
import { LayoutMain } from './layout-main/layout-main.tsx'
import { LayoutPageWrapper } from './layout-page-wrapper/layout-page-wrapper.tsx'
import { LayoutWrapper } from './layout-wrapper/layout-wrapper.tsx'

describe('layouts', () => {
  it('LayoutWrapper is a full-height column', async () => {
    const html = await renderToString(<LayoutWrapper>x</LayoutWrapper>)

    assert.match(html, /flex-direction: column/)
    assert.match(html, /min-block-size: 100svb/)
  })

  it('LayoutMain renders the requested tag and opens a query container', async () => {
    assert.match(await renderToString(<LayoutMain>x</LayoutMain>), /<main/)
    assert.match(await renderToString(<LayoutMain tag="section">x</LayoutMain>), /<section/)
    assert.match(await renderToString(<LayoutMain>x</LayoutMain>), /container-name: layout-main/)
  })

  it('LayoutInner caps width per size and opts out with full', async () => {
    const medium = await renderToString(<LayoutInner>x</LayoutInner>)
    const full = await renderToString(<LayoutInner size="full">x</LayoutInner>)

    assert.match(medium, /--layout-inner-width-medium/)
    assert.match(full, /max-inline-size: none/)
    // Responsive padding comes from the shared query constants.
    assert.match(medium, /@media screen and \(width >= 768px\), print/)
  })

  it('LayoutPageWrapper drops the header offset on request', async () => {
    const normal = await renderToString(<LayoutPageWrapper>x</LayoutPageWrapper>)
    const noTop = await renderToString(<LayoutPageWrapper isTopNoSpace>x</LayoutPageWrapper>)

    assert.match(normal, /--layout-header-height-small/)
    assert.doesNotMatch(noTop, /--layout-header-height-small/)
    assert.match(noTop, /padding-block-start: 0/)
  })

  it('lets a caller override through styles', async () => {
    const html = await renderToString(
      <LayoutInner styleOverrides={{ maxInlineSize: '42px' }}>x</LayoutInner>
    )

    // Merged into one class, so spread order decides — not cascade order.
    assert.equal([...html.matchAll(/class="([^"]+)"/g)].length, 1)
    assert.match(html, /max-inline-size: 42px/)
  })
})
