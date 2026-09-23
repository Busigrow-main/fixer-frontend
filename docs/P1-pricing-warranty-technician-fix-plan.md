# P1 Fix Plan — Pricing, Warranty & Post-Booking Transparency

**Scope:** Customer-facing repair booking (Next.js web + NestJS backend)  
**Out of scope for customer P1:** Fixxer-mobile (technician field app only)  
**Date:** 2026-09-23  
**Status:** Implemented (Phase A–D core) — unit tests added

---

## Executive summary

| # | Theme | Severity | Current state |
|---|--------|----------|---------------|
| 10 | Pricing transparency | P1 | Partial pre-book price; post-book amounts hidden; extras not explained |
| 11 | Warranty transparency | P1 | Slogan-level only; no policy, exclusions, or proof; conflicting part durations |
| 12 | Technician / status visibility | P1 | Binary “awaiting / assigned”; no name, ETA, or schedule for customers |

**Root pattern across all three:** Backend already holds (or can hold) the data. Customer web UI and customer APIs intentionally or accidentally omit it. Ops/admin and technician surfaces are richer than what customers see.

---

## Where the customer journey lives

```
Discovery (/services, /services/[slug])
  → BookingForm (modal)
  → POST /api/v1/bookings
  → (optional) PendingBookingConfirmDialog
  → /my-bookings (ONLY post-booking customer surface)
```

There is **no** customer booking-detail route (`/my-bookings/[id]`), **no** customer push/SMS on status change, and **no** customer app in Expo.

---

# 10. Pricing Transparency

## Requirements

1. Show estimated/fixed pricing **before** booking wherever possible  
2. Clearly explain inspection/visit charges and potential additional repair/component costs  
3. Provide a final price breakdown where possible  

## Where it exists today

| Surface | Path | What customer sees |
|---------|------|--------------------|
| Services catalog | `app/services/page.tsx`, `ServicesClient.tsx` | “Starts at {startingPrice}” |
| Service detail | `app/services/[slug]/page.tsx` | Hero “Starting at …” only — **no subcategory price list** |
| Homepage picker | `app/components/ServicePickerSection.tsx` | **No prices** |
| Booking form | `app/components/BookingForm.tsx` | “Standard Service Charge” + “Visit fee included” after subtype select |
| Pending confirm | `PendingBookingConfirmDialog.tsx` | **No price** |
| My Bookings | `app/my-bookings/page.tsx` → `RepairBookingCard` | **“Verified”** / “Final pricing shared after inspection” — hides amounts |
| Bill download | `app/admin/utils/jobsheet.ts` → `openRetailInvoice()` | Full breakdown **only after** billed/closed/paid |
| Backend invoice | `fixxer-backend/.../booking.schema.ts` `invoiceData` | `serviceTotal`, `partsTotal`, `additionalCharges`, `spareParts`, `totalAmount` — already computed on create |

## Issues (bugs / gaps)

### BUG-P1 — Post-booking price concealment

**Where:** `app/my-bookings/page.tsx` (~490–497)

**What happens:** Card shows “Verified” and “Final pricing shared after inspection” even though `POST /bookings` already runs `generateInvoiceData()` and `GET /user/bookings` returns `invoiceData.serviceTotal`.

**Why it’s a bug:** Data exists; UI discards it. Customer is told there is no price after booking, which contradicts the fixed “Standard Service Charge” shown pre-book.

**Why fix here:** My Bookings is the only post-booking customer surface. Surfacing `invoiceData` here closes the transparency gap without a new product surface.

### BUG-P2 — Variable costs never disclosed

**Where:** `BookingForm.tsx` (~297–313)

**What happens:** Only “Standard Service Charge” + one-line “Visit fee included”. No explanation that spare parts, gas, extra labour, or diagnosis-dependent work may be charged separately and confirmed after inspection.

**Why it’s a bug:** Marketing (“No hidden fees”) + post-book “pricing after inspection” conflict without framing. Customers cannot distinguish base fee vs extras.

**Why fix here:** Disclosure must appear **before** consent to book — BookingForm (and confirm dialog) is the decision moment.

### BUG-P3 — Confirm step drops price

**Where:** `lib/pending-booking.ts`, `PendingBookingConfirmDialog.tsx`

**What happens:** Draft has no price fields; confirm UI omits charge entirely.

**Why fix here:** Auth-gated confirm is a second “buy” moment; repeating the estimate prevents surprise.

### BUG-P4 — Discovery under-shows prices

**Where:** Service detail (no subcategory grid), homepage picker (no “from ₹”).

