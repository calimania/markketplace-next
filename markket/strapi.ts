const MARKKET_API = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place';

/**
 * Wrapper method to abstract the creation of records in Markket Strapi API
 *
 * @param endpoint
 * @param data
 * @returns
 */
export const createRecord = async <T>(endpoint: string, data: T) => {

  const _url = new URL(`api/${endpoint}`, MARKKET_API);

  try {
    const response = await fetch(_url.toString(), {
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
