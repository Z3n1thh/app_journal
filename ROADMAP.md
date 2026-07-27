# Bujo Mood Tracker — Roadmap & implementationsguide

> **Syfte:** Denna fil dokumenterar allt som byggts, vad som fixats, och vad som kan läggas till **steg för steg**.  
> Använd den som checklista när du (eller Cursor) ska fortsätta utveckla appen.  
> **Projektmapp:** `Test_app` · **Version:** 2.0.0 · **Stack:** React + Vite + localStorage/IndexedDB

---

## Snabbstart

```bash
cd Test_app
npm install
npm run dev          # http://localhost:5173
npm run test         # 25 enhetstester
npm run test:e2e     # 2 Playwright-tester
npm run build        # produktion
```

---

## Sidor i appen

| Sida | Fil | Navigering |
|------|-----|------------|
| Kalender | `src/pages/CalendarPage.jsx` | Sidomeny / bottennav |
| Vecka | `src/pages/WeeklyPage.jsx` | Sidomeny / bottennav |
| Spårning | `src/pages/TrackingPage.jsx` | Sidomeny / bottennav |
| Insikter | `src/pages/InsightsPage.jsx` | Sidomeny / bottennav |
| Samlingar | `src/pages/CollectionsPage.jsx` | Sidomeny / **Mer** (mobil) |
| Sök | `src/pages/SearchPage.jsx` | Sidomeny / **Mer** (mobil) |
| Inställningar | `src/components/Settings.jsx` | Sidomeny / **Mer** (mobil) |
| Mer (mobil) | `src/pages/MobileMorePage.jsx` | Bottennav → ⋯ |

---

# DEL 1 — Redan implementerat (klart)

## 1.1 Kärnfunktioner
- [x] Onboarding (namn, kön, språk, menscykel med skip)
- [x] Dagmodal: humör, energi, sömn, vatten, vanor, taggar, tacksamhet, prioriteringar, anteckningar
- [x] Kopiera igår i dagmodal
- [x] Trigger-log (“Vad kan ha påverkat?”)
- [x] Foto per dag (komprimerat, base64)
- [x] Röstanteckning per dag (MediaRecorder, base64)
- [x] Snabblogg på Spårning-sidan
- [x] Månadsintention
- [x] Månadsreflektion
- [x] Veckoreflektion
- [x] Månadsmål med progress (+1 knapp)
- [x] Mål kopplade till vanor (auto +1 vid checkad vana)
- [x] Vanor: skapa, redigera, ta bort, dra/↑↓ sortera
- [x] Menscykel i kalender + förutsägelse från profil
- [x] Streaks (dagar + vanor)
- [x] Mörkt/ljust tema + egen accentfärg
- [x] Temapaket: Classic, Forest, Lavender, Midnight
- [x] PIN-lås + Passkey (WebAuthn)
- [x] Daglig påminnelse (notifikationer)
- [x] Backup-påminnelse + auto-export var 7:e dag

## 1.2 Sidor & vyer
- [x] Kalender med taggfilter
- [x] Veckovy + kopiera förra veckan
- [x] Insikter: humörtrend (30 dagar), heatmap, korrelationer, taggmönster
- [x] Jämför månader (denna vs förra)
- [x] Årsöversikt (“2026 in review”)
- [x] Veckosammanfattning (regelbaserad)
- [x] Samlingar (bullet-listor)
- [x] Sök i anteckningar/taggar/humör
- [x] Box-andnings-timer

## 1.3 Data & säkerhet
- [x] localStorage för all data
- [x] IndexedDB-migration (`src/utils/db.js` — delvis, speglar fortfarande till localStorage)
- [x] JSON-backup: export, import, merge, urklipp
- [x] Krypterad backup (export + import med lösenord)
- [x] CSV-export, PDF/print, terapeut-sammanfattning
- [x] Månadsbild-export (SVG → canvas, kan vara opålitlig)
- [x] Valfri molnsync via Supabase REST (`src/utils/sync.js`)
- [x] Par-läge: flera profiler, byt profil i Inställningar

## 1.4 UX & PWA
- [x] Sidomeny (desktop) + bottennav (mobil)
- [x] PWA manifest + service worker
- [x] Installations-banner
- [x] Genvägar i manifest (Log today, Calendar)
- [x] Tangentbordsgenvägar: `N` ny entry, `/` sök, `←/→` månad, `?` tour
- [x] Undo-toast efter raderad dag
- [x] Onboarding-tur första gången
- [x] 6 språk: en, es, fr, de, nl, sv (+ localeExtras.js)

