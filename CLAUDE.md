# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read First

- `AGENTS.md` — starter layout and route-ownership conventions.
- `.agents/skills/remix/SKILL.md` — the Remix 3 build guide (project layout, placement precedence, core rules, package map, canonical patterns). Load `.agents/skills/remix/references/<topic>.md` only for the topic you are touching; each reference opens with a "What This Covers" section.
- Full API docs for a `remix/<subpath>` live in `node_modules/remix/src/<dir>/README.md`. The directory name is not always the subpath name (`remix/router` → `src/fetch-router/README.md`); fall back to the nearest parent README.

## Commands

```sh
npm run dev         # watch-mode server on :44100 (gallery at /dev/ui)
npm run hmr         # HMR proxy on :44100 -> child server on :44102 (HMR events :44101)
npm run start       # production server
npm test            # node --test over the whole project
npm run typecheck   # tsc -b (incremental, writes tsconfig.tsbuildinfo)
npm run routes      # remix routes --table (inspect the route contract)
npm run doctor      # remix doctor (project health check)
npm run lint        # oxlint, warnings are errors
npm run lint-fix    # oxlint --fix
npm run format      # oxfmt --check
npm run format-fix  # oxfmt --write
npm run stylelint   # stylelint over public/**/*.css
npm run stylelint-fix
npm run pre-commit  # typecheck -> format-fix -> lint-fix -> stylelint-fix
```

Run a single test file or filter by name:

```sh
NODE_ENV=test node --import remix/node-tsx --test app/actions/controller.test.tsx
NODE_ENV=test node --import remix/node-tsx --test --test-name-pattern 'renders home'
```

There is no build step — TypeScript is loaded at runtime through the `remix/node-tsx` import hook, and browser modules are compiled on demand by the asset server.

**Node version.** `.node-version` pins 24.11.1 and `package.json` requires `>=24.3.0`, because `remix/node-tsx` calls `module.registerHooks`. On an older runtime every `node --import remix/node-tsx` command fails with `does not provide an export named 'registerHooks'`, and the `remix` CLI cannot load `app/routes.ts` at all. `oxlint`, `oxfmt`, and `tsc` are standalone binaries and work regardless. If `node -v` disagrees with `.node-version`, a hardcoded version directory is shadowing the nodenv shims on `PATH`.

**Write tests with `node:test`, not `remix/test`.** The `test` script is plain `node --test`, which never runs a suite registered through `remix/test` — the file is imported, the assertions never execute, and it still reports a pass. `remix/test` only works under the `remix test` runner, which needs `playwright` installed. So until that runner is set up, import `describe`/`it` from `node:test` and pair it with `import * as assert from 'remix/assert'` (the namespace import is what carries `assert.match`; the *named* `assert` export is only the bare callable).

The `test` script passes explicit globs because Node's default discovery pattern covers `.ts` but **not** `.tsx` — without them only `app/env.test.ts` runs, and the suite reports a green 2 tests instead of 20.

## Routes and actions

`app/routes.ts` imports nothing from the app, so nothing can create a cycle back into the route contract. That matters: making `pages.ts`-style metadata the source of a pattern (`get(PAGES.home.getUrl())`) produced a circular type reference that silently degraded `routes` to `any` — `href({ typoParam: 1 })` and `routes.doesNotExist.href()` both stopped being errors while the app kept serving 200s.

- **Declare the method.** A bare string (`home: '/'`) is typed `Route<"ANY", "/">` and answers POST, PUT and DELETE alike; `get('/')` answers GET and 404s the rest. Use `get`/`post`/`form`/`resources`, never a bare pattern.
- **Keep patterns literal.** Remix derives `href()` arguments and `context.params` from the pattern's literal type. Any indirection that widens it to `string` silently removes that checking.
- **Nest route areas.** `articles: { index: get('/articles'), show: get('/articles/:id') }` gives the area its own controller and a place to hang middleware later. `router.map` wires only direct leaves, so each nested map needs an explicit `router.map(routes.articles, articlesController)`.

