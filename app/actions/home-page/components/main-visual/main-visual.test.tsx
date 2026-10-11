import * as assert from 'remix/assert'
import { renderToString } from 'remix/component/server'
import { describe, it } from 'remix/test'

import { CACHE_BUSTER } from '../../../../env.ts'
import { MainVisual } from './main-visual.tsx'

describe('MainVisual', () => {
  it('busts the cache on an image staticFiles serves without Cache-Control', async () => {
    const html = await renderToString(<MainVisual />)

    assert.match(html, new RegExp(`/static/img/img-sample-001\\.avif\\?${CACHE_BUSTER}`))
    assert.match(html, /alt="Remix 3 スターターテンプレート"/)
    // <h1> は phrasing content のみ。<figure> を挟むと無効な HTML になる。
    assert.doesNotMatch(html, /<figure/)
  })
})
