import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import { router } from '../router.ts'
import { routes } from '../routes.ts'

describe('root controller', () => {
  it('renders the home page', async () => {
    const response = await router.fetch(new Request(`http://localhost${routes.home.href()}`))

    assert.equal(response.status, 200)
  })

  it('serves the dev gallery outside production', async () => {
    const response = await router.fetch(new Request(`http://localhost${routes.devUi.href()}`))

    assert.equal(response.status, 200)
    assert.match(await response.text(), /UI ギャラリー/)
  })

  it('answers 404 for an unmapped path', async () => {
    const response = await router.fetch(new Request('http://localhost/nope'))

    assert.equal(response.status, 404)
  })
})
