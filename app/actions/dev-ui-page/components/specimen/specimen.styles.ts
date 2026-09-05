import type { StyleRecipe } from '../../../../ui/styles/public/mixins.ts'

export const specimen: StyleRecipe = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  borderRadius: '8px',
  background: '#ffffff',
  border: '1px solid #e4e8e8',
}

export const specimen_label: StyleRecipe = { color: '#6b7676', fontSize: '12px' }

export const specimen_stage: StyleRecipe = {
  display: 'flex',
  alignItems: 'center',
  minHeight: '40px',
  padding: '8px',
  borderRadius: '6px',
  background: '#fafbfb',
}
