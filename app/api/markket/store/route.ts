import { NextResponse, NextRequest } from 'next/server';
import { strapiClient } from '@/markket/api';
import { markketplace } from '@/markket/config';
import { fetchUserStores, errorResponses, validators } from '@/markket/helpers.api';
import { Store } from '@/markket';
import { headers } from 'next/headers';
import type { RichTextValue } from '@/markket/richtext';

export const fetchCache = 'force-no-store';

type StorePayload = {
  store: Store & {
    description?: RichTextValue | null;
    Description?: RichTextValue | null;
    active?: boolean;
  };
};

type StoreWithPublication = Omit<Store, 'publishedAt'> & {
  status?: 'published' | 'draft';
  publishedAt?: string | null;
};

async function findStoreByPublicationStatus(documentId: string | undefined, slug: string | undefined, status: 'published' | 'draft') {
  const filters: Record<string, object> = documentId
    ? {
      documentId: {
        $eq: documentId,
      },
    }
    : {
      slug: {
        $eq: slug,
      },
    };

  const response = await strapiClient.fetch<Store>({
    contentType: 'stores',
    filters,
    status,
    paginate: { page: 1, pageSize: 1 },
    populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS,Cover,Slides',
    includeAuth: true,
  });

  return response?.data?.[0] as Store | undefined;
}

async function enrichStorePublication(store: Store): Promise<StoreWithPublication> {
  const published = await findStoreByPublicationStatus(store.documentId, store.slug, 'published');
  if (published) {
    return {
      ...store,
      publishedAt: published.publishedAt || store.publishedAt,
      status: 'published',
    };
  }

  const draft = await findStoreByPublicationStatus(store.documentId, store.slug, 'draft');
  if (draft) {
    return {
      ...store,
      publishedAt: draft.publishedAt || store.publishedAt,
      status: 'draft',
    };
  }

  return {
    ...store,
    status: store.publishedAt ? 'published' : 'draft',
    publishedAt: store.publishedAt,
  };
}

async function runStorePublicationAction(documentId: string, action: 'publish' | 'unpublish', token: string) {
  const attempts = action === 'publish'
    ? [
      { path: `api/stores/${documentId}/actions/publish`, method: 'POST' as const, body: {} },
    ]
    : [
      // Some Strapi setups support this explicit endpoint.
      { path: `api/stores/${documentId}/actions/unpublish`, method: 'POST' as const, body: {} },
      // Strapi v5 commonly uses DELETE on publish action for unpublish.
      { path: `api/stores/${documentId}/actions/publish`, method: 'DELETE' as const, body: null },
      // Fallback for custom controllers that accept status switching on publish action.
      { path: `api/stores/${documentId}/actions/publish`, method: 'POST' as const, body: { status: 'draft' } },
    ];

  let lastFailure: { status: number; error: string; details: any } | null = null;

  for (const attempt of attempts) {
    const upstreamUrl = new URL(attempt.path, markketplace.api);
    const response = await fetch(upstreamUrl, {
      method: attempt.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(attempt.body === null ? {} : { body: JSON.stringify(attempt.body) }),
    });

    const text = await response.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        data: json?.data || json,
      };
    }

    lastFailure = {
      status: response.status,
      error: json?.error?.message || json?.error || `Failed to ${action} store`,
      details: {
        ...json,
        attemptedPath: attempt.path,
        attemptedMethod: attempt.method,
      },
    };

    // Continue trying fallbacks for method-not-allowed or not-found variations.
    if (response.status !== 405 && response.status !== 404) {
      break;
    }
  }

  return {
    ok: false,
    status: lastFailure?.status || 500,
    error: lastFailure?.error || `Failed to ${action} store`,
    details: lastFailure?.details || {},
  };
}

function getStoreDescription(payloadStore?: StorePayload['store']) {
  if (!payloadStore) return undefined;
  if (payloadStore.Description !== undefined) return payloadStore.Description;
  if (payloadStore.description !== undefined) return payloadStore.description;
  return undefined;
}

export async function GET() {

  try {
    const stores = await fetchUserStores();

    if (Array.isArray(stores?.data)) {
      const enrichedStores = await Promise.all(
        (stores.data as Store[]).map((store) => enrichStorePublication(store)),
      );

      return NextResponse.json({
        ...stores,
        data: enrichedStores,
      }, { status: stores?.status || 200 });
    }

    return NextResponse.json(stores, { status: stores?.status || 200 });
  } catch (error) {
    console.error('Route error:', error);
    return errorResponses.internalError();
  }
}

