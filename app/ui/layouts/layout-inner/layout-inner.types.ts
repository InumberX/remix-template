import type { MixInput, RemixNode } from 'remix/ui'

import type { StyleRecipe } from '../../styles/public/mixins.ts'

export type LayoutInnerSize = 'small' | 'medium' | 'large' | 'full'

export type LayoutInnerProps = {
  children?: RemixNode
  size?: LayoutInnerSize
  styleOverrides?: StyleRecipe
  mix?: MixInput<HTMLElement>
}
