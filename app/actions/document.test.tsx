import * as assert from 'remix/assert'
import { renderToString } from 'remix/component/server'
import { describe, it } from 'remix/test'

import { Document } from './document.tsx'

describe('Document', () => {
  it('renders the page head slot after the import map and the entry script', async () => {
    const html = await renderToString(
      <Document
        url={new URL('http://localhost/')}
        head={<script type="module" src="/page-module.js"></script>}
      />
    )

    const importMap = html.search(/<script[^>]* type="importmap"/)
    const entry = html.search(/<script type="module" src="\/assets\/app\/actions\/public\/entry\./)
    const pageModule = html.indexOf('src="/page-module.js"')

    assert.ok(importMap !== -1 && entry !== -1 && pageModule !== -1, 'all three are rendered')
    // A browser without multiple-import-map support has to see the map before
    // any module script, including one a page adds through `head`.
    assert.ok(importMap < pageModule && entry < pageModule, 'head slot comes last')
  })
})
