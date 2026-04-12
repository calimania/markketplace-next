import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { headers } from 'next/headers';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         bio:
 *           type: string
 *           example: "John"
 *         displayName:
 *           type: string
 *           example: "Doe"
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               example: "https://api.markket.place/uploads/avatar.jpg"
 *
 * /api/markket/user:
 *   put:
 *     summary: Update user profile
 *     description: |
 *       Updates the authenticated user's profile information.
 *       Requires authentication via JWT token.
 *       Uses admin token to update user in Strapi.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *                 description: User ID must match authenticated user
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request or missing configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "API configuration missing"
 *       401:
 *         description: Authentication error or user mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update user"
 */
export async function PUT(
  request: NextRequest,
) {

  try {
    const headersList = await headers();
    const userToken = headersList.get('authorization')?.split('Bearer ')[1] || '';
    const body = await request.json();

    const payload = { username: body?.username, displayName: body?.displayName, bio: body?.bio };

    const url = new URL('/api/markket/user', markketplace.api);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.text();
    console.error('User update failed:', data);
    return NextResponse.json({ error: 'Failed to update user', data }, { status: response.status });
  } catch (error) {
    console.error('User update error:', error);

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
};
