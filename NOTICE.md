# Third-party notices & attributions

This file lists open-source components and external services used by **Bujo Mood Tracker**.
Full license texts for npm packages are available in each package under `node_modules/<package>/` (or on the linked project pages).

Bujo Mood Tracker itself is licensed under the **MIT License** (see [`LICENSE`](./LICENSE)).

---

## Application dependencies (runtime)

| Package | License | Notes |
|---------|---------|--------|
| [react](https://reactjs.org/) | MIT | UI library |
| [react-dom](https://reactjs.org/) | MIT | React DOM renderer |
| [html2canvas](https://html2canvas.hertzen.com/) | MIT | Month image export |
| [@capacitor/core](https://capacitorjs.com/) | MIT | Native runtime |
| [@capacitor/android](https://capacitorjs.com/) | MIT | Android bridge |
| [@capacitor/ios](https://capacitorjs.com/) | MIT | iOS bridge |
| [@capacitor/local-notifications](https://capacitorjs.com/) | MIT | Local notifications |
| [@capgo/capacitor-health](https://capgo.app/docs/plugins/health/) | **MPL-2.0** | HealthKit / Health Connect bridge |

### MPL-2.0 note (`@capgo/capacitor-health`)

This dependency is licensed under the Mozilla Public License 2.0. If you modify **MPL-covered source files** from that package and distribute them, you must comply with MPL-2.0 (including source availability for those files). Using the package as an unmodified dependency in this app does not re-license your own MIT-licensed application code.

---

## Build / development tools

| Package | License |
|---------|---------|
| [vite](https://vite.dev/) | MIT |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | MIT |
| [vitest](https://vitest.dev/) | MIT |
| [@playwright/test](https://playwright.dev/) | Apache-2.0 |
| [@capacitor/cli](https://capacitorjs.com/) | MIT |

---

## Fonts (Google Fonts CDN)

Loaded in `index.html` via Google Fonts:

| Font | License |
|------|---------|
| [Inter](https://fonts.google.com/specimen/Inter) | SIL Open Font License 1.1 |
| [Caveat](https://fonts.google.com/specimen/Caveat) | SIL Open Font License 1.1 |

OFL allows free use, modification, and redistribution with attribution; font names must not be used to promote derived fonts without permission. See: https://openfontlicense.org/

---

## External APIs & services (optional / user-configured)

These are **not bundled**. They are called only when the user enables a feature or supplies credentials.

| Service | When used | Terms / attribution |
|---------|-----------|---------------------|
| [Open-Meteo](https://open-meteo.com/) | Weather attach (if enabled) | Free non-commercial / open weather API. Weather data attribution: **Open-Meteo.com**. See https://open-meteo.com/en/terms |
| [Supabase](https://supabase.com/) | Optional cloud sync (user’s project) | User’s Supabase project & keys. Subject to Supabase Terms: https://supabase.com/terms |
| [OpenAI](https://openai.com/) | Optional AI weekly summary (user API key) | User’s OpenAI account. Subject to OpenAI Terms: https://openai.com/policies/terms-of-use |
| [Anthropic](https://www.anthropic.com/) | Optional AI weekly summary (user API key) | User’s Anthropic account. Subject to Anthropic Terms: https://www.anthropic.com/legal/consumer-terms |
| [Google Fonts](https://fonts.google.com/) | Font CSS/files from Google CDN | Google Fonts FAQ / OFL fonts as above |

API keys for OpenAI, Anthropic, and Supabase are entered by the user and stored **only on their device** (browser storage / app storage). This project does not operate those services or process keys on a central server.

---

## Icons & branding

App icons under `public/icon-*.svg` are part of this project and covered by the MIT License unless otherwise noted.

---

## Disclaimer

This NOTICE is provided for transparency and open-source compliance hygiene. It is **not legal advice**. License obligations can depend on how you modify and redistribute the software. If you need certainty for commercial distribution, consult a qualified attorney.
