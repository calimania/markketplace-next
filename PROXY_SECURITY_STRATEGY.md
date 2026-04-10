# Proxy Security Strategy

**Goal**: Centralize all dashboard API requests through `/api/markket` to enforce store affiliation + user authorization, preventing unauthenticated access to sensitive data.

---

## 1. Core Security Model

```
Browser Request
    ↓
/api/markket (proxy)
    ├─ Verify JWT token → extract user_id + email
    ├─ Fetch user's authorized store slugs from Strapi
    ├─ If GET request: verify (?filters[store][slug] or target entity belongs to user's stores)
    ├─ Transform response (remove sensitive fields for public data)
    └─ Forward to Strapi

Strapi Response
    ↓
/api/markket (response transformation layer)
    ├─ Strip / sanitize fields based on content type
    ├─ Remove internal IDs if public view
    └─ Return to client
```

---

## 2. Current Implementation Issues

### ✅ What's Good
- **Auth check exists**: Proxy verifies JWT token
- **Store affiliation logic exists**: Fetches user's stores + applies filters
- **Upload protected**: POST /upload requires auth

### ⚠️ What's Missing
- **No PUT/PATCH/DELETE rules**: Editor can't save changes
- **No transform on response**: Sensitive data could leak (e.g., order payment details to wrong user)
- **No audit logging**: Who accessed what, when?
- **No rate limiting**: Potential abuse on read endpoints
- **No request validation**: Malicious queries could bypass filters

---

## 3. High-Risk EndpointsTable

| Endpoint | Risk | Current Status | Mitigation |
|----------|------|---|---|
| **GET /api/orders** | Customer emails, payment details | 🟡 Proxy rules exist but no transform | Filter response: only `id`, `total`, `status`, `createdAt` |
| **GET /api/subscribers** | Email list, contact info | 🟡 Proxy rules exist but no transform | Strip private fields; require owner verification |
| **GET /api/inboxes** | User messages, form submissions | 🟡 Proxy rules exist but no transform | Verify form owner; mask user emails |
| **PUT /api/products/[id]** | Product data | 🔴 No rule yet | Add rule + verify store ownership |
| **DELETE /api/products/[id]** | Destructive | 🔴 No rule yet | Add rule + soft-delete logging |
| **POST /api/stripe/connect** | Payment provider link | 🟡 Endpoint exists | Verify user +store ownership |
| **GET /api/stripe/balance** | Sensitive payout info | 🔴 Endpoint doesn't exist | Create endpoint; verify owner + rate-limit |

---

## 4. Implementation Checklist

### Immediate (This week)
- [ ] Add PUT/PATCH/DELETE rules to `/api/markket/route.ts`
- [ ] Consolidate `/api/markket/cms` POST through main proxy
- [ ] Verify store affiliation on every write operation

### Short-term (Next 1-2 weeks)
- [ ] Create response transform middleware for orders, subscribers, inboxes
- [ ] Add request validation (reject malicious filters)
- [ ] Implement audit logging for sensitive operations
- [ ] Add rate limiting to read endpoints

### Medium-term (Next 3-4 weeks)
- [ ] Create `/api/stripe/connect/status` endpoint (check STRIPE_ID)
- [ ] Implement full order + subscriber detail views with proper sanitization
- [ ] Newsletter send endpoint (with audit log + confirmation flow)

### Long-term (Later)
- [ ] GDPR export endpoint for subscribers (data controller responsibility)
- [ ] Formal audit trail UI for store admins
- [ ] Role-based access (team members with limited scope)

---

## 5. Code Pattern: Adding a New Protected Endpoint

### Example: PUT /api/products/[id] (Update Product)

```typescript
// /api/markket/route.ts - Add to PROXY_RULES
{
  methods: ['PUT', 'PATCH'],
  requiresAuth: true,
  match: /^\/api\/(products|articles|events|pages|albums|tracks)\/[^/?#]+$/,
}

// /app/api/markket/middleware.ts - New verification middleware
async function verifyStoreAccessForMutation(
  method: string,
  contentType: string,
  itemId: string,
  userStores: Set<string>
) {
  const item = await fetch(
    `${STRAPI_URL}/api/${contentType}/${itemId}?fields[0]=store&fields[1]=stores`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
  ).then(r => r.json());

  const itemStore = item.data?.store?.slug || item.data?.stores?.[0]?.slug;

  if (!itemStore || !userStores.has(itemStore)) {
    throw new UnauthorizedError(`User cannot ${method} this ${contentType}`);
  }

  // Log mutation for audit trail
  logAuditEvent({
    action: `${method.toUpperCase()} ${contentType}`,
    itemId,
    userId: req.headers.get('markket-user-id'),
    timestamp: new Date(),
  });
}
```

---

## 6. Response Sanitization Rules

### Orders (High-Risk)
```typescript
// What store owner sees
{
  id, documentId, total, status, createdAt, updatedAt,
  product { id, title, price },      // ✓ safe
  customer { id, firstName, lastName } // ✓ no email
  // ✗ Remove: payment_method, card_last_4, customer.email, customer.phone
}

// What buyer sees (token-based, separate endpoint)
{
  id, total, status, createdAt,
  items [ { product { title }, quantity, price } ],
  // ✗ Never: customer info, payment details
}
```

