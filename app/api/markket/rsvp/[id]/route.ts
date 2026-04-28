import { NextRequest, NextResponse } from 'next/server';

import { markketplace } from '@/markket/config';

const STRAPI_URL = markketplace.api;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'RSVP id required' }, { status: 400 });
  }

  const url = new URL(`api/rsvps/${id}`, STRAPI_URL);
  url.searchParams.set('populate[event][fields][0]', 'Name');
  url.searchParams.set('populate[event][fields][1]', 'slug');
  url.searchParams.set('populate[event][fields][2]', 'startDate');
  url.searchParams.set('populate[event][fields][3]', 'endDate');
  url.searchParams.set('populate[event][fields][4]', 'documentId');
  url.searchParams.set('populate[event][fields][5]', 'timezone');
  url.searchParams.set('populate[event][populate][Thumbnail][fields][0]', 'url');
  url.searchParams.set('populate[event][populate][SEO][fields][0]', 'metaDescription');
  url.searchParams.set('populate[store][fields][0]', 'slug');
  url.searchParams.set('populate[store][fields][1]', 'title');

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });

  console.log(`[rsvp/get] <- GET ${url.toString()} — ${response.status}`);

  if (!response.ok) {
    return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
