/**
 * Runtime configuration for the Markket app
 */
export const markketConfig = {
  max_stores_per_user: 2,
  blank_image_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/8c99b7f0412e6ececd4fae78e3617ae7.png",
  /** NEXT_PUBLIC_MARKKET_API : markket-strapi api url || api.markket.place */
  api: process.env.NEXT_PUBLIC_MARKKET_API || "https://api.markket.place",
  /** NEXT_PUBLIC_MARKKET_URL : markket-next base url || de.markket.place */
  markket_url: process.env.NEXT_PUBLIC_MARKKET_URL || "https://de.markket.place",
  /** MARKKET_API_KEY : used to wrap API requests */
  admin_token: process.env.MARKKET_API_KEY as string,
};
