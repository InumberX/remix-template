// Type-only module: no runtime exports, so it is erased from browser output and
// may live outside a `public/` directory even when the component is hydrated.
import type { MixInput, RemixNode } from 'remix/component'

import type { StyleRecipe } from '../../../styles/public/mixins.ts'
import type { AnchorRel, AnchorTarget, ButtonType } from '../../../types/dom.ts'

export type { AnchorRel, AnchorTarget, ButtonType }

/** Local to this component: the tags it will fall back to when inert. */
export type NonClickableTag = 'span' | 'div' | 'p'

/**
 * Roles accepted by every element this component can render. Remix's DOM types
 * constrain `role` per element following ARIA-in-HTML, unlike React's uniformly
 * wide `AriaRole`, so this is the intersection of what `a[href]`, `button`, and
 * a generic tag will each accept.
 */
export type PrimitiveButtonRole =
  | 'button'
  | 'checkbox'
  | 'link'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'radio'
  | 'switch'
  | 'tab'
  | 'treeitem'

type PrimitiveButtonCommonProps = {
  isDisabled?: boolean
  children?: RemixNode
  /**
   * Style properties merged over the component's own recipe in a single
   * `css(...)` call.
   * Use this — not `mix` — whenever the override touches a property the reset
   * already sets (`color`, `font`, `padding`, …), because spread order is
   * deterministic while two descriptors on one element are not.
   */
  styleOverrides?: StyleRecipe
  /** Behavior and disjoint styling for the host element, e.g. `on('click', ...)`. */
  mix?: MixInput<HTMLElement>
  title?: string
  role?: PrimitiveButtonRole
  tabIndex?: number
  ariaLabel?: string
  ariaControls?: string
  ariaSelected?: boolean | 'true' | 'false'
}

/** An `<a>`. */
type PrimitiveButtonLinkProps = {
  /**
   * A page of this app as a root-relative path from `routes.<name>.href()`;
   * an absolute URL — even one on this site's own origin — is treated as
   * another site and loads as a plain document.
   */
  url: string
  target?: AnchorTarget
  rel?: AnchorRel
  buttonType?: never
  name?: never
  value?: never
  nonClickableTag?: never
}

/** A `<button>`. */
type PrimitiveButtonButtonProps = {
  buttonType: ButtonType
  name?: string
  value?: string
  url?: never
  target?: never
  rel?: never
  nonClickableTag?: never
}

/**
 * An inert tag: a label that looks like a button but does nothing — the right
 * choice inside a link or a clickable card, where a `<button>` would be
 * interactive content nested in interactive content.
 */
type PrimitiveButtonInertProps = {
  nonClickableTag: NonClickableTag
  url?: never
  target?: never
  rel?: never
  buttonType?: never
  name?: never
  value?: never
}

/**
 * Exactly one of `url`, `buttonType` or `nonClickableTag` decides the element,
 * and leaving all three out is a type error. A Remix click handler is a
 * `mix={on('click', …)}` the component cannot see, so it cannot guess the
 * element — and either guess is wrong somewhere: a default `<span>` drops a
 * click handler's button, a default `<button>` nests one inside a card's link.
 */
export type PrimitiveButtonProps = PrimitiveButtonCommonProps &
  (PrimitiveButtonLinkProps | PrimitiveButtonButtonProps | PrimitiveButtonInertProps)
