# GitHub Pages hosting

Live app: **https://z3n1thh.github.io/app_journal/**

## One-time setup (GitHub repo Settings)

1. Open [Settings → Pages](https://github.com/Z3n1thh/app_journal/settings/pages)
2. **Build and deployment → Source:** choose **GitHub Actions** (not “Deploy from a branch”)
3. If you previously used branch deploy, disable it — otherwise you’ll see extra failed `pages build and deployment` runs

## Deploys

- Workflow: `.github/workflows/pages.yml`
- Triggers on push to **`main` only**
- Build: `GITHUB_PAGES=true npm run build:pages`

## Troubleshooting failed deploys

| Symptom | Fix |
|---------|-----|
| `deploy` job failed, `build` succeeded | Enable **GitHub Actions** as Pages source (step above) |
| Deploy from `master` branch failed | Push to **`main`** instead — only `main` deploys |
| Blank / 404 on refresh | Fixed via `404.html` + `.nojekyll` in build |

## Install as PWA

Open the live URL on mobile → **Add to Home Screen**.