**Why fix here:** Pricing transparency starts at discovery, not only at checkout.

### BUG-P5 — `estimatedAmount` never written

**Where:** `booking.schema.ts` has `estimatedAmount` (default `0`); create path never freezes it. Tech jobs fall back to `estimatedAmount || invoiceData.totalAmount`, so “estimate” drifts as parts are added.

**Why fix here:** Freeze base quote at create so customers and ops share one immutable “quoted” figure separate from live invoice total.

### BUG-P6 — Dead invoice URL

**Where:** `invoiceData.url` → `/api/v1/user/bookings/:id/invoice` but no matching customer GET route.

**Why fix:** Either implement the route or stop writing a dead URL (avoids broken deep links / future client bugs).

### BUG-P7 — Ambiguous catalog price strings

**Where:** Seeded prices like `"₹449–₹549"`, `"Starting ₹249"`. Numeric parse takes first digit group → invoice math can disagree with display.

**Why fix:** Normalize to numeric `priceNumeric` + clear display rules (fixed vs range) so estimate and bill match copy.

## Proposed fix (what to place + why)

### Backend (`fixxer-backend`)

| Change | Placement | Why |
|--------|-----------|-----|
| On create, set `estimatedAmount = invoiceData.serviceTotal` (immutable thereafter) | `bookings.service.ts` create + `generateInvoiceData` | Freezes the pre-inspection quote |
| Ensure `GET /user/bookings` always returns `invoiceData` + `estimatedAmount` (already largely true) | `findAllByUser` | Customer UI needs the fields |
| Optional: `GET /user/bookings/:id` with full breakdown | new controller route | Enables detail page / live total without overloading list |
| Fix or remove `invoiceData.url` | invoice gen | Avoid dead links |
| Normalize subcategory prices to `priceNumeric` + display type (`FIXED` \| `RANGE` \| `FROM`) | service schema + seed | Align math with marketing strings |

### Web (`fixxer`)

| Change | Placement | Why |
|--------|-----------|-----|
| Show subcategory prices on `/services/[slug]` | service detail page | Pre-book visibility without opening modal |
| Show “from ₹…” on homepage picker | `ServicePickerSection` | Discovery transparency |
| Expand BookingForm disclosure block | under Standard Service Charge | Explain: base service charge includes visit; parts / extra repairs quoted after diagnosis and confirmed before charge |
| Persist price into pending draft + confirm dialog | `pending-booking.ts`, confirm dialog | No silent confirm |
| My Bookings: replace “Verified” with amount UI | `RepairBookingCard` | Always show **Estimated / Base charge**; when `partsTotal` or extras > 0 show **Current total** + line breakdown; after billable show **Final** + download |

### Suggested customer copy (pricing)

> **Base service charge: ₹X** — includes technician visit and standard labour for this service.  
> **Spare parts and additional repairs** (if needed) are diagnosed on site, priced before work proceeds, and added only with your confirmation.  
> **Final invoice** may differ from the base charge if parts or extra labour are approved.

### Acceptance criteria

- [ ] Subcategory fixed/range price visible on service detail before Book  
- [ ] Booking form + confirm show base charge and visit/extras disclosure  
- [ ] My Bookings shows estimated base amount immediately after booking  
- [ ] When parts/extras exist, in-app breakdown matches invoice fields  
- [ ] Final bill download still available after close/paid  

---

# 11. Warranty Transparency

## Requirements

1. Clearly communicate the 60-day warranty / responsibility policy  
2. Provide supporting documentation or proof  
3. Explain coverage and exclusions/conditions  
4. Make warranty info accessible **before and after** booking  

## Where it exists today

| Surface | Path | What customer sees |
|---------|------|--------------------|
| Hero | `app/components/Hero.tsx` | “60-Day Warranty” badge |
| Difference | `app/components/DifferenceSection.tsx` | Short blurb; **“Learn more” is not a link** |
| Booking form | `BookingForm.tsx` | Chip “60 Days Warranty”; success: **“60 Days Protection Enabled”** |
| Service features | `app/lib/services.ts` | “60 Days Service Warranty”, “Up to 30 Days Part Warranty” |
| My Bookings | `my-bookings/page.tsx` | Status chip + Claim Warranty CTA |
| Invoice | `jobsheet.ts` | ~2-line “covers labor and genuine parts…” — no exclusions |
| Footer | `Footer.tsx` | Privacy / Terms → **`href="#"` (dead)** |
| Backend | `warranties.service.ts`, `lockServiceWarranty` | SERVICE warranty locked on **COMPLETED** (60 days); PART default **6 months** |

