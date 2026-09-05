import type { PrimitiveButtonProps } from '../../primitives/buttons/primitive-button/primitive-button.types.ts'

export type BaseButtonTone = 'neutral' | 'primary'

/** Everything the primitive accepts except `styleOverrides`, which this tier owns. */
export type BaseButtonProps = Omit<PrimitiveButtonProps, 'styleOverrides'> & {
  tone?: BaseButtonTone
}
