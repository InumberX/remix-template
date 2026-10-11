# Remix 3 Agent Guide

This app was scaffolded with `remix new`. Use these conventions when continuing to build it out.

## Commands

```sh
npm i
npm run dev
npm run hmr
npm run start
npm test
npm run typecheck
```

## Building Features

Refer to ./.agents/skills/remix/SKILL.md for the Remix mental model and how to find guides and API READMEs through `node_modules/remix/INDEX.md`. Project-specific conventions are in `CLAUDE.md`.

## Starter Layout

- `app/routes.ts` defines the shared route contract used by server and browser modules for type-safe hrefs
- `app/router.ts` wires routes to route handlers and installs the standard Remix component renderer used by actions
- `app/assets.ts` owns the server-side asset pipeline used by the asset route and render middleware
- `app/env.ts` is the only module that reads `process.env`; everything else imports the resolved constants
- `app/actions/controller.tsx` owns the direct leaf route actions (`assets`, `home`, `devUi`)
- `app/actions/<route-key>/controller.tsx` owns a nested route map (`articles/`)
- `app/actions/<route-key>-page/<route-key>-page.tsx` renders one page; `document.tsx` and `meta.tsx` are the shared shell and metadata defaults
- `app/actions/**/public/` contains browser-reachable source — the runtime entry (`app/actions/public/entry.ts`) and hydrated components
- `app/ui/` holds cross-route UI: `primitives/` (unstyled skeletons), `<category>/` (styled components), `styles/public/` (tokens and query constants), `types/`
- Root `public/` contains static files served unchanged from the app root, including the cascade layer order in `static/css/app.css`
- `server.ts` runs the app; `hmr.ts` supervises it behind an HMR proxy for `npm run hmr`

## Route Ownership

- Start from `app/routes.ts` and map each route to the narrowest owner on disk.
- Put top-level route actions in `app/actions/controller.tsx`.
- Add `app/actions/<route-key>/controller.tsx` for nested route maps that need their own actions or middleware.
- Keep route-owned page modules next to the route that owns them.
- Move shared UI to `app/ui/`, not `app/actions/`.

- A controller's `actions` object contains only direct leaf route keys; nested route maps get their own controller and an explicit `router.map(routes.<routeKey>, controller)` line.
- Name directories under `app/actions/` after route-map keys, not URL path segments.
- Controller middleware does not protect other controllers; add it to each controller that needs it.

## Placement Precedence

When code could live in more than one place:

1. Put it in the narrowest owner first; if it belongs to one route, keep it with that route.
2. Shared UI across route areas goes in `app/ui/`.
3. Request lifecycle setup (auth, sessions, uploads, database injection) goes in `app/middleware/`.
4. Schema, queries, persistence and startup data logic go in `app/data/`.
5. `app/utils/<topic>.ts` only as a last resort, for pure cross-layer helpers that import nothing from `app/actions/` or response/render APIs.

## Build-Out Notes

- This starter intentionally begins small; add directories like `app/data/`, `app/middleware/` and `test/` only when you need them.
- Avoid generic dumping-ground directories: no `app/lib/`, no `app/components/` (that is `app/ui/`), no `app/controllers/` (that is `app/actions/`).
- Do not register app leaf routes directly in `app/router.ts`; they belong in a controller.
