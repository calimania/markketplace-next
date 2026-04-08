const INJECTED_STORAGE_KEY = 'markket.injected';

export type MarkketInjectedContext = {
  embedded?: boolean;
  platform?: 'ios' | 'android' | 'web';
  sourceApp?: string;
  [key: string]: unknown;
};

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function readInjectedContext(): MarkketInjectedContext {
  if (!canUseLocalStorage()) return {};

  const raw = localStorage.getItem(INJECTED_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as MarkketInjectedContext;
    }
  } catch (error) {
    console.warn('Invalid markket.injected payload, clearing it.', error);
    localStorage.removeItem(INJECTED_STORAGE_KEY);
  }

  return {};
}

export function writeInjectedContext(value: MarkketInjectedContext) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(INJECTED_STORAGE_KEY, JSON.stringify(value || {}));
}

export function patchInjectedContext(patch: MarkketInjectedContext) {
  const current = readInjectedContext();
  writeInjectedContext({ ...current, ...patch });
}

export function isEmbeddedMode() {
  return !!readInjectedContext()?.embedded;
}

export { INJECTED_STORAGE_KEY };
