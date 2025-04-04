/**
 * @swagger
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               example: 1
 *             title:
 *               type: string
 *               example: "Makeup store"
 *             Description:
 *               type: string
 *               example: "For clowns and actors"
 *             slug:
 *               type: string
 *               example: "makeup-clowns"
 *             documentId:
 *               type: string
 *               example: "abc123xyz789"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             Logo:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *             Favicon:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *             SEO:
 *               type: object
 *               properties:
 *                 metaTitle:
 *                   type: string
 *                 metaDescription:
 *                   type: string
 *             URLS:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/markket/store:
 *   get:
 *     summary: Retrieve stores for authenticated user
 *     description: |
 *       Fetches all stores associated with the authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *       Uses admin token to fetch from Strapi with user-specific filters.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       Logo:
 *                         type: object
 *                       Favicon:
 *                         type: object
 *                       SEO:
 *                         type: object
 *                       URLS:
 *                         type: array
 *       400:
 *         description: Missing API configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad request
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No token provided
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /api/markket/store:
 *   post:
 *     summary: POST /api/markket/store - Create a new store
 *     description: |
 *       Creates a new store for the authenticated user
 *       Requires a valid JWT token in the Authorization header
 *       Uses admin token to create store in Strapi
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - Description
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Makeup store"
 *               Description:
 *                 type: string
 *                 example: "For clowns and actors"
 *               slug:
 *                 type: string
 *                 minLength: 5
 *                 pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 *                 example: "makeup-clowns"
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid slug format"
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/markket/store/{id}:
 *   put:
 *     summary: Update an existing store
 *     description: |
 *       Updates a store for the authenticated user
 *       Requires a valid JWT token in the Authorization header
 *       Uses admin token to update store in Strapi
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               store:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Updated Store Name"
 *                   Description:
 *                     type: string
 *                     example: "Updated store description"
 *                   slug:
 *                     type: string
 *                     minLength: 5
 *                     pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 *                     example: "updated-store-name"
 *                   SEO:
 *                     type: object
 *                     properties:
 *                       metaTitle:
 *                         type: string
 *                         example: "Store Meta Title"
 *                       metaDescription:
 *                         type: string
 *                         example: "Store meta description for SEO"
 *     responses:
 *       200:
 *         description: Store updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Authentication error
 *       403:
 *         description: Not authorized to update this store
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 */
