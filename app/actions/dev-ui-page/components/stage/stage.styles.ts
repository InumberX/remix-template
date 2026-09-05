import { css } from 'remix/ui'

/** Hatched, dashed frame so a full-width layout's own edges stay visible. */
export const stage = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  width: '100%',
  padding: '4px',
  borderRadius: '6px',
  background: 'repeating-linear-gradient(45deg, #f2f4f4 0 6px, #eaeded 6px 12px)',
  outline: '1px dashed #c3cbcb',
})
