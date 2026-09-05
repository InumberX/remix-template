import type { StyleRecipe } from '../../ui/styles/public/mixins.ts'

export const devUiPage: StyleRecipe = {
  boxSizing: 'border-box',
  margin: 0,
  minHeight: '100vh',
  padding: '32px 24px 64px',
  background: '#f7f8f8',
  color: '#2f3a3a',
  fontFamily: 'system-ui, sans-serif',
  '& *, & *::before, & *::after': { boxSizing: 'border-box' },
}

export const devUiPage_heading: StyleRecipe = { margin: '0 0 32px', fontSize: '20px' }
