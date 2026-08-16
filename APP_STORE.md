# MathLift App Store readiness

MathLift is a Vite + React web app packaged for iOS with Capacitor.

## Product quality checklist (code)

- [x] Join / Login works across devices (class code + nickname)
- [x] Sign Out clears student session; Home shows Continue
- [x] Teacher PIN required to manage a class
- [x] No YouTube / external lesson embeds (self-contained celebrations)
- [x] Lesson routes require a student session
- [x] Error boundary for unexpected crashes
- [x] Safe-area aware nav; larger touch targets
- [x] Tablet solar system scales so outer planets fit
- [x] Support + Privacy + Cookie + Settings pages linked from Home
- [x] In-app account / class deletion (no email-to-delete)
- [x] Firebase used as database only — Analytics modules not loaded
- [x] Native iOS shell: offline screen, spinner, tab bar, haptics
- [x] Placeholder planet-description stubs removed
- [x] Teacher start level syncs student roster accurately
- [x] Read-aloud TTS hardened for iOS WebViews (no mic permission needed)
- [x] Story quiz retry / guided practice / scoring consistent
- [x] `ITSAppUsesNonExemptEncryption` set for export compliance

## What you still must do on a Mac (required for App Store)

Apple will **not** accept a website URL alone. You need a native iOS build:

1. Install Xcode on a Mac.
2. From this repo:
   ```bash
   npm install
   npm run build
   npm run cap:sync
   npx cap open ios
   ```
3. In Xcode: set Team / Signing, bundle id `com.mathlift.app`, replace default app icons with a 1024×1024 MathLift icon, verify splash.
4. Archive → Upload to App Store Connect.

If you built a SwiftUI Xcode project that loads the Vercel URL (not Capacitor), paste `ios-native/ContentView.swift` over your `ContentView.swift`. That file is the native offline screen, spinner, tab bar, and haptic bridge.

## App Store Connect listing

- Age rating: educational / kids-appropriate (answer COPPA questionnaire honestly)
- Privacy Nutrition Labels: class code + nickname + Firebase Firestore progress only. Do **not** declare tracking or analytics. MathLift does not use Google Analytics or Firebase Analytics, and does not collect IP or location for analytics.
- Support URL: your deployed `/support` page
- Privacy Policy URL: your deployed `/privacy-policy` page
- Screenshots: iPhone + iPad of Home, Join, Planets, a lesson, Teacher dashboard

## Honest note on approval

No engineer can guarantee “100%” Apple approval. Reviewers check:

- Complete functionality (no placeholders)
- Stable experience on all claimed devices
- Accurate privacy / kids data practices (no analytics SDKs; in-app Delete Account)
- Sufficient native app value (offline screen, spinner, native tab bar, haptics — not a bare Safari web view)

This codebase is prepared for that bar; final approval depends on your App Store Connect metadata, signing, and Apple’s review.
