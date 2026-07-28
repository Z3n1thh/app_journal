# Privacy Policy — Bujo Mood Tracker

**Last updated:** 2026-07-29  
**Live app:** https://z3n1thh.github.io/app_journal/  
**Source:** https://github.com/Z3n1thh/app_journal

This privacy policy describes how the Bujo Mood Tracker web/native client (“the App”) handles information. It is provided for transparency and is **not legal advice**.

## 1. Who is responsible

The App is an open-source project published by **Z3n1thh**. By default it runs entirely in your browser or on your device. The publisher does **not** operate a central account database for journal contents unless you configure optional third-party services yourself.

## 2. Data the App stores locally

Unless you turn on optional features, your data stays on your device:

- Profile (name, preferences, language, theme)
- Journal entries (mood, habits, notes, photos you add, audio notes, cycle data, medications you log, etc.)
- Backups you export
- PIN / passkey material used only for local lock (as implemented in the App)

Storage mechanisms: browser `localStorage` / IndexedDB, and equivalent on-device storage in native builds.

**The publisher cannot read your local journal data from GitHub Pages hosting alone**, because the hosted site is a static client.

## 3. Data that may leave your device (only if you enable it)

| Feature | What is sent | Where | Who controls credentials |
|---------|--------------|-------|---------------------------|
| Weather | Location coordinates / city search needed for forecast | Open-Meteo | None (public API) |
| Cloud sync | Your journal JSON blob | Your Supabase project | **You** (URL + anon key) |
| AI summary | Summarized journal text you choose to send | OpenAI or Anthropic | **You** (API key) |
| Health sync | Sleep / steps (native) | OS Health APIs → App storage | OS permissions you grant |
| Notifications | Local only (device) | Your device | You |

Disable these features in Settings if you do not want that data shared with those providers. Their privacy policies apply to data you send them.

## 4. Photos, health, and sensitive content

The App may store sensitive personal data you choose to enter (mood, menstrual cycle, medications, photos, voice notes). Treat exported backups as confidential. Do not share Sync IDs, API keys, or encrypted-backup passwords.

## 5. Children

The App is not directed at children under 13 (or the minimum age in your country). Do not use it to collect data from children if that would violate local law.

## 6. Analytics / ads / tracking

The core App does not include third-party advertising SDKs or analytics trackers as part of this repository. Loading Google Fonts or calling Open-Meteo may expose your IP address to those providers when those features load.

## 7. Your choices

- Export or delete data via Settings (backup / reset)
- Turn off weather, cloud sync, AI, and health sync
- Clear site data in your browser, or uninstall the native app

## 8. Changes

Updates to this policy will be posted in this repository (`PRIVACY.md`) and/or the hosted docs. Continued use after changes means you accept the updated policy where applicable.

## 9. Contact

Open an issue on the GitHub repository: https://github.com/Z3n1thh/app_journal/issues
