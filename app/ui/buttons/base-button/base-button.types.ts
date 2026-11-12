import type { PrimitiveButtonProps } from '../../primitives/buttons/primitive-button/primitive-button.types.ts'

export type BaseButtonTone = 'neutral' | 'primary'

/**
 * `Omit` applied to each member of a union. A plain `Omit` over
 * `PrimitiveButtonProps` would merge its link, button and inert variants into
 * one object type and lose the rule that exactly one of them applies.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** Everything the primitive accepts except `styleOverrides`, which this tier owns. */
export type BaseButtonProps = DistributiveOmit<PrimitiveButtonProps, 'styleOverrides'> & {
  tone?: BaseButtonTone
}
