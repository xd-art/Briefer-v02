# Phase 6 Testing Checklist

**Status:** Ready for Testing  
**Date:** 2025-12-13  
**Tester:** ___________

---

## Pre-Testing Setup

- [ ] Application running on `http://localhost:3000`
- [ ] Backend server running on `http://localhost:3003`
- [ ] Database populated with articles and categories
- [ ] Browser console open (F12)

---

## Test 1: BlogList Page (`/blog`)

**URL:** `http://localhost:3000/blog`

### Desktop Testing (≥ 1024px)

- [ ] Page loads without errors
- [ ] Header displays correctly
- [ ] **Left sidebar visible** (3 columns width)
  - [ ] Shows 6 main categories with icons
  - [ ] Categories are expandable/collapsible
  - [ ] Category links work
- [ ] **Center content visible** (6 columns width)
  - [ ] "Collection of Articles About Human Action" title
  - [ ] Introduction text displays
  - [ ] Blog cards grid (2 columns)
  - [ ] All blog cards render
- [ ] **Right sidebar visible** (3 columns width)
  - [ ] "Featured from Categories" section
  - [ ] Shows 4 featured articles
  - [ ] "Random Inspiration" section
  - [ ] "Quick Links" section
- [ ] No console errors
- [ ] Layout looks balanced

### Mobile Testing (< 1024px)

- [ ] Resize browser below 1024px
- [ ] Left sidebar disappears
- [ ] Right sidebar disappears
- [ ] Center content expands to full width
- [ ] Blog cards still display correctly
- [ ] No horizontal scrolling
- [ ] All functionality works

### Interaction Testing

- [ ] Click category in left nav → navigates correctly
- [ ] Click featured article in right sidebar → opens article
- [ ] Click blog card → navigates to blog post
- [ ] Expand/collapse categories in left nav
- [ ] All links functional

---

## Test 2: CategoriesPage (`/categories`)

**URL:** `http://localhost:3000/categories`

### Desktop Testing (≥ 1024px)

- [ ] Page loads without errors
- [ ] Header displays correctly
- [ ] **Left sidebar visible**
  - [ ] Categories navigation
  - [ ] Icons display
  - [ ] Links functional
- [ ] **Center content visible**
  - [ ] "How-to Article Categories" title
  - [ ] "Select an area to view instructions" text
  - [ ] Three category groups:
    - [ ] Programming & Development
    - [ ] Business & Management
    - [ ] Design & Creative
  - [ ] All subcategory links display
- [ ] **Right sidebar visible**
  - [ ] Featured articles
  - [ ] Random inspiration
  - [ ] Quick links
- [ ] No console errors

### Mobile Testing (< 1024px)

- [ ] Sidebars hidden
- [ ] Content full width
- [ ] Categories list readable
- [ ] No horizontal scroll

### Interaction Testing

- [ ] Click subcategory link → navigates to articles page
- [ ] Click left nav category → navigates
- [ ] Click right sidebar article → opens article
- [ ] All links work correctly

---

## Test 3: CategoryArticlesPage

**URL:** `http://localhost:3000/categories/graphic-design/web-design`
*(Adjust based on your actual categories)*

### Desktop Testing (≥ 1024px)

#### Loading State
- [ ] Briefly shows loading spinner
- [ ] **3-column layout maintained during loading**
- [ ] Left sidebar visible
- [ ] Right sidebar visible
- [ ] Spinner in center column

#### Loaded State
- [ ] Page loads without errors
- [ ] **Left sidebar visible**
  - [ ] Categories navigation
  - [ ] Current category highlighted (optional feature)
- [ ] **Center content visible**
  - [ ] Category title displays
  - [ ] "Articles in this category" subtitle
  - [ ] Articles list displays
  - [ ] Each article shows:
    - [ ] Title (clickable)
    - [ ] Author name
    - [ ] Date
    - [ ] Facet tags (up to 3)
    - [ ] "Edit & save to profile" button
- [ ] **Right sidebar visible**
  - [ ] Featured articles from other categories
  - [ ] Random inspiration
  - [ ] Quick links
- [ ] No console errors

#### Error State (If applicable)
- [ ] Force error (disconnect backend)
- [ ] **3-column layout maintained**
- [ ] Error message in center
- [ ] "Retry" button visible
- [ ] Sidebars still visible

### Mobile Testing (< 1024px)

- [ ] Sidebars hidden
- [ ] Articles list full width
- [ ] All article information visible
- [ ] Buttons accessible
- [ ] No horizontal scroll

### Interaction Testing

- [ ] Click article title → opens article detail page
- [ ] Click "Edit & save to profile" → navigates to editor
- [ ] Click facet tag → navigates to category (if implemented)
- [ ] Click left nav category → navigates
- [ ] Click right sidebar article → opens article
- [ ] All interactions work smoothly

---

## Test 4: Responsive Behavior (All Pages)

### Breakpoint Testing

Test on each page: Blog, Categories, Category Articles

#### At 1024px (Breakpoint)
- [ ] Sidebars visible at 1024px and above
- [ ] Sidebars hidden at 1023px and below
- [ ] Smooth transition

