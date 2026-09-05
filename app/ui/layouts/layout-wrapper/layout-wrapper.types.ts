import type { MixInput, RemixNode } from 'remix/ui'

import type { StyleRecipe } from '../../styles/public/mixins.ts'

export type LayoutWrapperProps = {
  children?: RemixNode
  /** Merged over the layout recipe in a single `css(...)` call. */
  styleOverrides?: StyleRecipe
  mix?: MixInput<HTMLElement>
}
