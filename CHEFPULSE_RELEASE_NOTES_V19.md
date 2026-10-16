# ChefPulse V19 — On-Demand Chef + Grocery Fulfillment

## What changed
- Server-authoritative on-demand request lifecycle now supports `requested -> accepted` for immediate SOS chef requests without forcing a duplicate chef-service payment before chef acceptance.
- Added persistent grocery orders with separate lifecycle: `created -> payment_pending -> paid -> out_for_delivery -> delivered_to_customer`.
- Grocery payments are separate from chef-service payments and use the same trusted Razorpay verification foundation when Razorpay is configured.
- Supported grocery partners are exactly **Zepto, Blinkit and BigBasket**.
- Ingredient cart totals are recomputed server-side from the submitted item list; client totals cannot be trusted.
- Added IDOR protection for grocery orders/payments.
- Added explicit **Groceries delivered to your home** state before chef tracking.
- Customer on-demand flow now creates a real booking, waits for server acceptance, creates the grocery order after acceptance, starts a separate ingredient payment, and records delivery status.
- Customer/chef active booking state is synchronized from the backend every few seconds while authenticated.
- Production blocks simulation for grocery payments when the live payment provider is not configured.

## Important integration boundary
Zepto, Blinkit and BigBasket are represented through a provider abstraction and partner selection in V19. This release does **not** claim a live commercial partner API connection. Real grocery ordering/fulfilment webhooks require the corresponding partner contract/API credentials.

## Validation
- TypeScript source was updated for the V19 state machine, grocery service/routes, schema and customer flow.
- Full dependency installation/live provider tests remain environment-dependent; no external payment or grocery credentials were accessed or changed by this build.
