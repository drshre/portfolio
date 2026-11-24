# shreyasparat.com — 3D portfolio

Next.js (App Router) port of the "Shreyas Parat Portfolio, 3D Scene" artifact.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a new GitHub repo:
   ```bash
   git init && git add . && git commit -m "3D portfolio"
   gh repo create shreyas-portfolio --private --source=. --push
   ```
2. In Vercel: **Add New → Project → Import** the repo. Framework is detected as Next.js; no settings to change.
3. Add your domain under **Settings → Domains**.

Or skip GitHub: `npx vercel` from this folder, then `npx vercel --prod`.

## Where things live

| File | What it is |
| --- | --- |
| `app/globals.css` | All the page styles (straight from the artifact) |
| `app/markup.ts` | The static page markup the scene attaches to |
| `app/layout.tsx` | `<head>`: title, description, Open Graph, Google Fonts |
| `app/scene-loader.tsx` | Loads the three.js libs and scene script in order, client-side |
| `public/content.js` | All project content (`PROJECTS`, `DETAILS`, `ASSETS`) and the about/project page templates, shared by both views |
| `public/scene.js` | The 3D meadow |
| `app/list/` + `public/list.js` | The list view at `/list`: about page with a signpost to every project, no 3D |
| `public/lib/` | three.js + loaders |
| `public/models/` | One `.glb` per project (meshopt-compressed) |

To edit project copy, links or media, change `public/content.js`; both views pick it up.
Files under `/lib` and `/models` are served with a one-year immutable cache header (see `next.config.ts`).
To replace a model, overwrite `public/models/<id>.glb` and bump `MODEL_VERSION` in both
`public/scene.js` and `app/page.tsx`. To replace a lib file, rename it.

## Project pages

Project page copy comes from `app/case-studies.json` (hook, premise, beats, "ask me about", role, years, platform,
stack, status). Entries are matched to scene objects by `id` or `name`, and any non-empty field overrides the
defaults in `PROJECTS` / `DETAILS` in `public/content.js`. To update copy, replace `app/case-studies.json` with a
fresh export. Projects without an entry (currently Starling) fall back to their `DETAILS` copy.
