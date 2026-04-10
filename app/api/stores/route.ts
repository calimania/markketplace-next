import { NextResponse, NextRequest } from 'next/server';
import { strapiClient } from '@/markket/api.strapi';

export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

  try {
    const response = await strapiClient.getStores(
      { page, pageSize },
      { filter: '', sort: 'active:desc,updatedAt:desc' },
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Stores route error:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}
