import { MEDIA_QUERY } from '../../styles/public/media-query.ts'
import { getClampPx, type StyleRecipe } from '../../styles/public/mixins.ts'

const headerOffset = (height: string) => `calc(${height} + var(--layout-header-space-top))`

// Longhands, not the `padding-block` shorthand: a later spread replaces the
// key outright, so an override leaves no dead value behind in the output.
export const layoutPageWrapper: StyleRecipe = {
  paddingInline: 0,
  paddingBlockStart: headerOffset('var(--layout-header-height-small)'),
  paddingBlockEnd: getClampPx(40, 80),
  [MEDIA_QUERY.SM]: {
    paddingBlockStart: headerOffset('var(--layout-header-height-medium)'),
  },
}

/**
 * generalview expressed these as class-combination selectors
 * (`&${topNoSpace}:not(...)`). Here they are recipes spread after the base, so
 * the override is decided by JS spread order rather than by selector weight.
 */
export const layoutPageWrapper__topNoSpace: StyleRecipe = {
  paddingBlockStart: 0,
  [MEDIA_QUERY.SM]: { paddingBlockStart: 0 },
}

export const layoutPageWrapper__bottomNoSpace: StyleRecipe = {
  paddingBlockEnd: 0,
}