export async function POST(request: Request) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  const headersList = await headers();
  const user_id: string | number = headersList.get('markket-user-id') || '';
  const token = headersList.get('authorization')?.replace('Bearer ', '') || '';

  if (!token) {
    return errorResponses.noToken();
  }

  try {
    const stores = await fetchUserStores();

    if (stores?.data?.length >= markketplace.max_stores_per_user) {
      return errorResponses.storeLimit(stores?.data?.length);
    }

    const payload: StorePayload = await request.json();

    if (!validators.storeContent(payload?.store)) {
      return errorResponses.missingFields();
    }

    if (!validators.slug(payload?.store?.slug)) {
      return errorResponses.invalidSlug()
    }

    const title = payload?.store?.title;
    const slug = payload?.store?.slug;
    const Description = getStoreDescription(payload?.store);
    const URLS = payload?.store?.URLS || [];
    const SEO = payload?.store?.SEO || {};
    const data = {
      title,
      ...(Description !== undefined ? { Description } : {}),
      slug,
      URLS: URLS?.map(({ URL, Label }) => ({ URL, Label })),
      SEO: {
        metaTitle: SEO?.metaTitle,
        metaDescription: SEO?.metaDescription,
        metaKeywords: SEO?.metaKeywords,
        socialImage: SEO?.socialImage?.id,
      },
      users: [user_id],
      active: false,
    };

    const response = await strapiClient.create('stores', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data
    });

    const createdStoreFromResponse =
      response?.data?.data ||
      response?.data?.attributes ||
      response?.data ||
      response;

    const hasCreatedStoreInResponse = Boolean(
      createdStoreFromResponse && (
        createdStoreFromResponse.id ||
        createdStoreFromResponse.documentId ||
        createdStoreFromResponse.slug ||
        createdStoreFromResponse.attributes?.slug
      )
    );

    let createdStore = createdStoreFromResponse;

    // Fallback: if upstream response shape is non-standard but record exists, resolve by slug.
    if (!hasCreatedStoreInResponse && slug) {
      const verification = await strapiClient.fetch<Store>({
        contentType: 'stores',
        filters: {
          slug: {
            $eq: slug,
          },
        },
        status: 'all',
        paginate: { page: 1, pageSize: 1 },
        populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS,Cover,Slides',
        includeAuth: true,
      });

      if (verification?.data?.[0]) {
        createdStore = verification.data[0];
      }
    }

    const hasCreatedStore = Boolean(
      createdStore && (
        createdStore.id ||
        createdStore.documentId ||
        createdStore.slug ||
        createdStore.attributes?.slug
      )
    );

    if (!hasCreatedStore) {
      return NextResponse.json({
        error: 'Failed to create store',
        details: {
          ...(response?.error?.details || {}),
          message: response?.error?.message || 'Unknown error',
          upstream: response,
        },
      }, { status: response?.status || 500 });
    }

    return NextResponse.json({
      data: createdStore || {},
    }, {
      status: response.status || 201
    });
  } catch (error) {
    console.error('Store creation error:', error);
    return errorResponses.internalError();
  }
}

export async function PUT(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) {
      return errorResponses.noToken();
    }

    const id = request.nextUrl?.searchParams.get('id')
    const action = request.nextUrl?.searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'Store id is required' }, { status: 400 });
    }

    const stores = await fetchUserStores();
    const store = stores.data.find((store: any) => store.documentId === id);

    if (!store?.id) {
      return errorResponses.unauthorized();
    }

    if (action === 'publish' || action === 'unpublish') {
      const publication = await runStorePublicationAction(store.documentId, action, token);
      if (!publication.ok) {
        return NextResponse.json({
          error: publication.error,
          details: publication.details,
        }, { status: publication.status || 500 });
      }

      return NextResponse.json({
        data: {
          ...(publication.data || {}),
          status: action === 'publish' ? 'published' : 'draft',
          publishedAt: action === 'publish'
            ? (publication.data?.publishedAt || new Date().toISOString())
            : null,
        },
      }, { status: publication.status || 200 });
    }

    const payload: StorePayload = await request.json();

    if (!validators.storeContent(payload?.store)) {
      return errorResponses.missingFields();
    }

    if (!validators.slug(payload?.store?.slug)) {
      return errorResponses.invalidSlug()
    }

    const title = payload?.store?.title;
    const slug = payload?.store?.slug;
    const Description = getStoreDescription(payload?.store);
    const URLS = payload?.store?.URLS || [];
    const SEO = payload?.store?.SEO || {};
    const active = payload?.store?.active;
    const Favicon = payload?.store?.Favicon;
    const Cover = payload?.store?.Cover;
    const Slides = payload?.store?.Slides;
    const Logo = payload?.store?.Logo;
    const data = {
      title,
      ...(Description !== undefined ? { Description } : {}),
      slug,
      URLS: URLS?.map(({ URL, Label }) => ({ URL, Label })),
      ...(typeof active === 'boolean' ? { active } : {}),
      SEO: {
        metaTitle: SEO?.metaTitle,
        metaDescription: SEO?.metaDescription,
        metaKeywords: SEO?.metaKeywords,
        socialImage: SEO?.socialImage?.id,
      },
      Favicon,
      Cover,
      Slides,
      Logo,
    };

    const response = await strapiClient.update('stores', store.documentId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data,
    });

    return NextResponse.json(response, { status: response?.error?.status || 200 });
  } catch (error) {
    console.error('Store update error:', error);

    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return errorResponses.invalidToken();
      }
      if (error.message === 'API configuration missing') {
        return errorResponses.missingConfig();
      }
    }

    return errorResponses.internalError();
  }
}
