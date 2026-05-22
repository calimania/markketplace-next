export interface StoreVisibilityContentSummary {
  articles_count: number;
  products_count: number;
  events_count: number;
  upcoming_events_count: number;
  pages_count: number;
}

export interface StoreVisibilitySummary {
  source?: string;
  enabled_sections?: string[];
  disabled_sections?: string[];
  explicit_overrides?: Record<string, boolean>;
  content_signals?: {
    articles?: number;
    pages?: number;
    products?: number;
    events?: number;
    upcoming_events?: number;
  };
  generated_at?: string;
}

export interface StoreVisibility {
  show_blog: boolean;
  show_events: boolean;
  show_shop: boolean;
  show_about: boolean;
  show_newsletter: boolean;
  show_home: boolean;
  has_upcoming_events: boolean;
  has_events: boolean;
  content_summary: StoreVisibilityContentSummary;
  magic_pages_detected: string[];
  settings_overrides: string[];
  summary?: StoreVisibilitySummary;
  _debug?: Record<string, unknown>;
}

export interface StoreVisibilityResponse {
  data?: StoreVisibility;
  summary?: StoreVisibilitySummary;
  _debug?: Record<string, unknown>;
  show_blog?: boolean;
  show_events?: boolean;
  show_shop?: boolean;
  show_about?: boolean;
  show_newsletter?: boolean;
  show_home?: boolean;
  has_upcoming_events?: boolean;
  has_events?: boolean;
  content_summary?: StoreVisibilityContentSummary;
  magic_pages_detected?: string[];
  settings_overrides?: string[];
}