Naming under `app/actions/` — **a bare directory is a route area, a `-page` directory is a page**:

```
app/actions/
  controller.tsx              direct leaves of the root map: assets, home, devUi
  document.tsx                the shared document shell
  meta.tsx                    site-wide metadata defaults
  home-page/home-page.tsx     home
  dev-ui-page/dev-ui-page.tsx devUi
  articles/                   route area — has a controller, gets a router.map line
    controller.tsx            nested route map: index, show
    index-page/index-page.tsx articles.index
    show-page/show-page.tsx   articles.show
  public/                     browser-reachable source
```

Route-area directories are named after route-map *keys*, never URL path segments; page directories are that key plus `-page`. The suffix is what tells you, without opening the directory, whether something needs a `router.map` line. Inside a page directory the filenames repeat the directory name (`show-page/show-page.tsx`, plus `.types.ts` / `.styles.ts` / `.test.tsx` as needed), and its own sub-components go one level down in `components/<name>/<name>.tsx` — the same shape `app/ui/` uses, so one convention covers both trees. The extra level keeps the page's own files from mixing with its parts:

```
home-page/
  home-page.tsx
  components/main-visual/main-visual.tsx
  public/components/<name>/<name>.tsx     the hydrated ones
```

`public/` is a visibility boundary rather than a category, so it wraps `components/` instead of replacing it. `app/assets.ts` allows `app/**/public/**`, and the `**` matches at any depth — verified — so nesting inside it costs nothing and the sub-component shape stays the same on both sides of the boundary.

There is no file-system routing in Remix 3, so a Next-style `page.tsx` would carry no framework meaning and would need `routes.ts` kept in sync by hand anyway; naming after the action key ties the file to the unit the framework actually dispatches on, and keeps editor tabs distinguishable.

### Page metadata

`app/actions/meta.tsx` is generalview's `getMetadata` translated: React Router collects `MetaDescriptor[]` and renders them, Remix 3 has no meta API, so `renderMeta()` returns the tags and `Document` places them. A page passes overrides and the request URL:

```tsx
<Document url={url} meta={{ title: '記事一覧', description: '…', ogType: 'article' }} />
```

`url` comes from `context.url` in the action, because a component has no request of its own. `<title>` is rendered by `Document` from the shared `resolveTitle()` and is deliberately absent from `renderMeta()` — emitting it in both places would produce two `<title>` elements. Anything but production gets `noindex, nofollow`, and `NO_INDEX=true` forces it in production too.

