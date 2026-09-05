import type { MixInput, RemixNode } from 'remix/ui'

import type { StyleRecipe } from '../../styles/public/mixins.ts'

/** Landmark-ish tags this wrapper is allowed to render. */
export type LayoutMainTag = 'main' | 'div' | 'section' | 'article'

export type LayoutMainProps = {
  children?: RemixNode
  tag?: LayoutMainTag
  styleOverrides?: StyleRecipe
  mix?: MixInput<HTMLElement>
}
