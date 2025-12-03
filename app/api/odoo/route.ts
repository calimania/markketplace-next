import { NextResponse } from 'next/server';

/**
 *
 * @returns { message: string } uwu
 */
export const GET = (): NextResponse<{ message: string }> => {
  return NextResponse.json({
    message: 'uwu'
  });
};
