import { css } from 'remix/ui'

export const devUiPage = css({
  boxSizing: 'border-box',
  margin: 0,
  minHeight: '100vh',
  padding: '32px 24px 64px',
  background: '#f7f8f8',
  color: '#2f3a3a',
  fontFamily: 'system-ui, sans-serif',
  '& *, & *::before, & *::after': { boxSizing: 'border-box' },
})

export const devUiPage_heading = css({ margin: '0 0 32px', fontSize: '20px' })
