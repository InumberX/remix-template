# CSS 規約（Remix の `css(...)` とスタイルのレシピ）

コンポーネントのスタイルは `<name>.styles.ts` のプレーンなレシピ（`StyleRecipe`）で書き、`mix={css(...)}` で要素に付ける。グローバルな CSS は `public/static/css/app.css` だけ。根拠は `CLAUDE.md` の「Rules that came from measurement, not taste」と「Global CSS」。

## レシピを export する

`.styles.ts` は `css(...)` のディスクリプタではなく、プレーンなオブジェクトを export する。ディスクリプタはスプレッドできないので、export すると呼び出し側から上書きの手段を奪う。`app/actions/` の中の `.styles.ts` も同じ。

```ts
// Good — app/ui/layouts/layout-inner/layout-inner.styles.ts
import type { StyleRecipe } from '../../styles/public/mixins.ts'

export const layoutInner: StyleRecipe = {
  marginInline: 'auto',
  paddingInline: 'var(--layout-inner-padding-xs)',
  inlineSize: '100%',
  [MEDIA_QUERY.SM]: { paddingInline: 'var(--layout-inner-padding-sm)' },
}
```

## 名前空間で import し、1 回の `css(...)` にまとめる

```ts
import * as styles from './layout-inner.styles.ts'

css(styles.layoutInner)                                             // 1 つだけなら直接渡す
css({ ...styles.layoutInner, ...styles.layoutInnerSizes[size], ...styleOverrides })  // 上書きはスプレッド
```

- **上書きのためにディスクリプタを重ねない**（`mix={[css(base), css(override)]}`）。`css(...)` はそれぞれ `@layer rmx.<hash>` を作り、その順序は配列の位置ではなく**最初に描画された順**で決まる。別の場所で先に描画されると優先順位が逆転する
- **`mix` の配列は振る舞い（`on('click', …)`）と、リセットが触れないプロパティのスタイルだけ**
- **呼び出し側の上書きは `styleOverrides` で受け取り、スプレッドの後ろ近くに置く**。ただし、呼び出し側に消されては困るもの（`PrimitiveButton` の無効化の見た目）はその後ろに置く
- **スプレッドは浅い**。`[MEDIA_QUERY.SM]` や `'&::before'` を持つレシピを後ろに置くと、前のブロックは**マージではなく置き換え**になる。残したい宣言はすべて書き直す
- **1 つしか使わない短いスタイルはインラインでよい**。再利用するか、コンポーネントが読みにくくなったら `.styles.ts` に移す

## 命名（BEM 風）

- `block`、`block_element`（要素は `_` 1 つ）、`block__modifier`（修飾子は `__` 2 つ）。BEM 本来とは逆
- `style` 接頭辞を付けない（`styles.styleLayoutInner` は重複）
- **要素の要素は作らない**。入れ子のまとまりには別のブロック名を付ける（`mainVisual_titleImage` ではなく `mainVisualTitle_image`）。1 つの `.styles.ts` に複数のブロックがあってよい（`main-visual.styles.ts`）
- **バリアントは名前を持つ修飾子の定数を作り、対応表（`layoutInnerSizes`）はそれを指す**

## メディアクエリ・コンテナクエリ

- **`MEDIA_QUERY.*`・`MEDIA_QUERY_REVERSE.*`・`MEDIA_QUERY_BETWEEN.*`・`CONTAINER_QUERY*.*` の定数を計算キーに使う**（`app/ui/styles/public/media-query.ts`）。`@media (min-width: 768px)` を直書きしない
- **クエリを返す関数を作らない**。`string` を返すと計算キーがリテラル型でなくなり、`CSSProps` と型が衝突する
- **ホバーは `[MEDIA_QUERY.HOVER]: { '&:hover': {…} }`**。タッチ端末でホバーが残らないようにする
- **JavaScript なしで見せるものは `MEDIA_QUERY.NOT_SCRIPTING`**
- **上限は排他的**（`width < 768px`）。`max-width: 767px` のような `- 1` の値を書かない
- `CONTAINER_QUERY.*` は名前のないコンテナを指し、最も近い `container-type` の祖先に効く

## 論理プロパティ

新しく書くレシピは、物理プロパティではなく論理プロパティを使う（`layout-inner.styles.ts`、`main-visual.styles.ts`）。

