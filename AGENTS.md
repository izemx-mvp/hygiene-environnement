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

## Architecture
- App state is an in-memory mock store (`src/lib/store.ts`, `useSyncExternalStore`); selectors must return stable references (no `.filter` inside `useStore`) to avoid render loops. Why: MVP is frontend-only simulation.
- Authenticated app pages live under the pathless `_app` layout (AppShell); the public client form is `/f/$code`. Why: keeps sidebar/header out of client-facing pages.
