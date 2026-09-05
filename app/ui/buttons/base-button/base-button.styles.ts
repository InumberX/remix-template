// Styled tier: this is where design decisions live. Recipes are plain objects so
// the primitive can spread them over its reset in a single css(...) call.
import { getTransition, type StyleRecipe } from '../../styles/public/mixins.ts'
import { fontSmall } from '../../styles/public/tokens.ts'
import type { BaseButtonTone } from './base-button.types.ts'

export const baseButton: StyleRecipe = {
  ...fontSmall,
  borderRadius: '4px',
  cursor: 'pointer',
  justifyContent: 'center',
  padding: '8px 16px',
  transition: getTransition([{ property: 'color' }, { property: 'background-color' }]),
}

export const baseButton__neutral: StyleRecipe = {
  background: '#eef1f1',
  color: 'var(--color-util-black)',
}

export const baseButton__primary: StyleRecipe = {
  background: 'var(--color-util-black)',
  color: 'var(--color-util-white)',
}

/** Lookup for the `tone` prop; members are the modifier recipes above. */
export const baseButtonTones: Record<BaseButtonTone, StyleRecipe> = {
  neutral: baseButton__neutral,
  primary: baseButton__primary,
}
