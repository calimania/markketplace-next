import { useState, useEffect } from 'react';
import { markketClient } from '@/markket/api.markket';

import { ContentType , FetchOptions} from './common.d';

export type { ContentType } from './common.d';

const markket = new markketClient();

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
      const json = await markket.fetch(`/api/markket?path=/api/${contentType}/${_id}&${options?.append || ''}`, {});
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

  const refresh = async () => {
    const json = await markket.fetch(`/api/markket?path=/api/${contentType}/${id}&${options?.append || ''}`, {});
    setLoading(false);
    setItem(json?.data as T);
  }

  return { item, loading, error, refresh };
};
