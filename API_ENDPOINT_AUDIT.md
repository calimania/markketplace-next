# API Endpoint Audit & Implementation Strategy

**Date**: April 9, 2026
**Status**: Planning phase — prioritize carefully to avoid exposing sensitive data
**Proxy Strategy**: All dashboard requests go through `/api/markket` to enforce store affiliation + user auth

---

## 1. Current Proxy Rules (`/api/markket`)

### ✅ Existing Rules
```typescript
PROXY_RULES = [
  // Public (no auth)
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local\/register$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/forgot-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/reset-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth-magic\/request$/ },

  // Protected (auth required)
  { methods: ['POST'], requiresAuth: true, match: /^\/api\/upload$/ },
  { methods: ['GET'], requiresAuth: true, match: /^\/api\/(articles|pages|products|albums|tracks|events|subscribers|inboxes|forms|orders|stores)\/[^/?#]+$/ },
  { methods: ['GET'], requiresAuth: true, match: /^\/api\/(articles|pages|products|albums|tracks|events|subscribers|inboxes|forms|orders|stores)(\?.*)?$/ },
]
```

### ⚠️ Issues
- **No PUT/PATCH rules** — Can't update content (products, articles, etc.)
- **No DELETE rules** — Can't delete content
- **POST for CMS** — Creates go through `/api/markket/cms` instead of main proxy
- **No store affiliation check on GET** — Currently trusts Strapi query filtering

---

## 2. Content Type Endpoint Matrix

### Legend
- 🟢 **Ready** — Endpoint exists, secure
- 🟡 **Partial** — Endpoint exists, needs review or limits
- 🔴 **Missing** — Not implemented yet
- 🔒 **Auth Required** — Must check store ownership + user permission

| Content Type | GET List | GET By ID | POST Create | PUT/PATCH | DELETE | Notes |
|---|---|---|---|---|---|---|
| **articles** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | Via `/api/markket` + `/api/markket/cms` |
| **products** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | Need prices + urls editors |
| **pages** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | |
| **events** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | Need schedule, prices editors |
| **albums** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | Need track relationships |
| **tracks** | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | Need URLs editor, can belong to multiple albums |
| **subscribers** | 🟡 | 🟡 | 🔴 | 🔴 | 🔴 | Read-only; inbound |
| **orders** | 🟡 | 🟡 | 🔴 | 🔴 | 🔴 | Read-only; sensitive; need refund endpoint |
| **newsletter** | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Editions, schedule, send mock |
| **inbox (forms)** | 🟡 | 🟡 | 🔴 | 🔴 | 🔴 | Read-only; form submissions |
| **finance (stripe)** | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Balance, payouts, onboarding status |

---

## 3. Dashboard Sections & Required Endpoints

### Must Have (mvp)
| Page | Endpoints Needed | Priority |
|------|---|---|
| `/tienda/[storeSlug]/products` | `GET /api/products?store=[slug]` + edit/delete | 🟠 HIGH |
| `/tienda/[storeSlug]/articles` | `GET /api/articles?store=[slug]` + edit/delete | 🟠 HIGH |
| `/tienda/[storeSlug]/events` | `GET /api/events?store=[slug]` + edit/delete | 🟠 HIGH |
| `/tienda/[storeSlug]/albums` | `GET /api/albums?store=[slug]` + `GET /api/tracks?album=[id]` | 🟠 HIGH |
| `/tienda/[storeSlug]/tracks` | `GET /api/tracks?store=[slug]` (standalone lib) | 🟠 HIGH |
| `/tienda/[storeSlug]/finance` | `GET /api/stripe/balance`, `GET /api/stripe/payouts`, `POST /api/stripe/onboarding` | 🟠 HIGH |

### Can Start with Skeletons (ios-verifiable)
| Page | Endpoints Needed | Priority |
|------|---|---|
| `/tienda/[storeSlug]/subscribers` | `GET /api/subscribers?store=[slug]` | 🟡 LOW |
| `/tienda/[storeSlug]/orders` | `GET /api/orders?store=[slug]` | 🟡 LOW |
| `/tienda/[storeSlug]/newsletter` | `GET /api/newsletter?store=[slug]` + `POST /api/newsletter/send-mock` | 🟡 LOW |
| `/tienda/[storeSlug]/inbox` | `GET /api/inboxes?store=[slug]` | 🟡 LOW |

---

## 4. Endpoint Security Checklist

### Store Affiliation Verification
Every authenticated request must verify:
```
User → Stores (1:N) ✓
Requested Content → Store (M:1) ✓
User's Store Set ∩ Content's Store = Not Empty ✓
```

**Risk**: User tokens could be spoofed; always re-verify store ownership server-side.

### High-Risk Endpoints (Sensitive Data)
- ❌ **Orders**: Must verify user is store owner before returning order data
- ❌ **Subscribers**: Must verify user is store owner
- ❌ **Inbox/Forms**: Email + message content; verify owner
- ❌ **Finance**: Stripe details; verify owner

### Transform Required (Proxy Benefits)
- **GET /api/orders** → Strapi response includes customer emails/payment details → Filter/transform before client
- **GET /api/subscribers** → Export-ready, but only to store owners
- **Subscriber list pagination** → Transform large lists (>1000) for performance

---

## 5. Proxy Rules to Add

