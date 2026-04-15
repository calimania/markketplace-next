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
  };
};

function getStoreDescription(payloadStore?: StorePayload['store']) {
  if (!payloadStore) return undefined;
  if (payloadStore.Description !== undefined) return payloadStore.Description;
  if (payloadStore.description !== undefined) return payloadStore.description;
  return undefined;
}

export async function GET() {

  try {
    const stores = await fetchUserStores();

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

    if (!response?.data?.id) {
      return NextResponse.json({
        error: 'Failed to create store',
        details: {
          ...(response?.error?.details || {}),
          message: response?.error?.message || 'Unknown error',
        },
      }, { status: response?.status || 500 });
    }

    return NextResponse.json({
      data: response?.data || {},
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

    const stores = await fetchUserStores();

    const payload: StorePayload = await request.json();

    const store = stores.data.find((store: any) => store.documentId === id);

    if (!store?.id) {
      return errorResponses.unauthorized();
    }

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
    const Favicon = payload?.store?.Favicon;
    const Cover = payload?.store?.Cover;
    const Slides = payload?.store?.Slides;
    const Logo = payload?.store?.Logo;
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
