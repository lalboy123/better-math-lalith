# Native iOS wrapper (copy into Xcode)

MathLift’s App Store shell is a real iPhone app around the live site at
`https://better-math-lalith.vercel.app`.

## If you already have the SwiftUI project

1. Open the MathLift Xcode project.
2. Replace **ContentView.swift** with the full contents of `ios-native/ContentView.swift` from this repo.
3. Build and run on a device or simulator.

That file adds:

- A custom **No Internet Connection** screen with **Try Again** (no Safari error page)
- The system **iOS spinner** until the Vercel site finishes loading
- A native **MathLift** header and **Home / Classes / Settings** tab bar
- A Taptic Engine bridge so taps in the website click on the phone

You do **not** need to change `MathLiftApp.swift` if it already shows `ContentView()`.

## If you use Capacitor instead

The same chrome lives in `ios/App/App/NativeShellViewController.swift`. After `npm run cap:sync`, open Xcode with `npx cap open ios`.
