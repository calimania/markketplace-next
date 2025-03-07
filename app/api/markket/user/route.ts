import { NextRequest, NextResponse } from 'next/server';
import { markketConfig } from '@/markket/config';

const MARKKET_API = markketConfig.api;
const ADMIN_TOKEN = markketConfig.admin_token;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!MARKKET_API || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
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

/**
 *   "username": "omard.skp+1@gmail.com",
    "email": "omard.skp+1@gmail.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2025-03-01T00:59:39.904Z",
    "updatedAt": "2025-03-07T22:47:22.696Z",
    "uuid": null,
    "documentId": "s8es3j6jbmlyle2vofgwd7jy",
    "publishedAt": "2025-03-01T00:59:39.904Z",
    "bio": null,
    "displayName": null,
    "role": {
        "id": 3,
        "name": "Store Owners",
 */
