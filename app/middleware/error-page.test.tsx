import * as assert from 'remix/assert'
import { createRouter } from 'remix/router'
import { get, route } from 'remix/routes'
import { describe, it } from 'remix/test'

import { router } from '../router.ts'
import { renderWithCsp } from './csp.tsx'
import { errorPage } from './error-page.tsx'

const fetchPath = (path: string, init?: RequestInit) =>
  router.fetch(new Request(`http://localhost${path}`, init))

const titleOf = (html: string) => html.match(/<title>(.*?)<\/title>/)?.[1] ?? ''

/** A router whose one route answers with whatever the test hands it. */
const routerAnswering = (answer: () => Response) => {
  const testRouter = createRouter({ middleware: [renderWithCsp(), errorPage()] })
  testRouter.map(route({ page: get('/page') }), { actions: { page: answer } })
  return testRouter
}

describe('errorPage()', () => {
  it('renders one page for every way a 404 is reached', async () => {
    // The router's own (nothing matches), and the articles route's own.
    for (const path of ['/a/b', '/articles/abc']) {
      const response = await fetchPath(path)
      const html = await response.text()

      assert.equal(response.status, 404, path)
      assert.match(response.headers.get('Content-Type') ?? '', /^text\/html/, path)
      assert.match(titleOf(html), /^ページが見つかりません \| /, path)
      assert.match(html, /<meta name="robots" content="noindex, nofollow"/, path)
      // The page's own nonce policy, not the plain-text fallback.
      assert.match(response.headers.get('Content-Security-Policy') ?? '', /nonce-/, path)
    }
  })

  it('keeps the status and the Allow header of a 405', async () => {
    const response = await fetchPath('/articles', {
      method: 'POST',
      headers: { 'Sec-Fetch-Site': 'same-origin' },
    })
    const html = await response.text()

    assert.equal(response.status, 405)
    assert.ok(response.headers.get('Allow'))
    assert.match(response.headers.get('Content-Type') ?? '', /^text\/html/)
    // The page exists; it only refused the method.
    assert.doesNotMatch(titleOf(html), /見つかりません/)
    assert.match(html, /このページを表示できませんでした。/)
  })

  it('says to try again later only for a server error', async () => {
    const response = await routerAnswering(() => new Response(null, { status: 503 })).fetch(
      new Request('http://localhost/page')
    )
    const html = await response.text()

    assert.equal(response.status, 503)
    assert.match(titleOf(html), /^エラーが発生しました/)
    assert.match(html, /時間をおいて、もう一度お試しください。/)
  })

  it('leaves a response with a type of its own alone', async () => {
    const response = await routerAnswering(() =>
      Response.json({ error: 'gone' }, { status: 404 })
    ).fetch(new Request('http://localhost/page'))

    assert.equal(response.status, 404)
    assert.match(response.headers.get('Content-Type') ?? '', /^application\/json/)
  })

  it('keeps every Set-Cookie of the plain response', async () => {
    const response = await routerAnswering(() => {
      const headers = new Headers()
      headers.append('Set-Cookie', 'a=1')
      headers.append('Set-Cookie', 'b=2')
      return new Response(null, { status: 404, headers })
    }).fetch(new Request('http://localhost/page'))

    assert.match(response.headers.get('Content-Type') ?? '', /^text\/html/)
    assert.deepEqual(response.headers.getSetCookie(), ['a=1', 'b=2'])
  })

  it('names no canonical URL for an error', async () => {
    const html = await (await fetchPath('/articles/abc?page=0')).text()

    assert.doesNotMatch(html, /rel="canonical"/)
    assert.doesNotMatch(html, /og:url/)
  })
})

describe('errorPage() and files', () => {
  it('leaves a missing file a plain 404, unless a browser asks for a page', async () => {
    const asset = await fetchPath('/assets/app/gone.ts', { headers: { Accept: '*/*' } })
    const image = await fetchPath('/static/img/gone.avif', { headers: { Accept: 'image/*' } })
    const page = await fetchPath('/old.html', { headers: { Accept: 'text/html' } })

    for (const response of [asset, image]) {
      assert.equal(response.status, 404)
      assert.doesNotMatch(response.headers.get('Content-Type') ?? '', /html/)
    }
    assert.equal(page.status, 404)
    assert.match(page.headers.get('Content-Type') ?? '', /^text\/html/)
  })

  it('says the answer for a file varies by Accept, and keeps any other dotted path a page', async () => {
    const asset = await fetchPath('/assets/app/gone.ts', { headers: { Accept: '*/*' } })
    const page = await fetchPath('/assets/app/gone.ts', { headers: { Accept: 'text/html' } })
    const dotted = await fetchPath('/a/b.23', { headers: { Accept: '*/*' } })

    assert.equal(asset.headers.get('Vary'), 'Accept')
    assert.match(page.headers.get('Vary') ?? '', /Accept/)
    assert.match(dotted.headers.get('Content-Type') ?? '', /^text\/html/)
  })
})
