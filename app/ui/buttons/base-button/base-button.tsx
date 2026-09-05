// Styled counterpart to the unstyled primitive: it adds tone, padding, radius
// and motion, and delegates element selection and accessibility downwards.
import type { Handle } from 'remix/ui'

import { PrimitiveButton } from '../../primitives/buttons/primitive-button/primitive-button.tsx'
import * as styles from './base-button.styles.ts'
import type { BaseButtonProps } from './base-button.types.ts'

export type * from './base-button.types.ts'

export function BaseButton(handle: Handle<BaseButtonProps>) {
  return () => {
    const { tone = 'neutral', children, ...forwarded } = handle.props

    return (
      <PrimitiveButton
        {...forwarded}
        styleOverrides={{ ...styles.baseButton, ...styles.baseButtonTones[tone] }}
      >
        {children}
      </PrimitiveButton>
    )
  }
}