**Missing entirely:** `/warranty`, `/terms`, `/privacy` pages; warranty PDF/certificate; exclusions copy; public policy API.

## Issues (bugs / gaps)

### BUG-W1 — No authoritative warranty policy (core miss)

**Where:** No routes under `app/warranty`, `app/terms`, `app/privacy`. Footer legal links are `#`. DifferenceSection “Learn more” is a non-navigating `<span>`.

**Why it’s a bug:** Customers cannot read what “60-day warranty” means — only marketing slogans exist.

**Why fix here:** One canonical policy page linked from Hero, Difference, BookingForm, My Bookings, Claim dialog, Footer, and invoice.

### BUG-W2 — Coverage / exclusions never defined

**Where:** Only substantive customer sentence is invoice HTML in `jobsheet.ts`. Zero exclusion language in UI or content APIs.

**Why fix:** Claim and marketing without exclusions create legal/trust risk and support load (“is gas refill covered?”).

### BUG-W3 — Conflicting part-warranty durations

| Source | Claim |
|--------|--------|
| `DifferenceSection`, `services.ts` | Up to **30 days** on parts |
| Backend `DEFAULT_PART_WARRANTY_MONTHS` | **6 months** |
| `spare-parts/verified/page.tsx` | Up to **12 months** on all spares |

**Why it’s a bug:** Three clocks marketed as one product promise.

**Why fix:** Pick one product rule (service labour vs genuine Fixxer parts vs manufacturer/SKU parts), align seed/copy/backend defaults, and explain two clocks in the policy UI.

### BUG-W4 — Success copy claims protection before warranty starts

**Where:** `BookingForm.tsx` success: “60 Days Protection Enabled”. Backend `lockServiceWarranty` only runs when status → `COMPLETED`.

**Why it’s a bug:** Misleading — warranty window has not started at request time.

**Why fix:** Copy should say warranty activates on successful job completion (include start/end rules on policy page).

### BUG-W5 — Proof is operational, not documentary

**Where:** Mongo `Warranty` records + `warrantyExpiry` exist for ops; customers get no certificate ID, policy URL, or shareable proof in My Bookings (only optional invoice download).

**Why fix:** Customer-facing proof reduces claim friction and supports P1 “documentation”.

## Proposed fix (what to place + why)

### Content / legal (web)

| Change | Placement | Why |
|--------|-----------|-----|
| Add `/warranty` policy page | `app/warranty/page.tsx` | Single source of truth: coverage, exclusions, claim process, start date = completion, service vs parts |
| Add `/terms` and `/privacy` (even if minimal v1) | `app/terms`, `app/privacy` | Unblock dead Footer links; warranty can be incorporated by reference |
| Wire all “Learn more” / badges / Footer | `DifferenceSection`, `Hero`, `Footer`, BookingForm, my-bookings | Pre + post accessibility |

### Suggested policy sections (minimum)

1. What is covered (labour for same fault; genuine parts replaced on the job)  
2. What is not covered (misuse, third-party parts, unrelated failures, consumables/gas unless stated, etc. — finalize with product/legal)  
3. When it starts / ends (completion → +60 days)  
4. How to claim (My Bookings → Claim Warranty)  
5. Part warranty vs service warranty (aligned durations)  

### Product / backend alignment

| Change | Placement | Why |
|--------|-----------|-----|
| Align `DEFAULT_PART_WARRANTY_MONTHS` with marketing | `warranties.service.ts` + web copy | One truth |
| Expose `warrantyExpiry`, warranty type, policy URL on user bookings | `findAllByUser` / detail DTO | Post-booking proof |
| Optional warranty certificate endpoint or PDF | new route or invoice section | Supporting documentation |

### Web UX

| Change | Placement | Why |
|--------|-----------|-----|
| Fix success copy | BookingForm | “Included — activates when job is completed” |
| Claim dialog: short terms + link to `/warranty` before confirm | my-bookings | Informed claim |
| My Bookings: show expiry date + “View warranty policy” | RepairBookingCard | Post-booking accessibility |
| Invoice: expand Master Warranty block + policy link | `jobsheet.ts` | Durable proof on bill |

### Acceptance criteria

- [ ] `/warranty` live with coverage + exclusions + claim steps  
- [ ] Footer Terms/Privacy/Warranty are real links  
- [ ] Pre-book surfaces link to policy (not slogan-only)  
- [ ] Post-book shows expiry + policy link; claim requires acknowledge  
- [ ] Part vs service durations consistent across web + backend  
- [ ] Success copy no longer says protection is already “enabled” at request  

