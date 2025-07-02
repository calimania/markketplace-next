import { markketConfig } from "./config";

type fetchOptions = {
  method?: string;
  headers?: any;
  body?: any;
  cache?: any;
};

export type _validImageRef = 'common.SEO' | 'api::store.store' | 'api::page.page';

/**
 * Utitilities to easily communitcate with our routes in /api/markket
 */
export class markketClient {
  private baseUrl: string;
  private token: string;
  private _id: string | number;

  constructor() {
    if (typeof window == 'undefined') {
      this.baseUrl = markketConfig.markket_url as string;
      this.token = '';
      this._id = ''
    } else {
      this.baseUrl = window.location.origin;
      this.token = '';
      this._id = ''
    }
  };

  public who = () => {
    console.log('markketClient', this);
  };

  public readToken = () => {
    if (typeof window == 'undefined') { return null; }
    if (!localStorage) { return null; }

    const _string = localStorage.getItem('markket.auth');
    const _json = _string ? JSON.parse(_string) : {};
    const { jwt, id } = _json;

    this.token = jwt;
    this._id = id;
    return jwt;
  };

  public uploadImage = async (file: File, field: string, refId: string | number, alt?: string, ref?: _validImageRef) => {
    this.readToken();

    const formData = new FormData();
    formData.append('files', file);
    formData.append('ref', ref || 'api::store.store');
    formData.append('refId', refId as string);
    formData.append('field', field);
    formData.append("fileInfo", JSON.stringify({
      name: file.name,
      alternativeText: alt,
      caption: alt,
    }));

    const _url = new URL('/api/markket?path=/api/upload', this.baseUrl);

    return await fetch(_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
  };

  public fetch = async (url: string | URL, options: fetchOptions) => {
    if (!options?.headers?.Authorization) {
      this.readToken();
    }

    console.log(`${options.method || 'GET'}:${url}`);
    const _url = new URL(url, this.baseUrl);

    const response = await fetch(_url, {
      ...options,
      method: options?.method || 'GET',
      body: ['POST', 'PUT'].includes(options?.method as string) ? JSON.stringify(options?.body || {}) : undefined,
      headers: {
        'Authorization': options?.headers?.Authorization || `Bearer ${this.token}`,
        'markket-user-id': this._id?.toString() || '',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });

    return await response.json();
  };

  public post = async (url: string, options: any) => {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body,
    });
  };

  public put = async (url: string, options: any) => {
    return this.fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body,
    });
  };

  public stripeConnect = async (action: string, options: any) => {
    this.readToken();

    const _url = new URL(`/api/stripe/connect?action=${action}`, this.baseUrl);

    return await this.fetch(_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: options,
    });
  };


  public verifyMagicCode = async (code: string): Promise<{ jwt?: string; user?: { id: string, username: string, email: string } }> => {

    const _url = new URL(`/api/auth-magic/verify`, markketConfig.api);

    const response = await fetch(_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      return {};
    }

    const json = response.json();

    return json;
  }
};
