---
name: review-pr
description: Review a pull request against this project's style, naming, and structural conventions. Use when the user asks for a PR review, code review, or review of pending changes — including narrowed-scope requests like "review the styling" or "check the naming".
---

# review-pr

このプロジェクト固有のレビュー観点を集約したスキル。`app/`・`server.ts`・`hmr.ts` の Remix 3 + Node + TypeScript のコードが、規約に従っているかをレビューする。

規約の本文と理由は `CLAUDE.md` と `AGENTS.md` にある。`rules/` はそこからレビューで確かめる点を抜き出したもので、両者が食い違ったら `CLAUDE.md` が正しい。そのときはルールファイルの更新も指摘する。

## いつ発動するか

次のいずれかに該当する場合に使う:

- 「PR レビューして」「コードレビューして」「変更をレビューして」と依頼された
- 「スタイルだけ見て」「命名だけチェックして」など特定観点のレビューを依頼された
- PR の差分（`git diff`、GitHub の PR、ステージング済みの変更）に対する品質評価を求められた

機械的に検出できる項目（フォーマット、未使用変数、`any`、import 順序、`node:test` の使用など）は `npm run format`・`npm run lint`・`npm run typecheck`・`npm run stylelint` に任せる。本スキルは**人間の判断が必要なルール**にフォーカスする。

## レビュー手順

### 1. 差分の取得

優先順位:

1. ユーザーが PR 番号や URL を指定 → `gh pr view <番号>` / `gh pr diff <番号>` で取得する（`gh` が使えない環境では GitHub の MCP ツールで PR の差分を読む）
2. ブランチがある → PR のマージ先（通常は `develop`）との差分を `git diff <base>...HEAD --stat` と `git diff <base>...HEAD` で把握する
3. 作業ツリーに未コミット変更がある → `git status` と `git diff`

### 2. 観点の選択

依頼内容から参照するルールを決定する。

| 依頼パターン | 参照ファイル |
|---|---|
| 「PR レビュー」「全体レビュー」「コードレビュー」 | `rules/**/*.md` 全て |
| 「スタイル」「命名」「CSS」「構造」関連 | `rules/style/*.md` |
| 「命名だけ」 | `rules/style/naming.md` |
| 「CSS だけ」「スタイルのレシピ」「`css(...)`」 | `rules/style/css.md` |
| 「ディレクトリ構造」「ファイル配置」「ルート」「ハイドレーション」「ミドルウェア」 | `rules/style/structure.md` |

将来 `rules/a11y/`・`rules/performance/` 等が追加されたら、同様のマッピングを拡張する。

### 3. ルールの読み込みとレビュー

選択したルールファイルを実際に読み、差分の各ファイルに対してルール違反を検出する。**ルールを推測で適用せず、必ずファイルから引用して根拠を示す。**

判断に迷ったら `examples/style/good.md`・`examples/style/bad.md` を参照する。既存コードも参考にする。対になる実例は次のとおり。

- 見た目を持たない骨組みと、見た目を持つ部品: `app/ui/primitives/buttons/primitive-button/` と `app/ui/buttons/base-button/`
- ルートエリアとページ: `app/actions/articles/`（`controller.tsx`・`index-page/`・`show-page/`）
- ハイドレートする部品: `app/actions/dev-ui-page/public/components/example-copy-button/`
- 複数のブロックを持つ `.styles.ts`: `app/actions/home-page/components/main-visual/main-visual.styles.ts`
- ミドルウェア: `app/middleware/`（`security-headers.ts`・`csp.tsx`・`error-page.tsx`・`trailing-slash.ts`）

### 4. 出力フォーマット

指摘は重要度別に整理し、ファイルパスと行番号を必ず含める。

````markdown
## レビュー結果

### 🔴 Must（規約違反・修正必須）

- **`app/ui/buttons/new-button/new-button.styles.ts:12`**
  `css(...)` のディスクリプタを export しています。ディスクリプタはスプレッドできないため、呼び出し側が `styleOverrides` で上書きできなくなります。プレーンなレシピを export してください（参考: `rules/style/css.md`「レシピを export する」、`CLAUDE.md`「Style recipes live in `<name>.styles.ts`」）。
  ```ts
  // Bad
  export const newButton = css({ display: 'inline-flex' })
  // Good
  export const newButton: StyleRecipe = { display: 'inline-flex' }
  ```

### 🟡 Should（推奨される改善）

- **`app/ui/buttons/new-button/new-button.types.ts:5`**
  boolean の props は `is*` で揃えると既存と一貫します（参考: `rules/style/naming.md`）。
  - `disabled` → `isDisabled`

### 🟢 Nit（任意の好み）

- ...

### ✅ 良かった点

- コンポーネントのディレクトリが `<name>.tsx`・`.types.ts`・`.styles.ts`・`.test.tsx` に分かれている
- 内部リンクをすべて `routes.<name>.href(...)` で組み立てている
- ...
````

## 出力上の注意

- 機械的検出可能な指摘（lint で出るもの）は基本的に書かない。書く場合は「`npm run lint` で検出可能」と添える
- 「規約違反」と「好みの差」を明確に分ける（Must / Should / Nit）
- 参照したルールファイルとセクションを必ず引用する
- ファイルが大量にある PR では、まず観点別の集計（「naming 違反 N 件、css 違反 M 件」）を提示してから個別指摘に入る
- Remix のコンポーネントは React ではない。フック・依存配列・暗黙の再描画を前提にした指摘をしない（`CLAUDE.md`「Code Conventions」）

## 拡張ガイド（将来の作業者向け）

新しいレビュー観点（例: アクセシビリティ）を追加するときは、以下の手順で拡張する:

1. `rules/<category>/` ディレクトリを作成し、観点別の `.md` ファイルを追加
2. `examples/<category>/good.md`・`bad.md` を追加
3. 本ファイルの「観点の選択」テーブルに行を追加

ルールファイルを増やしすぎる前に、既存ファイルへの追記で済まないか検討する。規約そのものを追加・変更するときは、先に `CLAUDE.md` を更新する。
