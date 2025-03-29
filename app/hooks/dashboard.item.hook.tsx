import { useState, useEffect } from 'react';

import { ContentType , FetchOptions} from './common.d';

export type { ContentType } from './common.d';

export function useCMSItem<T>(
  contentType: ContentType,
  id: string,
  options?: Partial<FetchOptions>
) {
  const [item, setItem] = useState<T>({} as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);


  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async (_id: string) => {
      const response = await fetch(`/api/markket?path=/api/${contentType}/${_id}&${options?.append || ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json();
      setLoading(false);
      setItem(json?.data as T);
    };

    if (id) {
      try {
        fetchData(id);
      }
      catch (error) {
        setError(error as Error);
      }
    }
  }, [id, contentType, options?.append]);

  return { item, loading, error };
};
