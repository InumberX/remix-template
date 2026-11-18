import * as assert from 'remix/assert'
import type { Handle } from 'remix/component'
import { renderToString } from 'remix/component/server'
import { describe, it } from 'remix/test'

import { CspNonceProvider, useCspNonce } from './csp-nonce.tsx'

function NonceProbe(handle: Handle<object>) {
  const nonce = useCspNonce(handle)
  return () => <p>{nonce ?? 'none'}</p>
}

describe('useCspNonce', () => {
  it('reads the nonce a CspNonceProvider above it set', async () => {
    const html = await renderToString(
      <CspNonceProvider nonce="abc">
        <div>
          <NonceProbe />
        </div>
      </CspNonceProvider>
    )
    assert.match(html, /<p>abc<\/p>/)
  })

  it('is undefined outside a provider', async () => {
    assert.match(await renderToString(<NonceProbe />), /<p>none<\/p>/)
  })
})
