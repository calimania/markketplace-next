import { NextRequest, NextResponse } from 'next/server';
import { markketConfig } from '@/markket/config';
import { verifyToken } from '@/markket/helpers.api';
import { headers } from 'next/headers';

/**
 * @swagger
 * components:
 *   schemas:
 *     CollectionItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 3
 *         documentId:
 *           type: string
 *           example: "u6gmw4g46s4a5citybgx1g16"
 *         title:
 *           type: string
 *           example: "Jessica Santana, Co-founder and CEO at America On Tech"
 *         slug:
 *           type: string
 *           example: "jessica-santana"
 *         bio:
 *           type: string
 *           example: "## Jessica Santana\nCo-founder and CEO at America On Tech..."
 *         URLS:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               Label:
 *                 type: string
 *               URL:
 *                 type: string
 *
 *     Collection:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - items
 *       properties:
 *         id:
 *           type: number
 *           example: 3
 *         documentId:
 *           type: string
 *           example: "vv980fdda07oirdzvlsrlr8w"
 *         title:
 *           type: string
 *           example: "#NYCTech Week Club Calima speakers"
 *         slug:
 *           type: string
 *           example: "summit-2025-speakers"
 *         description:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CollectionItem'
 *
 *     CollectionResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Collection'
 *         meta:
 *           type: object
 *           properties:
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 pageSize:
 *                   type: number
 *                   example: 25
 *                 pageCount:
 *                   type: number
 *                   example: 1
 *                 total:
 *                   type: number
 *                   example: 1
 *
 * /api/markket/collections:
 *   get:
 *     summary: Get collections
 *     description: Retrieve a list of collections with their items
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Collection slug to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response with collections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
async function handler(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const path = requestUrl.searchParams.get('path');

  console.log(`Proxie:${req.method}:${path}`);

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 }
    );
  }

  const headersList = await headers();
  const token = headersList.get('authorization')?.split('Bearer ')[1];

  if (token) {
    const user = await verifyToken(token);

    if (!user?.id || user.blocked) {
      return NextResponse.json(
        { error: 'Unauthorized Token' },
        { status: 401 }
      );
    }
  }
  const targetUrl = new URL(
    path,
    markketConfig.api,
  );

  requestUrl.searchParams.delete('path');
  targetUrl.search = requestUrl.searchParams.toString();

  try {
    // Handle multipart form data differently than JSON to allow binary uploads
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${markketConfig.admin_token}`,
      }
    };

    if (isMultipart) {
      const formData = await req.formData();
      fetchOptions.body = formData;
    } else {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      };
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(await req.json());
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
