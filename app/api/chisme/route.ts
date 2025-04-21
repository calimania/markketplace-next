import News, { Release } from '@/app/utils/cision';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {

  const release_id = request?.nextUrl?.searchParams.get('release_id');
  const keyword_or = request?.nextUrl?.searchParams.get('keyword_or') || 'art tech vc health wellness colombia latinx univision telemundo ecommerce ketamine ayahuasca screenprint business miami finance rock cumbia salsa teatro bogota calima markket a16z ycombinator colombia logotherapy data breach';

  if (!release_id) {
    const news = await News.get({
      keyword_or,
    });
    return NextResponse.json(
      news,
      { status: 200 }
    )

  }
  const _release = await News.get_by_id(release_id);
  const release = _release?.data as Release;

  return NextResponse.json({
    release
  })
};
