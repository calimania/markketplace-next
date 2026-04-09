'use client';

import { useEffect, useState } from 'react';
import { INJECTED_STORAGE_KEY, isEmbeddedMode, patchInjectedContext } from '@/markket/injected';

function readEmbedFromQuery(): boolean | undefined {
  if (typeof window === 'undefined') return undefined;

  const params = new URLSearchParams(window.location.search);
  const display = (params.get('display') || '').trim().toLowerCase();
  const navbar = (params.get('navbar') || '').trim().toLowerCase();
  const footer = (params.get('footer') || '').trim().toLowerCase();

  if (display) {
    if (display.startsWith('embed')) return true;
    if (display === 'full' || display === 'default' || display === 'web' || display === 'show') return false;
  }

  if (navbar === 'hide' || footer === 'hide') return true;
  if (navbar === 'show' && footer === 'show') return false;

  return undefined;
}

const LOCATION_CHANGE_EVENT = 'markket:location-change';
const INJECTED_UPDATE_EVENT = 'markket:injected-update';

function ensureHistoryEventsPatched() {
  if (typeof window === 'undefined') return;

  const historyWithFlag = window.history as History & { __markketPatched?: boolean };
  if (historyWithFlag.__markketPatched) return;

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function pushState(...args) {
    const result = originalPushState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };

  window.history.replaceState = function replaceState(...args) {
    const result = originalReplaceState(...args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };

  historyWithFlag.__markketPatched = true;
}

function ensureInjectedStorageEventsPatched() {
  if (typeof window === 'undefined') return;

  const storageWithFlag = window.localStorage as Storage & { __markketPatched?: boolean };
  if (storageWithFlag.__markketPatched) return;

  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  window.localStorage.setItem = function setItem(key: string, value: string) {
    originalSetItem(key, value);
    if (key === INJECTED_STORAGE_KEY) {
      window.dispatchEvent(new Event(INJECTED_UPDATE_EVENT));
    }
  };

  window.localStorage.removeItem = function removeItem(key: string) {
    originalRemoveItem(key);
    if (key === INJECTED_STORAGE_KEY) {
      window.dispatchEvent(new Event(INJECTED_UPDATE_EVENT));
    }
  };

  storageWithFlag.__markketPatched = true;
}

export function useEmbeddedMode() {
  const [embedded, setEmbedded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    const fromQuery = readEmbedFromQuery();
    if (typeof fromQuery === 'boolean') return fromQuery;

    return isEmbeddedMode();
  });

  useEffect(() => {
    ensureHistoryEventsPatched();
    ensureInjectedStorageEventsPatched();

    const syncEmbedded = () => {
      const fromQuery = readEmbedFromQuery();

      if (typeof fromQuery === 'boolean') {
        patchInjectedContext({ embedded: fromQuery });
        setEmbedded(fromQuery);
        return;
      }

      setEmbedded(isEmbeddedMode());
    };

    syncEmbedded();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === INJECTED_STORAGE_KEY) {
        syncEmbedded();
      }
    };

    const handleLocationChange = () => {
      syncEmbedded();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    window.addEventListener(INJECTED_UPDATE_EVENT, handleLocationChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
      window.removeEventListener(INJECTED_UPDATE_EVENT, handleLocationChange);
    };
  }, []);

  return embedded;
}