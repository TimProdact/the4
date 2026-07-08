# The4 — QA Plan & Implementation Roadmap

**Updated:** 2026-07-08 · **Build:** `2026-07-08-v3`

## Screen inventory

| Route / flow | Status | Notes |
|--------------|--------|-------|
| `/` pre-drop | ✅ | Countdown, waitlist, VIP, auth |
| `/` active | ✅ | Buy Now, checkout, themes |
| `/` sold-out | ✅ | Disabled CTA + waitlist + archive link |
| `/` paused | ✅ | Admin pause + `?preview=paused` |
| `/` offline | ✅ | `?preview=offline` |
| Profile sheet (12 views) | ✅ | Auth, orders, addresses, legal, settings |
| Checkout (9 steps) | ✅ | Hold, pay, errors, success overlay |
| `/order/[id]` | ✅ | Receipt + demo seed 1001–1003 |
| `/admin` (11 tabs) | ✅ | Mock backend, refund, analytics |
| `/home` archive | ✅ | Live + 2 archive entries |
| `/legal/*` | ✅ | Expanded copy |
| `/demo` | ✅ | All QA links |
| 404 | ✅ | `not-found.tsx` |

## Implemented in this pass

- Admin session survives refresh (tokens in localStorage)
- Analytics events → Admin → Аналитика
- Demo orders 1001–1003 auto-seed
- Success overlay before receipt
- Sold-out waitlist flow
- Checkout preview URLs (`?checkout=…`)
- Paused preview (`?preview=paused`)
- Order receipt fixes (edition, share, refund link)
- Admin refund + waitlist mock broadcast
- Profile: refunded filter, language, payment mock
- 3D placeholder when GLB missing
- Legal pages expanded
- Demo hub complete

## Still requires production backend

| Item | Priority |
|------|----------|
| Real Paylov + webhook | P0 |
| SMS OTP (Eskiz / Twilio) | P0 |
| Shared stock API + SSE (Supabase) | P0 |
| 9× GLB assets in `public/models/gallery/` | P0 |
| Cross-device admin auth (Supabase Auth) | P1 |
| Waitlist real SMS broadcast | P1 |
| i18n strings (RU/UZ/EN) | P2 |
| Per-theme inventory | P2 |
| Team RBAC + 2FA | P2 |
| PDF receipt export | P3 |

## QA checklist

1. `/demo` — open every link
2. Active drop — full checkout Paylov → success → receipt
3. Apple Pay — pending → paid flow
4. Google Pay — payment_failed
5. Profile — login, address CRUD, orders filter
6. Admin — login, refresh (session persists), refund order
7. Sold out — waitlist button
8. Pre-drop — notify + VIP long-press
