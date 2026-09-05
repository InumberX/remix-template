import type { StyleRecipe } from '../../../../ui/styles/public/mixins.ts'

// Two blocks rather than one. BEM elements do not nest, so the <h1> and its
// image get their own `mainVisualTitle` prefix instead of becoming
// `mainVisual_titleImage` — an element of an element, which is what the
// convention exists to avoid.
//
// The empty recipes are deliberate: they are this template's slots, named and
// wired to their element so a project starting from here fills them in rather
// than inventing a name and a `css(...)` call at the same time.

export const mainVisual: StyleRecipe = {}

export const mainVisual_container: StyleRecipe = {}

export const mainVisualTitle: StyleRecipe = {}

export const mainVisualTitle_image: StyleRecipe = {
  inlineSize: '100%',
  blockSize: 'auto',
}
