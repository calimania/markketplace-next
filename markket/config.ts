
const MAX_STORES: number = parseInt(process.env.NEXT_PUBLIC_MAX_STORES_PER_USER || '3', 10);
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

const readPublicEnv = (value?: string) => {
  const normalized = value?.trim();

  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return '';
  }

  return normalized;
};

const normalizePostHogHost = (value?: string) => {
  const normalized = readPublicEnv(value);

  if (!normalized) {
    return DEFAULT_POSTHOG_HOST;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
    const url = new URL(withProtocol);

    if (url.hostname === 'us.posthog.com' || url.hostname === 'app.posthog.com') {
      return DEFAULT_POSTHOG_HOST;
    }

    if (url.hostname === 'eu.posthog.com') {
      return 'https://eu.i.posthog.com';
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_POSTHOG_HOST;
  }
};

/**
 * Runtime configuration for the Markket app
 */
export const markketplace = {
  /**MAX_STORES_PER_USER | artificial limit in the instance for store owners */
  max_stores_per_user: MAX_STORES,
  max_pages_per_store: 50,
  max_articles_per_store: 100,
  max_products_per_store: 20,
  max_albums_per_store: 100,
  max_tracks_per_album: 25,
  max_events_per_store: 50,
  max_images_per_slide: 6,
  blank_image_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/4dd22c1b57887fe28307fb4784c974bb.png",
  blank_favicon_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/43c188106f4d950987346842a05e0cbf.png",
  blank_logo_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/f96148440e7ccf81fe2c36a779c06e30.png",
  blank_cover_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/c2491ef7c413165be47c9882a08d7ffd.png",
  /** NEXT_PUBLIC_ MARKKET_API : markket-strapi api url || api.markket.place */
  api: process.env.NEXT_PUBLIC_MARKKET_API || "https://api.markket.place",
  /** NEXT_PUBLIC_MARKKET_URL : markket-next base url || markket.place */
  markket_url: process.env.NEXT_PUBLIC_MARKKET_URL || "https://markket.place",
  /** NEXT_PUBLIC_MARKKET_STORE_SLUG */
  slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || 'next',
  /** NEXT_PUBLIC_MARKKET_DESIGN_SYSTEM_STORE_SLUG */
  design_system_demo_slug: process.env.NEXT_PUBLIC_MARKKET_DESIGN_SYSTEM_STORE_SLUG || 'dev',
  extensions: {
    unsplash_access_key: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
    pexels_access_key: process.env.PEXELS_API_KEY || process.env.NEXT_PUBLIC_PEXELS_KEY || '',
    posthog: {
      api_key: readPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY),
      host: normalizePostHogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST)
    }
  }
};
