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

Refer to ./.agents/skills/remix/SKILL.md

## Starter Layout

- `app/routes.ts` defines the shared route contract used by server and browser modules for type-safe hrefs
- `app/router.ts` wires routes to route handlers and installs the standard Remix UI renderer used by actions
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

## Build-Out Notes

- This starter intentionally begins small; add directories like `app/data/` and `test/` only when you need them.
- Prefer putting code in the narrowest owner before introducing shared modules.
- Avoid generic dumping-ground directories like `app/lib/` or `app/components/`.
