export interface StoreVisibility {
  show_blog: boolean;
  show_events: boolean;
  show_shop: boolean;
  show_about: boolean;
  show_newsletter: boolean;
  show_home: boolean;
  has_upcoming_events: boolean;
  has_events: boolean;
  content_summary: {
    articles_count: number;
    products_count: number;
    events_count: number;
    upcoming_events_count: number;
    pages_count: number;
  };
  magic_pages_detected: string[];
  settings_overrides: any[];
}

export interface StoreVisibilityResponse {
  data: StoreVisibility;
}
