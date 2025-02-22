import { NextRequest, NextResponse } from 'next/server';

const MARKKET_URL = process.env.MARKKET_URL || 'https://api.markket.place/';

async function handler(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const requestUrl = new URL(req.url);
  const path = requestUrl.pathname.replace('/api/markket', '/api');

  // Construct the target URL
  const targetUrl = new URL(path, MARKKET_URL);
  targetUrl.search = requestUrl.search;


  console.log({ targetUrl: targetUrl.toString() });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(req.headers.get('authorization') && {
          'Authorization': req.headers.get('authorization') || ''
        })
      },
      // Forward the body for POST/PUT/PATCH requests
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

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
