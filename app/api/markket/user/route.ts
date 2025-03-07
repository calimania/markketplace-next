import { NextRequest, NextResponse } from 'next/server';
import { markketConfig } from '@/markket/config';
import { validateUserAndToken } from '../store/route';

const MARKKET_API = markketConfig.api;
const ADMIN_TOKEN = markketConfig.admin_token;

export async function PUT(
  request: NextRequest,
) {
  if (!MARKKET_API || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 400 }
    );
  }

  try {
    const userData = await validateUserAndToken();

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (userData?.id !== body?.id) {
      return NextResponse.json(
        { error: 'Invalid user contacting the FBI' },
        { status: 401 }
      );
    }

    const url = new URL(`/api/users/${body.id}`, MARKKET_API);
    console.log('User update:', { url: url.toString(), body });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.text();
    console.error('User update failed:', data);
    return NextResponse.json({ error: 'Failed to update user' , data }, { status: response.status });
  } catch (error) {
    console.error('User update error:', error);

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
};
