# Capacitor Native App Setup

Build Bujo Mood Tracker as a native Android or iOS app.

## Prerequisites

- Node.js 18+
- **Android:** Android Studio with SDK 26+
- **iOS:** macOS with Xcode 15+ (iOS builds only work on Mac)

## Quick start

```bash
cd Test_app
npm install
npm run cap:sync          # build web app + sync to native projects
npm run cap:android       # open Android Studio
npm run cap:ios           # open Xcode (macOS only)
```

## First-time platform setup

If `android/` or `ios/` folders don't exist yet:

```bash
npm run build
npx cap add android
npx cap add ios           # macOS only
npx cap sync
```

## Native features enabled

| Feature | Plugin | Notes |
|---------|--------|-------|
| Local notifications | `@capacitor/local-notifications` | Daily + habit reminders |
| Health sync | `@capgo/capacitor-health` | Sleep & steps → journal entries |

## Health sync setup

### iOS (HealthKit)

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the App target → **Signing & Capabilities** → **+ Capability** → **HealthKit**
3. Add to `Info.plist`:
   - `NSHealthShareUsageDescription` — "Bujo Mood reads sleep and step data for your journal."
   - `NSHealthUpdateUsageDescription` — "Bujo Mood may write health data you choose to log."

### Android (Health Connect)

1. Ensure `minSdkVersion` ≥ 26 in `android/variables.gradle`
2. Users need Health Connect installed (built-in on Android 14+)
3. Grant permissions when prompted in Settings → Health sync

## Enable in app

1. **Settings → Health sync** — toggle on and tap **Sync now**
2. **Settings → Native app** — link to this guide

## Development workflow

```bash
npm run dev               # web dev server (browser)
npm run cap:sync          # after code changes, rebuild + sync
```

Run on device/emulator from Android Studio or Xcode.

## Troubleshooting

- **White screen:** Run `npm run build` before `cap sync`; check `webDir` is `dist` in `capacitor.config.json`
- **Notifications not firing:** Check app notification permissions in OS settings
- **Health unavailable:** Verify HealthKit capability (iOS) or Health Connect install (Android)
