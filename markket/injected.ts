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

function readEmbedModeFromLocation(): boolean | undefined {
  if (typeof window === 'undefined') return undefined;

  const params = new URLSearchParams(window.location.search);
  const display = (params.get('display') || '').trim().toLowerCase();
  const navbar = (params.get('navbar') || '').trim().toLowerCase();
  const footer = (params.get('footer') || '').trim().toLowerCase();

  // Examples supported:
  // ?display=embed
  // ?display=embed:mobile
  // ?display=full
  if (display) {
    if (display.startsWith('embed')) return true;
    if (display === 'full' || display === 'default' || display === 'web' || display === 'show') return false;
  }

  // Examples supported:
  // ?navbar=hide
  // ?footer=hide
  if (navbar === 'hide' || footer === 'hide') return true;
  if (navbar === 'show' && footer === 'show') return false;

  return undefined;
}

export function isEmbeddedMode() {
  const fromUrl = readEmbedModeFromLocation();
  if (typeof fromUrl === 'boolean') return fromUrl;

  return !!readInjectedContext()?.embedded;
}

export { INJECTED_STORAGE_KEY };
