# Remix template

[Remix 3](https://remix.run)（`3.0.0-rc.1`）のスターターテンプレートです。サーバーファーストで、Web 標準の `Request` / `Response` の上に構築されています。

- **ビルドステップがありません。** TypeScript は `remix/node-tsx` の import フックで実行時に読み込まれ、ブラウザ向けモジュールはアセットサーバーがオンデマンドでコンパイルします。
- **URL の単一の情報源。** `app/routes.ts` がルート契約を持ち、`href()` の引数と `context.params` はパターンのリテラル型から導出されます。
- **UI は 2 階層。** 素の骨組み（`primitives/`）とデザイン判断を載せた層（`<category>/`）を分離しています。
- **`/dev/ui` にコンポーネントギャラリー。** 実際の `context.render()` パイプラインを通すので、見本が本番の描画と乖離しません。

## 必要環境

Node.js **24.3.0 以上**（`.node-version` は 24.11.1 を固定）。`remix/node-tsx` が `module.registerHooks` を使うためで、これより古いランタイムでは `remix` CLI も含めて全てのコマンドが失敗します。

## セットアップ

```sh
npm i
npm run dev
```

http://localhost:44100 が開発サーバー、http://localhost:44100/dev/ui がコンポーネントギャラリーです。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | ウォッチモードのサーバー（:44100） |
| `npm run hmr` | HMR プロキシ（:44100 → 子サーバー :44102、HMR イベント :44101） |
| `npm run start` | 本番サーバー |
| `npm test` | `node --test` によるテスト実行 |
| `npm run typecheck` | `tsc -b`（インクリメンタル） |
| `npm run routes` | ルート契約を表形式で確認 |
| `npm run doctor` | プロジェクトのヘルスチェック |
| `npm run lint` / `lint-fix` | oxlint（警告もエラー扱い） |
| `npm run format` / `format-fix` | oxfmt |
| `npm run stylelint` / `stylelint-fix` | stylelint（`public/` の CSS） |
| `npm run pre-commit` | typecheck → format-fix → lint-fix → stylelint-fix |

単一ファイル・単一テストの実行:

```sh
NODE_ENV=test node --import remix/node-tsx --test app/actions/controller.test.tsx
NODE_ENV=test node --import remix/node-tsx --test --test-name-pattern 'renders home'
```

## ディレクトリ構成

```
app/
  routes.ts                     ルート契約（URL の単一の情報源）
  router.ts                     ミドルウェアスタックと router.map
  assets.ts                     ブラウザ向けアセットパイプライン
  env.ts                        process.env を読む唯一のモジュール
  actions/
    controller.tsx              ルートマップ直下のリーフ（assets / home / devUi）
    document.tsx                共通のドキュメントシェル
    meta.tsx                    サイト全体のメタデータ既定値
    home-page/                  ページ（ルートキー + `-page`）
      home-page.tsx
      components/<name>/        そのページ専用のコンポーネント
    articles/                   ルートエリア（controller を持つ）
      controller.tsx
      index-page/ show-page/
    dev-ui-page/                コンポーネントギャラリー
      public/components/        ハイドレートされるコンポーネント
    public/entry.ts             ブラウザランタイムのエントリ
  ui/                           複数ルートで使う共有 UI
    styles/public/              デザイントークン、ブレークポイント、クエリ定数
    types/                      型のみの DOM 語彙
    primitives/<category>/<component>/
    <category>/<component>/
public/
  favicon.svg
  static/css/app.css            カスケードレイヤーの順序・リセット・トークン
  static/img/
server.ts                       node:http + createRequestListener
hmr.ts                          HMR プロキシと子プロセスの管理
```

ディレクトリ名の規則は 2 つだけです。**素のディレクトリはルートエリア**（`controller.tsx` を持ち、`router.map` の行が必要）、**`-page` 付きはページ**。ページ配下の部品は `components/<name>/<name>.tsx` に置きます。

コンポーネントのディレクトリは 4 分割します（`index.tsx` は使いません）。

| ファイル | 内容 |
| --- | --- |
| `<name>.tsx` | コンポーネント本体 |
| `<name>.types.ts` | 型のみ（ブラウザ出力から消えるため `public/` の外に置ける） |
| `<name>.styles.ts` | スタイルレシピ / `css(...)` の値 |
| `<name>.test.tsx` | テスト |

## ルーティング

`npm run routes` の出力:

| Route | Method | Path | Owner |
| --- | --- | --- | --- |
| `assets` | GET | `/assets/*path` | `actions/controller.tsx` |
| `home` | GET | `/` | `actions/controller.tsx` |
| `articles.index` | GET | `/articles` | `actions/articles/controller.tsx` |
| `articles.show` | GET | `/articles/:id` | `actions/articles/controller.tsx` |
| `devUi` | GET | `/dev/ui` | `actions/controller.tsx` |

- **メソッドを明示する。** ベタ書きの文字列（`home: '/'`）は `Route<"ANY", "/">` になり POST や DELETE にも応答します。`get` / `post` / `form` / `resources` を使ってください。
- **パターンはリテラルのまま置く。** 間接参照で `string` に広がると `href()` と `context.params` の型チェックが静かに失われます。
- **ネストしたルートマップには専用の `router.map` 行を書く。** `router.map` は直下のリーフしか結線しません。
- 内部 URL は文字列リテラルではなく `routes.<name>.href(...)` で組み立てます。

`/dev/ui` は型を安定させるため全ビルドで宣言され、アクション側が本番のみ 404 を返します。

## ページとメタデータ

Remix 3 に meta API はないため、`app/actions/meta.tsx` の `renderMeta()` がタグを返し、`Document` が `<head>` に配置します。ページは差分だけを渡します。

```tsx
<Document url={url} meta={{ title: '記事一覧', description: '…', ogType: 'article' }} />
```

`url` はコンポーネントがリクエストを持たないため、アクション側の `context.url` から渡します。`<title>` は `Document` が `resolveTitle()` から描画するので `renderMeta()` には含まれません（2 つ出力されるため）。本番以外は常に `noindex, nofollow`、本番でも `NO_INDEX=true` で強制できます。ページタイトルは各ページモジュールの `PAGE_TITLE` 定数です。

## UI 層

```
app/ui/
  styles/public/                トークン・ブレークポイント・クエリ定数（実行時の値）
  types/                        型のみの DOM 語彙
  primitives/<category>/<component>/   素の骨組み
  <category>/<component>/              デザインを載せたコンポーネント
```

`primitives/` は要素の選択・アクセシビリティ属性・ユーザーエージェントのリセットだけを持ち、**デザイン判断を一切持ちません**（`color` と `font` は `inherit`）。そのため実行時の依存が自分の `.styles.ts` だけになり、ディレクトリごと `public/` に移してハイドレートできます。`<category>/` 側がトーン・余白・角丸・モーションを決めて下へ渡します。`buttons/base-button/` と `primitives/buttons/primitive-button/` が対の実例です。

`layouts/` は構造だけのラッパーです（`layout-wrapper` = フルハイトの列、`layout-main` = `@container` を開く、`layout-page-wrapper` = ヘッダー分のオフセット、`layout-inner` = 中央寄せ・幅上限）。実寸は `app.css` の `--layout-*` カスタムプロパティ側にあり、`util` レイヤーから再調整できます。

**ルートが所有する UI はここに置きません。** それは `app/actions/<route-key>/` の担当です。`app/ui/` は複数のルートエリアが必要とする UI だけを置きます。

## スタイリング

スタイルと振る舞いは `mix` プロパティでホスト要素に付きます。

```tsx
<div mix={css({ color: 'red' })} />
<button mix={on('click', handler)} />
<div mix={[styleA, styleB]} />
```

**上書きはレシピを 1 回の `css(...)` にスプレッドして行い、ディスクリプタを重ねません。** `css(...)` はそれぞれ独自の `@layer rmx.<hash>` を作り、その順序は配列内の位置ではなく**最初に描画された順**で決まります。そのためコンポーネントは `styleOverrides` レシピを受け取り、リセット + 状態 + 呼び出し側を 1 つの `css(...)` にまとめます。`mix` は振る舞い（`on('click', …)`）と、リセットが触れないプロパティのスタイルに使います。

レシピは `<name>.styles.ts` に置き、名前空間インポートで読みます。

```ts
import * as styles from './layout-inner.styles.ts'

css(styles.layoutInner)                             // 単体
css({ ...styles.layoutInner, ...styleOverrides })   // マージ
```

命名は BEM 風（`block`、`block_element`、`block__modifier`）です。ただし区切り文字は BEM とは逆で、`_` が要素、`__` が修飾子です（after_works の `Block__element` / `Block--modifier` とも逆になります）。これらは JavaScript の識別子であり `-` を含められないため `--` が使えず、残る2つを短い順に割り当てた結果です。名前空間側が `styles` を担うので `style` 接頭辞は付けません。呼び出し側のプロパティ名が `styles` ではなく `styleOverrides` なのも同じ理由です。

メディアクエリとコンテナクエリは**関数ではなく定数**です。`css(...)` の計算キーはリテラル型を要求し、`string` を返すヘルパーだと `CSSProps` が継承する数値インデックスシグネチャと衝突します。

```ts
css({ color: 'red', [MEDIA_QUERY.MD]: { color: 'blue' } })
```

## グローバル CSS

`public/static/css/app.css` がカスケードレイヤーの順序を持ちます。

```css
@layer reset, lib, base, rmx, util;
```

弱い順に、`reset`（UA 正規化）、`lib`（サードパーティ、`@import url('…') layer(lib)` で取り込む）、`base`（アプリ既定値と `:root` トークン）、`rmx`（`css(...)` が生成する全て）、`util`（ユーティリティ、コンポーネントより強い唯一のレイヤー）。

このファイルが守るべき点が 3 つあります。

- **使う全レイヤーをこの宣言に書く。** 未宣言のレイヤーは初出位置＝最後尾になり、他の全てより強くなります。
- **カスタムプロパティは必ずレイヤー内に置く。** レイヤー外の宣言は暗黙の最終レイヤーに属し、`util` からも上書きできません。
- **そのまま配信する必要があるためルートの `public/` に置く。** アセットサーバーの CSS コンパイラは `@layer` 文を書き換えますが、`staticFiles` は書き換えません。また `<link>` は `css(...)` より先に解釈される必要があり、Remix は `<style data-rmx-style>` を `<head>` 末尾に足すため、`document.tsx` に書いた `<link>` が必ず先行します。

PostCSS は入っていません。`@mixin` / `@custom-media` / `@media (--name)` は素通りして無効になるため、`clamp()` や `rem` はそのまま書きます。

## ハイドレーション

サーバー描画のレスポンスを先に作り、ブラウザが本当に必要な箇所だけを島としてハイドレートします。

```tsx
export const ExampleCopyButton = clientEntry(
  import.meta.url,
  function ExampleCopyButton(handle: Handle<ExampleCopyButtonProps>) { /* … */ }
)
```

- 渡すのは**名前付き関数**です。アロー関数だと `clientEntry` がエクスポート名を取得できず、描画時に例外になります（typecheck・lint・テストは通ってしまいます）。
- **ハイドレートするコンポーネントは実行時の依存を全て `public/` の内側に置きます。** `app/assets.ts` が許可するのは `app/routes.ts` と `app/**/public/**` だけで、値のインポートが外に出るとブラウザビルドが `IMPORT_NOT_ALLOWED` で失敗します。型のみのインポートは消えるため対象外です。
- props はシリアライズ可能で、`SerializableProps` を継承している必要があります。

実例は `app/actions/dev-ui-page/public/components/example-copy-button/` です。`Example` 接頭辞は「テンプレートの参考資料であり、そのまま使うものではない」ことを示します。

## 環境変数

`app/env.ts` が `process.env` を読む唯一のモジュールで、他は解決済みの定数をインポートします。

| 変数 | 既定値 | 用途 |
| --- | --- | --- |
| `NODE_ENV` | `development` | `IS_PRODUCTION` などの導出元 |
| `PORT` | `44100` | 公開ポート |
| `HMR_PORT` | `PORT + 1` | ブラウザ HMR のイベントチャンネル |
| `APP_PORT` | `HMR_PORT + 1` | HMR プロキシ配下の子サーバー |
| `BUILD_ID` | `dev` | アセットのフィンガープリントと `CACHE_BUSTER` |
| `SITE_URL` | `http://localhost:${PORT}` | canonical / og:url の絶対 URL |
| `NO_INDEX` | `false` | `true` で `noindex, nofollow` を強制 |

## キャッシュ

ビルドがないため、キャッシュ識別子は 2 層とも実行時に決まります。どちらも本番のみ有効で、開発中は常に `no-cache` です。

- **アセットサーバー（`/assets/*`）** — `fingerprint: { buildId: BUILD_ID }` がコンテンツハッシュを URL に挿入し（`entry.@r2O3W4.ts`）、`public, max-age=31536000, immutable` で配信します。ハッシュはファイル内容と build id から作られるため、デプロイで URL が変わるのは実際に変更されたモジュールだけです。ファイルが変化しない前提なので `watch: false` が必須で、開発では無効にしています。
- **ルートの `public/`（`staticFiles`）** — 本番は `public, max-age=86400`。URL が固定なので `immutable` にはしません。アプリから参照するファイルは `?${CACHE_BUSTER}` を付けてデプロイごとに更新し、`favicon.svg` のように直接取得されるものは ETag の再検証に任せます。

**全インスタンスで `BUILD_ID` を共有してください。** 値が違うと同じ内容に別の URL が割り当てられ、キャッシュが分断されます。既定値が `dev` なので、CI からコミット SHA を渡さないとデプロイしても何も無効化されません。

## テスト

テストは対象の隣に置きます（`app/actions/controller.test.tsx`、`app/ui/**/<name>.test.tsx`）。`app/assets.ts` の `denyFiles: ['app/**/*.test.*']` があるため、隣接していてもブラウザから到達することはありません。

**`remix/test` ではなく `node:test` で書いてください。** `test` スクリプトは素の `node --test` で、`remix/test` で登録したスイートは読み込まれるだけでアサーションが実行されず、それでも成功として報告されます（`remix test` ランナーには playwright が必要です）。`describe` / `it` は `node:test` から、アサーションは `import * as assert from 'remix/assert'` の名前空間インポートで取り込みます。

ルートの挙動は `router.fetch(new Request(...))` の `Response` に対して、コンポーネントは `renderToString` で検証します。

なお `test` スクリプトが glob を明示しているのは、Node の既定の探索パターンが `.tsx` を含まないためです。省略すると `app/env.test.ts` しか実行されず、それでも緑になります。

## Lint / Format

`oxlint`（`.oxlintrc.json`）と `oxfmt`（`.oxfmtrc.json`）を使用します。セミコロンなし、シングルクォート、`printWidth` 100、`trailingComma: "es5"`、インポートのグループ化とソート。

`react` プラグインはランタイム非依存の JSX ルール（`jsx-key` など）のために有効ですが、React のランタイムを前提とするルールは**意図的に無効**にしています。`no-unknown-property`（`mix` プロパティとケバブケースの SVG 属性を誤検知）、`display-name`（Remix のコンポーネントは `function Name(handle) { return () => jsx }` の形なので無名コンポーネントと誤読される）、そして React 専用 API を対象とするフック系ルールです。

### Stylelint

`stylelint`（`.stylelintrc.json`）の対象は `public/static/css/**/*.css` だけです。コンポーネントのスタイルは `.styles.ts` のプレーンなオブジェクトで、stylelint は CSS テキストしか解析できないため対象外になります。

`stylelint-config-standard` をベースに、手書きのリセット CSS と衝突する箇所だけを調整しています。

- `property-no-vendor-prefix` — **無効**。`-webkit-text-size-adjust` などはリセットとして意図的に残しています。`--fix` に剥がされると Safari で挙動が変わります。
- `value-keyword-case` — `currentColor` と `--font-family-*` の値を除外。フォント名の大文字を潰さないためです。
- `font-family-no-duplicate-names` — `monospace` を除外。`monospace, monospace` は normalize 由来の意図的な重複です。
- `no-descending-specificity` — 無効、`order/properties-alphabetical-order` — 有効。いずれも after_works と同じ設定です。

`stylelint --fix` は書き出し時に `<style` という並びを `\3c style` にエスケープします。`app.css` 冒頭のコメントはこれを踏まないよう書いてあるので、その形を保ってください。

## CI

GitHub Actions は `.github/workflows/` にあります。after_works / sugidama と同じ構成です。

| ワークフロー | トリガー | 内容 |
| --- | --- | --- |
| `push.yml` | 全ブランチへの push | `setup` →（`lint` / `test`）→ `routes` |
| `automation-pr-label.yml` | PR 作成時 | ブランチの prefix から `enhancement` / `bug` を付与 |
| `automation-release-pr.yml` | `develop` への push | `develop` → `main` のリリース PR を作成 |
| `automation-release-note.yml` | `main` への push | `v{YYYY.MM.DD}-{連番}` のタグとリリースノートを生成 |

`lint` ジョブは `format` → `stylelint` → `lint` → `typecheck` の順に走ります。

Remix 3 にビルドステップは無いため、他リポジトリの `build` ジョブの位置には `routes` を置いています。`app/routes.ts` と各コントローラーの対応が壊れていればここで落ちます。

Node のバージョンは `actions/setup-node` の `node-version-file` で `.node-version` から読みます。

デプロイ先が未定のため `deploy.yml` は入れていません。自動ラベル付与には `enhancement` / `bug` / `release` の各ラベルがリポジトリ側に必要です。

## コーディング規約

- TypeScript のインポートは実際の拡張子を書きます（`./routes.ts`、`./home-page.tsx`）。
- **関数は `const` アロー、コンポーネントは `function` 宣言。** `<X />` として使うものがコンポーネントで、`RemixNode` を返すだけのヘルパー（`renderMeta()`）は `const` のままです。巻き上げによってファイル冒頭に主役を置けること、`clientEntry` が関数名を読むことが理由です。
- **型は `type`。ただし `declare module` の中は `interface`。** モジュール拡張は宣言マージを必要とし、それを持つのは `interface` だけです（`app/router.ts` の `AppContext` を `type` にすると全コントローラーから `context.render` が消えます）。
- **Remix のコンポーネントは React ではありません。** `function Name(handle: Handle<Props>) { return () => <jsx/> }` の形で書き、props は `handle.props` から読み、状態はセットアップスコープの変数に持ち、再描画は `handle.update()` を明示的に呼びます。フックも暗黙の再描画もありません。

## 拡張するときは

狭い所有者から先に埋めます。ルートが所有する UI は `app/actions/<route-key>/`、複数ルートで使う UI は `app/ui/`、ライフサイクル関連は `app/middleware/`、スキーマと永続化は `app/data/`、`app/utils/` は最後の手段です。`app/lib/`、`app/components/`、`app/controllers/` は作りません。

`app/` 直下は、より狭い所有者が持てないアプリ全体の単一契約（`routes.ts`、`router.ts`、`assets.ts`、`env.ts`）のためのものです。このうちブラウザに許可されているのは `app/routes.ts` だけで、他はサーバー専用です。

`app/actions/home-page/` と `app/actions/document.tsx` は差し替え前提のスターターです。

## ドキュメント

- `AGENTS.md` — スターター構成とルート所有権の規約。
- `CLAUDE.md` — 実測から得た規約と落とし穴の記録。
- `.agents/skills/remix/SKILL.md` — Remix 3 のビルドガイド。トピック別の詳細は `.agents/skills/remix/references/<topic>.md`。
- `remix/<subpath>` の API ドキュメントは `node_modules/remix/src/<dir>/README.md`（ディレクトリ名は必ずしもサブパス名と一致しません。例: `remix/router` → `src/fetch-router/README.md`）。
