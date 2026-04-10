# Dashboard Cleanup & Planning Summary

**Date**: April 9, 2026
**Status**: ✅ Route consolidation complete; 🟡 endpoint audit & security docs ready; 🟠 implementation pending

---

## What We Completed

### 1. ✅ Dashboard Route Consolidation
- [x] Redirected `/dashboard` → `/me`
- [x] Redirected `/dashboard/[slug]` → `/tienda` or `/me/account` (with mapping)
- [x] Redirected `/dashboard/[slug]/[id]` → `/tienda`
- [x] Added `@deprecated` markers on old dashboard components
- **Result**: Old routes are dead-ends; all traffic flows to new `/tienda` + `/me` structure

### 2. ✅ Embed Header Optimization
- [x] Created `CompactBreadcrumbs` component (shows only in embedded mode)
- [x] Updated `StoreLayout` to use client wrapper + breadcrumbs
- [x] Breadcrumbs show home icon + current section (non-navigable, prevents escape)
- [x] Global banner already hides itself in embed mode
- **Result**: iOS WebView/embed gets more vertical space; users can't navigate away

### 3. ✅ Comprehensive Endpoint Audit
- [x] Created [API_ENDPOINT_AUDIT.md](API_ENDPOINT_AUDIT.md) — matrix of what exists vs what's missing
- [x] Prioritized endpoints: HIGH (editing), LOW (skeletons for iOS verification)
- [x] Identified 4 implementation phases (Editing → Skeletons → Finance → Details)

### 4. ✅ Security Strategy Documentation
- [x] Created [PROXY_SECURITY_STRATEGY.md](PROXY_SECURITY_STRATEGY.md) — detailed proxy model
- [x] Mapped high-risk endpoints (orders, subscribers, inboxes)
- [x] Defined sanitization rules per content type
- [x] Provided code patterns for secure endpoints

---

## What's Next (Organized by Priority)

### Phase 1: Unblock Content Editing (URGENT)
**Why**: Dashboard is unusable without save functionality
**Effort**: ~1-2 days

```
Tasks:
[ ] Add PUT/PATCH/DELETE rules to /api/markket proxy
[ ] Consolidate /api/markket/cms POST through main proxy
[ ] Test: edit + save a product
[ ] Test: delete an article
[ ] Verify store affiliation on mutations
```

### Phase 2: Skeleton Pages for iOS (2-3 days)
**Why**: iOS app needs routes to hit; can implement details later
**Priority**: Low (no backend work, just UI)

```
[ ] Create /tienda/[storeSlug]/subscribers/page.tsx (list skeleton)
[ ] Create /tienda/[storeSlug]/orders/page.tsx (list skeleton)
[ ] Create /tienda/[storeSlug]/newsletter/page.tsx (list skeleton)
[ ] Create /tienda/[storeSlug]/inbox/page.tsx (list skeleton)
[ ] Test iOS app can navigate to these routes
```

### Phase 3: Finance Page + Stripe Onboarding (2-3 days)
**Why**: Store owners need to see payout info
**What**:
- [ ] Create `/tienda/[storeSlug]/finance/page.tsx`
- [ ] Add `/api/stripe/connect/status` endpoint (check if STRIPE_ID exists)
- [ ] Onboarding CTA if no STRIPE_ID
- [ ] Hook to existing `/api/stripe/connect?action=account`
- [ ] Fetch + display: Stripe balance, recent payouts

### Phase 4: Form Component Library (3-4 days)
**Why**: Products, events, newsletter all need special editors
**What**:
- [ ] **Prices Editor** — dynamic list (amount, currency, STRIPE_ID, description)
- [ ] **URLs Editor** — key-value pairs (Label + URL)
- [ ] **Image Upload** — crop/trim/resize (mobile: media suite; desktop: simple)
- [ ] **Schedule Picker** — date + time + timezone
- [ ] **SEO Widget** — preview + edit + AI fill

### Phase 5: Content Editors (4-5 days)
**Why**: Newsletter + albums need tiptap
**What**:
- [ ] **Newsletter Editor** — tiptap + send mock + schedule
- [ ] **Album Editor** — cover image + track selector + display type
- [ ] **Track Editor** — URLs + media gallery + tiptap
- [ ] **Event Editor** — layout with images/prices/schedule sections

### Phase 6: Detail Views & Sensitive Data (3-4 days)
**Why**: Store owners need to view orders/subscribers/inbox
**What**:
- [ ] Orders detail: sanitized response
- [ ] Subscribers detail: no email exposure
- [ ] Inbox: form submission threads
- [ ] Add audit logging for all access

---

## Content Type Status Matrix