---

# 12. Technician Information & Booking Status

## Requirements

1. Display technician’s name after a master technician is assigned  
2. Display expected arrival time (ETA) and scheduling information  
3. Give customers clear visibility into booking status  

## Where it exists today

| Surface | Path | What customer sees |
|---------|------|--------------------|
| My Bookings only | `app/my-bookings/page.tsx` | Raw `booking.status` enum; tech line: PENDING → “Awaiting Dispatch”, else **“Assigned to Master Tech”** (no name) |
| Backend assignment | `technicianId`, `assignmentStatus`, `dispatchStatus`, status machine | Full lifecycle for admin/tech |
| Visits | `visit.schema.ts` `scheduledDate` | Admin/tech only — **not** in customer list API |
| Arrival | `arrivalAt` + GPS | Actual on-site timestamp when tech taps “I’ve Arrived” — **not** an ETA |
| Customer API | `findAllByUser` | Populates `userId`, `serviceId` only — **does not populate `technicianId` or visits** |
| Mobile | Fixxer-mobile job screens | Technician workflows only |

**Absent on Booking schema:** `expectedArrival`, `eta`, `scheduledSlot`, preferred date/time on repair create.  
**Absent for customers:** detail route, status timeline, notifications on assign/status.

## Issues (bugs / gaps)

### BUG-T1 — Technician name never reaches customers

**Where:** Backend `findAllByUser` does not populate `technicianId`. UI hardcodes “Assigned to Master Tech”.

**Why it’s a bug:** Name exists on Technician model and is shown in admin; customers are left with a generic label after assignment — direct P1 miss.

**Why fix in API + My Bookings:** Minimal path — populate safe fields (`name`, maybe masked phone) on customer bookings; render in card. Do not expose internal IDs/ops fields unnecessarily.

### BUG-T2 — No ETA / schedule model for repair bookings

**Where:** BookingForm collects no preferred slot. No `expectedArrival` on booking. Visit `scheduledDate` never returned to customers.

**Why it’s a bug:** Customers cannot plan around the visit; success copy promises tracking but offers no time information.

**Why fix:** Need both (a) optional preferred window at book time and/or (b) admin/tech-set scheduled arrival surfaced to customer, plus (c) optional live ETA later.

### BUG-T3 — Status visibility collapsed and misleading

**Where:** `RepairBookingCard` — non-PENDING always “Assigned to Master Tech”; status shown as raw enum; status dot green for everything except PENDING (including `CANCELLED`).

**Why it’s a bug:** Real states (`ASSIGNED`, `EN_ROUTE`, `IN_PROGRESS`, `COMPLETED`, …) are invisible. Customer cannot tell searching vs on the way vs working vs done.

**Why fix here:** Map statuses to human labels + simple timeline on the only customer tracking surface.

### BUG-T4 — “Track live status” promise unmet

**Where:** Booking success / marketing implies live tracking; My Bookings has no polling, websocket, or push; no detail page.

**Why fix:** At minimum, human status + tech name + schedule on My Bookings with refresh; ideally customer notify on assign / en route.

### BUG-T5 — Naming confusion: mobile “I’ve Arrived” → `EN_ROUTE`

**Where:** Tech arrival API sets `EN_ROUTE` + `arrivalAt` (sounds like “coming”, acts like “on site”).

**Why fix (copy layer):** Customer-facing labels should say “Technician on the way” vs “Technician arrived” based on product intent — may require splitting status or using `arrivalAt` presence.

## Proposed fix (what to place + why)

### Backend (`fixxer-backend`)

| Change | Placement | Why |
|--------|-----------|-----|
| Populate technician safe profile on `findAllByUser` | `bookings.service.ts` | Unblocks name in UI |
| Include visit summary (`scheduledDate`, status) or first upcoming visit | same | Scheduling visibility without admin API |
| Add fields: `preferredSlot` (from customer) and/or `expectedArrivalAt` (set by admin/tech/dispatch) | `booking.schema.ts` + assign/visit flows | ETA/schedule have a home |
| Set `expectedArrivalAt` when visit scheduled or tech accepts | visits / assign / claim handlers | Single customer-facing time |
| Optional: customer SMS/push on ASSIGNED and EN_ROUTE | notification dispatch | Don’t leave customers in silence |
| Optional: `GET /user/bookings/:id` | controller | Detail/timeline page |

### Web (`fixxer`)

