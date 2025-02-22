import { NextRequest, NextResponse } from 'next/server';

const MARKKET_URL = process.env.MARKKET_URL || 'https://api.markket.place/';

async function handler(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const path = requestUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 }
    );
  }

  // Construct the target URL (ensure path starts with /)
  const targetUrl = new URL(
    path.startsWith('/') ? path : `/${path}`,
    MARKKET_URL
  );

  console.log('API Proxy:', { targetUrl: targetUrl.toString() });

  // Forward all other query params except 'path'
  requestUrl.searchParams.delete('path');
  targetUrl.search = requestUrl.searchParams.toString();

  console.info('API Proxy:', { targetUrl: targetUrl.toString() });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('authorization') && {
          'Authorization': req.headers.get('authorization') || ''
        })
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && {
        body: JSON.stringify(await req.json())
      })
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
