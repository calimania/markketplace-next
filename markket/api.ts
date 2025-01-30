import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store.d';

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.MARKKET_URL || 'https://api.markket.place/';
    this.storeSlug = process.env.MARKKET_STORE_SLUG || 'next';
  }

  private transformFilters(filters: Record<string, number | string | object>): string {
    return Object.entries(filters)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          const [nestedKey, operator] = Object.entries(value)[0];
          return `filters[${key}][${nestedKey}][$eq]=${operator}`;
        }
        return `filters[${key}][$eq]=${value}`;
      })
      .join('&');
  }

  private buildUrl(options: FetchOptions): string {
    const { contentType, filters, populate, paginate } = options;
    const params = new URLSearchParams();

    // Handle filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters[${key}][$eq]`, value.toString());
      });
    }

    if (populate) {
      const fields = Array.isArray(populate) ? populate : populate.split(',');
      fields.forEach(field => params.append('populate[]', field.trim()));
    }

    if (paginate?.limit) params.append('pagination[limit]', paginate.limit.toString());

    if (paginate?.page) params.append('pagination[page]', paginate.page.toString());

    const url = new URL('api/' + contentType, this.baseUrl);
    url.search = params.toString();

    return url.toString();
  }

  async fetch<T>(options: FetchOptions): Promise<StrapiResponse<T>> {
    const url = this.buildUrl(options);
    console.info({ url });
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${options.contentType}`);
    }

    return response.json();
  }

  // Convenience methods
  async getProducts() {
    return this.fetch({
      contentType: 'product',
      filters: { store: { slug: { $eq: this.storeSlug } } },
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES'
    });
  }

  async getPosts() {
    return this.fetch({
      contentType: 'article',
      filters: { store: { slug: { $eq: this.storeSlug } } },
      populate: 'SEO.socialImage,Tags,store,cover'
    });
  }

  async getEvents() {
    return this.fetch({
      contentType: 'event',
      filters: { store: { slug: { $eq: this.storeSlug } } },
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores'
    });
  }

  async getStore(slug = this.storeSlug) {
    return this.fetch<Store>({
      contentType: `stores`,
      filters: { slug },
      populate: 'Logo,SEO.socialImage,Favicon'
    });
  }
}

export const strapiClient = new StrapiClient();
