import { StrapiResponse, FetchOptions } from '.';
import { Store } from './store';
import { Page } from './page';
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

type uploadAvatarOptions = {
  id: number | string;
  model?: string;
  field?: string;
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

  public update = async (endpoint: string, id: string, options: any) => {
    const _url = new URL(`api/${endpoint}/${id}`, this.baseUrl);

    console.log('Updating record:', _url.toString());
    try {
      const response = await fetch(_url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": options?.headers?.Authorization,
        },
        body: JSON.stringify({ data: options.data }),
      });

      return await response.json();
    } catch (error) {
      console.error("Record creation failed:", error);
      return false;
    }
  };

  public create = async (endpoint: string, options: any) => {
    const _url = new URL(`api/${endpoint}`, this.baseUrl);

    console.log('Creating record:', _url.toString());
    try {
      const response = await fetch(_url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": options?.headers?.Authorization,
        },
        body: JSON.stringify({ data: options.data }),
      });

      return await response.json();
    } catch (error) {
      console.error("Record creation failed:", error);
      return false;
    }
  };

  public me = async () => {
    if (typeof localStorage == 'undefined') { return null; }

    const _string = localStorage.getItem('markket.auth');
    const _json = _string ? JSON.parse(_string) : {};
    const { jwt, id } = _json;

    if (!jwt) {
      return null;
    }

    const url = new URL(`api/users/${id}?populate=avatar`, this.baseUrl);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
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


  // @TODO - if we have a store?.id, is faster to search that way instead of slug
  private buildUrl(options: EnhancedFetchOptions): string {
    const { contentType, filters, populate, paginate, sort, status } = options;
    const params = new URLSearchParams();

    const filterString = this.buildFilterString(filters);

    if (status) {
      params.append('status', status);
    }

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
    const url = this.buildUrl(options as EnhancedFetchOptions);

    console.info({ url });

    try {

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': options.includeAuth ? `Bearer ${this._token()}` : '', // Only include auth if specified
        },
        // next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${options.contentType}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    return {} as StrapiResponse<T>;
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
      populate: 'Logo,SEO.socialImage,Favicon,URLS,Cover',
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
      populate: 'SEO.socialImage,store,albums,albums.cover,albums.SEO,albums.tracks'
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

  /** Requests related Album */
  async getAlbum(album_slug: string, store_slug?: string) {

    return await this.fetch({
      contentType: 'albums',
      filters: {
        slug: {
          $eq: album_slug,
        },
        store: {
          slug: {
            $eq: store_slug || this.storeSlug
          },
        }
      },
      populate: 'SEO.socialImage,tracks,tracks.SEO,tracks.SEO.socialImage,tracks.media,tracks.urls,cover',
      sort: 'createdAt:desc',
    });
  };

  async getTrack(track_slug: string, store_slug?: string) {

    return await this.fetch({
      contentType: 'tracks',
      filters: {
        slug: {
          $eq: track_slug,
        },
        store: {
          slug: {
            $eq: store_slug || this.storeSlug
          },
        }
      },
      populate: 'SEO.socialImage,urls,media',
      sort: 'createdAt:desc',
    });
  };


  /**
   * Uploads an avatar image to the strapi / upload endpoint with the user's token
   * @param file
   * @param param1
   * @returns
   */
  public uploadAvatar = async (file: File, { id, model, field }: uploadAvatarOptions) => {
    const token = this._token();
    const formData = new FormData();
    formData.append('files', file);
    formData.append('ref', model || 'plugin::users-permissions.user');
    formData.append('refId', id.toString());
    formData.append('field', field || 'avatar');

    return await fetch(new URL('api/upload', this.baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
  };
};

export const strapiClient = new StrapiClient();
