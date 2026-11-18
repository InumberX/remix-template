# ディレクトリ構造規約

ファイルの配置とルート・ハイドレーション・ミドルウェア・テストの約束ごと。新しいファイルが正しい場所にあるかをレビューする。根拠は `AGENTS.md` と `CLAUDE.md` の該当する節。

## トップレベル構成

```
app/
├── routes.ts          # ルート定義。app の他のモジュールを import しない
├── router.ts          # ミドルウェアの順序、AppContext、router.map
├── assets.ts          # ブラウザ向けアセットのパイプライン（allowFiles・allowPackages）
├── env.ts             # process.env を読む唯一のモジュール
├── actions/           # ルートが所有するもの（controller・ページ・その部品）
├── ui/                # 複数のルートエリアが使う UI
├── middleware/        # リクエストの流れに関わるもの（ヘッダー・CSP・エラーページ・末尾スラッシュ）
└── utils/             # どの層にも属さない純粋な関数（最後の手段）
public/                # staticFiles がそのまま配信する静的ファイル
server.ts              # node:http + createRequestListener(router.fetch)
hmr.ts                 # npm run hmr の HMR プロキシと子プロセス
```

- **`app/lib/`・`app/components/`・`app/controllers/` を作らない**（`AGENTS.md`「Build-Out Notes」）
- **`app/data/`・`test/` などは必要になったときに作る**。空のディレクトリを先に作らない
- **`app/` 直下はアプリに 1 つしかない契約だけ**（`routes.ts`・`router.ts`・`assets.ts`・`env.ts`）
- **`process.env` を読むのは `app/env.ts` だけ**。テストも含め、他は解決済みの定数を import する

## 置き場所の優先順位

複数の場所に置けるときは上から順に決める（`AGENTS.md`「Placement Precedence」）。

1. 1 つのルートのものは、そのルートの近く（`app/actions/<route-key>/…`）
2. 複数のルートエリアが使う UI は `app/ui/`
3. リクエストの流れに関わるもの（認証、セッション、アップロード）は `app/middleware/`
4. スキーマ・クエリ・永続化は `app/data/`
5. どれにも当てはまらない純粋な関数だけ `app/utils/<topic>.ts`。`app/actions/` や描画の API を import しない

**ルートが所有する UI を `app/ui/` に置かない。** 2 つ目のルートエリアが必要としたときに移す。

## ルートとアクション

- **`app/routes.ts` にルートを先に足す**。メソッドを明示し（`get`・`post`・`form`・`resources`）、素の文字列パターンは使わない。パターンはリテラルのまま書く
- **内部の URL はすべて `routes.<name>.href(...)` で組み立てる**。末尾に `/` を付けない（`trailingSlash()` が 308 で外す）
- **ルートマップ直下のリーフは `app/actions/controller.tsx`**。ネストしたマップは `app/actions/<route-key>/controller.tsx` と、`app/router.ts` の `router.map(routes.<key>, controller)` の行を持つ
- **ルートの葉を `app/router.ts` に直接登録しない**
- **controller のミドルウェアは他の controller に効かない**。要る controller それぞれに付ける

### `app/actions/` の中

```
app/actions/
  controller.tsx
  document.tsx / meta.tsx / error-page.tsx
  <route-key>/                 ルートエリア（controller.tsx を持つ）
    controller.tsx
    <key>-page/                ページ
      <key>-page.tsx
      <key>-page.styles.ts / .types.ts / .test.tsx
      components/<name>/<name>.tsx          ページの部品
      public/components/<name>/<name>.tsx   ハイドレートする部品
```

- **素のディレクトリはルートエリア、`-page` 付きはページ**。名前はルートマップのキーで、URL のセグメントではない
- **エラーは素のテキストか空の `Response` で返す**（`new Response(null, { status: HTTP_STATUS.NOT_FOUND })`）。見た目は `app/middleware/error-page.tsx` が付ける。HTML のエラーを自分で組み立てない
- **ページは `Document` に `url={context.url}` を渡す**。`renderMeta()` が canonical・og:url・`noindex` を作るのに要る

## `app/middleware/` の中

- **順序は `app/router.ts` のコメントのとおり**（`securityHeaders()` → `cop()` → `trailingSlash()` → `staticFiles()` → `renderWithCsp()` → `errorPage()`）。足すときは、どの応答に効く必要があるかで位置を決め、コメントも直す
- **CSP のポリシーは `app/middleware/csp.tsx` の `DIRECTIVES`**。外部のオリジンを使い始めたらそこに足す。`'unsafe-inline'` を足さない
- **セッションを入れるときは `session()` と `csrf()` を `cop()` の後に足す**（`CLAUDE.md`「Security」）

