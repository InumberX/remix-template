import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { css } from 'remix/ui'
import { renderToString } from 'remix/ui/server'

import { getClampPx, getClampRem, getLineClamp, getTransition } from './mixins.ts'

describe('getTransition', () => {
  it('defaults the speed and omits an unset delay', () => {
    assert.equal(getTransition([{ property: 'color' }]), '0.3s color')
    assert.equal(getTransition([{ property: 'color', speed: 0.2, delay: 0.1 }]), '0.2s 0.1s color')
  })

  it('joins several properties into one declaration', () => {
    assert.equal(
      getTransition([{ property: 'color' }, { property: 'background-color' }]),
      '0.3s color, 0.3s background-color'
    )
  })
})

describe('getClampRem', () => {
  // 62.5% ルート基準で、BREAKPOINTS.xs（360px）から BREAKPOINTS.xxl（1400px）
  // までの間を補間する。丸めが 6 箇所あり、目視では追えない。
  it('interpolates between the two ends of the breakpoint scale', () => {
    assert.equal(getClampRem(14, 16), 'clamp(0.875rem, 0.832rem + 0.19vi, 1rem)')
    assert.equal(getClampRem(12, 14), 'clamp(0.75rem, 0.707rem + 0.19vi, 0.875rem)')
  })

  it('collapses to a constant when both ends are equal', () => {
    assert.equal(getClampRem(16, 16), 'clamp(1rem, 1rem + 0vi, 1rem)')
  })
})

describe('getClampPx', () => {
  it('interpolates in px rather than rem', () => {
    assert.equal(getClampPx(40, 80), 'clamp(40px, 26px + 3.85vi, 80px)')
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

// public/static/css/app.css は PostCSS を通らないため、これらの値は手書きです。
// CSS と TS は別言語で互いに導出できず、片方だけ変えても他は何も落ちません。
// ここで突き合わせておかないと、コメントが指す関数と実際の値が黙って食い違います。
describe('app.css の手書き clamp 値', () => {
  const appCss = readFileSync(
    new URL('../../../../public/static/css/app.css', import.meta.url),
    'utf8'
  )

  it('matches getClampRem(14, 16), as its own comment claims', () => {
    assert.equal(appCss.includes(`font-size: ${getClampRem(14, 16)};`), true)
  })
})
