import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { CACHE_BUSTER, HAS_BUILD_ID } from './env.ts'

describe('CACHE_BUSTER', () => {
  it('is a bare query string, so a caller supplies the `?` itself', () => {
    // `/static/img/img.jpg?${CACHE_BUSTER}` が正しい 1 クエリになること。
    // 自前の `?` や区切り文字を含んでいると二重になる。
    assert.match(CACHE_BUSTER, /^ver=[^?&#\s]+$/)
  })

  // env.ts はモジュール読み込み時に process.env を確定させるため、テスト内で
  // 環境変数を差し替えて読み直すことはできません。既定値だけを固定します。
  it(
    'falls back to `dev` so a deploy that forgets BUILD_ID invalidates nothing',
    { skip: HAS_BUILD_ID ? 'BUILD_ID is set in this environment' : false },
    () => {
      assert.equal(CACHE_BUSTER, 'ver=dev')
    }
  )
})
