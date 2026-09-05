import { describe, it } from 'node:test'
import * as assert from 'remix/assert'

import { router } from '../../router.ts'
import { routes } from '../../routes.ts'

const fetchPath = (path: string) => router.fetch(new Request(`http://localhost${path}`))

describe('articles controller', () => {
  it('renders the index', async () => {
    const response = await fetchPath(routes.articles.index.href())

    assert.equal(response.status, 200)
  })

  it('renders an article that resolves', async () => {
    const response = await fetchPath(routes.articles.show.href({ id: '1' }))

    assert.equal(response.status, 200)
    assert.match(await response.text(), /記事 1/)
  })

  it('answers 404 for an id that does not resolve', async () => {
    // ルートパラメータは任意のユーザー入力。200 を返すと、存在しない記事の
    // ページが canonical 付きで無限に生成されてしまう。
    const response = await fetchPath(routes.articles.show.href({ id: 'does-not-exist' }))

    assert.equal(response.status, 404)
  })
})
