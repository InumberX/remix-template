import type { MixInput, RemixNode } from 'remix/ui'

import type { StyleRecipe } from '../../styles/public/mixins.ts'

export type LayoutPageWrapperProps = {
  children?: RemixNode
  /** Drop the header offset, for pages whose first block is full-bleed. */
  isTopNoSpace?: boolean
  /** Drop the bottom padding, for pages ending in a full-bleed block. */
  isBottomNoSpace?: boolean
  styleOverrides?: StyleRecipe
  mix?: MixInput<HTMLElement>
}
