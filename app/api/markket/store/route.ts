import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API;
const ADMIN_TOKEN = process.env.MARKKET_API_KEY;

async function verifyToken(token: string) {
  const _url = new URL('api/users/me', STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Token verification response:', response);

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

async function fetchUserStores(userId: number) {
  const query = qs.stringify({
    filters: {
      users: {
        id: {
          $eq: userId
        }
      }
    },
    populate: ['Logo', 'SEO.socialImage', 'Favicon', 'URLS'],
  }, {
    encodeValuesOnly: true
  });

  const _url = new URL(`api/stores?${query}`, STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    throw error;
  }
}

export async function GET() {
  if (!STRAPI_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  };

  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const userData = await verifyToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const stores = await fetchUserStores(userData.id);

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
