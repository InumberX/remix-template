import { describe, it } from 'node:test'
import * as assert from 'remix/assert'
import { on } from 'remix/ui'
import { renderToString } from 'remix/ui/server'

import { PrimitiveButton } from './primitive-button.tsx'

describe('PrimitiveButton', () => {
  it('renders an enhanced anchor for an internal url', async () => {
    const html = await renderToString(<PrimitiveButton url="/books">Books</PrimitiveButton>)

    assert.match(html, /<a[^>]*href="\/books"/)
    assert.doesNotMatch(html, /data-rmx-document/)
  })

  it('opts out of client navigation for external and hash urls', async () => {
    const external = await renderToString(
      <PrimitiveButton url="https://remix.run">Remix</PrimitiveButton>
    )
    const hash = await renderToString(<PrimitiveButton url="#top">Top</PrimitiveButton>)

    assert.match(external, /data-rmx-document/)
    assert.match(hash, /data-rmx-document/)
  })

  it('renders a button when buttonType is given', async () => {
    const html = await renderToString(
      <PrimitiveButton buttonType="submit" name="intent" value="save">
        Save
      </PrimitiveButton>
    )

    assert.match(html, /<button[^>]*type="submit"/)
    assert.match(html, /name="intent"/)
  })

  it('falls back to an inert tag with no url and no buttonType', async () => {
    const span = await renderToString(<PrimitiveButton>Label</PrimitiveButton>)
    const div = await renderToString(<PrimitiveButton nonClickableTag="div">Label</PrimitiveButton>)

    assert.match(span, /<span/)
    assert.match(div, /<div/)
  })

  it('marks a disabled button as disabled', async () => {
    const html = await renderToString(
      <PrimitiveButton buttonType="button" isDisabled>
        Nope
      </PrimitiveButton>
    )

    assert.match(html, /disabled/)
  })

  it('accepts composed behavior through mix', async () => {
    const html = await renderToString(
      <PrimitiveButton buttonType="button" mix={on('click', () => {})}>
        Click
      </PrimitiveButton>
    )

    assert.match(html, /<button/)
  })
})
