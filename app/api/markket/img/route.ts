
import { markketConfig } from '@/markket/config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API extension endpoints for image interactions
 *
 * Enabled actions - proxy | unsplash -
 *
 * Proxy reads URL images to go around cross origin restrictions
 * Unsplash queries their API for suggested images
 *
 * GET /api/markket/img?action=proxy&url=..
 * GET /api/markket/img?action=unsplash&query=[keywords]
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'proxy') {
    const url = searchParams.get('url');
    // If url is not a valid URL, treat as Unsplash search query
    if (!url) {
      return NextResponse.json({ error: 'Invalid or missing url' }, { status: 400 });
    }

    if (!/^https?:\/\//.test(url)) {
      try {
        const imgRes = await fetch(url, { headers: { 'User-Agent': 'markketplace-proxy' } });
        if (!imgRes.ok) {
          return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
        }

        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await imgRes.arrayBuffer();

        return new NextResponse(Buffer.from(arrayBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (e) {
        return NextResponse.json({ error: 'Image proxy error', message: e }, { status: 500 });
      }
    }

    try {
      const imgRes = await fetch(url, { headers: { 'User-Agent': 'markketplace-proxy' } });
      if (!imgRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
      }
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await imgRes.arrayBuffer();

      return new NextResponse(Buffer.from(arrayBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (e) {
      return NextResponse.json({ error: 'Proxy error', message: e }, { status: 500 });
    }
  }

  if (action === 'unsplash') {
    const accessKey = markketConfig.extensions?.unsplash_access_key;
    if (!accessKey) {
      return NextResponse.json({ error: 'Unsplash access key not set' }, { status: 500 });
    }

    const query = searchParams.get('query');

    try {
      const url = query
        ? `https://api.unsplash.com/photos/random?count=10&orientation=squarish&query=${encodeURIComponent(query)}&client_id=${accessKey}`
        : `https://api.unsplash.com/photos/random?count=10&orientation=squarish&client_id=${accessKey}`;

      const unsplashRes = await fetch(url);
      if (!unsplashRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch Unsplash images' }, { status: 502 });
      }
      const data = await unsplashRes.json();
      const urls = Array.isArray(data)
        ? data.map((img: any) => img.urls?.regular || img.urls?.full || img.urls?.small)
        : [];

      return NextResponse.json({ urls });
    } catch (e) {
      return NextResponse.json({ error: 'Unsplash error', message: e }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
