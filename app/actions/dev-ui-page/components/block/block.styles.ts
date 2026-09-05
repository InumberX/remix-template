import type { StyleRecipe } from '../../../../ui/styles/public/mixins.ts'

export const block: StyleRecipe = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '28px',
  padding: '4px 8px',
  borderRadius: '4px',
  background: '#ffffff',
  outline: '1px solid #d6dada',
  color: '#6b7676',
  fontSize: '11px',
}

export const block__grow: StyleRecipe = { flex: '1 1 auto' }
