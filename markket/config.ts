
const MAX_STORES = parseInt(process.env.NEXT_PUBLIC_MAX_STORES_PER_USER || '2', 10);

/**
 * Runtime configuration for the Markket app
 */
export const markketConfig = {
  /**MAX_STORES_PER_USER | artificial limit in the instance for store owners */
  max_stores_per_user: MAX_STORES,
  max_pages_per_store: 15,
  max_articles_per_store: 25,
  max_products_per_store: 15,
  max_albums_per_store: 15,
  max_tracks_per_album: 25,
  max_events_per_store: 25,
  max_images_per_slide: 6,
  blank_image_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/4dd22c1b57887fe28307fb4784c974bb.png",
  blank_favicon_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/43c188106f4d950987346842a05e0cbf.png",
  blank_logo_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/f96148440e7ccf81fe2c36a779c06e30.png",
  blank_cover_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/c2491ef7c413165be47c9882a08d7ffd.png",
  /** NEXT_PUBLIC_MARKKET_API : markket-strapi api url || api.markket.place */
  api: process.env.NEXT_PUBLIC_MARKKET_API || "https://api.markket.place",
  /** NEXT_PUBLIC_MARKKET_URL : markket-next base url || de.markket.place */
  markket_url: process.env.NEXT_PUBLIC_MARKKET_URL || "https://de.markket.place",
  /** MARKKET_API_KEY : used to wrap API requests */
  admin_token: process.env.MARKKET_API_KEY as string,
  /** NEXT_PUBLIC_MARKKET_STORE_SLUG */
  slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || 'next',
  /** MARKKET_API_KEY */
  markket_api_key: process.env.MARKKET_API_KEY || '',
  /** CISION_CREDENTIALS */
  cision: process.env.CISION_CREDENTIALS || '',
  extensions: {
    unsplash_access_key: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  }
};
