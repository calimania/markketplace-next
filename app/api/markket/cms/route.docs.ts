/***
 * path: /api/markket/cms
 * name: CMS Proxie
 * description: Validates and transforms data to POST & PUT the content API
 */
/**
 * @swagger
 * tags:
 *   name: Dashboard CMS (Article, Page, Product, Event, Form, Album, AlbumTrack)
 *   description: Content Management System API for Markkët
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ContentResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           description: The created or updated content item
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: object
 *           description: Additional error details
 *
 *     ArticleInput:
 *       type: object
 *       required:
 *         - Title
 *         - Content
 *         - slug
 *       properties:
 *         Title:
 *           type: string
 *           description: Article title
 *         Content:
 *           type: array
 *           description: Article content blocks
 *           items:
 *             type: object
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     PageInput:
 *       type: object
 *       required:
 *         - Title
 *         - Content
 *         - slug
 *       properties:
 *         Title:
 *           type: string
 *           description: Page title
 *         Content:
 *           type: array
 *           description: Page content blocks
 *           items:
 *             type: object
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     ProductInput:
 *       type: object
 *       required:
 *         - Name
 *         - Description
 *         - slug
 *       properties:
 *         Name:
 *           type: string
 *           description: Product name
 *         Description:
 *           type: string
 *           description: Product description
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         SKU:
 *           type: string
 *           description: Stock keeping unit
 *         PRICES:
 *           type: array
 *           description: Product pricing options
 *           items:
 *             type: object
 *             properties:
 *               Price:
 *                 type: number
 *               Currency:
 *                 type: string
 *               Name:
 *                 type: string
 *               Description:
 *                 type: string
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     TrackInput:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *       properties:
 *         title:
 *           type: string
 *           description: Track title
 *         description:
 *           type: string
 *           description: Track description
 *         content:
 *           type: array
 *           description: Track content blocks
 *           items:
 *             type: object
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         urls:
 *           type: array
 *           description: External links
 *           items:
 *             type: object
 *             properties:
 *               Label:
 *                 type: string
 *               URL:
 *                 type: string
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     AlbumInput:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *       properties:
 *         title:
 *           type: string
 *           description: Album title
 *         description:
 *           type: string
 *           description: Album description
 *         content:
 *           type: array
 *           description: Album content blocks
 *           items:
 *             type: object
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         displayType:
 *           type: string
 *           enum: [grid, list, carousel]
 *           description: How to display album tracks
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     EventInput:
 *       type: object
 *       required:
 *         - Name
 *         - slug
 *         - startDate
 *       properties:
 *         Name:
 *           type: string
 *           description: Event name
 *         Description:
 *           type: string
 *           description: Event description
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         location:
 *           type: string
 *           description: Event location
 *         PRICES:
 *           type: array
 *           description: Event pricing options
 *           items:
 *             type: object
 *         SEO:
 *           $ref: '#/components/schemas/SEOInput'
 *
 *     SEOInput:
 *       type: object
 *       properties:
 *         metaTitle:
 *           type: string
 *           description: Page title for SEO
 *         metaDescription:
 *           type: string
 *           description: Page description for SEO
 *         metaKeywords:
 *           type: string
 *           description: Comma-separated keywords
 *         socialImage:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: Media ID for social sharing image
 *
 */

/**
 * @swagger
 * /api/markket/cms:
 *   post:
 *     summary: Create content item
 *     description: |
 *       Create a new content item in the CMS based on content type.
 *
 *       The Universal CMS API abstracts away the complexity of managing
 *       multiple content types. Rather than having separate API routes for each content type,
 *       this single endpoint uses dynamic configuration to handle multiple types
 *       while applying consistent validation, transformations, and access control.
 *
 *       Benefits:
 *       - Unified validation and error handling
 *       - Consistent data transformations
 *       - Centralized permissions checking
 *       - Content limits management
 *       - Standardized integration with Strapi
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [article, page, product, track, album, event]
 *         description: Type of content to create
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         required: false
 *         description: Store ID (required for all content types except store)
 *       - in: query
 *         name: albumId
 *         schema:
 *           type: string
 *         required: false
 *         description: Album ID (required for track content type)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               article:
 *                 $ref: '#/components/schemas/ArticleInput'
 *               page:
 *                 $ref: '#/components/schemas/PageInput'
 *               product:
 *                 $ref: '#/components/schemas/ProductInput'
 *               track:
 *                 $ref: '#/components/schemas/TrackInput'
 *               album:
 *                 $ref: '#/components/schemas/AlbumInput'
 *               event:
 *                 $ref: '#/components/schemas/EventInput'
 *           examples:
 *             article:
 *               value:
 *                 article:
 *                   Title: "Example Article"
 *                   Content: [{"type":"paragraph","children":[{"text":"Content here"}]}]
 *                   slug: "example-article"
 *                   SEO:
 *                     metaTitle: "Example Article"
 *                     metaDescription: "This is an example article"
 *             product:
 *               value:
 *                 product:
 *                   Name: "Sample Product"
 *                   Description: "Product description"
 *                   slug: "sample-product"
 *                   SKU: "PROD-001"
 *                   PRICES: [{"Price": 19.99, "Currency": "USD", "Name": "Standard"}]
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   error: "Missing required fields for article"
 *               invalidSlug:
 *                 value:
 *                   error: "Invalid slug format"
 *               storeLimit:
 *                 value:
 *                   error: "Maximum product limit reached (20)"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               noToken:
 *                 value:
 *                   error: "No token provided"
 *               invalidToken:
 *                 value:
 *                   error: "Invalid token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Store not found or unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Internal server error"
 */

