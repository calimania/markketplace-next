import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store.d';

export type { StrapiResponse, FetchOptions };

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.MARKKET_URL || 'https://api.markket.place/';
    this.storeSlug = process.env.MARKKET_STORE_SLUG || 'next';
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

    if (paginate?.pageSize) params.append('pagination[pageSize]', paginate.pageSize.toString());

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

  /**
   * Requests stores from the strapi / markket api, including pagination, to display in our /stores ,
   * including filters to search for by some attributes like name, slug, title or description using the same keyword
   */
  async getStores(paginate: { page: number; pageSize: number }, options: { filter: string, sort: string }) {
    const { filter, sort } = options;

    return await this.fetch<Store>({
      contentType: 'stores',
      populate: 'Logo,SEO,SEO.socialImage,Favicon',
      filters: filter && {
        '$or][0][title': filter,
      } || {},
      paginate,
      sort,
    });
  };

}

export const strapiClient = new StrapiClient();
