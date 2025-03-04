import { NextResponse } from 'next/server'
import { strapiClient } from '@/markket/api'
import pkg from '@/package.json';

export async function GET() {
  const store = await strapiClient.getStore();

  return NextResponse.json(
    {
      markket: `markket@${pkg.version}`,
      markket_api: process.env.NEXT_PUBLIC_MARKKET_API || '',
      markket_store_slug: store?.data?.[0]?.slug || '',
      markketplace_url: process.env.NEXT_PUBLIC_MARKKETPLACE_URL || '',
      title: store?.data?.[0]?.title || '',
    },
    { status: store?.data ? 200 : 420 }
  )
};
