# 悪い例

レビューで指摘する書き方と、その直し方。根拠は `rules/style/*.md` と `CLAUDE.md`。

## 1. ❌ ディスクリプタを export する

```ts
// Bad — 呼び出し側が上書きできない
export const newCard = css({ display: 'grid', gap: getClampPx(16, 24) })

// Good — プレーンなレシピ
export const newCard: StyleRecipe = { display: 'grid', gap: getClampPx(16, 24) }
```

## 2. ❌ ディスクリプタを重ねて上書きする

```tsx
// Bad — 優先順位は最初に描画された順で決まり、配列の順ではない
<div mix={[css(styles.newCard), css(styleOverrides)]} />

// Good — 1 回の css(...) にスプレッドする
<div mix={css({ ...styles.newCard, ...styleOverrides })} />
```

## 3. ❌ BEM 本来の区切り、`style` 接頭辞、要素の要素

```ts
// Bad
export const styleNewCard: StyleRecipe = {}
export const newCard__title: StyleRecipe = {}      // 要素に __
export const newCard_title_icon: StyleRecipe = {}  // 要素の要素

// Good
export const newCard: StyleRecipe = {}
export const newCard_title: StyleRecipe = {}
export const newCardTitle_icon: StyleRecipe = {}   // 別のブロック
export const newCard__active: StyleRecipe = {}     // 修飾子は __
```

## 4. ❌ メディアクエリの直書きと `- 1` の上限

```ts
// Bad
{ '@media (max-width: 767px)': { display: 'none' } }

// Good
{ [MEDIA_QUERY_REVERSE.MD]: { display: 'none' } }
```

## 5. ❌ 物理プロパティと、トークンがある値のリテラル

```ts
// Bad
{ width: '100%', marginLeft: 'auto', paddingLeft: '20px', color: '#000', fontSize: '14px' }

// Good
{
  inlineSize: '100%',
  marginInlineStart: 'auto',
  paddingInline: 'var(--layout-inner-padding-xs)',
  color: 'var(--color-util-black)',
  fontSize: getFontSize(14),
}
```

## 6. ❌ `primitives/` にデザインを持たせる

```ts
// Bad — app/ui/primitives/…/primitive-x.styles.ts
export const primitiveX: StyleRecipe = { color: 'var(--color-util-black)', ...fontSmall }

// Good — 色と文字は inherit。デザインは <category>/ の部品が styleOverrides で渡す
export const primitiveX: StyleRecipe = { color: 'inherit', font: 'inherit' }
```

## 7. ❌ クリックを props で受ける、boolean に `is*` がない

```tsx
// Bad
<NewButton disabled onClick={save}>保存</NewButton>

// Good
<NewButton isDisabled buttonType="button" mix={on('click', save)}>保存</NewButton>
```

## 8. ❌ 内部リンクを文字列で書く、末尾にスラッシュ

```tsx
// Bad
<PrimitiveButton url={`/articles/${id}/`}>記事</PrimitiveButton>

// Good
<PrimitiveButton url={routes.articles.show.href({ id })}>記事</PrimitiveButton>
```

## 9. ❌ エラーを HTML で組み立てる、ステータスを数値で書く

```tsx
// Bad
return context.render(<p>見つかりません</p>, { status: 404 })

// Good — 見た目は errorPage() が付ける
return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
```

## 10. ❌ ハイドレートする部品が `public/` の外の値を import する

```tsx
// Bad — app/actions/foo-page/public/components/foo-toggle/foo-toggle.tsx
import { BaseButton } from '../../../../../ui/buttons/base-button/base-button.tsx'  // public/ の外

// Good — 使う部品を public/ に移してから import する（初めて必要になったときに移す）
// （仮の例。テンプレートの BaseButton は今は ui/buttons/base-button/ にあり、public/ にはない）
import { BaseButton } from '../../../../../ui/buttons/public/base-button/base-button.tsx'
```

- `app/assets.ts` の `allowFiles` は `app/**/public/**` だけなので、外のモジュールはブラウザ向けにコンパイルされない。型だけの import は対象外

## 11. ❌ nonce のない script、CSP への `'unsafe-inline'`

```tsx
// Bad
<script type="module" src="/assets/app/foo.ts"></script>
'style-src': ["'self'", "'unsafe-inline'"],

// Good
<script type="module" src={href} nonce={useCspNonce(handle)}></script>
'style-src': ["'self'", `'nonce-${NONCE_PLACEHOLDER}'`],
```

## 12. ❌ nonce を正規表現に埋め込んで比べる

```ts
// Bad — base64 の nonce は + や / を含み、正規表現として解釈されて時々落ちる
assert.match(html, new RegExp(`nonce="${nonce}"`))

// Good
assert.ok(html.includes(`nonce="${nonce}"`))
```
