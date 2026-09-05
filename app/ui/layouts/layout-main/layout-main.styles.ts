import type { StyleRecipe } from '../../styles/public/mixins.ts'

/** Descendants can size against this with `CONTAINER_QUERY.*`. */
export const LAYOUT_MAIN_CONTAINER = 'layout-main'

export const layoutMain: StyleRecipe = {
  inlineSize: '100%',
  containerType: 'inline-size',
  containerName: LAYOUT_MAIN_CONTAINER,
}
