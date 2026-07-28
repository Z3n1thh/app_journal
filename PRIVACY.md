# Privacy Policy — Bujo Mood Tracker

**Last updated:** 2026-07-29  
**App / site:** https://z3n1thh.github.io/app_journal/  
**Source:** https://github.com/Z3n1thh/app_journal

This privacy policy describes how **Bujo Mood Tracker** (“the App”) handles information when you use the web app or a self-built native build.

> This document is a good-faith privacy notice for a local-first hobby/open-source journal app. It is **not legal advice**.

---

## 1. Summary

- Journal data is stored **on your device** (browser `localStorage` / IndexedDB, or native app storage).
- The App authors **do not** run a central database that collects your journal entries by default.
- Optional features may send limited data to **third-party services you enable** (weather, your own Supabase project, or AI providers with **your** API key).

---

## 2. Data stored on your device

Depending on what you log, the App may store locally:

- Profile details (name, preferences, language, theme)
- Daily entries (mood, energy, habits, notes, tags, photos, voice notes, etc.)
- Goals, collections, reflections, achievements
- Optional PIN hash / passkey credentials (device-bound)
- Optional API keys you paste for sync or AI (stored locally)

**You** control this data. Use Settings → Backup to export or delete. Clearing site data / uninstalling removes local storage.

---

## 3. Data we (the GitHub Pages / repo owners) do not collect by default

Hosting the static site on **GitHub Pages** means GitHub may process standard web hosting / CDN logs according to GitHub’s policies. The App itself does not include analytics SDKs (e.g. Google Analytics) in this repository as of the date above.

See also: [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).

---

## 4. Optional third-party processing (only if you enable it)

| Feature | What may leave your device | Who receives it |
|---------|----------------------------|-----------------|
| Weather | Approximate location (if you allow) + date | Open-Meteo |
| Cloud sync | Encrypted or plain backup blob (as configured) | **Your** Supabase project |
| AI weekly summary | Aggregated weekly journal context + your API key | OpenAI or Anthropic (your choice) |
| Health sync (native) | Sleep / steps via OS health APIs | Stays in OS health frameworks → imported into local entries |

Disable these features if you do not want that data shared. Review each provider’s privacy policy before enabling.

---

## 5. Children

The App is not directed at children under 13 (or the minimum age in your jurisdiction). Do not use it to store data about children in a way that violates local law.

---

## 6. Your choices

- Do not enable weather, sync, AI, or health features.
- Export and delete backups anytime.
- Use a PIN / passkey for local access control (does not encrypt all data at rest in the browser by default unless you use encrypted backup).

---

## 7. Contact

For privacy questions about this open-source project, open an issue on the GitHub repository:  
https://github.com/Z3n1thh/app_journal/issues

---

## 8. Changes

Updates to this policy will be reflected by changing the “Last updated” date and committing to the repository / GitHub Pages deployment.
