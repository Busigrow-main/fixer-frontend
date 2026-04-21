# Spare Parts Seeding & Testing Guide

## Overview

The spare parts system is now complete with:

- ✅ Mobile-first category landing page
- ✅ Popular/featured parts section (shows before categories)
- ✅ 5000 sample spare parts seed script
- ✅ Full UI flow with proper navigation

---

## 🚀 Step 1: Seed Database with 5000 Parts

### Prerequisites

- MongoDB running locally or accessible via `MONGO_URI`
- Backend environment: `fixxer-backend/`

### Run the Seed Script

```bash
cd /Users/misanthropic/codebase/fixxer-backend

# Install dependencies (if not already installed)
npm install

# Run the 5000 parts seed script
node seed-5000-parts.js
```

### Expected Output

The script will:

1. Generate 5000+ diverse spare parts across 8 appliance types
2. Batch insert parts (500 at a time) with progress tracking
3. Mark ~5% as "featured" for landing page display
4. Print statistics:

```
🔗 Connecting to MongoDB...
✅ Connected to mongodb://localhost:27017/fixxer

📱 Refrigerator: Generating 625 parts...
   ⭐ Featured: Samsung Door Gasket (SP-REF-GSK-00001)
   ⭐ Featured: LG Compressor (SP-REF-COM-00045)
   ...
✅ Progress: 500/5000 parts (10%)
✅ Progress: 1000/5000 parts (20%)
...

========== SEEDING COMPLETE ==========
📊 Total parts in database: 5248
⭐ Featured parts: 285

📱 Parts by Appliance Type:
   Refrigerator: 625 parts
   Washing Machine: 625 parts
   Air Conditioner: 625 parts
   Microwave & OTG: 625 parts
   Water Purifier: 400 parts
   Television: 400 parts
   Water Heater / Geyser: 400 parts
   Ceiling Fan: 400 parts
=====================================
```

---

## 🎯 Step 2: Verify Backend API

### Check Featured Parts Endpoint

```bash
# Open terminal and test the API
curl "http://localhost:3000/api/v1/spare-parts?isFeatured=true&limit=12"
```

Expected response: Array of 12 featured parts with all fields populated.

### Test Category Endpoint

```bash
curl "http://localhost:3000/api/v1/spare-parts/categories"
```

Should return array of appliance types with updated `partCount`.

---

## 🌐 Step 3: Start Frontend Dev Server

```bash
cd /Users/misanthropic/codebase/fixxer

npm run dev
```

Frontend will start on `http://localhost:3000`

---

## 📱 Step 4: Test UI Flow

### Landing Page (First Visit)

1. **Open** `/spare-parts` in browser
2. **Verify** sections display in order:
   - ✅ Popular Parts Section (with Zap icon)
     - Should show 6-12 featured parts in a grid
     - Each card shows: image, part name, brand, price, "Add" button
     - "View All" link at top right
     - Helpful tip banner below
   - ✅ Divider line with "Or Browse By" text
   - ✅ Appliance Categories Grid
     - Should show 8 categories: Refrigerator, Washing Machine, AC, etc.
     - Each card shows icon, name, part count
     - Hover animation on cards

### Test Mobile (320px - 767px)

```
Popular Parts:
  - Single column layout
  - Full-width images (h-48)
  - Prices and buttons easily accessible

Categories:
  - 1 column grid
  - Full-width cards
  - Responsive padding
```

**In DevTools:**

- Press F12 → Toggle Device Toolbar
- Set to iPhone 12/14 (390px width)
- Scroll and verify layout

### Test Tablet (768px - 1024px)

```
Popular Parts:
  - 2 column grid
  - Medium-sized cards

Categories:
  - 2 column grid
```

### Test Desktop (1025px+)

```
Popular Parts:
  - 3 column grid

Categories:
  - 3 column grid
```

---

## 🔍 Step 5: Test Category Selection

### Click Appliance Type (e.g., "Refrigerator")

**Expected behavior:**

1. Page transitions to parts browsing state
2. Header shows: "Home > Spare Parts > Refrigerator"
3. Parts load within 2 seconds
4. At least 5-10 parts visible on mobile without scrolling
5. Filters appear: Brand, Model (if applicable), Part Category
6. Search bar visible and functional

### Verify Parts Display

```
Each part card should show:
✅ Product image
✅ Part name
✅ Brand name / SKU
✅ Installation difficulty badge (Easy/Medium/Hard/Professional)
✅ Warranty months badge
✅ "In Stock" badge (if applicable)
✅ Price (formatted with rupee symbol)
✅ MRP (original price) with discount %
✅ "Add" button (or "+ Add" on mobile)
```