### Subscribers (High-Risk)
```typescript
// What store owner sees
{
  id, documentId, email, createdAt, updatedAt,
  subscribedAt, unsubscribedAt
  // ✓ Format email domain only in UI (user@****.com)
}

// What public sees
{ id } // Only in aggregate stats, never detail
```

### Forms/Inbox (Sensitive)
```typescript
// What form owner sees
{
  id, documentId, createdAt, submittedAt,
  form { title },
  data { /* user input */ },
  submitterEmail,  // ✓ visible to form owner
  submitterName    // ✓ visible to form owner
}

// What other users see
// ✗ 403 Forbidden (not their form)
```

---

## 7. Proxy Implementation Roadmap

### Current State
```typescript
const PROXY_RULES = [
  // Auth (public)
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\// },

  // Get/Create (protected)
  { methods: ['GET'], requiresAuth: true, match: /^\/api\/(articles|products|...)/ },
  { methods: ['POST'], requiresAuth: true, match: /^\/api\/(articles|products|...)/ },
]
```

### Target State
```typescript
const PROXY_RULES = [
  // Auth (public)
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\//, transform: 'none' },

  // Reads (protected + sanitized)
  { methods: ['GET'], requiresAuth: true, match: /^\/api\/(articles|products|...)/, transform: 'sanitizeForStore' },
  { methods: ['GET'], requiresAuth: true, match: /^\/api\/(orders|subscribers|inboxes)/, transform: 'sensitiveReadOnly' },

  // Writes (protected + audited)
  { methods: ['POST'], requiresAuth: true, match: /^\/api\/(article|products|...)/, transform: 'validateAndLog' },
  { methods: ['PUT', 'PATCH'], requiresAuth: true, match: /^\/api\/.*/, transform: 'validateAndLog' },
  { methods: ['DELETE'], requiresAuth: true, match: /^\/api\/.*/, transform: 'auditDelete' },
]
```

---

## 8. Example: Secure Proxy Enhanced

```typescript
// app/api/markket/route.ts - Enhanced proxy

async function handleRequest(req: NextRequest) {
  const { method, path } = parseRequest(req);
  const rule = findRule(method, path);

  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (rule.requiresAuth) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's authorized stores (cache for 1 min)
  const userStores = await fetchUserStores(user.id);

  // Verify store affiliation for this request
  if (isMutationRequest(method)) {
    await verifyStoreAccessForMutation(method, req, userStores);
    await logAuditEvent(req, user.id, 'mutation');
  }

  // Forward to Strapi
  const strapiResponse = await fetch(
    `${STRAPI_URL}${path}`,
    {
      method,
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, ...req.headers },
      body: req.body,
    }
  );

  // Transform response based on rule
  const sanitized = await applyTransform(
    rule.transform,
    strapiResponse,
    userStores,
    user.id
  );

  return NextResponse.json(sanitized, { status: strapiResponse.status });
}
```

---

## 9. Audit Trail Structure

Every sensitive operation should log:

```typescript
{
  id: uuid(),
  action: 'UPDATE_PRODUCT', // or 'DELETE_SUBSCRIBER', 'VIEW_ORDER', etc.
  userId: number,
  storeId: number,
  resourceId: string,
  resourceType: string,
  changes?: { before: any, after: any },
  status: 'success' | 'failed',
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string,
  timestamp: Date,
}
```

**Access**: Available only to store admin via `/api/audit-logs?store=[slug]`

---

## 10. Testing Checklist

- [ ] Unauthorized user cannot read other store's products
- [ ] User cannot PUT/PATCH another store's products
- [ ] Subscribers endpoint strips email from non-owner
- [ ] Order endpoint strips payment details from non-owner
- [ ] Deleted items are soft-deleted with audit entry
- [ ] Audit logs are tamper-proof (immutable via DB constraints)
- [ ] Rate limiting blocks > 100 req/min per user
- [ ] Invalid filters are rejected with 400 error

---

## 11. Deployment Safety

Before enabling updates/deletes in production:

1. **Soft-delete only** for first 2 weeks (data recoverable)
2. **Test on staging** with real store data
3. **Audit trail must be live** before go-live
4. **Backup before change** (export Strapi data)
5. **Gradual rollout** (10% users first, then 100%)

---

## Quick Reference: Which Endpoint for Which Data?

| Data Type | Who Sees | Endpoint | Protection |
|-----------|----------|----------|-----------|
| **Products** (Public) | Any user | `GET /shop/[storeSlug]/products` | Cache-friendly, no auth |
| **Products** (Admin) | Store owner only | `GET /api/markket/products?store=[slug]` | Auth + Store verify |
| **Orders** (Admin) | Store owner only | `GET /api/markket/orders?store=[slug]` | Auth + Store verify + Sanitize |
| **Orders** (Buyer) | Customer only | `GET /orders/[id]?token=[buyerToken]` | Token-based, no auth |
| **Subscribers** (Admin) | Store owner only | `GET /api/markket/subscribers?store=[slug]` | Auth + Store verify + Sanitize |
| **Subscribers** (Export) | Store owner only | `POST /api/markket/subscribers/export` | Auth + Store verify + Audit log |
