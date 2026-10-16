# ChefPulse V5 Mobile Release Plan

1. Keep the current responsive/PWA customer experience stable.
2. Validate Razorpay checkout in the target Android WebView/container before production.
3. Add the native Razorpay Android/iOS SDK integration when the true native app shells are introduced; do not ship the Razorpay secret in either mobile build.
4. Run real-device tests for payment success, payment cancellation, slow network, app backgrounding, duplicate callback, and webhook-before-callback ordering.
5. Do not publish the current APK as a production marketplace client until backend database migration and payment staging tests are complete.
