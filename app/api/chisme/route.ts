import News, { Release } from '@/app/utils/cision';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {

  const release_id = request?.nextUrl?.searchParams.get('release_id');

  if (!release_id) {
    const news = await News.get();
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