## 1.5 Tester
- [x] Vitest: constants, insights, search, crypto, pin, summary
- [x] Playwright: app laddar, `/` öppnar sök

---

# DEL 2 — Buggar som fixats (lärdomar)

| Problem | Orsak | Fix | Fil |
|---------|-------|-----|-----|
| Insikter fungerade inte | `computeInsights` användes utan import | Lade till `import { computeInsights } from '../utils/insights'` | `InsightsPage.jsx` |
| Samlingar fungerade inte | `CollectionsPage` användes utan import | Lade till import i `App.jsx` | `App.jsx` |

**Regel vid nya sidor:** Kontrollera alltid att sidkomponenten är importerad i `App.jsx` och att alla utils-funktioner har import.

---

# DEL 3 — Polera först (prioritet 1)

## Steg 3.1 — Granska alla sidor mot import-fel ✅

**Mål:** Inga sidor ska krascha p.g.a. saknade imports.

- [x] Verifierat imports i `App.jsx` — build grön
- [x] Alla sidor importerade och fungerande

**Filer:** `src/App.jsx`, alla `src/pages/*.jsx`

---

## Steg 3.2 — Flytta all lagring till IndexedDB ✅

**Mål:** Slipp 5 MB localStorage-gräns (foton/röst fyller snabbt).

- [x] `storage.js` använder `storageGet()` / `storageSet()` från `db.js`
- [x] `loadAllFromStorage()` async init i `App.jsx`
- [x] localStorage som fallback/spegling
- [x] Varning i Inställningar när lagring > 80%

**Filer:** `src/storage.js`, `src/utils/db.js`, `src/App.jsx`

---

## Steg 3.3 — Supabase molnsync guide i appen ✅

**Mål:** Användaren ska kunna sätta upp sync utan att gissa.

- [x] `docs/SUPABASE_SETUP.md` + `public/docs/SUPABASE_SETUP.md`
- [x] Steg-för-steg i `Settings.jsx` när sync är av

**Filer:** `src/components/Settings.jsx`, `docs/SUPABASE_SETUP.md`

---

## Steg 3.4 — Förbättra månadsbild-export ✅

**Mål:** Tillförlitlig PNG av kalendern.

- [x] `html2canvas` som dependency
- [x] Uppdaterad `exportMonthImage()` i `src/utils/export.js`
- [x] Navigerar till kalender automatiskt vid export från Inställningar

**Filer:** `src/utils/export.js`, `src/components/Settings.jsx`

---

# DEL 4 — Daglig användning (prioritet 2)

## Steg 4.1 — Achievements / badges ✅

- [x] `src/constants/achievements.js`
- [x] `src/utils/achievements.js`
- [x] Sparas i `bujo-achievements`
- [x] Visas på Spårning-sidan
- [x] Toast vid ny upplåsning
- [x] Översättningar (en + sv via localeExtras)

---

## Steg 4.2 — Påminnelser per vana ✅

- [x] Habit-objekt med `reminder: { enabled, time }`
- [x] Tidväljare i `HabitManager.jsx`
- [x] `scheduleHabitReminders()` i `notifications.js`

---

## Steg 4.3 — Förbättrad PWA / widget ✅

- [x] Fler shortcuts i `manifest.webmanifest`
- [x] `?action=quicklog` öppnar QuickLog-modal
- [x] iOS-installationshint i `InstallPrompt.jsx`

---

## Steg 4.4 — Sök med datumintervall ✅

- [x] Filter `from`, `to`, `tags`, `mood` i `search.js`
- [x] UI i `SearchPage.jsx`
- [x] Resultat grupperade per månad

---

# DEL 5 — Wellness & bujo (prioritet 3)

## Steg 5.1 — Medicin / kosttillskott ✅

- [x] `medications: []` i dagposter
- [x] Sektion i `DayModal.jsx`
- [x] Vanliga mediciner i profil (Inställningar)
- [x] Insikter: medicinräkning denna månad
- [x] Backup v4

---

## Steg 5.2 — Väder kopplat till humör ✅

