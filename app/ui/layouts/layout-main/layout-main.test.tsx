import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { LayoutMain } from './layout-main.tsx'

describe('LayoutMain', () => {
  it('renders the requested tag and opens a query container', async () => {
    assert.match(await renderToString(<LayoutMain>x</LayoutMain>), /<main/)
    assert.match(await renderToString(<LayoutMain tag="section">x</LayoutMain>), /<section/)
    assert.match(await renderToString(<LayoutMain>x</LayoutMain>), /container-name: layout-main/)
  })
})
