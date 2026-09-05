import { css } from 'remix/ui'

export const section = css({ margin: '0 0 48px' })

export const section_title = css({
  margin: 0,
  paddingBottom: '4px',
  borderBottom: '1px solid #d6dada',
  fontSize: '16px',
})

export const section_note = css({ margin: '8px 0 20px', color: '#6b7676', fontSize: '13px' })

export const section_grid = css({
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
})
