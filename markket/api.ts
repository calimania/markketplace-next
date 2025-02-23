import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store.d';
import { Page } from './page.d';

export type { StrapiResponse, FetchOptions };

interface FilterOperator {
  operator: '$eq' | '$contains' | '$in' | '$gt' | '$lt' | '$gte' | '$lte' | '$ne';
  value: string | number | boolean | Array<any>;
};

interface FilterValue {
  [key: string]: string | number | boolean | FilterOperator | { [key: string]: FilterValue };
};

interface EnhancedFetchOptions extends Omit<FetchOptions, 'filters'> {
  filters?: {
    [key: string]: FilterValue | string | number | boolean;
  };
};

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.PUBLIC_NEXT_PUBLIC_MARKKET_URL || 'https://api.markket.place/';
    this.storeSlug = process.env.MARKKET_STORE_SLUG || 'next';
  }

  private buildFilterString(filters: any, prefix = ''): Array<[string, string]> {
    const params: Array<[string, string]> = [];

    Object.entries(filters).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}[${key}]` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('operator' in value && 'value' in value) {
          params.push([`filters[${fullKey}][${value.operator}]`, (value.value as string | number | boolean).toString()]);
        } else {
          params.push(...this.buildFilterString(value, `filters[${fullKey}]`));
        }
      } else {
        params.push([`filters[${fullKey}][$eq]`, (value as string | boolean | number).toString()]);
      }
    });

    return params;
  }


  private buildUrl(options: EnhancedFetchOptions): string {
    const { contentType, filters, populate, paginate, sort } = options;
    const params = new URLSearchParams();

    if (filters) {
      const filterParams = this.buildFilterString(filters);
      filterParams.forEach(([key, value]) => params.append(key, value));
    }

    if (populate) {
      const fields = Array.isArray(populate) ? populate : populate.split(',');
      fields.forEach(field => params.append('populate[]', field.trim()));
    }

    if (paginate?.limit) params.append('pagination[limit]', paginate.limit.toString());
    if (paginate?.page) params.append('pagination[page]', paginate.page.toString());
    if (paginate?.pageSize) params.append('pagination[pageSize]', paginate.pageSize.toString());
    if (sort) params.append('sort', sort);

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

  async getProducts(paginate: { page: number; pageSize: number }, options: { filter: string, sort: string }, store_slug: string) {
    const { sort, filter } = options;

    return this.fetch({
      contentType: 'products',
      filters:
      {
        active: true,
        stores: {
          slug: {
            operator: '$eq',
            value: `[${store_slug}]`
          }
        }
      },
      ...(filter ? [{
        Name: {
          operator: '$contains',
          value: filter
        }
      }] : []),
      sort,
      paginate,
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores'
    });
  }

  async getPosts(paginate: { page: number; pageSize: number }, options: { filter: string, sort: string }, slug?: string) {
    const { filter, sort } = options;

    return this.fetch({
      contentType: 'articles',
      sort,
      filters: filter && {
        '$and][0][store][slug': slug || this.storeSlug,
        '$or][0][title': filter,
      } || {
        '$and][0][store][slug': slug || this.storeSlug,
      },
      populate: 'SEO.socialImage,Tags,cover',
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
   * Returns a page by its slug
   * @param slug
   * @returns
   */
  async getPages(storeSlug: string = this.storeSlug) {

    return this.fetch<Page>({
      contentType: `pages`,
      filters: {
        '$and][0][store][slug': storeSlug,
        '$and][1][Active': true
      },
      populate: 'SEO.socialImage'
    });
  };

  /**
   * Returns a page by its slug
   * @param slug
   * @returns
   */
  async getPage(slug: string, storeSlug: string = this.storeSlug) {

    return await this.fetch<Page>({
      contentType: `pages`,
      filters: {
        '$and][0][store][slug': storeSlug,
        '$and][1][slug': slug
      },
      paginate: { page: 1, pageSize: 10 },
      populate: 'SEO.socialImage,store'
    });
  };

  /**
   * Requests stores from the strapi / markket api, including pagination, to display in our /stores ,
   * including filters to search for by some attributes like name, slug, title or description using the same keyword
   */
  async getStores(paginate: { page: number; pageSize: number }, options: { filter: string, sort: string }) {
    const { filter, sort } = options;

    return await this.fetch<Store>({
      contentType: 'stores',
      populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS',
      filters: filter && {
        '$or][0][title': filter,
      } || {
      },
      paginate,
      sort,
    });
  };

  async getPost(article_slug: string, slug?: string) {
    return await this.fetch({
      contentType: 'articles',
      filters: {
        '$and][0][store][slug': slug || this.storeSlug,
        '$and][1][slug': article_slug,
      },
      paginate: { page: 1, pageSize: 10 },
      populate: 'SEO.socialImage,Tags,cover',
    });
  }
};

export const strapiClient = new StrapiClient();