| 物理 | 論理 |
|---|---|
| `width` / `height` | `inlineSize` / `blockSize` |
| `paddingTop` / `paddingBottom` | `paddingBlock` / `paddingBlockStart` / `paddingBlockEnd` |
| `paddingLeft` / `paddingRight` | `paddingInline` / `paddingInlineStart` / `paddingInlineEnd` |
| `marginTop` / `marginLeft` など | `marginBlock*` / `marginInline*` |
| `top` / `left` など | `insetBlockStart` / `insetInlineStart` など |

例外: `transform`、`backgroundPosition` など物理座標が前提のもの。`textAlign` は `start` / `end`。

## トークンとミックスイン

- **`app.css` にカスタムプロパティがある値は `var()` で参照する**（`var(--layout-inner-padding-sm)`、`var(--font-weight-bold)`、`var(--color-util-black)`）。プロジェクトで色のトークンを足したら、それを使う
- **文字の大きさと太さは `app/ui/styles/public/tokens.ts` のプリセットをスプレッドする**（`...fontSmall`）。プリセットにない固定の大きさは `getFontSize(px)` で rem にする
- **ミックスイン**（`app/ui/styles/public/mixins.ts`・`color.ts`）

| 関数 | 用途 |
|---|---|
| `getClampPx(min, max)` | 流体の px 値（`gap`、`paddingInline`） |
| `getClampRem(min, max)` | 流体の rem 値（`fontSize`） |
| `getFontSize(px)` | 固定の px を rem に |
| `getLineClamp(n)` | n 行で切る |
| `getTransition([{ property }])` | トランジション |
| `getTextGradation(color)` | 文字にグラデーション |
| `getRgba(rgb, alpha)` | `R, G, B` の 3 つの値からアルファ付きの色 |

- **単位のないプロパティは出力された CSS で確かめる**。Remix は単位なしだと知らないプロパティの数値に `px` を付ける（3.1.0 までは `WebkitLineClamp: 3` が `3px` になり無効だった。3.2.0 は `3` のまま出す）。確かめていないプロパティには文字列を渡す（`CLAUDE.md`「Check the emitted CSS for a unitless property」）
- `/dev/ui` のギャラリー（`app/actions/dev-ui-page/`）は見本で、色をリテラルで持つ。ここは対象外

## `primitives/` のスタイル

`primitives/` は UA のリセットと状態（無効化など）だけを持ち、`color` と `font` は `inherit`。色・文字の大きさ・余白・角丸・モーションは `<category>/` 側が `styleOverrides` で渡す。

## グローバル CSS（`public/static/css/app.css`）

- **レイヤーの順序は `@layer reset, lib, base, rmx, util;` の 1 行で宣言する**。新しいレイヤーもここに書く。書かないと最後尾、つまり最も強いレイヤーになる
- **カスタムプロパティはレイヤーの中に置く**。外に置くと `util` からも上書きできない
- **アプリ全体の上書きは `util` レイヤー**。`!important` は `[hidden]` のように理由があるものだけ
- **ress（`reset` レイヤー）は手を入れずに置く**。直したいものは `base` で上書きする（`[hidden]`、`:focus-visible`）
- **PostCSS の構文（`@mixin`、`@custom-media`、`@media (--name)`）は使えない**。そのまま配信され、黙って無効になる
- **ヘッダーのコメントに `<style` の文字列を書かない**。`stylelint --fix` が `\3c style` に書き換える
- 第三者の CSS は `@import url('…') layer(lib)` で取り込む

## アンチパターン（指摘対象）

- ❌ `.styles.ts` が `css(...)` のディスクリプタを export する
- ❌ `mix={[css(base), css(override)]}` で上書きする
- ❌ `styleOverrides` を受け取らず、`style` 属性で上書きさせる（CSP が `style` 属性を止める）
- ❌ 名前空間 import をせず、レシピを個別に名前で import する
- ❌ 要素に `__`、修飾子に `_`、`style` 接頭辞、要素の要素（`block_element_child`）
- ❌ メディアクエリの直書き、クエリを返す関数、`- 1` の上限
- ❌ `[MEDIA_QUERY.HOVER]` の外の `'&:hover'`
- ❌ 新しいレシピの物理プロパティ（`width`、`marginLeft`、`top`）
- ❌ `app.css` にカスタムプロパティがある値のリテラル、文字サイズを px や数値で直書き（`getFontSize` を通す。`/dev/ui` の見本を除く）
- ❌ `primitives/` が色やトークンを持つ
- ❌ `app.css` で未宣言のレイヤー、レイヤーの外のカスタムプロパティ、PostCSS の構文、ress の書き換え
