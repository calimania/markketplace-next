# AGENTS.md

## Markketplace Agents: Architecture, Best Practices & Learnings

This document outlines the architecture, conventions, and best practices for building high-quality, maintainable agents and screens in the Markketplace Next.js project. Our codebase leverages the Next.js `app/` directory, API routes, React screens, and integrates with Strapi (ecommerce API), Stripe, SendGrid, and Zoom.

---

## 1. Project Structure & Next.js Best Practices

- **Use the `app/` directory** for all screens, layouts, and API routes. This enables server components, routing, and colocation of logic.
- **Organize by feature**: Group related screens, components, and API routes under feature folders (e.g., `app/dashboard/`, `app/api/stripe/`).
- **API routes**: Place all backend logic in `app/api/` and keep secrets/server code out of client bundles.
- **Type safety**: Use TypeScript everywhere. Define types in `markket/*.d.ts` and ensure correct capitalization (e.g., `Store`, `Product`, `Order`).
- **Reusable components**: Store shared UI in `markket/components/` and import as needed.
- **Environment variables**: Use `process.env` for secrets, never expose keys to the client.

---

## 2. Agent Design Principles

- **Abstraction**: Encapsulate business logic in helpers and API clients (e.g., `markket/api.strapi.ts`, `markket/helpers.api.ts`).
- **Separation of concerns**: Keep UI, API, and business logic separate. Use dedicated API routes for Stripe, SendGrid, Zoom, etc.
- **Composability**: Build agents and screens as composable React components. Favor hooks for shared logic.
- **Error handling**: Centralize error responses and validation in helpers. Always return meaningful errors from API routes.
- **Security**: Never import or use secrets in client code. All sensitive operations (Stripe, SendGrid, Zoom) must run server-side.

---

## 3. TypeScript & Naming Conventions

- **Types**: All types are PascalCase (e.g., `Store`, `Product`, `Order`, `Subscriber`).
- **Exports**: Use `export * from './index.d'` in `markket/index.ts` to expose all types.
- **Strict types**: Prefer explicit types for API responses, props, and state. Avoid `any`.
- **Type guards**: Use type guards and validators for runtime safety.

---

## 4. Integration Patterns

- **Strapi**: Use `markket/api.strapi.ts` for all ecommerce API interactions. Abstract fetch logic and error handling.
- **Stripe**: All payment logic lives in `app/api/stripe/`. Never expose Stripe keys or logic to the client.
- **SendGrid**: Email operations are handled in server API routes only.
- **Zoom**: Integrate via server API routes for meetings/webinars. Never expose Zoom credentials.

---

## 5. High-Quality Code Learnings

- **Modularity**: Keep code modular and DRY. Extract shared logic into helpers and hooks.
- **Scalability**: Design agents and screens to be easily extendable for new features/services.
- **Testing**: Write unit and integration tests for API routes and business logic.
- **Documentation**: Document all agents, types, and API endpoints. Use JSDoc and Swagger for API routes.
- **Performance**: Use server components and caching for data-heavy screens. Avoid unnecessary client-side fetches.

---

## 6. Example Agent Pattern

```tsx
// app/api/stripe/products/route.ts
import stripeServer from '@/lib/stripe/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // ...business logic abstracted from UI
}
```
## 7. Thoughtful User Experience

- **Thoughtful about user experience** and design aesthetics
- **Consistent** as much as possible on margin, padding, centering dynamics
- **Readable** easy to navigate and understand without bloat
- **Clean** and elegant, for an enjoyable user experience

---

## 8. Design System & Color Palette

Markketplace uses a sophisticated color system inspired by Latin American vibrancy meets Scandinavian/Japanese minimalism. All colors are defined in `markket/colors.config.ts` and should be imported consistently across the codebase.

