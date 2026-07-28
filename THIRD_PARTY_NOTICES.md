# Third-party notices & attributions

Bujo Mood Tracker includes or calls the following third-party software and services.
This file is for attribution and license compliance. It is **not** legal advice.

---

## Direct npm dependencies

| Package | License | Homepage / source |
|---------|---------|-------------------|
| `react` | MIT | https://github.com/facebook/react |
| `react-dom` | MIT | https://github.com/facebook/react |
| `html2canvas` | MIT | https://github.com/niklasvh/html2canvas |
| `@capacitor/core` | MIT | https://github.com/ionic-team/capacitor |
| `@capacitor/cli` | MIT | https://github.com/ionic-team/capacitor |
| `@capacitor/android` | MIT | https://github.com/ionic-team/capacitor |
| `@capacitor/ios` | MIT | https://github.com/ionic-team/capacitor |
| `@capacitor/local-notifications` | MIT | https://github.com/ionic-team/capacitor-plugins |
| `@capgo/capacitor-health` | **MPL-2.0** | https://github.com/Cap-go/capacitor-health |

Transitive dependencies are predominantly MIT / ISC / Apache-2.0 / BlueOak-1.0.0 / 0BSD / Unlicense.
Full production tree: run `npx license-checker --production` in this repository.

### MPL-2.0 note (`@capgo/capacitor-health`)

This package is licensed under the Mozilla Public License 2.0. Unmodified use as an npm dependency is permitted. If you modify MPL-covered source files from that package, you must make those modifications available under MPL-2.0. See: https://www.mozilla.org/en-US/MPL/2.0/

---

## Fonts (Google Fonts CDN)

Loaded at runtime from Google Fonts:

| Font | License | Designer / notes |
|------|---------|------------------|
| **Inter** | SIL Open Font License 1.1 | https://github.com/rsms/inter |
| **Caveat** | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Caveat |

OFL FAQ: https://scripts.sil.org/OFL

Using fonts via the Google Fonts CSS API is subject to [Google Fonts Terms](https://developers.google.com/fonts/faq/legal).

---

## External APIs & services (optional / user-configured)

### Open-Meteo (weather)

- Endpoints: `api.open-meteo.com`, `archive-api.open-meteo.com`
- Used for optional weather linked to journal entries
- No API key is stored in this repository
- Weather data by **Open-Meteo.com** — https://open-meteo.com/
- Review their terms / non-commercial vs commercial use: https://open-meteo.com/en/terms

### Supabase (optional cloud sync)

- User supplies their own **project URL** and **anon key** in Settings
- This project does not ship Supabase credentials
- Subject to [Supabase Terms](https://supabase.com/terms) and your project’s RLS policies

### OpenAI (optional AI summaries)

- User supplies their own API key in Settings
- Calls `https://api.openai.com` only when enabled by the user
- Subject to [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) and usage policies

### Anthropic / Claude (optional AI summaries)

- User supplies their own API key in Settings
- Calls `https://api.anthropic.com` only when enabled by the user
- Subject to [Anthropic Terms](https://www.anthropic.com/legal/consumer-terms)

### Apple Health / Google Health Connect (native builds)

- Accessed only via `@capgo/capacitor-health` when the user enables Health sync and grants OS permissions
- Subject to Apple / Google platform policies and HealthKit / Health Connect rules

### GitHub Pages hosting

- Static hosting of this client app may be served from GitHub Pages
- Subject to [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)

---

## Trademark notice

Product names, logos, and brands (OpenAI, Anthropic, Supabase, Apple, Google, Capacitor, React, etc.) are property of their respective owners. Use here is for identification and attribution only.
