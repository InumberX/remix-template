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

/**
 * One below each breakpoint, for `width <=` bounds.
 *
 * Written out rather than computed as `BREAKPOINTS[key] - 1` because TypeScript
 * has no type-level arithmetic: the subtraction widens to `number`, the query
 * string degrades from a literal to a `${number}` pattern, and it can no longer
 * be used as a `css(...)` computed key. `breakpoints.test.ts` asserts the -1
 * relationship so the two objects cannot drift apart.
 */
export const BREAKPOINTS_MAX = {
  xs: 359,
  sm: 575,
  md: 767,
  lg: 991,
  xl: 1199,
  xxl: 1399,
} as const satisfies { [key in BreakpointKey]: number }
