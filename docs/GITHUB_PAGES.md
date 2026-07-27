# GitHub Pages hosting

Live app: **https://z3n1thh.github.io/app_journal/**

## One-time setup (GitHub repo Settings)

1. Open [github.com/Z3n1thh/app_journal/settings/pages](https://github.com/Z3n1thh/app_journal/settings/pages)
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**
3. Push to `main` — the **Deploy GitHub Pages** workflow builds and publishes automatically

## How it works

- Workflow: `.github/workflows/pages.yml`
- Build command: `GITHUB_PAGES=true npm run build:pages`
- Vite `base` is set to `/app_journal/` for correct asset paths on Pages

## Install as PWA from Pages

On mobile, open the live URL → browser menu → **Add to Home Screen**.

## Custom domain (optional)

In repo **Settings → Pages → Custom domain**, add your domain and follow GitHub’s DNS instructions.