## `app/ui/` の中

```
app/ui/
  styles/public/                      トークン・ブレークポイント・クエリ定数・ミックスイン
  types/                              型だけの DOM の語彙（dom.ts）
  contexts/                           プロバイダーとフック（csp-nonce）
  primitives/<category>/<component>/  見た目を持たない骨組み
  <category>/<component>/             見た目を持つコンポーネント
```

- **`primitives/` はデザインの判断を持たない**。要素の選択・アクセシビリティ属性・UA のリセットだけで、`color` と `font` は `inherit`。トークンを import しない
- **`<category>/` がデザインを決めて primitive に渡す**（`buttons/base-button/` → `primitives/buttons/primitive-button/`）
- **`layouts/` は構造だけのラッパー**。寸法は `app.css` の `--layout-*` に置く
- **`app/ui/styles/` からコンポーネントを import しない**
- **カテゴリのディレクトリは最初の部品ができたときに作る**。空のディレクトリを先に作らない

## コンポーネントのディレクトリ

| ファイル | 中身 | ハイドレートするとき `public/` の外に置けるか |
|---|---|---|
| `<name>.tsx` | コンポーネント | 置けない |
| `<name>.types.ts` | 型だけ | 置ける（ブラウザ向けの出力から消える） |
| `<name>.styles.ts` | レシピ | 置けない |
| `<name>.test.tsx` | テスト | 対象外（`denyFiles` が止める） |

## ハイドレーションと `public/`

- **ハイドレートするのはブラウザが本当に必要な部品だけ**。まず HTML（GET フォーム、`<details>`、`popover`、CSS）で動くかを考える
- **ハイドレートする部品が実行時に使うものは、すべて `public/` の内側に置く**。`app/assets.ts` の `allowFiles` は `app/routes.ts` と `app/**/public/**` だけなので、外の値を import するとブラウザ向けにコンパイルされない。型だけの import は消えるので対象外
- **クライアントエントリーは `clientEntry(import.meta.url, function Name(…) {…})`**（`ExampleCopyButton`）
- **新しいパッケージをブラウザで使うなら `app/assets.ts` の `allowPackages` に足す**
- **`<script>`・`<link rel="modulepreload">`・`<ImportMap>` を書くなら `nonce={useCspNonce(handle)}` を付ける**。付けないと CSP に止められる（`document.tsx`）
- **ルートの `public/` のファイルをアプリから参照するときは `?${CACHE_BUSTER}` を付ける**（`app.css`、`/static/img/…`）。`favicon.svg` のように直接取得されるものは付けない（`CLAUDE.md`「Caching」）
- **部品の置き場は、ハイドレートする部品が初めて必要としたときに `public/` へ移す**。先回りして移さない

## テスト

- **テストは対象の横に置く**（`<name>.test.tsx`、`app/middleware/*.test.ts`）
- **`remix/test` と `import * as assert from 'remix/assert'` を使う**。`node:test` は失敗しても全体が成功になる（lint でも検出）
- **ルートの振る舞いは `router.fetch(new Request(...))` の `Response` で確かめる**。部品は `renderToString`
- **nonce は base64 で `+` や `/` を含むので、正規表現に埋め込まず文字列で比べる**（`csp.test.tsx`）

## アンチパターン（指摘対象）

- ❌ `app/lib/`・`app/components/`・`app/controllers/` の新設、`app/` 直下への 1 つの機能のためのファイル
- ❌ 1 つのルートでしか使わない部品を `app/ui/` に置く
- ❌ `app/env.ts` 以外で `process.env` を読む
- ❌ `routes.ts` に素の文字列パターン、または `routes.ts` から app のモジュールを import する
- ❌ 内部リンクを文字列で書く、末尾に `/` を付ける
- ❌ ネストしたルートマップに `router.map` の行や controller がない
- ❌ エラーを HTML で組み立てて返す
- ❌ CSP に `'unsafe-inline'` を足す、nonce のない `<script>`・preload・import map、`style` 属性
- ❌ `primitives/` が色・文字サイズ・トークンを持つ
- ❌ ハイドレートする部品が `public/` の外の値を import する
- ❌ ルートの `public/` のファイルを参照するのに `?${CACHE_BUSTER}` がない