- [x] `src/utils/weather.js` (Open-Meteo)
- [x] Plats i profil + toggle i Inställningar
- [x] Sparas i `entry.weather`
- [x] Insikter: väder vs humör

---

## Steg 5.3 — Journal prompts (guidad reflektion) ✅

- [x] `src/constants/prompts.js` — 32 frågor
- [x] Dagens fråga på Spårning + dagmodal
- [x] Sparas i `entry.promptAnswer`
- [x] en + sv

---

## Steg 5.4 — Collections-mallar ✅

- [x] `src/constants/collectionTemplates.js`
- [x] Knapp “Lägg till mall” på Samlingar

---

## Steg 5.5 — Trigger-analys ✅

- [x] `getTriggerInsights()` i `insights.js`
- [x] Kort på Insikter-sidan

---

## Steg 5.6 — Morgon/kväll-rutin ✅

- [x] `DEFAULT_ROUTINES` + `routineChecks` i entry
- [x] QuickLog-flikar Morgon/Kväll

---

# DEL 6 — Export & utskrift (prioritet 3)

## Steg 6.1 — Månads-spread PDF (bujo-layout) ✅

- [x] `exportMonthSpreadPDF()` i `export.js`
- [x] Knapp i Inställningar

---

## Steg 6.3 — Dela månad som snygg bild ✅

- [x] `exportShareCard()` — 1080×1080 canvas
- [x] Humörfördelning + streak + månad + namn
- [x] Knapp i Inställningar

---

## Steg 6.2 — Årsbok PDF ✅

- [x] `exportYearBook()` i `export.js`
- [x] Sektioner per månad + `computeYearReview()`
- [x] Knapp i Inställningar

---

## Steg 7.1 — Delade insikter mellan profiler ✅

- [x] `CouplePage.jsx` — “Vi två”, veckojämförelse
- [x] Välj partner från dropdown

---

## Steg 7.2 — Gemensam veckovy ✅

- [x] `CoupleWeekPage.jsx` — två kolumner
- [x] Navigering från Vi två + sidomeny (vid 2+ profiler)

---

# DEL 8 — Tekniskt & proffsigt (prioritet 4)

## Steg 8.1 — Fler tester ✅

- [x] `src/storage.test.js` — backup roundtrip
- [x] `src/utils/import.test.js` — Daylio CSV
- [x] `src/utils/insights.triggers.test.js` — trigger/medicin

---

## Steg 8.2 — GitHub Actions CI ✅

- [x] `.github/workflows/ci.yml`

---

## Steg 8.3 — Import från Daylio / CSV ✅

- [x] `src/utils/import.js`
- [x] Inställningar → “Importera Daylio CSV”

---

# DEL 9 — “Wow”-funktioner (prioritet 5)

## Steg 9.1 — AI-veckosammanfattning ✅ (regelbaserad)

- [x] Utökad `generateWeeklySummary()` — fler mönster (lågt/bra humör, stress, tacksamhet)

---

## Steg 9.2 — Animerad humör-trend ✅

- [x] SVG stroke-animation i `MoodTrendChart.jsx`

---

## Steg 9.3 — Säsongstemen ✅

- [x] Vår/sommar/höst/vinter i `themes.js`
- [x] “Automatiskt säsongstema” i Inställningar

---

## Steg 9.4 — Streak-notifikationer ✅

- [x] Milestones 7/14/30/100 dagar vid sparad dag
- [x] Kopplat till achievements-systemet

---

# DEL 10 — Fas E (implementerad)

## Steg 8.4 — Native app (Capacitor) ✅

- [x] `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/local-notifications`
- [x] `capacitor.config.json` + `npm run cap:sync` / `cap:android` / `cap:ios`
- [x] `src/utils/native.js` — plattformsdetektion + init
- [x] Notiser via Capacitor Local Notifications (fallback web)
- [x] `docs/CAPACITOR_SETUP.md` + guide i Inställningar

---

## Steg 8.5 — Health sync (Apple Health / Google Fit) ✅

- [x] `@capgo/capacitor-health` (HealthKit + Health Connect)
- [x] `src/utils/health.js` — sömn + steg → `sleepHours` / `steps`
- [x] Inställningar: toggle + manuell sync
- [x] Auto-sync vid appstart när aktiverat

---

## Steg 9.1 — AI via API (OpenAI/Claude) ✅

