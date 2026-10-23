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
- Plant map labels use % coordinates over a 16:9 cover container so they stay aligned with the mockup image.
- All quality screens share src/app/PanelLayout.tsx; local Zustand session guards run after hydration because the demo has no server authentication.
- Quality mutations use pure domain validation and a shared append-only local audit store; product versions are copied, never overwritten, so historical lot approval versions remain stable.
- Panel tables use the shared useSortableTable hook and native HTML tables, never TanStack Table.
- Shared brand placements use src/ui/logo.tsx and the uploaded asset pointer; the favicon is a small raster derived from the same source so identity stays consistent.