/**
 * @swagger
 * /api/markket/cms:
 *   put:
 *     summary: Update content item
 *     description: |
 *       Update an existing content item in the CMS based on content type.
 *
 *       This centralized API handles updates for multiple content types
 *       while ensuring proper validation, transformation, and access control.
 *       Using a single route with dynamic configuration simplifies maintenance
 *       and provides consistent behavior across all content types.
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [article, page, product, track, album, event]
 *         description: Type of content to update
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content item to update
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         required: false
 *         description: Store ID (required for all content types except store)
 *       - in: query
 *         name: albumId
 *         schema:
 *           type: string
 *         required: false
 *         description: Album ID (required for track content type)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               article:
 *                 $ref: '#/components/schemas/ArticleInput'
 *               page:
 *                 $ref: '#/components/schemas/PageInput'
 *               product:
 *                 $ref: '#/components/schemas/ProductInput'
 *               track:
 *                 $ref: '#/components/schemas/TrackInput'
 *               album:
 *                 $ref: '#/components/schemas/AlbumInput'
 *               event:
 *                 $ref: '#/components/schemas/EventInput'
 *           examples:
 *             article:
 *               value:
 *                 article:
 *                   Title: "Updated Article"
 *                   Content: [{"type":"paragraph","children":[{"text":"New content here"}]}]
 *                   slug: "updated-article"
 *                   SEO:
 *                     metaTitle: "Updated Article"
 *                     metaDescription: "This is an updated article"
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Content item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/markket/cms:
 *   get:
 *     summary: Get content items
 *     description: Fetch content items based on content type
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [article, page, product, track, album, event]
 *         description: Type of content to fetch
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: ID of a specific content item to fetch
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: Store ID to filter content by
 *     responses:
 *       200:
 *         description: Content items retrieved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/markket/cms:
 *   delete:
 *     summary: Delete content item
 *     description: Delete a content item by its ID
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [article, page, product, track, album, event]
 *         description: Type of content to delete
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content item to delete
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: Store ID (required for content types linked to stores)
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @description
 *
 * # Universal CMS API
 *
 * ## Purpose
 *
 * The Universal CMS API acts as a proxy layer between your frontend application and
 * your Strapi backend, providing several key benefits:
 *
 * 1. **Unified Interface**: Instead of creating separate endpoints for each content type
 *    (articles, pages, products, etc.), this API provides a single point of entry.
 *
 * 2. **Configuration-Based Logic**: Content type-specific behavior is defined through
 *    configuration objects rather than duplicated code.
 *
 * 3. **Consistent Validation**: Common validation patterns like slug formatting and
 *    required fields are applied consistently.
 *
 * 4. **Access Control**: Permission checks ensure users can only modify content
 *    they own or have access to.
 *
 * 5. **Data Transformation**: Input data is transformed into the exact format
 *    expected by Strapi before being sent.
 *
 * 6. **Content Limits**: Enforces limits on how many items of certain types
 *    can be created (e.g., products per store).
 *
 * ## Architecture
 *
 * The API uses a dynamic configuration system where each content type defines:
 *
 * - **Validation Rules**: What fields are required and what format they should have
 * - **Transformation Rules**: How to convert input data to Strapi's expected format
 * - **Relationship Rules**: How content connects to stores or other content
 * - **Limits**: Any quantity restrictions that should be enforced
 *
 * This approach allows for easy addition of new content types without creating
 * new API routes or duplicating validation and transformation logic.
 */