| Change | Placement | Why |
|--------|-----------|-----|
| Show technician name (and optional phone) when `technicianId` present | `RepairBookingCard` | P1 requirement |
| Status map + progress steps | same | PENDING → Confirmed → Assigned → On the way → On site / In progress → Completed |
| Show scheduled / expected arrival when available | same | ETA/scheduling |
| Optional preferred date/time in BookingForm | BookingForm + API | Capture schedule intent early |
| Fix status indicator colors (cancelled ≠ success green) | card styles | Trust / clarity |
| Optional booking detail page | `app/my-bookings/[id]/page.tsx` | Room for timeline without crowding list |

### Suggested customer status labels

| Backend status | Customer label |
|----------------|----------------|
| `PENDING` | Finding a master technician |
| `CONFIRMED` | Booking confirmed |
| `ASSIGNED` | {Technician name} assigned |
| `EN_ROUTE` (no `arrivalAt`) | {Name} is on the way — ETA … |
| `EN_ROUTE` + `arrivalAt` / or dedicated arrived | {Name} has arrived |
| `IN_PROGRESS` | Service in progress |
| `COMPLETED` | Service completed |
| `PAYMENT_COLLECTED` | Payment received |
| `CANCELLED` | Cancelled |
| `RESCHEDULED` | Rescheduled |

### Acceptance criteria

- [ ] After assign/claim, customer sees technician display name  
- [ ] When schedule/ETA exists, customer sees date/time (or window)  
- [ ] Status progression is human-readable (not raw enums / binary assigned)  
- [ ] Cancelled/error states are visually distinct  
- [ ] (Stretch) Customer notified when tech assigned or en route  

---

## Cross-cutting notes

1. **Customer surface concentration:** Almost all P1 customer fixes land in **BookingForm + My Bookings + a new `/warranty` page + customer booking API populate**. Admin and mobile already have richer data — do not rebuild there for this P1.  
2. **Don’t invent prices post-hoc:** Prefer showing existing `invoiceData` / subcategory prices; freeze `estimatedAmount` at create.  
3. **Copy consistency:** Pre-book “fixed service charge” and post-book “final after inspection” must be framed as **base fee vs variable extras**, not as contradictory stories.  
4. **Warranty start time:** Never claim active protection at request create.  
5. **Mobile:** No customer booking app today — web is the delivery vehicle for P1 10–12.

---

## Suggested implementation order

| Phase | Items | Rationale |
|-------|-------|-----------|
| **A — Quick wins** | Populate technician on user bookings; My Bookings status labels + tech name; show `invoiceData.serviceTotal` / estimated amount; fix warranty success copy; link Difference “Learn more” once `/warranty` stub exists | Highest customer visibility / lowest schema risk |
| **B — Disclosure** | BookingForm pricing + warranty disclosure; confirm dialog price; service detail subcategory prices; Claim terms | Pre-book transparency |
| **C — Policy & proof** | Full `/warranty` (+ terms/privacy); invoice warranty block; align part durations | Legal/trust completeness |
| **D — Schedule / ETA** | preferred slot and/or `expectedArrivalAt` + visit surfacing; optional notifications; optional detail page | Completes P1 #12 depth |

---

## Evidence index (key files)

| Area | Files |
|------|-------|
| Pricing UI hide | `fixxer/app/my-bookings/page.tsx` |
| Pricing pre-book | `fixxer/app/components/BookingForm.tsx` |
| Invoice model | `fixxer-backend/src/bookings/schemas/booking.schema.ts` |
| Invoice gen | `fixxer-backend/src/bookings/bookings.service.ts` (`generateInvoiceData`) |
| Warranty lock | `fixxer-backend/src/bookings/bookings.service.ts` (`lockServiceWarranty`) |
| Part default | `fixxer-backend/src/warranties/warranties.service.ts` (`DEFAULT_PART_WARRANTY_MONTHS = 6`) |
| Dead legal links | `fixxer/app/components/Footer.tsx` |
| Customer API gap | `findAllByUser` — no `technicianId` populate |
| Tech-only mobile | `Fixxer-mobile/src/app/job/**` |

---

## Open product decisions (blockers for Phase C/D)

1. **Part warranty duration:** 30 days vs 6 months vs 12 months (SKU) — pick canonical rules.  
2. **Final warranty exclusions list** — needs product/legal sign-off.  
3. **ETA source of truth:** customer preferred window vs admin visit schedule vs tech-provided ETA.  
4. **Whether EN_ROUTE means “on the way” or “arrived”** — align mobile action label with customer copy (may need a new status).  
