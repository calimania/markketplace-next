import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store.d';
import { Page } from './page.d';
import qs from 'qs';

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

type fetchOptions = {
  method?: string;
  headers?: any;
  body?: any;
};

/**
 * Utitilities to easily communitcate with our routes in /api/markket
 */
export class markketClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = window.location.origin;
    this.token = '';
  };

  public readToken = () => {
    const _string = localStorage.getItem('markket.auth');
    const _json = _string ? JSON.parse(_string) : {};
    const { jwt } = _json;

    this.token = jwt;
    return jwt;
  };

  public fetch = async (url: string, options: fetchOptions) => {
    const token = this.readToken();

    const _url = new URL(url, this.baseUrl);

    const response = await fetch(_url.toString(), {
      ...options,
      method: options?.method || 'GET',
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    return await response.json();
  };
};

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';
    this.storeSlug = process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || 'next';
  }

  private _token = () => {
    const _string = localStorage.getItem('markket.auth');
    const _json = _string ? JSON.parse(_string) : {};
    const { jwt } = _json;
    return jwt;
  };

  public me = async () => {
    if (!localStorage) { return null; }

    const token = this._token();

    if (!token) {
      return null;
    }
    const url = new URL(`api/users/me?populate=avatar`, this.baseUrl);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  private async authenticatedFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = this._token();

    if (!token) throw new Error('XXX');

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  };


  async updateProfile(data: FormData) {
    if (!localStorage) return null;

    try {
      const url = new URL('api/user/me', this.baseUrl);

      return await this.authenticatedFetch(url.toString(), {
        method: 'PUT',
        body: data,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  private buildFilterString(filters: any): string {
    return qs.stringify({ filters }, {
      arrayFormat: 'brackets',
      encodeValuesOnly: true,
    });
  };


  private buildUrl(options: EnhancedFetchOptions): string {
    const { contentType, filters, populate, paginate, sort } = options;
    const params = new URLSearchParams();

    const filterString = this.buildFilterString(filters);

    if (populate) {
      const fields = Array.isArray(populate) ? populate : populate.split(',');
      fields.forEach(field => params.append('populate[]', field.trim()));
    }

    if (paginate?.limit) params.append('pagination[limit]', paginate.limit.toString());
    if (paginate?.page) params.append('pagination[page]', paginate.page.toString());
    if (paginate?.pageSize) params.append('pagination[pageSize]', paginate.pageSize.toString());
    if (sort) params.append('sort', sort);

    const url = new URL(`api/${contentType}?${filterString}&${params.toString()}`, this.baseUrl);

    return url.toString();
  }

  async fetch<T>(options: FetchOptions): Promise<StrapiResponse<T>> {
    const url = this.buildUrl(options);

    console.info({ url });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${options.contentType}`);
    }

    return response.json();
  };


  async getProduct(product_slug: string, store_slug: string) {
    return this.fetch({
      contentType: 'products',
      filters:
      {
        stores: {
          slug: {
            $eq: store_slug || this.storeSlug,
          }
        },
        slug: {
          $eq: product_slug
        }
      },
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores'
    });
  }

  async getProducts(paginate: { page: number; pageSize: number }, options: { filter: string, sort: string }, store_slug: string) {
    const { sort } = options;

    return this.fetch({
      contentType: 'products',
      filters:
      {
        stores: {
          slug: {
            $eq: store_slug,
          }
        }
      },
      sort,
      paginate,
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores'
    });
  }

  async getEvents(store_slug: string = this.storeSlug) {
    return this.fetch({
      contentType: 'events',
      filters: {
        stores: {
          slug: {
            $eq: store_slug,
          }
        }
      },
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores'
    });
  }

  async getEventBySlug(event_slug: string, store_slug: string = this.storeSlug) {
    return this.fetch({
      contentType: 'events',
      filters: {
        stores: {
          slug: {
            $eq: store_slug,
          }
        },
        slug: {
          $eq: event_slug
        }
      },
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores'
    });
  }

  async getStore(slug = this.storeSlug) {
    return await this.fetch<Store>({
      contentType: `stores`,
      filters: { slug },
      populate: 'Logo,SEO.socialImage,Favicon,URLS',
    });
  }


  /**
   * Returns a page by its slug
   * @param slug
   * @returns
   */
  async getPages(store_slug: string = this.storeSlug) {

    return this.fetch<Page>({
      contentType: `pages`,
      filters: {
        Active: {
          $eq: true
        },
        store: {
          slug: {
            $eq: store_slug
          }
        }
      },
      populate: 'SEO.socialImage'
    });
  };

  /**
   * Returns a page by its slug
   * @param slug
   * @returns
   */
  async getPage(slug: string, store_slug: string = this.storeSlug) {

    return await this.fetch<Page>({
      contentType: `pages`,
      filters: {
        store: {
          slug: {
            $eq: store_slug
          }
        },
        slug: {
          $eq: slug
        },
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
    const { sort } = options;

    return await this.fetch<Store>({
      contentType: 'stores',
      populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS',
      filters: {
        active: {
          $eq: true
        }
      },
      paginate,
      sort,
    });
  };

  async getPosts(paginate: { page: number; pageSize: number }, options: { filter?: string, sort: string }, store_slug?: string) {
    const { sort } = options;

    return this.fetch({
      contentType: 'articles',
      sort,
      filters: {
        store: {
          slug: {
            $eq: store_slug || this.storeSlug
          },
        }
      },
      paginate,
      populate: 'SEO.socialImage,Tags,cover,store',
    });
  }

  async getPost(article_slug: string, store_slug?: string) {

    return await this.fetch({
      contentType: 'articles',
      filters: {
        slug: {
          $eq: article_slug
        },
        store: {
          slug: {
            $eq: store_slug || this.storeSlug
          },
        }
      },
      populate: 'SEO.socialImage,Tags,cover,store',
      sort: 'createdAt:desc',
    });
  }
};

export const strapiClient = new StrapiClient();
