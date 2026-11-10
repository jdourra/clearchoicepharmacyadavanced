# Future service: NAD+ IV, hangover drips, and mobile IV

These pages are off the public site. Clear Choice is not offering NAD+ IV, hangover drips, Myers Cocktail, hydration IVs, or rejuvenation vial kits right now.

The public addresses `/iv-rejuvenation`, `/iv-rejuvenation/book`, the package and vial pages, and the booking APIs are archived here. `proxy.ts` still answers those old addresses with “not available.”

The screen designs are still in the project, ready to reconnect later:

- `components/iv-rejuvenation-page.tsx`
- `components/iv-booking-form.tsx`
- `components/iv-package-product-detail.tsx`
- `components/iv-booster-picker.tsx`
- `components/rejuvenation-vial-intake-form.tsx`
- `components/rejuvenation-vial-product-detail.tsx`
- `lib/iv-catalog.ts`
- `lib/iv-product-content.ts`
- `lib/rejuvenation-vial-catalog.ts`
- `lib/rejuvenation-vial-product-content.ts`

To offer the service again, move `routes` back to `app/iv-rejuvenation`, move the two API folders back under `app/api`, and connect the main page to `IvRejuvenationPage` instead of the not-found placeholder.
