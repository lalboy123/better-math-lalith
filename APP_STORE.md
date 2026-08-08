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
- [x] Support + Privacy + Cookie pages linked from Home
- [x] Placeholder planet-description stubs removed

## What you still must do on a Mac (required for App Store)

Apple will **not** accept a website URL alone. You need a native iOS build:

1. Install Xcode + CocoaPods on a Mac.
2. From this repo:
   ```bash
   npm install
   npm run build
   npx cap add ios          # first time only
   npm run cap:sync
   npx cap open ios
   ```
3. In Xcode: set Team / Signing, bundle id `com.mathlift.app`, app icons (1024×1024), splash, privacy strings.
4. Archive → Upload to App Store Connect.

## App Store Connect listing

- Age rating: educational / kids-appropriate (answer COPPA questionnaire honestly)
- Privacy Nutrition Labels: class code + nickname + Firebase progress; analytics if enabled
- Support URL: your deployed `/support` page
- Privacy Policy URL: your deployed `/privacy-policy` page
- Screenshots: iPhone + iPad of Home, Join, Planets, a lesson, Teacher dashboard

## Honest note on approval

No engineer can guarantee “100%” Apple approval. Reviewers check:

- Complete functionality (no placeholders)
- Stable experience on all claimed devices
- Accurate privacy / kids data practices
- Sufficient native app value (Capacitor wrapper of a finished education app is commonly accepted when content is complete)

This codebase is prepared for that bar; final approval depends on your App Store Connect metadata, signing, and Apple’s review.
