// Ported from auba-general-view: app/components/primitives/buttons/PrimitiveButton
//
// Unstyled skeleton. It owns element selection (anchor with a `url`, button with
// a `buttonType`, otherwise an inert tag), the accessibility attributes and the
// user-agent reset — nothing else. Design decisions belong to the styled tier in
// `app/ui/<category>/`, which passes them down through `styleOverrides`.
import { css, type Handle, type MixInput } from 'remix/ui'

import * as styles from './primitive-button.styles.ts'
import type { PrimitiveButtonProps } from './primitive-button.types.ts'

export type * from './primitive-button.types.ts'

export function PrimitiveButton(handle: Handle<PrimitiveButtonProps>) {
  return () => {
    const {
      url,
      target,
      rel,
      buttonType = 'button',
      isDisabled,
      children,
      styleOverrides,
      mix,
      name,
      value,
      title,
      role,
      tabIndex,
      ariaLabel,
      ariaControls,
      ariaSelected,
      nonClickableTag = 'span',
    } = handle.props

    // Cross-origin links are never enhanced by the client runtime, and in-page
    // hash links should stay a plain browser jump, so both opt out explicitly.
    const isDocumentNavigation = url
      ? url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#')
      : false

    // One css(...) call: the reset, the disabled treatment and the caller's
    // recipe are merged as plain objects, so JS spread order decides which
    // declaration wins. Output is content-hashed and deduplicated.
    const hostStyle: MixInput<HTMLElement> = [
      css({
        ...styles.primitiveButton,
        ...(isDisabled ? styles.primitiveButton__disabled : null),
        ...styleOverrides,
      }),
      mix,
    ]

    if (url) {
      return (
        <a
          href={url}
          target={target}
          rel={rel}
          title={title}
          role={role}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-selected={ariaSelected}
          data-rmx-document={isDocumentNavigation ? '' : undefined}
          mix={hostStyle}
        >
          {children}
        </a>
      )
    }

    if (handle.props.buttonType) {
      return (
        <button
          type={buttonType}
          disabled={isDisabled}
          name={name}
          value={value}
          title={title}
          role={role}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-selected={ariaSelected}
          mix={hostStyle}
        >
          {children}
        </button>
      )
    }

    const Tag = nonClickableTag

    return (
      <Tag
        title={title}
        role={role}
        aria-label={ariaLabel}
        aria-controls={ariaControls}
        aria-selected={ariaSelected}
        mix={hostStyle}
      >
        {children}
      </Tag>
    )
  }
}