- [x] `src/utils/aiSummary.js` — OpenAI + Anthropic
- [x] Inställningar: provider, API-nyckel, modell
- [x] Veckosammanfattning på Insikter (fallback till regelbaserad)

---

# DEL 11 — Filreferens (var saker bor)

```
Test_app/
├── capacitor.config.json
├── android/                ← Capacitor Android-projekt
├── docs/
│   ├── SUPABASE_SETUP.md
│   └── CAPACITOR_SETUP.md
├── package.json
├── playwright.config.js
├── e2e/
│   └── app.spec.js
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icon-*.svg
└── src/
    ├── App.jsx             ← huvudstate, routing, alla imports här!
    ├── main.jsx
    ├── index.css
    ├── constants.js        ← humör, vanor, emptyDayEntry()
    ├── storage.js          ← localStorage + backup
    ├── components/
    │   ├── DayModal.jsx
    │   ├── Settings.jsx
    │   ├── SideNav.jsx
    │   ├── BottomNav.jsx
    │   └── ...
    ├── pages/
    │   ├── CalendarPage.jsx
    │   ├── InsightsPage.jsx
    │   ├── CollectionsPage.jsx
    │   └── ...
    ├── utils/
    │   ├── insights.js
    │   ├── summary.js
    │   ├── sync.js
    │   ├── crypto.js
    │   ├── export.js
    │   ├── db.js
    │   ├── health.js
    │   ├── aiSummary.js
    │   ├── native.js
    │   └── passkey.js
    └── i18n/
        ├── translations.js
        └── localeExtras.js
```

---

# DEL 11 — localStorage-nycklar

| Nyckel | Innehåll |
|--------|----------|
| `bujo-profile` | Användarprofil, PIN, sync-config, reminders |
| `bujo-entries` | Alla dagposter `{ "2026-07-27": { mood, ... } }` |
| `bujo-habits` | Vanor-array |
| `bujo-moods` | Anpassade humör-emojis |
| `bujo-collections` | Bullet-listor |
| `bujo-reflections` | Månads + vecko reflektioner |
| `bujo-intentions` | Månadsintentioner |
| `bujo-goals` | Månadsmål |
| `bujo-theme` | light/dark |
| `bujo-language` | en/sv/... |
| `bujo-accent` | accentfärg hex |
| `bujo-last-backup` | ISO-datum |
| `bujo-tour-done` | "1" om tour visats |
| `bujo-profiles-meta` | Par-läge profiler |
| `bujo-profile-data-{id}` | Snapshot per profil |
| `bujo-achievements` | Upplåsta badges |

---

# DEL 12 — Rekommenderad ordning att implementera

```
Fas A — Stabilitet ✅ KLART
  3.1 Granska imports
  3.2 IndexedDB
  3.3 Supabase-guide
  3.4 Månadsbild-export

Fas B — Daglig glädje ✅ KLART
  4.1 Achievements
  4.2 Vana-påminnelser
  4.3 PWA-genvägar
  4.4 Sök med datum

Fas C — Bujo-djup ✅ KLART (delvis)
  5.3 Journal prompts
  5.4 Collections-mallar
  6.1 Månads-spread PDF
  6.3 Dela-månad-bild
  (6.2 Årsbok PDF — ej implementerad)

Fas D — Avancerat ✅ KLART
  5.5 Trigger-analys
  5.6 Morgon/kväll-rutin
  5.2 Väder
  5.1 Medicin
  6.2 Årsbok PDF
  7.x Par-läge utökat
  8.x CI, Daylio-import, tester
  9.x Streak-notiser, säsongstema, animation, summary

Fas E — Framtida (valfritt) ✅ KLART
  8.4 Capacitor native app
  8.5 Apple Health / Google Fit
  9.1 AI via API (OpenAI/Claude)
```

---

# DEL 13 — Prompt-mall för Cursor

Kopiera och klistra in när du vill implementera ett steg:

```
Implementera steg [X.X] från ROADMAP.md i Test_app.
Följ filreferenserna i roadmapen.
Kör npm run test och npm run build efteråt.
Uppdatera ROADMAP.md och bocka av steget när klart.
```

Exempel:
```
Implementera steg 4.1 (Achievements/badges) från ROADMAP.md i Test_app.
```

---

*Senast uppdaterad: 2026-07-27 — Fas A–E implementerad*
