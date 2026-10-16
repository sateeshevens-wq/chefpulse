#!/bin/bash
set -euo pipefail

echo "ChefPulse mobile release pipeline"
echo "This project now uses Capacitor for production Android/iOS packaging."

aif [ ! -d node_modules ]; then
  echo "ERROR: install dependencies first: npm install"
  exit 1
fi

npm run build
npx cap sync

echo "Native projects synced."
echo "Android: npm run mobile:android, then build a signed AAB in Android Studio/Gradle."
echo "iOS: npm run mobile:ios, then archive/sign in Xcode on macOS."
