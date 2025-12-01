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

## 9. Summary

By following these best practices and architectural patterns, Markketplace agents remain secure, maintainable, and scalable. All integrations with Strapi, Stripe, SendGrid, and Zoom are abstracted behind server API routes, ensuring a clean separation of concerns and a high-quality developer experience.

---

**For more details, see the codebase and type definitions in `markket/`.**