Per-page titles stay a `PAGE_TITLE` constant in the page module. A central screen registry (generalview's `app/config/paths.ts`) is not worth its weight until spec screen ids need tracing — the earlier `app/pages.ts` experiment worked, but only one route ever reads a given title.

`/dev/ui` is a component gallery for development. The route is declared in every build so `typeof routes` stays stable, and the action returns 404 when `IS_PRODUCTION`. It renders every `app/ui/` variant through the real `context.render()` pipeline, so a specimen cannot diverge from what ships — which is why this exists instead of Storybook (no Remix 3 renderer exists, and a Vite builder would add a second, differently-resolving module graph).

## The `app/ui/` layout

Adapted from `auba-general-view`'s `app/components/` taxonomy. Two component tiers over a token layer:

```
app/ui/
  styles/public/                       design tokens, breakpoints, query constants (runtime values)
  types/                               DOM vocabulary shared across components (type-only)
  primitives/<category>/<component>/   unstyled skeletons
  <category>/<component>/              styled components built on them
```

`styles/` sits under `public/` because `css(...)` descriptors and tokens are runtime values that a hydrated component has to import; `types/` does not, because type imports are erased.

Each component directory splits four ways, e.g. `primitives/buttons/primitive-button/`:

| file | holds | may live outside `public/` when hydrated? |
| --- | --- | --- |
| `<name>.tsx` | the component | no |
| `<name>.types.ts` | types only | **yes** — erased from browser output |
| `<name>.styles.ts` | recipes / `css(...)` values | no |
| `<name>.test.tsx` | tests | n/a (`denyFiles` blocks `*.test.*`) |

Create a category directory when it gets its first member; do not pre-create empty ones. Never `index.tsx` — NodeNext has no directory resolution, so it buys nothing and every import still spells the file out.

### What separates the two tiers

`primitives/` owns element selection, accessibility attributes and the user-agent reset, and takes **no** design decisions — no colors, no type scale, no motion. `color` and `font` are set to `inherit`, never to a token. Verified consequence: the primitive's only runtime import is its own sibling `.styles.ts`, so the whole directory can move into a `public/` directory and hydrate on its own (HTTP 200) without dragging the token layer along.

`<category>/` owns the design decisions and passes them down. `buttons/base-button/` is the reference pair — it adds tone, padding, radius and motion, and forwards everything else to `primitives/buttons/primitive-button/`.

`layouts/` holds the structural wrappers ported from generalview — `layout-wrapper` (full-height column), `layout-main` (the `@container` container), `layout-page-wrapper` (header offset), `layout-inner` (centred, width-capped). Their measurements are `--layout-*` custom properties in `app.css` rather than TS values, so `util` can retune the grid. Each takes the same `styleOverrides` recipe as the button primitive, which is how `/dev/ui` shrinks a `100svb` wrapper to 160px for display.

### Rules that came from measurement, not taste

**Hydrated components need every *runtime* dependency inside `public/`.** `app/assets.ts` allows `app/**/public/**`; a value import that crosses out of it fails the browser build with `IMPORT_NOT_ALLOWED` / HTTP 500. Type-only imports are erased (`verbatimModuleSyntax`) and are exempt — a `clientEntry` importing a type from outside `public/` compiles to 200 and the specifier is absent from the output. This is why `.types.ts` is a `.ts` and not a `.tsx`: the extension is the reminder that nothing runtime may enter it.

**Override styles by spreading recipes into one `css(...)` call, never by stacking descriptors.** Each `css(...)` emits its own `@layer rmx.<hash>`, and those sublayers are ordered by *first render*, not by position in a `mix` array — rendering a descriptor earlier elsewhere on the page flips the precedence of a later `mix={[base, override]}`. So `PrimitiveButton` takes a `styleOverrides` recipe and merges reset + disabled + caller into a single `css(...)`; output is content-hashed and deduplicated, and JS spread order decides the winner. `mix` stays for behavior (`on('click', …)`) and for styling that touches no property the reset already set.

For deliberate app-wide overrides use cascade layers instead — the documented mechanism (https://guides.remix.run/rendering-ui/). Every `css(...)` rule lands in the `rmx` layer (`REMIX_UI_STYLE_LAYER`), and `public/static/css/app.css` declares the order around it. See **Global CSS** below. What layers do *not* give is ordering *within* `rmx`: `@layer` names passed to `css(...)` nest inside the per-descriptor layer and are inert for cross-descriptor precedence, so generalview's `componentPage → … → componentUiPrimitive` hierarchy has no direct equivalent. Merge recipes for that.

**Style recipes live in `<name>.styles.ts` and are imported as a namespace.** Every component reads them the same way, so a call site says where a value came from without checking the import list:

```ts
import * as styles from './layout-inner.styles.ts'

css(styles.layoutInner)                                    // one recipe
css({ ...styles.layoutInner, ...styleOverrides })          // merged
```

Spread only when merging — a single recipe goes in directly. Names are plain BEM: `block`, `block_element`, `block__modifier` (`primitiveButton__disabled`, `section_title`). No `style` prefix — the namespace already supplies it, and `styles.styleLayoutInner` stutters. The block name stays even though a `.styles.ts` belongs to one component, because it keeps the constants greppable and survives being moved. A variant record such as `layoutInnerSizes` holds the modifier constants rather than inlining them, so each variant still has a name of its own.

**A `.styles.ts` may declare more than one block.** BEM elements do not nest, so a sub-tree that needs its own element names gets its own block prefix rather than a compound element name. `main-visual.styles.ts` is the worked example:

```ts
mainVisual            mainVisual_container         // the outer div
mainVisualTitle       mainVisualTitle_container    // the <h1> and its <figure>
                      mainVisualTitle_image
```

Flattening this would force `mainVisual_titleContainer` — an element of an element, which is what the convention exists to avoid — and only for one of the two containers, so the names stop being symmetric. Splitting `MainVisualTitle` into its own component would fix the names but multiply files for markup that renders once.

**Extraction is decided by reuse and props, not by naming.** The gallery's `Section`, `Specimen`, `Stage` and `Block` moved into `components/<name>/` because each takes props and is rendered many times; a pseudo-block like `mainVisualTitle` stays inline because it is neither.

The caller-facing prop is `styleOverrides`, not `styles`: the namespace import owns `styles` inside every component file, and two bindings with that name in one module is a shadowing bug waiting to happen.

**Media and container queries are constants, not functions.** A `css(...)` computed key needs a *literal* type. A helper returning `string` makes TypeScript infer a string index signature for the object literal, which clashes with the numeric index signature `CSSProps` inherits from `CSSStyleDeclaration` (`'string' and 'number' index signatures are incompatible`) — `as`, `satisfies` and an annotation all fail. So `media-query.ts` exports `MEDIA_QUERY.MD`, `CONTAINER_QUERY_BETWEEN.SM_LG` and friends, every value built from a `BREAKPOINTS` literal inside `as const`:

```ts
css({ color: 'red', [MEDIA_QUERY.MD]: { color: 'blue' } })
```

`BREAKPOINTS_MAX` exists because TypeScript has no type-level arithmetic: `${BREAKPOINTS.md - 1}` degrades the string to a `${number}` pattern and breaks the computed key again. `breakpoints.test.ts` asserts the -1 relationship so the two objects cannot drift.

**Example code is prefixed and lives with whatever shows it.** `app/ui/` is production UI that more than one route needs, so a component named to say "do not use me" does not belong in it. `ExampleCopyButton` sits in `app/actions/dev-ui-page/public/components/` — owned by the gallery that displays it — and the `Example` prefix makes every piece of reference material greppable when a real project starts from this template. It is also the one worked example of `clientEntry` hydration.

**Route-owned UI never goes here.** generalview's `components/pages/*` and `components/features/*` map onto `app/actions/<route-key>/`, next to the controller that owns them. `app/ui/` is only for UI that more than one route area needs.

**Derive DOM types where Remix pins them, hand-declare only deliberate narrowings.** `remix/ui` does not re-export its internal DOM types (`AriaRole`, `HTMLAttributeAnchorTarget`), so the JSX namespace is the supported seam: `NonNullable<JSX.IntrinsicElements['button']['type']>` is a real union and rejects `'nope'`, while `<a target>` and `<a rel>` stay open to arbitrary strings and must be narrowed by hand in `app/ui/types/dom.ts`. Note also that Remix constrains `role` per element following ARIA-in-HTML, unlike React's uniformly wide `AriaRole` — a component that renders several element types can only accept the intersection (see `PrimitiveButtonRole`).

Nothing in `app/ui/styles/` may import a component.

## Tests

Co-locate tests beside what they test — `app/actions/controller.test.tsx`, `app/ui/**/<name>.test.tsx`, `app/env.test.ts`. The framework assumes this: `app/assets.ts` carries `denyFiles: ['app/**/*.test.*']` specifically so co-located tests are never browser-reachable, and the CLI discovers by filename pattern rather than location. Root `test/` is reserved for what the skill scopes it to — shared helpers, fixtures, and integration/E2E coverage — and does not exist yet.

Drive route behavior with `router.fetch(new Request(...))` and assert on the `Response`; use `renderToString` for component specimens. See the note in **Commands** about `node:test` vs `remix/test`.

## Global CSS

```
public/
  favicon.svg
  static/
    css/app.css       cascade layer order, reset, tokens
    img/              images, served as-is
```

`public/static/css/app.css` owns the layer order:

```css
@layer reset, lib, base, rmx, util;
```

Weakest to strongest: `reset` (user-agent normalization), `lib` (third-party sheets, pulled in with `@import url('…') layer(lib)`), `base` (app defaults and `:root` tokens), `rmx` (everything `css(...)` generates), `util` (utility classes — the only layer that outranks component styles).

Three things this file has to get right, each learned the hard way:

- **Every layer must be named in that statement.** A layer that is not pre-declared takes its position from first appearance, which puts it *last*. A `@layer reset { … }` block written without listing `reset` made the reset outrank every component rule.
- **Custom properties must sit inside a layer.** Declarations outside any `@layer` belong to an implicit final layer that beats all named ones, so an unlayered `:root { --x }` could never be overridden from `util`.
- **It has to be served verbatim, so it lives in root `public/`.** The asset server's CSS compiler rewrites `@layer` statements; `staticFiles` does not. The `<link>` also has to be parsed before any `css(...)` rule — Remix appends its `<style data-rmx-style>` tags at the *end* of `<head>`, so a link written in `document.tsx` always wins that race.

The link carries `?${CACHE_BUSTER}` (`app/env.ts`, from `BUILD_ID`) because root `public/` URLs never change on their own — see **Caching** below.

There is no PostCSS here. `@mixin`, `@custom-media` and `@media (--name)` are PostCSS syntax: they survive into the served file and are then dropped or never match, silently. `getClampRem`/`getFontSize` values have to be written out as plain `clamp()` / `rem`.

## Caching

There is no build, so nothing produces hashed filenames up front. Both layers get their cache identity at runtime, and both are production-only — development keeps `no-cache` everywhere so an edit is always picked up.

**Asset server (`/assets/*`).** `fingerprint: { buildId: BUILD_ID }` in `app/assets.ts` inserts a content hash (`entry.@r2O3W4.ts`) and serves `public, max-age=31536000, immutable`, so a returning browser issues no request at all. The hash is derived from file contents plus the build id, which has two consequences: the same `BUILD_ID` always yields the same URL, and a deploy only changes the URLs of modules that actually changed — unlike a bundler, where one edit invalidates a whole chunk. Fingerprinting assumes files on disk are stable, so it requires `watch: false`; that is why it is disabled in development.

**Root `public/` (`staticFiles`).** `app/router.ts` sets `public, max-age=86400` in production. Not `immutable`, because these URLs are fixed: files the app references carry `?${CACHE_BUSTER}` and rotate per deploy, but `favicon.svg` and anything else fetched directly does not. A day plus ETag revalidation is correct for both.

**Every instance must share one `BUILD_ID`.** Different values hand out different URLs for the same bytes and split the cache. `BUILD_ID` falls back to `'dev'`, so a deploy that forgets to set it will not invalidate anything — pass the commit sha from CI.

Measured on this app: a cold first visit is 46 requests / ~338 KB, because modules are served individually rather than bundled. With the settings above a warm visit issues none of them.

## Lint and Format

`oxlint` (`.oxlintrc.json`) and `oxfmt` (`.oxfmtrc.json`) are ported from the `auba-general-view` project, so the style rules match across both repos: no semicolons, single quotes, `printWidth` 100, `trailingComma: "es5"`, and grouped/sorted imports (builtin+external, then relative, then internal).

The `react` plugin stays enabled for the runtime-agnostic JSX rules (`jsx-key`, `jsx-no-undef`, `jsx-no-duplicate-props`, …), but the rules that assume React's runtime are turned **off** in `.oxlintrc.json` — do not re-enable them:

- `react/no-unknown-property` — flags the `mix` prop and kebab-case SVG attributes (`stroke-width`, `fill-rule`), both of which Remix's JSX runtime accepts.
- `react/display-name` — Remix components are `function Name(handle) { return () => jsx }`, and the returned render closure is misread as an anonymous component.
- `react/rules-of-hooks`, `react/exhaustive-deps`, `react/no-direct-mutation-state`, `react/no-find-dom-node`, `react/no-is-mounted`, `react/no-render-return-value`, `react/no-string-refs`, `react/no-unsafe` — React-only APIs that do not exist here.

`prefer-const` is intentionally left on: it only flags bindings that are never reassigned (props destructuring), and does not conflict with the component model's mutable setup-scope state, which stays `let`.

### Stylelint

`stylelint` (`.stylelintrc.json`) covers `public/static/css/**/*.css` and nothing else. Component styles live in `.styles.ts` as plain objects, and stylelint only parses CSS text, so that whole tier is outside its reach — do not expect it to catch anything under `app/ui/`.

The config is `stylelint-config-standard` plus the few adjustments the hand-written reset needs:

- `property-no-vendor-prefix` is **off**. `-webkit-text-size-adjust`, `-moz-tab-size` and the `appearance` prefixes are deliberate; `--fix` would strip them and change behaviour in Safari.
- `value-keyword-case` ignores `currentColor` and any `--font-family-*` value, so real font names keep their capitals.
- `font-family-no-duplicate-names` ignores `monospace`, because `monospace, monospace` is the normalize-era fix for inherited font sizing.
- `no-descending-specificity` off, `order/properties-alphabetical-order` on — same as the `after_works` config.

**`stylelint --fix` escapes the literal sequence `<style` to `\3c style` when it writes the file**, comments included. The header comment in `app.css` is worded to avoid that sequence; keep it that way or every `stylelint-fix` run will mangle it.

## CI

Workflows live in `.github/workflows/` and mirror the `after_works` / `sugidama` setup.

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `push.yml` | push to any branch | `setup` -> (`lint` / `test`) -> `routes` |
| `automation-pr-label.yml` | PR opened | labels `enhancement` / `bug` from the branch prefix |
| `automation-release-pr.yml` | push to `develop` | opens the `develop` -> `main` release PR |
| `automation-release-note.yml` | push to `main` | cuts a `v{YYYY.MM.DD}-{n}` tag and generates the release note |

The `lint` job runs `format`, `stylelint`, `lint`, `typecheck` in that order.

Remix 3 has no build step, so where the other repos run a `build` job this one runs `routes`. `remix routes --table` loads `app/routes.ts` and every controller it names, which is the closest thing to a build-time check that the route contract still resolves.

Node comes from `.node-version` via `actions/setup-node`'s `node-version-file`, so CI cannot drift from the pin the repo already carries.

There is no `deploy.yml` — no deploy target is configured yet. The labelling workflows need `enhancement`, `bug` and `release` to exist as repository labels.

## Architecture

Remix 3 (`remix@3.0.0-rc.1`), server-first, built on Web `Request`/`Response`. Everything imports from a `remix/<subpath>`; there is no top-level `remix` import.

Request flow: `server.ts` (`node:http` + `createRequestListener`) → `router.fetch(request)` → middleware stack in `app/router.ts` (`staticFiles('./public')` then `render({ assets })`) → the controller mapped for the matched route → a `Response`.

The four pieces that must stay in sync:

- **`app/routes.ts`** — the single source of truth for URLs, shared by server and browser. Add routes here before wiring anything else, and build every internal URL with `routes.<name>.href(...)` rather than a string literal.
- **`app/router.ts`** — builds the middleware stack, derives `AppContext` from it via `MiddlewareContext<[...]>`, publishes that type through `declare module 'remix/router'`, then calls `router.map(routes, controller)`. `router.map` wires only *direct leaf* routes; each nested route map needs its own `router.map(routes.<key>, controller)` line and its own `app/actions/<route-key>/controller.tsx`.
- **`app/actions/controller.tsx`** — `createController(routes, { actions })`, one action per leaf route key. Actions return `Response` objects; UI responses go through `context.render(<Node />)`, which the `render()` middleware provides.
- **`app/env.ts`** — the only module that reads `process.env`. Everything else imports the resolved constants (`NODE_ENV`, `IS_PRODUCTION`, `PORT`, `HMR_PORT`, `APP_PORT`, `BUILD_ID`, `CACHE_BUSTER`, `SITE_URL`, `NO_INDEX`). The port topology lives here because `server.ts` and `hmr.ts` must agree on it. The one exception is the `...process.env` spread in `hmr.ts`, which hands the whole environment to the child process rather than reading a variable.
- **`app/ui/`** — shared cross-route UI, organized by category (see "The `app/ui/` layout" below).
- **`app/assets.ts`** — the browser asset pipeline. `createAssetServer` serves `/assets/*` (routed through the `assets` action in the controller) and gates what can be compiled for the browser via `allowFiles` (`app/routes.ts` and `app/**/public/**`) and `allowPackages`. It computes `entryHref`/`entryPreloads` with top-level `await`, which resolves the entry's dependency graph before the server listens and which `app/actions/document.tsx` injects into `<head>`. A browser module that lives outside a `public/` directory will not compile — put it under the narrowest owner's `public/`.

Development vs. HMR: `npm run dev` runs `server.ts` directly. `npm run hmr` runs `hmr.ts`, which owns the public port and supervises a child `server.ts` (extra `--import remix/ui-hmr/node`) behind `createFetchProxy`. `app/assets.ts` only enables the browser HMR channel and the `uiHmr()` script loader when `REMIX_NODE_HMR` is set by that runner.

## Code Conventions

- TypeScript imports carry their real extension (`./routes.ts`, `./home-page.tsx`) — `allowImportingTsExtensions` plus `verbatimModuleSyntax` are on.
- **Functions are `const` arrows; components are `function` declarations.** A component is anything used as `<X />` — a helper that merely returns a `RemixNode` (`renderMeta()`) stays a `const`. Three reasons for the exception: it is the form Remix's own docs and the skill use, so pasted examples fit; hoisting lets a file lead with its main component and put sub-components after it; and `clientEntry` reads the function's name to know which export to hydrate.
- **Types are `type`, except inside `declare module`.** Module augmentation needs declaration merging, which only `interface` has — `app/router.ts` publishes `AppContext` through `interface RouterTypes`, and turning it into a `type` deletes `context.render` from every controller.
- JSX compiles through `jsxImportSource: "remix/ui"`. **Remix components are not React**: write `function Name(handle: Handle<Props>) { return () => <jsx/> }`, read props from `handle.props`, keep state in setup-scope variables, and call `handle.update()` explicitly to re-render. There are no hooks and no implicit rerendering.
- Styling and behavior attach to host elements through the `mix` prop: `mix={css({...})}`, `mix={on('click', handler)}`, `mix={[styleA, styleB]}` to compose. Keep one-off styles inline; hoist a module-scoped `css(...)` descriptor once it is a reused recipe or large enough to obscure the component.
- Hydrate only where the browser is genuinely needed. `clientEntry(import.meta.url, Component)` (see `app/actions/dev-ui-page/public/components/example-copy-button/`) hydrates one island while the rest of the page stays static HTML; its props must be serializable and extend `SerializableProps`. Get the server-rendered response right before layering interactivity on top.

  Pass a **named function**, not an arrow. `clientEntry` needs the export name and otherwise throws `clientEntry() requires either an export name in the entry ID … or a named component function` at render time — green typecheck, green lint, green tests. The documented alternative, `` `${import.meta.url}#PromptButton` ``, works but puts the export name in a string no rename refactor touches: a stale one still renders and still typechecks, and only hydration in the browser breaks.
- `app/actions/public/entry.ts` is the browser runtime entry (`run(...)` from `remix/ui`) referenced by `app/assets.ts`.

## Growing This App

Follow the placement precedence in the skill: narrowest owner first, then `app/ui/` for cross-route UI, `app/middleware/` for lifecycle concerns, `app/data/` for schema and persistence, `app/utils/` only as a last resort. Do not create `app/lib/`, `app/components/`, or `app/controllers/`.

`app/` top level is for single-instance, app-wide contracts that no narrower owner can hold — `routes.ts`, `router.ts`, `assets.ts`, `env.ts`. Note that only `app/routes.ts` is allow-listed for the browser; everything else at that level is server-only.

`app/actions/home-page.tsx` and `app/actions/document.tsx` are starter scaffolding meant to be replaced.
