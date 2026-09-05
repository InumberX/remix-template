import type { Handle } from 'remix/ui'

import { routes } from '../../routes.ts'
import { LayoutInner } from '../../ui/layouts/layout-inner/layout-inner.tsx'
import { LayoutMain } from '../../ui/layouts/layout-main/layout-main.tsx'
import { LayoutPageWrapper } from '../../ui/layouts/layout-page-wrapper/layout-page-wrapper.tsx'
import { PrimitiveButton } from '../../ui/primitives/buttons/primitive-button/primitive-button.tsx'
import { Document } from '../document.tsx'
import { MainVisual } from './components/main-visual/main-visual.tsx'

export type HomePageProps = {
  url: URL
}

export function HomePage(handle: Handle<HomePageProps>) {
  return () => (
    <Document
      url={handle.props.url}
      meta={{ description: 'Remix 3 のスターターアプリケーションです。' }}
    >
      <LayoutPageWrapper>
        <LayoutMain>
          <div>
            <MainVisual />
            <LayoutInner>
              <ul>
                <li>
                  <PrimitiveButton url={routes.articles.index.href()}>記事一覧へ</PrimitiveButton>
                </li>
              </ul>
            </LayoutInner>
          </div>
        </LayoutMain>
      </LayoutPageWrapper>
    </Document>
  )
}
