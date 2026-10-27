<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Puerto Marino
- Routing stays on TanStack Router (platform requirement); route files in src/routes are thin wrappers that render screens from src/features/*.
- Do not add a QueryClient or query provider; simulated data and interactive screens use local state, while mandatory TanStack Start routing remains intact.
- Pure business rules live in src/domain, typed mock data in src/mocks; no backend — all data simulated.
- Offline storage via Dexie in src/offline/db.ts, guarded for SSR (getDb returns null without indexedDB).
- The plant map is a lazily loaded client-only R3F scene (Planta3D) driven by the GLB asset and its manifest; manifest station ids map to ZonaId so the 3D model and domain stay decoupled.
- All quality screens share src/app/PanelLayout.tsx; local Zustand session guards run after hydration because the demo has no server authentication.
- Quality mutations use pure domain validation and a shared append-only local audit store; product versions are copied, never overwritten, so historical lot approval versions remain stable.
- Panel tables use the shared useSortableTable hook and native HTML tables, never TanStack Table.
- Shared brand placements use src/ui/logo.tsx and the uploaded asset pointer; the favicon is a small raster derived from the same source so identity stays consistent.
- R3F elements and drei components in Planta3D carry data-tsd-source={undefined}, because the dev source-injection plugin otherwise passes a dashed prop that R3F crashes on.
- Editable quality matrices retain immutable snapshots in the shared quality store and use their own level type; this preserves legacy station rules and historical approvals.
- The sanitary category list is shared between catalog and matrix so both grow together without duplicate category definitions.
- CF-1 reuses the reception scale hook with an optional simulation interval and isolated weight validation; manual authorization remains explicitly simulated.
- Personal/BPM and allergens use a dedicated local Zustand store with immutable snapshots and append events to the shared quality audit; this keeps simulated module data isolated without a backend.
- Allergen wizard steps use a single validated dynamic leaf route and session draft state; navigation changes the URL without losing edits.
- Barcode rendering and PDF/Excel libraries load only inside browser effects or actions; this avoids browser-only work during SSR and defers export costs.
- The data model (65 tables + SaldoLote view) lives isolated in src/modelo: one declarative schema derives TS row types, Dexie indexes (separate "puerto-marino-modelo" DB), PostgreSQL SQL and integrity checks; only the /panel/modelo-datos route and one nav entry touch the rest of the app, so it can be removed cleanly.
- El control de acceso del panel vive en src/domain/permisos.ts (matriz PERMISOS + banderas CONFIG_PERMISOS mutables); la sesión de rol en src/features/auth/sesionPanel.ts se hidrata desde sessionStorage solo en cliente (hidratar()) para no romper SSR, y los componentes de permiso están en src/ui/permisos.
