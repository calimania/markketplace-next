const MARKKET_API = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';

/**
 * Wrapper method to abstract the creation of records in Markket Strapi API
 *
 * @param endpoint
 * @param data
 * @returns
 */
export const createRecord = async <T>(endpoint: string, data: T) => {
  try {
    const response = await fetch(`${MARKKET_API}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    return response;
  } catch (error) {
    console.error("Record creation failed:", error);
    return false;
  }
};