### Primary Colors
- **Mexican Rosa** (#E4007C): Hero color for CTAs, newsletter sections, and primary actions
- **Cyan** (#00BCD4): Shop/products section
- **Magenta** (#E91E63): Blog/articles section
- **Green** (#4CAF50): Events/calendar section

### Neutrals (Scandinavian/Japanese inspired)
- White (#FFFFFF), Off-White (#FAFAFA), Light Gray (#F5F5F5)
- Medium Gray (#9E9E9E), Dark Gray (#616161), Charcoal (#424242)

### Section Colors (for navigation & headers)
```typescript
sections: {
  shop: { main: '#00BCD4', light: '#E0F7FA' },      // Cyan
  blog: { main: '#E91E63', light: '#FCE4EC' },      // Magenta
  events: { main: '#4CAF50', light: '#E8F5E9' },    // Green
  newsletter: { main: '#E4007C', light: '#FFE5F1' }, // Rosa
  about: { main: '#00BCD4', light: '#E0F7FA' },     // Cyan
}
```

### Gradients
- **Hero**: Rosa → Magenta (for newsletter CTAs and primary cards)
- **Fresh**: Cyan → Rosa
- **Sunset**: Rosa → Coral
- **Elegant**: Subtle neutral gradients for backgrounds

### Usage Guidelines
- Import colors: `import { markketColors } from '@/markket/colors.config'`
- Use section colors for navigation icons and buttons
- Apply subtle hover effects: scale-[1.02], opacity-90
- Maintain minimal shadows: 0 2px 8px rgba(0, 0, 0, 0.08)
- Use border-radius: xl (16px) for cards, lg (12px) for buttons

---

## 9. SEO & Metadata Best Practices

All pages must have rich, descriptive metadata for discoverability. Use `generateSEOMetadata` from `markket/metadata.ts` with dynamic content.

### Title Structure
- **Format**: `{Page Title} | {Store Name}`
- **Examples**:
  - "Shop | Artisan Collective"
  - "Summer Workshop 2025 | Creative Studio"
  - "Blog | Tech Hub"
- **Length**: 50-60 characters optimal

### Description Guidelines
- **Include counts**: "Browse 24 products" or "Join us for 3 upcoming events"
- **Include names**: First 3-5 product/article/event names
- **Call to action**: "Discover", "Join us", "Explore"
- **Length**: 150-160 characters optimal
- **Example**: "Browse 24 products including Handmade Pottery, Vintage Textiles, Organic Soaps and more."

### Keywords Strategy
```typescript
generateSEOMetadata({
  slug,
  entity: { SEO, title, url },
  defaultTitle: 'Shop',
  defaultDescription: 'Browse 24 products...',
  keywords: ['products', 'shop', 'buy', ...productNames.slice(0, 5)],
})
```

- **Base keywords**: Content type (products, articles, events)
- **Dynamic keywords**: Entity names (first 5)
- **Store keywords**: From database `metaKeywords` field
- **Avoid duplication**: Filter unique values

### OpenGraph & Social

- Always include store logo or social image
- Alt text format: `{Title} - {Description}`
- Image dimensions: 1200x630px optimal
- Card type: `summary_large_image`

### Canonical URLs

- Use clean paths: `/{slug}` not `/store/{slug}`
- Always absolute URLs with `metadataBase`
- No trailing slashes

### robots.txt

- Respect `excludeFromSearch` from database
- Default: `index: true, follow: true`
- Test pages: `index: false, follow: false`

---

## 10. Summary

By following these best practices and architectural patterns, Markketplace agents remain secure, maintainable, and scalable. All integrations with Strapi, Stripe, SendGrid, and Zoom are abstracted behind server API routes, ensuring a clean separation of concerns and a high-quality developer experience.

---

**For more details, see the codebase and type definitions in `markket/`.**

---

## 11. Token Conservation & Efficient Agent Operation

These rules apply to every session. The goal is to move fast without wasting tokens on ceremony.

### Read Strategy
- Read only the files you need; prefer `grep_search` over `read_file` for discovery.
- Read the smallest range that gives enough context to act; expand only when blocked.
- Batch parallel reads (independent files at same time) instead of sequential round-trips.
- Do not re-read files already in context unless content may have changed.

### Write Strategy
- Use `multi_replace_string_in_file` for all edits with >1 change in a session.
- Make the smallest diff that fixes the problem; avoid reformatting unrelated lines.
- Never create new files when an edit to an existing file will do.
- Do not add comments, docstrings, or console logs to code you did not touch.

### Thinking/Output Discipline
- Skip preamble ("I will now…", "Let me check…"). Jump to the action.
- Omit summaries of what was done unless explicitly requested.
- When reporting findings, use the structured format: severity → file path → one-line description.
- Keep replies to 3-5 lines unless showing code or a checklist.

### Task Sequencing
- Work on must-fix items first; defer nice-to-haves without discussion.
- Group related edits into one turn instead of one-edit-per-reply.
- After each cluster of changes, run `get_errors` once to catch regressions, not after every single file.

---

## 12. Launch Roadmap (Sprint: Dashboard Polish → Stripe Connect)

Ordered by priority. Do not skip ahead; close each item before opening the next.

### P0 — Dashboard Bug Fixes & UX Tightening
- [ ] Event form: replace basic time input with a proper date-time picker (e.g. `<input type="datetime-local">` or a lightweight picker component).
- [ ] Content boxes: add breathing room (padding, max-width prose) and a full-screen / expand toggle for long-form fields.
- [ ] Rich-text fields: evaluate swapping plain `<textarea>` for Tiptap editor in Article / Page / Event description fields. Keep the existing form shell; swap only the input widget.

### P1 — Free & Paid Pricing on Products & Events
- [ ] Add `price` (number, default 0) and `currency` (string, default `USD`) fields to Product and Event forms if not already mapped.
- [ ] Stripe payment-link flow: if price === 0, generate a $0 Stripe link (still captures email + order record for CRM).
- [ ] Show "Free" badge on cards/detail pages when price is 0.
- [ ] Product subscriptions: add `subscription` toggle (one-time vs. recurring) to Product form; wire to Stripe Price with `recurring` when enabled.

### P2 — Stripe Connect Dashboard & Basic Stats
- [ ] Store dashboard home: show aggregate stats card (total orders, total revenue, active subscribers count).
- [ ] Stripe Connect: onboarding link if not connected; connected status badge if already linked.
- [ ] Orders list: paginated table with status, amount, date, customer email.
- [ ] CRM Subscribers: list view with email, subscribed date, source store.

### P3 — QA Pass Before Ship
- [ ] Public storefront smoke test: homepage, store listing, product/event/article/blog detail pages.
- [ ] Empty-state audit: every list page must show a friendly empty state, not a blank screen.
- [ ] Metadata audit: title + description on all key public routes.
- [ ] Build passes with zero TypeScript errors (`npm run build`).

### Defer (post-launch)
- Zoom webinar integration
- Advanced subscription tiers
- Full CRM analytics
- A/B testing on store cards