### Test Filters

1. **Brand Filter**: Select a brand → parts list narrows
2. **Model Filter**: Select a model → parts list narrows
3. **Category Filter**: Select part category → parts list narrows
4. **Clear All**: Click "Clear All" button → resets all filters

### Test Search

1. Type in search box: "compressor"
2. Parts matching "compressor" should appear
3. Clear search: search box empties, all parts show again

---

## 📊 Step 6: Verify Data Statistics

### Open Browser Console

```javascript
// Check featured parts count
fetch("http://localhost:3000/api/v1/spare-parts?isFeatured=true&limit=100")
  .then((r) => r.json())
  .then((d) => console.log(`Featured parts: ${d.metadata.total}`));

// Check parts by appliance type
fetch(
  "http://localhost:3000/api/v1/spare-parts?applianceType=refrigerator&limit=1",
)
  .then((r) => r.json())
  .then((d) => console.log(`Refrigerator parts: ${d.metadata.total}`));
```

Expected:

- Featured parts: ~250-300 (5% of total)
- Refrigerator parts: 600-700
- Total across all types: 5000+

---

## ✅ Checklist: Full UI Flow Test

### Landing Page

- [ ] Popular Parts section loads with 6-12 featured parts
- [ ] "View All" button links to `/spare-parts?isFeatured=true` or filters
- [ ] Tip banner displays helpful information
- [ ] Appliance categories grid displays 8 categories
- [ ] Category cards show part counts
- [ ] Mobile layout: 1 column, Full-width images
- [ ] Tablet layout: 2 columns
- [ ] Desktop layout: 3 columns

### Category Selection

- [ ] Click appliance type → parts load within 2 seconds
- [ ] Header breadcrumb updates: "Home > Spare Parts > [Category]"
- [ ] 5+ parts visible on mobile without scrolling
- [ ] Part cards display all required fields
- [ ] Filters available: Brand, Model, Category
- [ ] Search bar functional and finds parts

### Filters & Search

- [ ] Brand filter works: narrows results
- [ ] Model filter works: narrows results
- [ ] Category filter works: narrows results
- [ ] Search works: finds parts by name/keyword
- [ ] "Clear All" button resets filters
- [ ] No parts show incorrect data

### Navigation

- [ ] Back button (breadcrumb) returns to landing
- [ ] Selecting different appliance type switches results
- [ ] URL updates with query parameters
- [ ] Can refresh page without losing state

### Mobile-First Design

- [ ] Cards scale properly at all breakpoints
- [ ] Images display at correct sizes
- [ ] Text is readable and not too small
- [ ] Touch targets are 48px minimum
- [ ] No horizontal scroll at any viewport
- [ ] Buttons/inputs are easily tappable

### Performance

- [ ] Featured parts section loads instantly
- [ ] Category parts load within 2-3 seconds
- [ ] Filter changes reflect immediately
- [ ] No UI jank or layout shifts

---

## 🐛 Troubleshooting

### "No parts show up on landing"

- Check backend is running: `curl http://localhost:3000/api/v1/spare-parts/categories`
- Verify seed script completed without errors
- Check MongoDB connection: `mongo mongodb://localhost:27017/fixxer`

### "Popular Parts section is empty"

- Run: `curl http://localhost:3000/api/v1/spare-parts?isFeatured=true&limit=12`
- If response is empty, parts may not have `isFeatured: true`
- Re-run seed script: `node seed-5000-parts.js`

### "Category parts don't load"

- Check appliance type slug is correct (e.g., `refrigerator`, `washing-machine`)
- Verify API: `curl http://localhost:3000/api/v1/spare-parts?applianceType=refrigerator`
- Check browser console for fetch errors

### "Build fails"

- Clear build cache: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Run build again: `npm run build`

---

## 📝 Next Steps (Optional)

Once testing is complete:

1. **Add More Real Data**: Replace generic images with actual product photos
2. **Implement Wishlist**: Save favorite parts for later
3. **Add Analytics**: Track which parts are most viewed/purchased
4. **Pagination**: Implement for categories with 100+ parts
5. **Advanced Filters**: Price range, warranty filtering, availability
6. **Related Parts**: Show "You might also need..." suggestions
7. **Part Details Page**: Expand `/spare-parts/:sku` with full specifications
8. **Live Stock Updates**: Connect to inventory management system

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check terminal output for API errors
4. Verify MongoDB is running: `mongo --version`
5. Verify environment variables are set correctly
