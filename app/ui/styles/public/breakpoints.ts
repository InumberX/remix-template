// Ported from auba-general-view: app/styles/variables/breakpoints.css.ts
//
// Kept in its own module because `mixins.ts` and `media-query.ts` both need it.
// Putting it in `tokens.ts` would make tokens <-> mixins circular, and a cycle
// here degrades inference silently rather than erroring.

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

/** Mobile-first minimums. Values are literal so query strings built from them
 *  keep their literal type — see the note in `media-query.ts`. */
export const BREAKPOINTS = {
  xs: 360,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const satisfies { [key in BreakpointKey]: number }
