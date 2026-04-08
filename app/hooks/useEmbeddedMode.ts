'use client';

import { useEffect, useState } from 'react';
import { INJECTED_STORAGE_KEY, isEmbeddedMode } from '@/markket/injected';

export function useEmbeddedMode() {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbeddedMode());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === INJECTED_STORAGE_KEY) {
        setEmbedded(isEmbeddedMode());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return embedded;
}