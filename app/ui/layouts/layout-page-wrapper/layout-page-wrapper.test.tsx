import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { LayoutPageWrapper } from './layout-page-wrapper.tsx'

describe('LayoutPageWrapper', () => {
  it('drops the header offset on request', async () => {
    const normal = await renderToString(<LayoutPageWrapper>x</LayoutPageWrapper>)
    const noTop = await renderToString(<LayoutPageWrapper isTopNoSpace>x</LayoutPageWrapper>)

    assert.match(normal, /--layout-header-height-small/)
    assert.doesNotMatch(noTop, /--layout-header-height-small/)
    assert.match(noTop, /padding-block-start: 0/)
  })
})
