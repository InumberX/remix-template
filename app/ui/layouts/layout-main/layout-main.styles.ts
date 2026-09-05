import type { StyleRecipe } from '../../styles/public/mixins.ts'

/**
 * The container descendants size against. `CONTAINER_QUERY.*` carries no name,
 * so it resolves to the NEAREST ancestor with `container-type` — this one, until
 * something closer opens a container of its own. Targeting this container
 * specifically needs the named form (`@container layout-main (...)`), which the
 * shared constants do not build; write it out where you need it.
 */
export const LAYOUT_MAIN_CONTAINER = 'layout-main'

export const layoutMain: StyleRecipe = {
  inlineSize: '100%',
  containerType: 'inline-size',
  containerName: LAYOUT_MAIN_CONTAINER,
}
