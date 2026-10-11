import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { router } from '../router.ts'
import { routes } from '../routes.ts'

describe('root controller', () => {
  it('renders the home page', async () => {
    const response = await router.fetch(new Request(`http://localhost${routes.home.href()}`))

    assert.equal(response.status, 200)
  })

  it('puts the import map in <head> before the entry script and its preloads', async () => {
    const response = await router.fetch(new Request(`http://localhost${routes.home.href()}`))
    const html = await response.text()
    const head = html.slice(0, html.indexOf('</head>'))

    const importMap = head.search(/<script[^>]* type="importmap"/)
    const preload = head.indexOf('rel="modulepreload"')
    const entry = head.search(/<script type="module" src="\/assets\/app\/actions\/public\/entry\./)

    assert.ok(importMap !== -1, 'import map is rendered')
    assert.ok(preload !== -1, 'module preloads are rendered')
    assert.ok(entry !== -1, 'entry script is rendered')
    assert.ok(importMap < preload && importMap < entry, 'import map precedes every module')
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
