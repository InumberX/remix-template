import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { css } from 'remix/ui'
import { renderToString } from 'remix/ui/server'

import { changeColorHexToRgb, getRgba, getTextGradation } from './color.ts'
import { getLineClamp } from './mixins.ts'

describe('color helpers', () => {
  it('converts hex to an rgb triple, with or without # and in shorthand', () => {
    assert.equal(changeColorHexToRgb('#2f3a3a'), '47, 58, 58')
    assert.equal(changeColorHexToRgb('2f3a3a'), '47, 58, 58')
    assert.equal(changeColorHexToRgb('#abc'), '170, 187, 204')
    assert.equal(changeColorHexToRgb('abc'), '170, 187, 204')
  })

  it('composes with getRgba', () => {
    assert.equal(getRgba(changeColorHexToRgb('#2f3a3a'), 0.6), 'rgba(47, 58, 58, 0.6)')
  })

  it('emits the vendor-prefixed properties text gradients need', async () => {
    const html = await renderToString(
      <span mix={css(getTextGradation('linear-gradient(90deg, #f00, #00f)'))}>x</span>
    )

    assert.match(html, /-webkit-background-clip: text/)
    assert.match(html, /-webkit-text-fill-color: transparent/)
  })
})

describe('getLineClamp', () => {
  it('needs -webkit-box display to work at all', async () => {
    const html = await renderToString(<span mix={css(getLineClamp(3))}>x</span>)

    assert.match(html, /display: -webkit-box/)
    assert.match(html, /-webkit-line-clamp: 3/)
    assert.match(html, /overflow: hidden/)
  })
})
