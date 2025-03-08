import { markketConfig } from "./config";

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

  public fetch = async (url: string, options: fetchOptions) => {
    if (!options?.headers?.Authorization) {
      this.readToken();
    }

    console.log({ url });
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
};
