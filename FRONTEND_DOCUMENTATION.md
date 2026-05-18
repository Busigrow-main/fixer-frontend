# Frontend Documentation

> **Workspace-resident documentation for all agents**

**Status**: ✅ Ready to Use | **Last Updated**: May 16, 2026

---

## 🎯 Quick Overview

- **Framework**: Next.js 16.2.2 with React 19.2.4
- **Bundler**: Webpack (not Turbopack - ARM64 incompatibility)
- **Styling**: Tailwind CSS 4.x
- **Port**: 3001 (auto-fallback from 3000)
- **API Base**: http://localhost:8080

---

## 🚀 Start Frontend

```bash
cd /Users/misanthropic/codebase/fixxer
npm run dev              # Development with Webpack
```

---

## 📁 Key Directories

```
fixxer/
├── app/
│   ├── config.ts                         ← API configuration
│   ├── globals.css                       ← Global styles & Material Symbols
│   ├── layout.tsx                        ← Root layout
│   ├── page.tsx                          ← Landing page
│   ├── components/                       ← Reusable components
│   │   └── spare-parts/appliances/       ← AC-specific components (7 files)
│   ├── spare-parts/
│   │   ├── page.tsx                      ← Spare parts main
│   │   ├── [sku]/page.tsx                ← Part detail
│   │   ├── appliances/
│   │   │   ├── page.tsx                  ← AC LANDING PAGE
│   │   │   └── ac/
│   │   │       ├── page.tsx              ← AC LISTING PAGE
│   │   │       └── [slug]/page.tsx       ← AC DETAIL PAGE
│   │   └── enquiry/
│   │       └── page.tsx                  ← Enquiry form (with pre-fill)
│   ├── context/
│   │   ├── AuthContext.tsx               ← User auth state
│   │   └── BookingContext.tsx            ← Booking state
│   ├── lib/
│   │   ├── services.ts                   ← API calls
│   │   ├── spareParts.ts                 ← Spare parts API
│   │   └── utils.ts                      ← Utility functions
│   └── ...
├── public/                               ← Static assets
├── next.config.ts                        ← Webpack configuration
├── tsconfig.json                         ← TypeScript config
├── tailwind.config.ts                    ← Tailwind config
├── package.json                          ← Scripts & dependencies
└── .env.local                            ← Environment variables (local)
```

---

## 🔧 Available Scripts

```bash
npm run dev              # Development with Webpack (hot reload)
npm run build            # Production build with Webpack
npm start                # Run production build
npm run lint             # ESLint check
```

---

## 🎨 AC Appliances Feature

### Pages

- **Landing**: `/spare-parts/appliances` - 3 category cards
- **Listing**: `/spare-parts/appliances/ac` - Filters, sort, pagination (12 items/page)
- **Detail**: `/spare-parts/appliances/ac/{slug}` - Full product info, gallery, tabs, CTAs
- **Enquiry**: `/spare-parts/enquiry?product={slug}&type=appliance` - Pre-filled form

### Components (7 Total)

```
fixxer/app/components/spare-parts/appliances/
├── ApplianceCategoryCard.tsx   ← Landing page tiles
├── ACProductCard.tsx            ← Product grid cards
├── ACFilterSidebar.tsx          ← Filter panel (5 filter types)
├── ACSortBar.tsx                ← Sort options (4 options)
├── ACImageGallery.tsx           ← Image carousel with thumbnails
├── ACSpecsTable.tsx             ← Specs display (grid/table)
└── TrustBadgeStrip.tsx          ← Trust badges (reusable)
```

### Integration Points

```
fixxer/app/components/spare-parts/SparePartsClient.tsx
  └─ "Browse Complete Appliances" promotional banner
     (between Popular Parts & Browse Catalog sections)

fixxer/app/components/SparePartsEnquiryForm.tsx
  └─ Pre-fills with product name & type when query params provided
```

---

## 🔗 API Integration

### Base URL

```typescript
// fixxer/app/config.ts
export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
```

### Key API Calls

```typescript
// Appliances Listing
GET http://localhost:8080/api/v1/appliances/ac?capacity=1.5&sort=price_asc&page=1

// Appliances Detail
GET http://localhost:8080/api/v1/appliances/ac/godrej-1-5t-5s-inverter-split

// Spare Parts Categories
GET http://localhost:8080/api/v1/spare-parts/categories
```

### API Service File

```typescript
// fixxer/app/lib/services.ts
export async function getAppliances(filters?: FilterApplianceDto);
export async function getApplianceBySlug(slug: string);
```

---

## 🎨 Brand Design

```
Primary Red:      #C8102E  (use in: CTAs, active states, hero sections)
Golden Accent:    #D48F0E  (use in: badges, secondary highlights)
```

### Icons

```
Material Symbols (medium/large)
- ac_unit:                  Air Conditioner
- kitchen:                  Refrigerator
- local_laundry_service:    Washing Machine
- verified_user:            Professional Installation
- shield:                   Warranty/Protection
- support_agent:            24/7 Support
```

---

## ⚠️ Important Notes

1. **Webpack Only**: Always use `npm run dev` which includes `--webpack` flag
2. **Never Turbopack**: Turbopack doesn't support macOS ARM64
3. **API URL**: Backend must be running on http://localhost:8080
4. **Images**: Using Unsplash URLs that may fail - non-blocking
5. **Performance**: Minor warnings about image `sizes` prop - can fix in Phase 6
6. **Hot Reload**: Frontend auto-compiles on file save

---

## 🧪 Quick Test

```bash
# Start frontend
npm run dev

# Open browser
open http://localhost:3001/spare-parts/appliances

# Test AC feature
- Landing: /spare-parts/appliances
- Listing: /spare-parts/appliances/ac?capacity=1.5
- Detail: /spare-parts/appliances/ac/godrej-1-5t-5s-inverter-split
- Enquiry: /spare-parts/enquiry?product=godrej-1-5t-5s-inverter-split&type=appliance
```

---

## 📚 Related Documentation

- Main Workspace Context: `/WORKSPACE_CONTEXT.md` (root)
- Quick Start Commands: `/QUICK_START.md` (root)
- Backend Docs: `../fixxer-backend/BACKEND_DOCUMENTATION.md`
- Full Workspace Map: See memory files if available

---

**This file is workspace-permanent and agent-independent.**
