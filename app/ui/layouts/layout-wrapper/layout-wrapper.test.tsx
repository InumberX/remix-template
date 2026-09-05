import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { LayoutWrapper } from './layout-wrapper.tsx'

describe('LayoutWrapper', () => {
  it('is a full-height column', async () => {
    const html = await renderToString(<LayoutWrapper>x</LayoutWrapper>)

    assert.match(html, /flex-direction: column/)
    assert.match(html, /min-block-size: 100svb/)
  })
})
