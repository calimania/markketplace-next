import { NextResponse, NextRequest } from 'next/server';
import { strapiClient } from '@/markket/api';
import { markketConfig } from '@/markket/config';
import { errorResponses, validators, countContentTypeItems } from '@/markket/helpers.api';
import { headers } from 'next/headers';
import { actionsMap } from '@/app/components/dashboard/actions/actions.config';
import stripeServer from '@/markket/stripe.server';

import { getContentType, contentTypeConfig, validateStoreAccess } from '@/markket/cms.route.helpers';
import { ContentTypes, Product } from '@/markket';

export const fetchCache = 'force-no-store';

// @TODO: Abtract STRIPE integration
export async function POST(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const headersList = await headers();
    const userId = headersList.get('markket-user-id') || '';

    if (!userId) {
      return errorResponses.noToken();
    }

    const payload = await request.json();
    const config = contentTypeConfig[contentType as keyof typeof contentTypeConfig];
    const storeId = request.nextUrl?.searchParams.get('storeId');

    if (config.linkToStore) {
      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }

      if (!(await validateStoreAccess(storeId))) {
        return errorResponses.unauthorized();
      }

      // Apply content limits or charges
      const limit = await countContentTypeItems(
        contentType as string,
        config.propLimit as number,
        storeId,
        markketConfig.markket_api_key,
      );

      console.log({ limit, config });
    }

    const validation = config.validate(payload[contentType as string]);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const transformedData = config.transform(
      payload[contentType as string],
      userId,
      storeId as string,
    ) as ContentTypes;

    if (contentType == 'product' && !((transformedData as Product).SKU)) {
      const stripe = stripeServer.getInstance();
      const stripeProduct = await stripe.products.create({
        name: transformedData.Name,
        description: transformedData.Description || undefined,
        metadata: {
          slug: transformedData.slug,
        },
      });

      transformedData.SKU = stripeProduct.id;
    }

    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;

    const response = await strapiClient.create(contentTypePlural, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data: transformedData
    });

    if (!response?.data?.id) {
      return NextResponse.json({
        error: `Failed to create ${contentType}`,
        details: {
          ...(response?.error?.details || {}),
          message: response?.error?.message || 'Unknown error',
        },
      }, { status: response?.status || 500 });
    }

    // Apply afterSave, more explicit behavior than middleware
    // afterSave performs notifications, webhooks, automations & bots

    return NextResponse.json({
      data: response?.data || {},
    }, { status: response.status || 201 });

  } catch (error) {
    console.error(`POST:`, error);
    return errorResponses.internalError();
  }
}

// @TODO: Abtract STRIPE integration
export async function PUT(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const headersList = await headers();
    const userId = headersList.get('markket-user-id') || '';
    const id = request.nextUrl?.searchParams.get('id');


    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    if (!userId) {
      return errorResponses.noToken();
    }

    const payload = await request.json();
    const config = contentTypeConfig[contentType as keyof typeof contentTypeConfig];
    const storeId = request.nextUrl?.searchParams.get('storeId');

    console.log(`PUT:${contentType}:${id}:store:${storeId}`);
    if (contentType == 'store') {
      return NextResponse.json({ error: 'Use a different endpoint to change stores' }, { status: 400 });
    }

    // For content types other than store, validate store access
    if (config.linkToStore) {
      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }

      if (!(await validateStoreAccess(storeId))) {
        return errorResponses.unauthorized();
      }
    }

    const validation = config.validate(payload[contentType as string]);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (['product'].includes(contentType as string) && stripeServer.enabled()) {
      const product = payload[contentType as string];
      const stripe = stripeServer.getInstance();

      if (!product.SKU) {
        const stripeProduct = await stripe.products.create({
          name: product.Name,
          description: product.Description || undefined,
          metadata: {
            slug: product.slug,
            documentId: product.documentId,
          },
        });
        console.log({ stripeProduct })
        product.SKU = stripeProduct.id;
      }

      // For each price, create Stripe price if not present
      if (Array.isArray(product.PRICES)) {
        for (let i = 0; i < product.PRICES.length; i++) {
          const price = product.PRICES[i];

          if (!price.STRIPE_ID && price.Price > 0) {
            const stripePrice = await stripe.prices.create({
              unit_amount: Math.round(price.Price * 100),
              currency: price.Currency.toLowerCase(),
              product: product.SKU,
              nickname: price.Name,
              metadata: {
                description: price.Description,
                productId: product.documentId,
              },
            });
            product.PRICES[i].STRIPE_ID = stripePrice.id;
          }
        }
      }

      payload[contentType as string] = product;
    }

    const transformedData = config.transform(
      payload[contentType as string],
      userId,
      storeId as string,
    );

    // Verify content belongs to this store
    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;
    const response = await strapiClient.update(contentTypePlural, id, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data: transformedData
    });

    return NextResponse.json(response, { status: response?.error?.status || 200 });

  } catch (error) {
    console.error('Content update error:', error);

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

export async function DELETE(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!['article', 'page', 'event', 'product', 'album', 'track', 'form'].includes(contentType as string)) {
      return NextResponse.json({ error: `Invalid content type:  ${contentType}` }, { status: 400 });
    }

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const id = request.nextUrl?.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }


    const storeId = request.nextUrl?.searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    if (!(await validateStoreAccess(storeId))) {
      return errorResponses.unauthorized();
    }

    console.log(`DELETE:${contentType}:${id}:store:${storeId}`);
    // Verify content belongs to this store

    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;
    const response = await strapiClient.delete(contentTypePlural, id, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      }
    });

    return NextResponse.json({ success: !!response.ok, status: response.status });

  } catch (error) {
    console.error('Content deletion error:', error);

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
