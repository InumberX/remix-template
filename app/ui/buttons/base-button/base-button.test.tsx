import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { renderToString } from 'remix/ui/server'

import { PrimitiveButton } from '../../primitives/buttons/primitive-button/primitive-button.tsx'
import { BaseButton } from './base-button.tsx'

const classesOf = (html: string) => [...html.matchAll(/class="([^"]+)"/g)].map((m) => m[1])

describe('BaseButton over PrimitiveButton', () => {
  it('keeps the primitive element selection', async () => {
    assert.match(
      await renderToString(<BaseButton url="/books">Books</BaseButton>),
      /<a[^>]*href="\/books"/
    )
    assert.match(
      await renderToString(<BaseButton buttonType="submit">Save</BaseButton>),
      /<button[^>]*type="submit"/
    )
  })

  it('resolves the tier override inside a single class', async () => {
    const html = await renderToString(<BaseButton tone="primary">Go</BaseButton>)

    // One host class: reset and styled recipe were merged, not stacked.
    assert.equal(classesOf(html).length, 1)
    // The styled tier's color won over the reset's `color: inherit`. It is a
    // custom property so the `util` layer can still override it.
    assert.match(html, /color: var\(--color-util-white\)/)
    assert.doesNotMatch(html, /color: inherit/)
    // Reset declarations the styled tier did not touch survive.
    assert.match(html, /border: none/)
  })

  it('leaves the primitive unstyled on its own', async () => {
    const html = await renderToString(<PrimitiveButton buttonType="button">Bare</PrimitiveButton>)

    assert.match(html, /color: inherit/)
    assert.match(html, /font: inherit/)
    assert.doesNotMatch(html, /#/) // no design tokens reach this tier
  })
})
