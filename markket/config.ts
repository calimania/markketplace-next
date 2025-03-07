/**
 * Runtime configuration for the Markket app
 */
export const markketConfig = {
  max_stores_per_user: 2,
  blank_image_url: "https://markketplace.nyc3.digitaloceanspaces.com/uploads/8c99b7f0412e6ececd4fae78e3617ae7.png",
  api: process.env.NEXT_PUBLIC_MARKKET_API || "https://api.markket.place",
  admin_token: process.env.MARKKET_API_KEY as string,
};
