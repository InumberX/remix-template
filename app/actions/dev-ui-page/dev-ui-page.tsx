// Development-only gallery. It renders every component in app/ui/ through the
// same server render pipeline the real pages use, so a specimen here cannot
// diverge from what ships. `npm run hmr` reloads it on edit.
import type { Handle } from 'remix/ui'

import { routes } from '../../routes.ts'
import { BaseButton } from '../../ui/buttons/base-button/base-button.tsx'
import { LayoutInner } from '../../ui/layouts/layout-inner/layout-inner.tsx'
import { LayoutMain } from '../../ui/layouts/layout-main/layout-main.tsx'
import { LayoutPageWrapper } from '../../ui/layouts/layout-page-wrapper/layout-page-wrapper.tsx'
import { LayoutWrapper } from '../../ui/layouts/layout-wrapper/layout-wrapper.tsx'
import { PrimitiveButton } from '../../ui/primitives/buttons/primitive-button/primitive-button.tsx'
import { Document } from '../document.tsx'
import { Block } from './components/block/block.tsx'
import { Section } from './components/section/section.tsx'
import { Specimen } from './components/specimen/specimen.tsx'
import { Stage } from './components/stage/stage.tsx'
import * as styles from './dev-ui-page.styles.ts'
import { ExampleCopyButton } from './public/components/example-copy-button/example-copy-button.tsx'

const PAGE_TITLE = 'UI ギャラリー'

export function DevUiPage(handle: Handle<{ url: URL }>) {
  return () => (
    <Document url={handle.props.url} meta={{ title: PAGE_TITLE, robots: 'noindex, nofollow' }}>
      <main mix={styles.devUiPage}>
        <h1 mix={styles.devUiPage_heading}>{PAGE_TITLE}</h1>

        <Section title="PrimitiveButton" note="骨組みのみ。色・字送り・モーションを持たない">
          <Specimen label="url（内部リンク・SPA 遷移）">
            <PrimitiveButton url={routes.articles.index.href()}>記事一覧へ</PrimitiveButton>
          </Specimen>
          <Specimen label="url（外部リンク・data-rmx-document）">
            <PrimitiveButton url="https://remix.run" target="_blank" rel="noopener noreferrer">
              remix.run
            </PrimitiveButton>
          </Specimen>
          <Specimen label="url（ハッシュ）">
            <PrimitiveButton url="#top">ページ先頭へ</PrimitiveButton>
          </Specimen>
          <Specimen label="buttonType=submit">
            <PrimitiveButton buttonType="submit">送信</PrimitiveButton>
          </Specimen>
          <Specimen label="isDisabled">
            <PrimitiveButton buttonType="button" isDisabled>
              無効
            </PrimitiveButton>
          </Specimen>
          <Specimen label="nonClickableTag=span（既定・不活性）">
            <PrimitiveButton>ラベルのみ</PrimitiveButton>
          </Specimen>
          <Specimen label="nonClickableTag=div + role">
            <PrimitiveButton nonClickableTag="div" role="button" ariaLabel="不活性な div">
              div として描画
            </PrimitiveButton>
          </Specimen>
        </Section>

        <Section title="BaseButton" note="プリミティブの上にデザイン判断を載せた層">
          <Specimen label="tone=neutral（既定）">
            <BaseButton buttonType="button">Neutral</BaseButton>
          </Specimen>
          <Specimen label="tone=primary">
            <BaseButton buttonType="button" tone="primary">
              Primary
            </BaseButton>
          </Specimen>
          <Specimen label="tone=primary + url（アンカーとして描画）">
            <BaseButton url="/articles" tone="primary">
              記事一覧へ
            </BaseButton>
          </Specimen>
          <Specimen label="isDisabled">
            <BaseButton buttonType="button" tone="primary" isDisabled>
              無効
            </BaseButton>
          </Specimen>
        </Section>

        <Section
          title="ExampleCopyButton"
          note="唯一のハイドレート島。クリックでテキストをコピーするため、実際の確認はブラウザでのみ可能"
        >
          <Specimen label="短いテキスト">
            <ExampleCopyButton text="npm run dev" />
          </Specimen>
          <Specimen label="長いテキスト（1 行に収まらない場合の折り返し）">
            <ExampleCopyButton text="この文字列はクリックするとクリップボードにコピーされます。コピー後は 1.2 秒だけ完了表示に変わり、元に戻ります。" />
          </Specimen>
        </Section>

        <Section
          title="Layouts"
          note="構造のみを持つ。実寸だと画面を占有するため styles で縮めて表示している"
        >
          <Specimen label="LayoutWrapper（フルハイトの列。ここでは 160px に縮小）">
            <Stage>
              <LayoutWrapper styleOverrides={{ minBlockSize: '160px' }}>
                <Block label="header" />
                <Block label="body" grow />
                <Block label="footer" />
              </LayoutWrapper>
            </Stage>
          </Specimen>

          <Specimen label="LayoutMain（tag=main・コンテナを開く）">
            <Stage>
              <LayoutMain>
                <Block label="container-name: layout-main" />
              </LayoutMain>
            </Stage>
          </Specimen>

          <Specimen label="LayoutMain tag=section">
            <Stage>
              <LayoutMain tag="section">
                <Block label="section として描画" />
              </LayoutMain>
            </Stage>
          </Specimen>

          <Specimen label="LayoutPageWrapper（ヘッダー分の上余白 + 下余白）">
            <Stage>
              <LayoutPageWrapper>
                <Block label="page body" />
              </LayoutPageWrapper>
            </Stage>
          </Specimen>

          <Specimen label="LayoutPageWrapper isTopNoSpace isBottomNoSpace">
            <Stage>
              <LayoutPageWrapper isTopNoSpace isBottomNoSpace>
                <Block label="余白なし" />
              </LayoutPageWrapper>
            </Stage>
          </Specimen>

          <Specimen label="LayoutInner size=small / medium / large / full">
            <Stage>
              <LayoutInner size="small">
                <Block label="small" />
              </LayoutInner>
              <LayoutInner size="medium">
                <Block label="medium" />
              </LayoutInner>
              <LayoutInner size="large">
                <Block label="large" />
              </LayoutInner>
              <LayoutInner size="full">
                <Block label="full" />
              </LayoutInner>
            </Stage>
          </Specimen>

          <Specimen label="入れ子（Wrapper > Main > PageWrapper > Inner）">
            <Stage>
              <LayoutWrapper styleOverrides={{ minBlockSize: '0' }}>
                <LayoutMain>
                  <LayoutPageWrapper isTopNoSpace isBottomNoSpace>
                    <LayoutInner size="small">
                      <Block label="content" />
                    </LayoutInner>
                  </LayoutPageWrapper>
                </LayoutMain>
              </LayoutWrapper>
            </Stage>
          </Specimen>
        </Section>
      </main>
    </Document>
  )
}
