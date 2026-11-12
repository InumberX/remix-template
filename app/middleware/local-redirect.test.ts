import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { localRedirect } from './local-redirect.ts'

const url = new URL('https://app.example/articles?page=2')

describe('localRedirect()', () => {
  it('redirects to a root-relative path on this site, query kept', () => {
    const response = localRedirect(url, '/articles?page=2', 308)
    assert.equal(response.status, 308)
    assert.equal(response.headers.get('Location'), '/articles?page=2')
  })

  it('sends anything that would leave the site to /', () => {
    for (const path of [
      '//evil.example/',
      '//evil.example',
      'https://evil.example/x',
      '/\\evil.example',
    ]) {
      assert.equal(localRedirect(url, path, 308).headers.get('Location'), '/', path)
    }
  })
})