| Type | Existing Route | Edit Capable | View Detail | Delete | Priority |
|------|---|---|---|---|---|
| Products | ✅ /tienda/[slug]/products | ❌ | ✅ | ❌ | 🔴 Phase 1 |
| Articles | ✅ /tienda/[slug]/articles | ❌ | ✅ | ❌ | 🔴 Phase 1 |
| Events | ✅ /tienda/[slug]/events | ❌ | ✅ | ❌ | 🔴 Phase 1 |
| Albums | ✅ /tienda/[slug]/albums | ❌ | ✅ | ❌ | 🔴 Phase 1 |
| Tracks | ✅ /tienda/[slug]/tracks | ❌ | ✅ | ❌ | 🔴 Phase 1 |
| Subscribers | 🟡 Skeleton | ❌ (read-only) | 🟡 Placeholder | ❌ | 🟡 Phase 2 |
| Orders | 🟡 Skeleton | ❌ (read-only) | 🟡 Placeholder | ❌ | 🟡 Phase 2 |
| Newsletter | ❌ Missing | ❌ | ❌ | ❌ | 🟡 Phase 2 |
| Inbox | 🟡 Skeleton | ❌ (read-only) | 🟡 Placeholder | ❌ | 🟡 Phase 2 |
| Finance | ❌ Missing | ❌ (onboarding only) | ❌ | ❌ | 🟠 Phase 3 |

---

## Risk Mitigation Strategy

### Data Exposure Prevention
✅ Using proxy `/api/markket` to centralize auth + store affiliation checks
✅ Documented sanitization rules per content type
✅ Store affiliation verification on every read/write

### User Confusion Prevention
✅ Removed old /dashboard routes (no dead ends)
✅ Breadcrumbs for embedded mode (no full nav)
✅ Clear deprecation markers on old components

### iOS App Readiness
✅ Skeleton pages so app can verify routes work
✅ Embed mode optimized (no header bloat)
✅ Query params propagated through nav (via EmbedQueryPropagator)

### Production Safety Planning
✅ Audit trail structure defined (immutable logs)
✅ Soft-delete recommended for first 2 weeks
✅ Rate limiting + request validation checklist provided

---

## File References

| Document | Purpose | Read When |
|----------|---------|-----------|
| [API_ENDPOINT_AUDIT.md](API_ENDPOINT_AUDIT.md) | What endpoints exist/missing, prioritized phases | Planning implementation |
| [PROXY_SECURITY_STRATEGY.md](PROXY_SECURITY_STRATEGY.md) | How to keep sensitive data safe, transformation rules | Building secure endpoints |
| [app/hooks/useEmbeddedMode.ts](app/hooks/useEmbeddedMode.ts) | Detects embed mode from query params (fixed async dispatch) | Understanding nav behavior |
| [app/components/tienda/compact-breadcrumbs.tsx](app/components/tienda/compact-breadcrumbs.tsx) | Minimal nav for embedded mode | Embedding in other layouts |
| [app/tienda/[storeSlug]/layout.tsx](app/tienda/[storeSlug]/layout.tsx) | Updated to use client wrapper + breadcrumbs | Understanding new structure |

---

## Recommended Starting Point

**If starting tomorrow**:
1. Pick **Phase 1** (unblock editing)
2. Add PUT/PATCH/DELETE rules to proxy
3. Test with a real product/article edit
4. Verify audit logging works
5. Ship to staging for iOS testing

**Expected time to Phase 1 completion**: 1-2 days
**Expected time to Phase 2 (skeletons)**: Additional 2-3 days
**Expected time to Phase 3 (finance)**: Additional 2-3 days

---

## Open Questions for Clarification

1. **Buyer screens** — Should these be separate from `/tienda/[storeSlug]`? (e.g., `/shop/[storeSlug]/...`)
2. **Newsletter send** — Real email or mock only for now?
3. **Audit logging** — Database table + API endpoint?
4. **Rate limiting** — Per-user or per-IP?
5. **Soft-delete** — Always, or only for content?
6. **Image processing** — Use Cloudinary or sharp middleware?

---

## You Know Where to Look

- Proxy rules: [`/app/api/markket/route.ts`](app/api/markket/route.ts)
- Stripe integration: [`/app/api/stripe/connect/route.ts`](app/api/stripe/connect/route.ts)
- TypeScript types: [`/markket/*.d.ts`](markket/)
- Dashboard components: [`/app/components/dashboard/`](app/components/dashboard/) (all marked @deprecated)
- New dashboard: [`/app/components/tienda/`](app/components/tienda/) and [`/app/tienda/[storeSlug]/`](app/tienda/[storeSlug]/)

---

**Questions? Check the audit docs first — they have detailed sections on security, implementation patterns, and testing.**