### Immediate (for edit flow)
```typescript
const PROXY_RULES_UPDATE = [
  // Update endpoints (auth required, store verification)
  { methods: ['PUT', 'PATCH'], requiresAuth: true,
    match: /^\/api\/(articles|pages|products|albums|tracks|events)\/[^/?#]+$/ },

  // Delete endpoints (auth required, store verification)
  { methods: ['DELETE'], requiresAuth: true,
    match: /^\/api\/(articles|pages|products|albums|tracks|events)\/[^/?#]+$/ },
];

// CMS POST should route through main proxy too
const PROXY_RULES_CREATE = [
  { methods: ['POST'], requiresAuth: true,
    match: /^\/api\/(articles|pages|products|albums|tracks|events|newsletters)($|\?)/ },
];
```

### Later (read-only, requires transform)
```typescript
const PROXY_RULES_READONLY = [
  // Sensitive read-only (transform before client)
  { methods: ['GET'], requiresAuth: true,
    match: /^\/api\/(orders|subscribers|inboxes)(\?.*)?$/, transform: 'sanitizeForOwner' },

  // Finance/Stripe
  { methods: ['GET', 'POST'], requiresAuth: true,
    match: /^\/api\/stripe\/(balance|payouts|onboarding)/ },
];
```

---

## 6. Implementation Phases

### Phase 1: Unblock Editing (Week 1)
- [ ] Add PUT/PATCH/DELETE proxy rules
- [ ] Route `/api/markket/cms` POST through main proxy (consolidate)
- [ ] Test edit flow: products, articles, events
- [ ] Verify store affiliation on each write

### Phase 2: Skeleton Read-Only Pages (Week 2)
- [ ] Create `/tienda/[storeSlug]/subscribers/page.tsx` (list skeleton, no detail yet)
- [ ] Create `/tienda/[storeSlug]/orders/page.tsx` (list skeleton)
- [ ] Create `/tienda/[storeSlug]/newsletter/page.tsx` (list skeleton)
- [ ] Create `/tienda/[storeSlug]/inbox/page.tsx` (list skeleton)
- [ ] iOS can verify routes are hit
- [ ] No backend work required

### Phase 3: Finance Page (Week 2-3)
- [ ] Create `/tienda/[storeSlug]/finance/page.tsx`
- [ ] Add `/api/stripe/connect/status` endpoint (check if STRIPE_ID exists)
- [ ] Add Stripe onboarding CTA (if no STRIPE_ID)
- [ ] Hook up to existing `/api/stripe/connect?action=account`

### Phase 4: Detailed Views (Week 3-4)
- [ ] Orders: Detail page + refund endpoint
- [ ] Subscribers: Detail page + segment view
- [ ] Newsletter: Edition creator + send mock
- [ ] Inbox: Message thread view

### Phase 5: Form Enhancements (Week 4+)
- [ ] Prices editor (dynamic list)
- [ ] URLs editor (key-value pairs)
- [ ] Image upload + crop/trim
- [ ] SEO widget + AI fill
- [ ] Schedule picker
- [ ] Tiptap integration (newsletter, albums)

---

## 7. Embed Mode Optimization

### Current Issue
Headers are too tall in embedded webviews (iOS, WebView).

### Solution
Use `useEmbeddedMode()` hook (already fixed) to conditionally render:

```tsx
// app/tienda/[storeSlug]/layout.tsx
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';

export default function StoreLayout({ children, params }: StoreLayoutProps) {
  const embedded = useEmbeddedMode();

  return (
    <>
      {!embedded && <TallHeader />}
      {embedded && <CompactBreadcrumbs />}
      <Container>{children}</Container>
    </>
  );
}
```

**Benefits**:
- ✅ No nav confusion in embedded context
- ✅ More vertical space in iOS WebView
- ✅ Pretty blue breadcrumbs remain (non-interactive)
- ✅ Native iOS app can control layout via `?display=embed`

---

## 8. Buyer Screens (Future)

| Page | Purpose | Notes |
|------|---------|-------|
| `/shop/[storeSlug]/products/[productId]` | Product detail + add to cart | Public, read-only |
| `/shop/[storeSlug]/events/[eventId]` | Event detail + register/buy | Public, read-only |
| `/shop/[storeSlug]/checkout` | Stripe Checkout flow | Public, requires Stripe session |
| `/orders/[orderId]` | Order receipt (buyer view) | Token-based access, not store-owned |

**Note**: These are separate from the dashboard; they use public `/api` endpoints (no auth).

---

## 9. Known Gaps & Risks

| Gap | Risk | Mitigation |
|-----|------|-----------|
| No order detail view yet | Buyers can't see receipts | Implement public order token access |
| Subscriber export unimplemented | Compliance risk (GDPR) | Add export endpoint + audit log |
| Newsletter send not tested | Could spam subscribers | Mock send first, test thoroughly |
| No image transform on proxy | Optimization risk | Consider Cloudinary or sharp middleware |
| SEO widget (AI fill) not built | Manual entry is tedious | Implement later, start with forms |

---

## 10. Running Todo

- [ ] Consolidate CMS POST through main `/api/markket` proxy
- [ ] Add PUT/PATCH/DELETE rules to proxy
- [ ] Implement store affiliation verification middleware
- [ ] Skeleton pages for subscribers, orders, newsletter, inbox
- [ ] Finance page + Stripe onboarding flow
- [ ] Prices editor component
- [ ] URLs editor component
- [ ] Embed header optimization in StoreLayout
- [ ] SEO widget (preview + edit + AI)
- [ ] Tiptap integration for newsletter + albums
- [ ] Access logs + audit trail for sensitive operations
