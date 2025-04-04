import { markketConfig } from "./config";

type fetchOptions = {
  method?: string;
  headers?: any;
  body?: any;
  cache?: any;
};

/**
 * Utitilities to easily communitcate with our routes in /api/markket
 */
export class markketClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    if (typeof window == 'undefined') {
      this.baseUrl = markketConfig.markket_url as string;
      this.token = '';
    } else {
      this.baseUrl = window.location.origin;
      this.token = '';
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
    const { jwt } = _json;

    this.token = jwt;
    return jwt;
  };

  public uploadImage = async (file: File, field: string, refId: string | number) => {
    this.readToken();

    const formData = new FormData();
    formData.append('files', file);
    formData.append('ref', 'api::store.store');
    formData.append('refId', refId as string);
    formData.append('field', field);

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
};
