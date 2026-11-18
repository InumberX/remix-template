import * as assert from 'remix/assert'
import { css, Frame, type Handle } from 'remix/component'
import { createRouter } from 'remix/router'
import { describe, it } from 'remix/test'

import { Document } from '../actions/document.tsx'
import { useCspNonce } from '../ui/contexts/csp-nonce/csp-nonce.tsx'
import { buildCspDirective, renderWithCsp } from './csp.tsx'

// Prints the nonce it receives through component context, so a test can compare
// it with the one in the header.
function NonceProbe(handle: Handle<object>) {
  const nonce = useCspNonce(handle)
  return () => <p id="nonce">{nonce ?? 'none'}</p>
}

const createTestRouter = () => {
  const router = createRouter({ middleware: [renderWithCsp()] })
  router.get('/', (context) => context.render(<NonceProbe />))
  router.get('/text', () => new Response('plain'))
  router.get('/own-policy', (context) =>
    context.render(<NonceProbe />, { headers: { 'Content-Security-Policy': "default-src 'self'" } })
  )
  return router
}

const nonceFromHeader = (response: Response): string | undefined =>
  response.headers.get('Content-Security-Policy')?.match(/'nonce-([^']+)'/)?.[1]

// A base64 nonce can hold `+` and `/`, so tests compare text, not a pattern.
const hasNonce = (tag: string, nonce: string): boolean => tag.includes(` nonce="${nonce}"`)

describe('buildCspDirective', () => {
  const policy = buildCspDirective('test-nonce')
  const directive = (name: string) => policy.match(new RegExp(`(?:^|; )${name} ([^;]*)`))?.[1]

  it('allows scripts from this origin and the nonce only', () => {
    assert.equal(directive('script-src'), "'self' 'nonce-test-nonce' 'strict-dynamic'")
  })

  it('allows styles by the nonce instead of unsafe-inline', () => {
    assert.equal(directive('style-src'), "'self' 'nonce-test-nonce'")
  })

  it('substitutes only the nonce into an otherwise fixed policy', () => {
    assert.equal(
      buildCspDirective('a').replaceAll("'nonce-a'", ''),
      buildCspDirective('b').replaceAll("'nonce-b'", '')
    )
  })

  it('leaves no placeholder behind', () => {
    assert.doesNotMatch(policy, /\{\{nonce\}\}/)
  })

  it('forbids plugins, framing and foreign form targets', () => {
    assert.equal(directive('object-src'), "'none'")
    assert.equal(directive('frame-ancestors'), "'none'")
    assert.equal(directive('form-action'), "'self'")
    assert.equal(directive('base-uri'), "'self'")
  })
})

describe('renderWithCsp()', () => {
  it('passes the header nonce down to components through context', async () => {
    const response = await createTestRouter().fetch(new Request('http://localhost/'))
    const nonce = nonceFromHeader(response)

    assert.ok(nonce, 'the header carries a nonce')
    assert.ok((await response.text()).includes(`<p id="nonce">${nonce}</p>`))
  })

  it('leaves a non-HTML response to the fallback policy', async () => {
    const response = await createTestRouter().fetch(new Request('http://localhost/text'))
    assert.equal(response.headers.get('Content-Security-Policy'), null)
  })

  it('keeps a policy the route set itself', async () => {
    const response = await createTestRouter().fetch(new Request('http://localhost/own-policy'))
    assert.equal(response.headers.get('Content-Security-Policy'), "default-src 'self'")
  })

  it('treats the HTML media type case-insensitively, as render() does', async () => {
    const router = createRouter({ middleware: [renderWithCsp()] })
    router.get(
      '/',
      () => new Response('<p>x</p>', { headers: { 'Content-Type': 'TEXT/HTML; charset=UTF-8' } })
    )
    const response = await router.fetch(new Request('http://localhost/'))
    assert.match(response.headers.get('Content-Security-Policy') ?? '', /'nonce-/)
  })

  it('puts the header nonce on the style tags css() emits', async () => {
    const router = createRouter({ middleware: [renderWithCsp()] })
    router.get('/', (context) => context.render(<p mix={css({ color: 'red' })}>x</p>))
    const response = await router.fetch(new Request('http://localhost/'))
    const nonce = nonceFromHeader(response)
    const styleTags = [...(await response.text()).matchAll(/<style[^>]*>/g)].map(([tag]) => tag)

    assert.ok(nonce)
    assert.ok(styleTags.length > 0, 'the page has a style tag')
    for (const tag of styleTags) assert.ok(hasNonce(tag, nonce), tag)
  })

  it('puts the header nonce on the import map, preloads and script Document writes', async () => {
    const router = createRouter({ middleware: [renderWithCsp()] })
    router.get('/', (context) => context.render(<Document url={context.url} />))
    const response = await router.fetch(new Request('http://localhost/'))
    const nonce = nonceFromHeader(response)
    const html = await response.text()
    const tags = [
      ...html.matchAll(/<script[^>]*>/g),
      ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*>/g),
    ].map(([tag]) => tag)

    assert.ok(nonce)
    assert.ok(
      tags.some((tag) => tag.includes('type="importmap"')),
      'an import map'
    )
    assert.ok(
      tags.some((tag) => tag.includes('type="module"')),
      'the script entry'
    )
    for (const tag of tags) assert.ok(hasNonce(tag, nonce), tag)
  })

  it('renders a server-side Frame under the document nonce', async () => {
    const router = createRouter({ middleware: [renderWithCsp()] })
    router.get('/', (context) => context.render(<Frame src="/frame" />))
    router.get('/frame', (context) =>
      context.render(
        <div mix={css({ color: 'blue' })}>
          <NonceProbe />
        </div>
      )
    )
    const response = await router.fetch(new Request('http://localhost/'))
    const nonce = nonceFromHeader(response)
    const html = await response.text()

    assert.ok(nonce)
    assert.ok(html.includes(`<p id="nonce">${nonce}</p>`), 'the frame reads the same nonce')
    for (const [tag] of html.matchAll(/<style[^>]*>/g)) assert.ok(hasNonce(tag, nonce), tag)
  })

  it('uses a fresh nonce for every request', async () => {
    const router = createTestRouter()
    const first = await router.fetch(new Request('http://localhost/'))
    const second = await router.fetch(new Request('http://localhost/'))

    assert.notEqual(nonceFromHeader(first), nonceFromHeader(second))
  })
})
