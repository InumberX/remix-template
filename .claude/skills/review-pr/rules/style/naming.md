# 命名規約（TypeScript / Remix 3）

`app/`・`server.ts`・`hmr.ts` のコードに適用する命名ルール。oxlint・oxfmt で機械的に検出できないものを中心に挙げる。根拠は `CLAUDE.md` の該当する節。

## コンポーネント

- **コンポーネント名は PascalCase、ディレクトリとファイルは kebab-case**（`BaseButton` → `base-button/base-button.tsx`）。エクスポート名とディレクトリ名は同じ語にする
- **コンポーネントは `function` 宣言、それ以外の関数は `const` のアロー関数**（`CLAUDE.md`「Code Conventions」）。`<X />` として使うものだけがコンポーネントで、`RemixNode` を返すだけのヘルパー（`renderMeta()`）は `const`
- **`clientEntry(...)` には名前付き関数を渡す**。`clientEntry` はエクスポート名を関数名から読む。アロー関数だと描画時に例外になるが、typecheck・lint・テストは通ってしまう
- **層ごとの接頭辞**
  - `primitives/` 配下は `Primitive*`（`PrimitiveButton`）
  - `layouts/` 配下は `Layout*`（`LayoutInner`、`LayoutMain`）
  - その他の `ui/` は機能を表す名前（`BaseButton`）
- **参考資料は `Example*`**（`ExampleCopyButton`）。表示する側（`/dev/ui`）が所有し、`app/ui/` には置かない
- **同じファイル内の、export しない補助の部品は短い名前でよい**。export するなら、他の部品と区別できる名前にする

## export

- **名前付き export で統一する**。例外は `controller.tsx` の `export default createController(...)` だけ
- **`clientEntry` の部品は `export const Name = clientEntry(import.meta.url, function Name(…) {…})`**。変数名と関数名を揃える

## Props 型

- **`<ComponentName>Props` で `<name>.types.ts` に置き、`export type`**。コンポーネントは `export type * from './<name>.types.ts'` で再 export する（`app/ui/layouts/layout-inner/layout-inner.tsx`）
- **ファイル内でしか使わない小さな型は `type Props` でよい**（export しない）
- **`type` を使い、`interface` は `declare module` の中だけ**。モジュール拡張には宣言のマージが必要で、`interface` にしかない（`app/router.ts` の `RouterTypes`）

## Props の命名

- **camelCase**
- **boolean は `is*`、何かを持つかどうかは `has*`**（`isDisabled`）。HTML 属性に渡すものでも props 名は `is*` にし、内部で `disabled={isDisabled}` と展開する
- **ARIA 属性をそのまま渡す props は `aria*`**（`ariaLabel`、`ariaControls`、`ariaSelected`）。属性との対応が名前でわかるようにする
- **呼び出し側からのスタイルの上書きは `styleOverrides`**。`styles` は各ファイルの名前空間 import が使っているので、props に同じ名前を付けない
- **要素のタグ名を受け取る props は `*Tag`**（`nonClickableTag`）
- **DOM のイベントは `mix` で付ける**。ボタンのクリックなどは呼び出し側が `mix={on('click', …)}` を渡し、`onClick` のような props を足さない。コンポーネントは `mix` の中身を見られないので、要素の種類（`<a>`・`<button>`）は `url`・`buttonType`・`nonClickableTag` のどれを渡すかで決める（`CLAUDE.md`「What separates the two tiers」）
- **`clientEntry` の props は直列化できる値に限る**。関数を渡すと `clientEntry(...)` の呼び出しが型エラーになる

## スタイルのレシピ

- **BEM 風。ただし区切りは `_` が要素、`__` が修飾子**（`mainVisualTitle_image`、`primitiveButton__disabled`）。BEM 本来とは逆で、JavaScript の識別子に `-` を使えないため
- **`style` 接頭辞を付けない**。名前空間 import（`styles.layoutInner`）が担う
- **バリアントの対応表は `<block><Variants>` の複数形**（`layoutInnerSizes`）。各値は名前を持つ修飾子の定数を指す
- 詳細は `rules/style/css.md`

## ファイル / ディレクトリ命名

| 種別 | 形式 | 例 |
|---|---|---|
| コンポーネントのディレクトリ | kebab-case | `base-button/`、`layout-inner/` |
| コンポーネント本体 | `<name>.tsx`（`index.tsx` は使わない） | `base-button/base-button.tsx` |
| 型 | `<name>.types.ts`（`.tsx` にしない。実行時のものを入れない） | `base-button.types.ts` |
| スタイルのレシピ | `<name>.styles.ts` | `base-button.styles.ts` |
| テスト | `<name>.test.tsx` / `<name>.test.ts` | `base-button.test.tsx` |
| UI のカテゴリ | 複数形の kebab-case | `buttons/`、`layouts/` |
| ルートエリア | ルートマップのキー（URL のセグメントではない） | `articles/` |
| ページ | ルートキー + `-page` | `index-page/`、`show-page/`、`home-page/` |
| ミドルウェア・utils | kebab-case の 1 ファイル | `trailing-slash.ts`、`http-status.ts` |

`*.server.ts` / `*.client.ts` のような環境の接尾辞は使わない。ブラウザに出せるかどうかは `public/` の内側か外側かで決まる（`rules/style/structure.md`）。

## 変数 / 定数

- **変数・関数は camelCase**、boolean の変数も `is*` / `has*`
- **モジュールの定数は SCREAMING_SNAKE_CASE**（`SITE_URL`、`MESSAGES`、`PAGE_TITLE`、`MEDIA_QUERY`）
- **HTTP のステータスは `HTTP_STATUS.<NAME>`**（`app/utils/http-status.ts`）。数値をそのまま書かない。新しいステータスが要るときはそこに名前を足す。テストは数値のままでよい（クライアントが実際に受け取るステータスを確かめるため。`CLAUDE.md`「Code Conventions」）
- **ページのタイトルはページのモジュールの `PAGE_TITLE`**（`CLAUDE.md`「Page metadata」）

`/dev/ui` のギャラリー（`app/actions/dev-ui-page/`）は見本で、この規約に合わない名前がある。ここは対象外。

## アンチパターン（指摘対象）

- ❌ コンポーネントのディレクトリやファイルが PascalCase（`BaseButton/index.tsx`）
- ❌ `index.tsx`、または `style.css.ts`（Vanilla Extract の名残）
- ❌ コンポーネントをアロー関数で定義、または `clientEntry` にアロー関数を渡す
- ❌ ヘルパー関数を `function` 宣言で書く
- ❌ `declare module` の外で `interface`
- ❌ boolean の props に `is*` / `has*` がない（`disabled`）。ARIA 属性の `aria*` は除く
- ❌ props に `styles` や `className` を足して上書きさせる（`styleOverrides` にする）
- ❌ 要素の DOM イベントを `onClick` などの props で受ける（呼び出し側が `mix={on(...)}` を渡す）
- ❌ レシピの区切りが BEM 本来のもの（要素に `__`）、または `style` 接頭辞
- ❌ ルートエリアのディレクトリを URL のセグメントで命名する、ページのディレクトリに `-page` がない
- ❌ `*.server.ts` / `*.client.ts` の接尾辞で実行環境を分けようとする
- ❌ `controller.tsx` 以外で `export default`
- ❌ テスト以外で HTTP のステータスを数値のまま書く（`{ status: 404 }` → `{ status: HTTP_STATUS.NOT_FOUND }`）
