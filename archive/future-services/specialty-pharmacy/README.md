# Future service: specialty medications

These pages are off the public site. Clear Choice is not offering specialty medication transfers, prior authorization, or copay assistance right now.

The public addresses `/specialty-pharmacy` and `/specialty-pharmacy/start`, plus the specialty intake APIs, are archived here. `proxy.ts` answers those old addresses with “not available.”

The screen designs are still in the project, ready to reconnect later:

- `archive/future-services/specialty-pharmacy/routes`
- `components/specialty-intake-form.tsx`
- `lib/specialty-pharmacy-catalog.ts`
- `lib/specialty-prescription-storage.ts`

To offer the service again, move `routes` back to `app/specialty-pharmacy`, move the API folders back under `app/api`, and remove `/specialty-pharmacy` from the removed-page list in `proxy.ts`.
