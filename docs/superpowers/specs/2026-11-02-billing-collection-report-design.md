# Billing collection report PDF

## Goal

Replace the Billing page's WhatsApp text report action with a downloadable and previewable PDF that landlords can share with family. Recreate the supplied `OCTOBER-REPORT.pdf` visual reference with live data, rather than storing that populated sample as a reusable template.

## User flow

1. The landlord selects a billing month on the Billing page and clicks **Send Report to Me**.
2. The app generates a report from every bill whose `billing_month` matches the selected/effective month. Tenant search must not affect report contents.
3. The report opens in a preview with a PDF download option. Match the existing invoice PDF behavior: embedded preview on desktop, and open the generated PDF in a new tab on mobile with a download fallback if the popup is blocked.
4. No WhatsApp message is opened and no report is uploaded to Supabase.

## Report content and layout

Follow the supplied one-page A4 sample's visual hierarchy and colors. Show:

- RentEase heading, readable month/year, and report date.
- Summary cards/blocks for total goal (sum of bill totals), collected (sum of recorded payments), and pending (sum of outstanding balances, falling back to total minus paid if an outstanding balance is absent).
- One detail row per monthly bill: room/flat, tenant, previous and current readings, units consumed, electricity rate and electricity charge, rent, and total bill.
- A totals row and electricity-rate note. When rates vary across buildings, show the rate per bill row; only show a single rate note when it is consistent across all included bills.
- Collection-status summary with counts by status and total pending amount.
- Footer branding and page number. The table must paginate cleanly when there are too many bills for one page.

Use the nested tenant/flat/building information already fetched by the Billing page, including each building's `electricity_rate`. Do not add database migrations or storage configuration.

## Implementation boundaries

- Keep PDF generation in the existing client-side `@react-pdf/renderer` pattern, with a focused collection-report PDF component and a preview/download control near the Billing page action.
- Keep the report independent from the text search state; derive its input from the full bill list for the effective month.
- Do not add WhatsApp sharing, report archiving, new Supabase tables/buckets, or unrelated invoice changes.
- If there are no bills for the effective month, keep report generation unavailable and show an understandable empty state or disabled action.

## Acceptance checks

- A month with multiple bills includes all of them even when the Billing search matches only one tenant.
- Totals, readings, unit consumption, rates, charges, rents, totals, and collection status reflect the selected month's records.
- Preview and download work on desktop; mobile opens the PDF or falls back to a download.
- A long report paginates without clipping rows or totals and shows correct page numbering.
- Existing invoice generation and invoice preview remain unchanged.

## Review notes

- The provided file is a populated November 2026 report despite its `OCTOBER` directory name; the app must generate the selected month dynamically.
- Supabase remains the source of billing and property data. A separate Supabase template or SQL commands are not needed.
