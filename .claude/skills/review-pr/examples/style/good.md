# 良い例

レビューで「これでよい」と判断する書き方。どれもこのリポジトリの実際のコードから取っている。

## 1. ✅ レシピを名前空間で import し、1 回の `css(...)` にまとめる

```tsx
// app/ui/layouts/layout-inner/layout-inner.tsx（抜粋）
import * as styles from './layout-inner.styles.ts'

css({ ...styles.layoutInner, ...styles.layoutInnerSizes[size], ...styleOverrides })
```

- `.styles.ts` はプレーンなレシピを export し、呼び出し側が `styleOverrides` で上書きできる
- 修飾子は名前を持つ定数（`layoutInner__small` など）で、`layoutInnerSizes` はそれを指す

## 2. ✅ 入れ子のまとまりに別のブロック名を付ける

```ts
// app/actions/home-page/components/main-visual/main-visual.styles.ts
export const mainVisual: StyleRecipe = {}
export const mainVisual_container: StyleRecipe = {}
export const mainVisualTitle: StyleRecipe = {}
export const mainVisualTitle_image: StyleRecipe = { inlineSize: '100%', blockSize: 'auto' }
```

- 要素の要素（`mainVisual_titleImage`）を作らず、`mainVisualTitle` という別のブロックにする

## 3. ✅ 骨組みと見た目を分ける

```tsx
// app/ui/buttons/base-button/base-button.tsx（抜粋）
<PrimitiveButton
  {...forwarded}
  styleOverrides={{ ...styles.baseButton, ...styles.baseButtonTones[tone] }}
>
```

- `PrimitiveButton` は要素の選択・ARIA・リセットだけを持ち、色や余白は `BaseButton` が渡す
- 要素の種類は `url`・`buttonType`・`nonClickableTag` で決まり、クリックは呼び出し側の `mix={on('click', …)}`

## 4. ✅ ルートエリアに controller を持たせ、エラーは素の Response で返す

```tsx
// app/actions/articles/controller.tsx（抜粋）
export default createController(routes.articles, {
  actions: {
    show(context) {
      const { id } = context.params

      if (!ARTICLE_IDS.has(id)) {
        return new Response('Not Found', { status: HTTP_STATUS.NOT_FOUND })
      }

      return context.render(<ArticleShowPage id={id} url={context.url} />)
    },
  },
})

// app/router.ts
router.map(routes.articles, articlesController)
```

- 見た目は `errorPage()` が付ける。ステータスは `HTTP_STATUS` の名前で書く
- ページには `url={context.url}` を渡し、`Document` がメタデータを作る

## 5. ✅ クライアントエントリー

```tsx
// app/actions/dev-ui-page/public/components/example-copy-button/example-copy-button.tsx（抜粋）
export const ExampleCopyButton = clientEntry(
  import.meta.url,
  function ExampleCopyButton(handle: Handle<ExampleCopyButtonProps>) {
    // …
  }
)
```

- `public/` の内側に置き、実行時に使うものも `public/` の内側から import する
- 名前付き関数を渡し、変数名と揃える

## 6. ✅ 自分で書くタグに nonce を付ける

```tsx
// app/actions/document.tsx（抜粋）
const nonce = useCspNonce(handle)

<ImportMap value={scriptEntry.importMap} nonce={nonce} />
{scriptEntry.preloads.map((href) => (
  <link key={href} rel="modulepreload" href={href} nonce={nonce} />
))}
<script type="module" src={scriptEntry.href} nonce={nonce}></script>
```

- nonce は setup で読む。CSP は `'unsafe-inline'` なしで、nonce のないタグを止める

## 7. ✅ ルートの振る舞いは `router.fetch` で確かめる

```tsx
// app/middleware/error-page.test.tsx（抜粋）
const response = await router.fetch(new Request('http://localhost/articles/abc'))

assert.equal(response.status, 404)
assert.match(response.headers.get('Content-Type') ?? '', /^text\/html/)
```

- `remix/test` と `remix/assert` を使う。テストのステータスは数値のまま
