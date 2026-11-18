import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { SITE_URL } from '../env.ts'
import { absoluteUrl } from './meta.tsx'

describe('absoluteUrl', () => {
  it('resolves like an href', () => {
    assert.equal(absoluteUrl('https://cdn.example/a.webp'), 'https://cdn.example/a.webp')
    assert.equal(absoluteUrl('/a'), `${SITE_URL}/a`)
    assert.equal(absoluteUrl('a'), `${SITE_URL}/a`)
    assert.equal(
      absoluteUrl('//cdn.example/a.webp'),
      `${new URL(SITE_URL).protocol}//cdn.example/a.webp`
    )
  })

  it('turns anything but a web address into the site root', () => {
    // Not a web address: the site's root rather than a `javascript:` og:image.
    assert.equal(absoluteUrl('javascript:alert(1)'), `${SITE_URL}/`)
    assert.equal(absoluteUrl('data:image/png;base64,AA'), `${SITE_URL}/`)
    // Unparseable: the site's root too, rather than throwing mid-render.
    assert.equal(absoluteUrl('http://exa mple/x'), `${SITE_URL}/`)
    assert.equal(absoluteUrl('http://[broken'), `${SITE_URL}/`)
  })
})