#### Common Widths
- [ ] **1920px (Full HD):** 3 columns, good spacing
- [ ] **1440px (Laptop):** 3 columns, balanced
- [ ] **1024px (Tablet landscape):** 3 columns appear
- [ ] **768px (Tablet portrait):** 1 column
- [ ] **375px (Mobile):** 1 column, good readability

### Scroll Testing
- [ ] Left sidebar sticky (stays visible while scrolling)
- [ ] Right sidebar sticky (stays visible while scrolling)
- [ ] Center content scrolls normally
- [ ] No layout jumping

---

## Test 5: Cross-Page Navigation

Start at Blog page, navigate through app:

- [ ] `/blog` → Click left nav category → Category page loads with layout
- [ ] Category page → Click subcategory → Articles page loads with layout
- [ ] Articles page → Click article → Article detail page
- [ ] Back button → Returns to articles with layout intact
- [ ] Click blog link in header → Blog page with layout
- [ ] Layout consistent throughout journey

---

## Test 6: Browser Compatibility

Test all pages in:

### Chrome/Edge
- [ ] Blog page works
- [ ] Categories page works
- [ ] Category articles page works
- [ ] Layout renders correctly
- [ ] No console errors

### Firefox
- [ ] Blog page works
- [ ] Categories page works
- [ ] Category articles page works
- [ ] Layout renders correctly
- [ ] No console errors

### Safari (if available)
- [ ] Blog page works
- [ ] Categories page works
- [ ] Category articles page works
- [ ] Layout renders correctly
- [ ] No console errors

---

## Test 7: Performance

### Load Times
- [ ] Blog page loads in < 2 seconds
- [ ] Categories page loads in < 2 seconds
- [ ] Category articles page loads in < 2 seconds
- [ ] Sidebars load quickly

### API Calls (Check Network tab)
- [ ] Left nav: 1 call to `/api/facets`
- [ ] Right sidebar: 6 parallel calls to `/api/articles/categories/*`
- [ ] All requests complete quickly
- [ ] No failed requests

### Rendering
- [ ] No layout shifts during load
- [ ] Smooth scrolling
- [ ] No flickering
- [ ] Animations smooth (if any)

---

## Test 8: Visual Consistency

### Layout
- [ ] All pages use same 3-6-3 distribution
- [ ] Consistent spacing on all pages
- [ ] Consistent gap between columns
- [ ] Consistent padding

### Sidebars
- [ ] Left sidebar looks same on all pages
- [ ] Right sidebar looks same on all pages
- [ ] Icons display correctly
- [ ] Colors/gradients consistent

### Typography
- [ ] Consistent fonts across pages
- [ ] Consistent heading sizes
- [ ] Good readability
- [ ] No text overflow

---

## Test 9: Edge Cases

### Empty States
- [ ] Category with no articles → Shows "No articles found"
- [ ] Layout maintained
- [ ] No errors

### Long Content
- [ ] Long article titles → Wrap correctly
- [ ] Many categories → Scrollable sidebar
- [ ] Many articles → List scrolls properly

### Network Issues
- [ ] Slow connection → Loading states show
- [ ] Failed API call → Error handled gracefully
- [ ] Retry works

---

## Test 10: Accessibility

### Keyboard Navigation
- [ ] Tab through all pages
- [ ] All links focusable
- [ ] All buttons focusable
- [ ] Focus visible
- [ ] Enter key activates links/buttons

### Screen Reader (if available)
- [ ] Page structure announced correctly
- [ ] Navigation landmarks identified
- [ ] Link text meaningful
- [ ] ARIA labels present

### Visual
- [ ] Good contrast ratios
- [ ] Text readable at all sizes
- [ ] No color-only indicators
- [ ] Zoom to 200% → Still usable

---

## Bug Report Template

If issues found:

```
Page: _________
Browser: _________
Screen Size: _________

Issue:
[Describe what went wrong]

Expected:
[What should have happened]

Steps to Reproduce:
1. 
2. 
3. 

Screenshot: [If applicable]

Console Errors: [Copy any errors]
```

---

## Sign-off

### Testing Complete

- [ ] All tests passed
- [ ] No critical issues
- [ ] Minor issues documented
- [ ] Ready for production

**Tester Signature:** _______________  
**Date:** _______________  
**Notes:**

---

---

## Quick Test (5 Minutes)

If time is limited, run this quick test:

1. **Desktop (1920px):**
   - [ ] Visit `/blog` → 3 columns visible
   - [ ] Visit `/categories` → 3 columns visible
   - [ ] Visit `/categories/graphic-design/web-design` → 3 columns visible
   - [ ] No errors in console

2. **Mobile (375px):**
   - [ ] Visit `/blog` → 1 column, sidebars hidden
   - [ ] Visit `/categories` → 1 column, sidebars hidden
   - [ ] Visit category articles → 1 column, sidebars hidden
   - [ ] No horizontal scroll

3. **Interaction:**
   - [ ] Click any left nav link → Works
   - [ ] Click any right sidebar article → Works
   - [ ] Click any main content link → Works

**If all pass:** Phase 6 is working! ✅

---

**GOOD LUCK WITH TESTING!** 🚀
