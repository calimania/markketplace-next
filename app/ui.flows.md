# Markket UI Flows

## Onboarding flow

This flow is **designed to familiarize new users** with:

1. Creating their first store
2. Uploading images
3. Adding the basic pages (About, Blog, Products, Newsletter)

…so that they can then explore the dashboard, start adding content, and feel comfortable navigating Markket without getting lost.

When user has no stores, the top navbar shows a create store button.

Depending on the onboarding status, different UI elements are displayed. To guide them on the basics.

If the user only has one store, there's no <select>, just the (logo) name of the store


### Step 0: Email Capture

**Trigger:** User clicks "Get Started"
**Component:** `EmailPopup`
**Inputs:**
- email (text, required)
**Action:** POST `/api/auth/magic-link` → sends login link
**UI Notes:**
- Modal popup
- Success message after submit: "Check your email for the link"
**Next:** Redirect to Step 1

---

### Step 1: Check Email Page

**Component:** `InfoPage`
**Content:**
- "Check your inbox for the magic link"
- Tips about Markket (like benefits, features, how to get started)
**Action:** None
**Next:** User clicks magic link → logs in → Step 2

---

### Step 2: Create Store

**Component:** `OnboardComponent`
**Condition:** user has no stores
**Inputs:**
- `storeName` (text, required)
- `storeDescription` (textarea, optional)
- `storeSlug` (text, optional, auto-generate if empty)
**Action:** POST `/api/stores` → returns `{ storeId, slug }`
**UI Notes:**
- Show progress indicator (Step 1/4)
- Inline validation for name uniqueness
- Clear CTA button: "Create Store"
**Next:** Step 3 – Upload Images

---

### Step 3: Upload Images

**Component:** `ImageUploader`
**Condition:** store created successfully
**Inputs:**
- `logo` (image, optional)
- `coverPhoto` (image, optional)
- `gallery` (multiple images, optional)
**Action:** POST `/api/stores/{storeId}/images`
**UI Notes:**
- Drag & drop or file picker
- Show upload progress
- Preview thumbnails
**Next:** Step 4 – Preview Store

---

### Step 4: Preview Store

**Component:** `StorePreviewCard`
**Condition:** images uploaded or skipped
**Content:**
- Show store link
- Buttons:
  - "View Store" → `/stores/{storeSlug}`
  - "Return to Dashboard" → `/dashboard`
**Next:** Step 5 – Create Basic Pages

---

### Step 5: Create Basic Pages

**Component:** `OnboardComponent` (stepper / wizard style)
**Condition:** store exists
**Inputs per page:**
- **About Page:** `title`, `content` (WYSIWYG / Markdown)
- **Blog:** `title`, `intro` (optional), `coverImage` (optional)
- **Products:** `title`, `description`, `price` (optional placeholder)
- **Newsletter / Signup Form:** `title`, `description`
**Action:** POST `/api/pages` or `/api/content` → returns pageId
**UI Notes:**
- Show checkmark after each page completed
- Optional “Skip” for each page
- Stepper at top: shows progress / which pages are missing
- CTA button: "Go to Dashboard" or "View Page"
**Next:** Redirect to dashboard or page view

---


## Step 6: SEO Suggestions

**Component:** `SeoPanel`
**Condition:** Any page/store with content
**Behavior:**
1. If fields are blank → **prepopulate** via POST `/api/seo-suggest`
2. Show inputs:
   - `metaTitle` (text)
   - `metaDescription` (textarea)
   - `metaKeywords` (text/tags)
3. Display **SEO Score** (0–100) with color-coded badge
4. Buttons:
   - "Recalculate SEO" → calls `/api/seo-suggest` again
   - "Clear SEO Fields" → resets inputs to empty
**UI Notes:**
- Collapsible panel by default
- Tooltip hint: "SEO helps your store/page be found by search engines. Pre-filled values are suggestions."
**Next:** Step 7 – Optional Hints / Dashboard

---

## Step 7: Conditional Onboarding Hints

**Component:** `OnboardHints`
**Condition:** user skips optional pages or first-time dashboard
**Content:**
- Highlight empty sections
- Suggest adding more products/blog/newsletter
- Encourage exploration
**Next:** User navigates freely in dashboard

---


## Notes / Best Practices

- **Minimal fields per step** → reduces friction
- **Immediate success feedback** → user sees progress
- **Optional vs required** → required fields only for first store creation, optional for images/pages
- **Use inline validation** → prevent errors during POST requests
- **Track onboarding completion** → could flag `user.onboardingComplete` in DB
- **Use Markdown / WYSIWYG inputs** → consistent content formatting for About/Blog/Newsletter

---


## Step 8: Payment Setup & Welcome

**Component:** `FinalOnboardPanel`
**Condition:** user completed store + pages onboarding
**Content:**
- Welcome message: "Congrats! Your store is ready 🎉"
- Payment / Stripe info:
  - "Connect your Stripe account to start receiving payments."
  - Options:
    - Button: "Connect Stripe Now" → opens Stripe Connect flow
    - Link/Button: "Do this later" → redirects to `/settings/payment`
- Tip: "You can always update your Stripe settings later from your dashboard."
- CTA: "Go to Dashboard" → redirects `/dashboard`

**UI Notes:**
- Highlight Stripe button for immediate action
- Show friendly checkmarks for completed onboarding steps
- Optional animated celebration or progress confetti to reinforce achievement
- Keep the panel concise and welcoming
**Next:** User lands on Dashboard with completed store + basic pages


## Optional Enhancements

- Save partial progress → allow users to close modal or refresh and resume
- Email reminders if they didn’t finish onboarding
- Analytics → track where users drop off to further reduce friction
- Pre-fill some fields with suggestions / defaults to accelerate setup
- Include “View Store” CTA after each step to reinforce progress

---

