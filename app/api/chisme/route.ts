import News from '@/app/utils/cision';
import { NextResponse } from 'next/server';

export async function GET() {
  const news = await News.get();

  return NextResponse.json(
    news,
    { status: 200 }
  )
};
