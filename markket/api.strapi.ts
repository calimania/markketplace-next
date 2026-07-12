import { StrapiResponse, FetchOptions } from './index.d';
import { Store } from './store';
import { Page } from './page';
import type { StoreVisibility, StoreVisibilityResponse } from './store.visibility.d';
import qs from 'qs';

export { type StrapiResponse, type FetchOptions };

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

type UploadImage = {
  alternativeText: string;
  id?: string | number;
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const AVATAR_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function isDynamicServerUsageError(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === 'object'
    && 'digest' in error
    && (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE'
  );
}

type UpdateMePayload = {
  displayName?: string;
  bio?: string;
  username?: string;
  email?: string;
};

type AuthSession = {
  jwt: string;
  id: string | number;
};

export class StrapiClient {
  private baseUrl: string;
  private storeSlug: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';
    this.storeSlug = process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || 'next';
  }

  private _token = () => {
    if (typeof window == 'undefined') {
      console.warn('strapi._token called from server component');
      console.trace();
      return '';
    }

    const _string = localStorage.getItem('markket.auth');
    let _json: any = {};
    try {
      _json = _string ? JSON.parse(_string) : {};
    } catch {
      localStorage.removeItem('markket.auth');
      _json = {};
    }
    const { jwt } = _json;
    return jwt;
  };

  private _authSession = (): AuthSession | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem('markket.auth');
    let parsed: any = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      localStorage.removeItem('markket.auth');
      parsed = {};
    }
    const jwt = parsed?.jwt;
    const id = parsed?.id;

    if (!jwt || !id) {
      return null;
    }

    return { jwt, id };
  };

  public update = async (endpoint: string, id: string, options: any) => {
    // Compatibility: route store updates to tienda endpoint
    let path = `api/${endpoint}/${id}`;
    if (endpoint === 'stores') {
      path = `api/tienda/${endpoint}/${id}`;
    }

    const _url = new URL(path, this.baseUrl);


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
      console.error("Record update failed:", error);
      return false;
    }
  };

  public delete = async (endpoint: string, id: string | number, options: any) => {
    const _url = new URL(`api/${endpoint}/${id}`, this.baseUrl);


    try {
      const response = await fetch(_url.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": options?.headers?.Authorization,
        },
        body: JSON.stringify({ data: options.data }),
      });

      return await response.json();
    } catch (error) {
      console.error("Record delete failed:", error);
      return false;
    }
  };

  public create = async (endpoint: string, options: any) => {
    // Compatibility: route store creates to tienda endpoint
    let path = `api/${endpoint}`;
    if (endpoint === 'stores') {
      path = `api/tienda/${endpoint}`;

    }

    const _url = new URL(path, this.baseUrl);


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
    let _json: any = {};
    try {
      _json = _string ? JSON.parse(_string) : {};
    } catch {
      localStorage.removeItem('markket.auth');
      _json = {};
    }
    const { jwt, id } = _json;

    if (!jwt) {
      return null;
    }

    const url = new URL(`api/users/${id}?populate[]=avatar&populate[]=stores`, this.baseUrl);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (response.status == 401) {
      console.warn('expired.token:strapi.me');
      return { status: response.status };
    }

    if (!response.ok) {
      console.warn('server.error:strapi.me');
      return { status: response.status };
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
      const url = new URL('api/users/me', this.baseUrl);

      return await this.authenticatedFetch(url.toString(), {
        method: 'PUT',
        body: data,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async updateMe(data: UpdateMePayload) {
    if (typeof window === 'undefined') {
      throw new Error('updateMe is client-only');
    }

    const session = this._authSession();

    if (!session?.jwt) {
      throw new Error('No token provided');
    }

    // Only send editable profile fields for non-admin JWT updates.
    const payload: UpdateMePayload = {
      displayName: data?.displayName,
      bio: data?.bio,
    };

    const path = `api/users/${session.id}`;
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let json: any = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!response.ok) {
      const message =
        json?.error?.message ||
        json?.error ||
        text ||
        `HTTP ${response.status}`;

      throw new Error(`Failed to update profile via ${path}: ${message}`);
    }

    return json ?? {};
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



    try {
      let authToken = options?.headers?.Authorization as string || '';

      if (!authToken && options.includeAuth) {
        // Server-side: use API key; client-side: use JWT from localStorage
        if (typeof window === 'undefined') {
          authToken = process.env.MARKKET_API_KEY || '';
        } else {
          authToken = this._token();
        }
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(response.statusText);
        throw new Error(`Failed to fetch ${options.contentType}`);
      }

      return response.json();
    } catch (error) {
      // Next.js throws this during static pre-render when dynamic fetch is used.
      // Avoid spamming logs with expected bailouts that are handled by route config.
      if (!isDynamicServerUsageError(error)) {
        console.error('Error fetching data:', error);
      }
    }

    return { data: [] } as unknown as StrapiResponse<T>;
  };


  public get = async (type: string, slug: string, store_slug = this.storeSlug) => {


    return await this.fetch<Store>({
      contentType: type,
      filters: { slug: store_slug },
      populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS,Cover',
    });
  }

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
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores,extras'
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

  async getEvents(store_slug: string = this.storeSlug, options?: { filter?: any; sort?: string; paginate?: { page: number; pageSize: number }; status?: string }) {
    const filters = {
      stores: {
        slug: {
          $eq: store_slug,
        },
      },
      ...(options?.filter || {}),
    };

    return this.fetch({
      contentType: 'events',
      filters,
      status: (options?.status || 'published') as "published" | "draft" | "all",
      sort: options?.sort,
      paginate: options?.paginate,
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,PRICES,stores',
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
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,PRICES,stores'
    });
  }

  async getStore(slug = this.storeSlug) {
    return await this.fetch<Store>({
      contentType: `stores`,
      filters: { slug },
      populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS,Cover,Slides',
    });
  }

  async getStoreVisibility(storeRef: string | number) {
    const apiKey = typeof window === 'undefined' ? process.env.MARKKET_API_KEY : undefined;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(new URL(`api/stores/${encodeURIComponent(String(storeRef))}/visibility`, this.baseUrl), {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`Store visibility unavailable (${response.status}), using defaults`);
        return null;
      }

      const payload = (await response.json()) as StoreVisibilityResponse | null;
      return this.normalizeStoreVisibility(payload);
    } catch (error) {
      if (!isDynamicServerUsageError(error)) {
        console.error('Error fetching store visibility:', error);
      }
      return null;
    }
  }

  private normalizeStoreVisibility(payload: StoreVisibilityResponse | null): StoreVisibility | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const sourceBase = (payload.data && typeof payload.data === 'object') ? payload.data : payload;
    const source = {
      ...sourceBase,
      summary: sourceBase.summary || payload.summary,
      _debug: sourceBase._debug || payload._debug,
    };
    const summarySignals = source.summary?.content_signals || {};
    const enabledSections = new Set((source.summary?.enabled_sections || []).map((value) => String(value).trim().toLowerCase()));
    const disabledSections = new Set((source.summary?.disabled_sections || []).map((value) => String(value).trim().toLowerCase()));
    const explicitOverrides = source.summary?.explicit_overrides || {};

    const resolveShowFlag = (
      section: 'blog' | 'events' | 'shop' | 'about' | 'newsletter' | 'home',
      directValue: unknown,
      fallback = true,
    ) => {
      if (typeof directValue === 'boolean') {
        return directValue;
      }

      const explicitValue = explicitOverrides?.[section];
      if (typeof explicitValue === 'boolean') {
        return explicitValue;
      }

      if (enabledSections.has(section)) {
        return true;
      }

      if (disabledSections.has(section)) {
        return false;
      }

      return fallback;
    };

    const contentSummary = source.content_summary || {
      articles_count: Number(summarySignals.articles || 0),
      products_count: Number(summarySignals.products || 0),
      events_count: Number(summarySignals.events || 0),
      upcoming_events_count: Number(summarySignals.upcoming_events || 0),
      pages_count: Number(summarySignals.pages || 0),
    };

    return {
      show_blog: resolveShowFlag('blog', source.show_blog, true),
      show_events: resolveShowFlag('events', source.show_events, true),
      show_shop: resolveShowFlag('shop', source.show_shop, true),
      show_about: resolveShowFlag('about', source.show_about, true),
      show_newsletter: resolveShowFlag('newsletter', source.show_newsletter, true),
      show_home: resolveShowFlag('home', source.show_home, true),
      has_upcoming_events: Boolean(source.has_upcoming_events ?? contentSummary.upcoming_events_count > 0),
      has_events: Boolean(source.has_events ?? contentSummary.events_count > 0),
      content_summary: {
        articles_count: Number(contentSummary.articles_count || 0),
        products_count: Number(contentSummary.products_count || 0),
        events_count: Number(contentSummary.events_count || 0),
        upcoming_events_count: Number(contentSummary.upcoming_events_count || 0),
        pages_count: Number(contentSummary.pages_count || 0),
      },
      magic_pages_detected: Array.isArray(source.magic_pages_detected) ? source.magic_pages_detected : [],
      settings_overrides: Array.isArray(source.settings_overrides) ? source.settings_overrides : [],
      summary: source.summary,
      _debug: source._debug,
    };
  }


  /**
   * Returns a page by its slug
   * @param slug
   * @returns
   */
  async getPages(store_slug: string = this.storeSlug, includeAuth = false) {

    return this.fetch<Page>({
      contentType: `pages`,
      includeAuth,
      filters: {
        // Active: {
        // $eq: true
        // },
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
  async getPage(slug: string, store_slug: string = this.storeSlug, includeAuth = false) {

    return await this.fetch<Page>({
      contentType: `pages`,
      includeAuth,
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
      populate: 'SEO.socialImage,store,albums,albums.cover,albums.SEO,albums.tracks,albums.tracks.media'
    });
  };

  /**
   * Requests stores from the strapi / markket api, including pagination, to display in our /stores ,
   * including filters to search for by some attributes like name, slug, title or description using the same keyword
   */
  async getStores(paginate: { page: number; pageSize: number }, options: { filter: Record<string, string | number | object>, sort: string }) {
    const { sort } = options;

    return await this.fetch<Store>({
      contentType: 'stores',
      populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS',
      filters: options.filter,
      paginate,
      sort,
    });
  };

  async getPosts(paginate: { page: number; pageSize: number }, options: { filter?: string, sort: string }, store_slug?: string) {
    const { sort } = options;

    return this.fetch({
      contentType: 'articles',
      sort,
      status: 'published',
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

  async getCommunityPosts(paginate: { page: number; pageSize: number }, options: { sort: string }) {
    const { sort } = options;

    return this.fetch({
      contentType: 'articles',
      sort,
      status: 'published',
      paginate,
      populate: 'SEO.socialImage,Tags,cover,store,store.Logo',
    });
  }

  async getCommunityPages(paginate: { page: number; pageSize: number }, options: { sort: string }) {
    const { sort } = options;

    return this.fetch<Page>({
      contentType: 'pages',
      sort,
      status: 'published',
      paginate,
      populate: 'SEO.socialImage,store,store.Logo',
    });
  }

  async getCommunityEvents(paginate: { page: number; pageSize: number }, options: { sort: string; from?: Date }) {
    const { sort } = options;

    const fromDate = options.from ?? (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    return this.fetch({
      contentType: 'events',
      sort,
      filters: {
        startDate: {
          $gte: fromDate.toISOString(),
        },
      },
      status: 'published',
      paginate,
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,PRICES,stores,stores.Logo',
    });
  }

  async getCommunityProducts(paginate: { page: number; pageSize: number }, options: { sort: string }) {
    const { sort } = options;

    return this.fetch({
      contentType: 'products',
      sort,
      status: 'published',
      paginate,
      populate: 'SEO,SEO.socialImage,Thumbnail,Slides,PRICES,stores,stores.Logo',
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
      status: 'published',
      populate: 'SEO.socialImage,Tags,cover,store',
      sort: 'createdAt:desc',
      paginate: { page: 1, pageSize: 1 },
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
    if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
      throw new Error('Unsupported image format. Use JPG, PNG, or WEBP.');
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new Error('Avatar is too large. Maximum size is 2MB.');
    }

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



  /**
   *
   * @param file
   * @returns
   */
  public uploadImage = async (file: File | null, { alternativeText, id }: UploadImage) => {
    if (!file) return;

    const token = this._token();
    const formData = new FormData();

    const newFileData = {
      alternativeText,
    }

    formData.append('files', file);
    formData.append('fileInfo', JSON.stringify(newFileData));

    const _id = id ? `?id=${id}` : '';

    const response = await fetch(new URL(`api/upload/${_id}`, this.baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
    try {
      return await response.json();
    } catch (error) {
      return { response, error };
    }
  };
};

export const strapiClient = new StrapiClient();
