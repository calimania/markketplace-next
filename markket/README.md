# Markket API Documentation

> **Note**: We're currently in pre-release. While we strive for stability, some responses might change. We follow semantic versioning and avoid breaking changes to existing attributes.

## Overview

Markket provides multiple ways to interact with your store data:

1. 🎯 REST API (Strapi-based)
2. 🔄 Next.js API Routes
3. 📦 NPM Client Package (coming soon)
4. 🎨 Dashboard UI

## Quick Start

### Using the Strapi Client

```typescript
import { strapiClient } from '@markket/api';

// Fetch store data
const { data: store } = await strapiClient.getStore('your-store-slug');

// Get store products with pagination
const { data: products } = await strapiClient.getProducts(
  { page: 1, pageSize: 10 },
  { filter: '', sort: 'createdAt:desc' },
  'your-store-slug'
);
```

### Available Methods

#### Store Operations
- `getStore(slug)` - Fetch store details
- `getStores(pagination, options)` - List all stores with filtering

#### Product Operations
- `getProduct(product_slug, store_slug)` - Get single product
- `getProducts(pagination, options, store_slug)` - List products

#### Content Operations
- `getPages(store_slug)` - Get store pages
- `getPosts(pagination, options, store_slug)` - Get blog posts
- `getEvents(store_slug)` - Get store events

### Response Types

```typescript
interface StrapiResponse<T> {
  data: T | T[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface Store {
  id: number;
  title: string;
  slug: string;
  Logo?: Media;
  Favicon?: Media;
  SEO?: {
    metaTitle?: string;
    metaDescription?: string;
    socialImage?: Media;
  };
  URLS?: string[];
}
```

## Authentication

For protected routes, include a JWT token in your requests:

```typescript
const token = 'your-jwt-token';
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## Data Guidelines

### Stability Promise
- ✅ Existing attributes will maintain their types
- ✅ New attributes will be optional
- ✅ Deprecated fields will be marked before removal
- ❌ Breaking changes only in major versions

### Best Practices
1. Always check for optional fields
2. Use TypeScript for better type safety
3. Implement error handling for API calls
4. Cache responses when appropriate

## Examples

### Fetching Store Data

```typescript
// Get store details with related data
const { data: store } = await strapiClient.getStore('your-store-slug');

// Access nested attributes safely
const storeTitle = store?.title;
const logoUrl = store?.Logo?.url;
const socialImage = store?.SEO?.socialImage?.url;
```

### Working with Products

```typescript
// Get paginated products
const { data: products, meta } = await strapiClient.getProducts(
  { page: 1, pageSize: 10 },
  { filter: '', sort: 'createdAt:desc' },
  'your-store-slug'
);

// Total pages available
const totalPages = meta.pagination?.pageCount || 1;
```

### Managing Events

```typescript
// Fetch store events
const { data: events } = await strapiClient.getEvents('your-store-slug');

// Get specific event
const { data: event } = await strapiClient.getEventBySlug(
  'event-slug',
  'store-slug'
);
```

## Coming Soon
- 📦 NPM package with TypeScript support
- 🎨 Dashboard components library
- 🔄 Real-time updates
- 🔍 Enhanced search capabilities
- 📱 Mobile SDK

## Support

For questions and support:
- 📧 Email: support@markket.place
- 💬 Discord: [Join our community](https://discord.gg/markket)
- 📚 Documentation: [docs.markket.place](https://docs.markket.place)

---

Built with ❤️ by the Markket team
