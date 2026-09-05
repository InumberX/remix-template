import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import * as styles from './example-copy-button.styles.ts'

const HOVER = '&:hover, &:focus-visible'

describe('exampleCopyButton__active', () => {
  it('repeats the hover block, which a shallow spread would otherwise leave winning', () => {
    // クリックすればポインタは必ずボタン上に残る。`__active` が top-level の
    // background だけを指定していると、base の `&:hover` がそれに勝ってしまい、
    // 「コピー完了」の反転が出るはずの唯一の経路で見えなくなる（しかも白文字が
    // ほぼ白の背景に乗る）。スプレッドは浅いので、ここは repeat が必要。
    const merged = { ...styles.exampleCopyButton, ...styles.exampleCopyButton__active }
    const hover = merged[HOVER] as Record<string, unknown>

    assert.equal(hover.background, merged.background)
    assert.equal(hover.color, merged.color)
  })

  it('inverts against the base rather than tinting it', () => {
    assert.equal(styles.exampleCopyButton.background, 'transparent')
    assert.equal(styles.exampleCopyButton__active.background, 'var(--color-util-black)')
    assert.equal(styles.exampleCopyButton__active.color, 'var(--color-util-white)')
  })
})
