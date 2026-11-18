import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { withHeaders } from './with-headers.ts'

describe('withHeaders', () => {
  it('sets headers on a mutable response in place', () => {
    const response = new Response('ok')
    assert.equal(withHeaders(response, { 'X-Test': '1' }), response)
    assert.equal(response.headers.get('X-Test'), '1')
  })

  it('copies a response whose headers are immutable', () => {
    const redirect = Response.redirect('http://localhost/elsewhere', 302)
    const result = withHeaders(redirect, { 'X-Test': '1' })

    assert.equal(result.headers.get('X-Test'), '1')
    assert.equal(result.status, 302)
    assert.equal(result.headers.get('Location'), 'http://localhost/elsewhere')
  })
})
