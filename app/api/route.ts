import { NextResponse } from 'next/server'
import { strapiClient } from '@/markket/api'

export async function GET() {
  const store = await strapiClient.getStore();

  return NextResponse.json(
    {
      markket: 'markket',
      markket_url: process.env.NEXT_PUBLIC_MARKKET_API,
      markket_store_slug: store?.data?.[0]?.slug,
      markket_place_url: process.env.NEXT_PUBLIC_MARKKET_PLACE_URL,
      title: store?.data?.[0]?.title,
    },
    { status: 200 }
  )
};
