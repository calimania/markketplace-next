import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store.d';

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.MARKKET_URL || 'https://api.markket.place/';
    this.storeSlug = process.env.MARKKET_STORE_SLUG || 'next';
  }

  private buildUrl(options: FetchOptions): string {
    const { contentType, filter, populate, paginate, single } = options;
    const params = new URLSearchParams();

    if (filter) params.append('filters', filter);
    if (single) {
      const [key, value] = single.split('=');
      if (key && value) {
        params.append(key, value);
      }
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
      filter: `filters[stores][slug][$eq]=${this.storeSlug}`,
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES'
    });
  }

  async getPosts() {
    return this.fetch({
      contentType: 'article',
      filter: `filters[store][slug][$eq]=${this.storeSlug}`,
      populate: 'SEO.socialImage,Tags,store,cover'
    });
  }

  async getEvents() {
    return this.fetch({
      contentType: 'event',
      filter: `filters[stores][slug][$eq]=${this.storeSlug}`,
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores'
    });
  }

  async getStore() {
    return this.fetch<Store>({
      contentType: `stores`,
      single: `slug=${this.storeSlug}`,
      populate: 'Logo,SEO.socialImage'
    });
  }
}

export const strapiClient = new StrapiClient();
