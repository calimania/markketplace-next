

export interface StripeAccount {
  info: {
    test_mode: boolean;
    business_profile: {
      name: string;
      url: string;
      support_phone: string;
    };
    charges_enabled: boolean;
    payouts_enabled: boolean;
    default_currency: string;
    email: string;
    settings: {
      dashboard: {
        display_name: string;
      };
      branding: {
        primary_color: string;
        secondary_color: string;
        logo: string;
      };
    };
    external_accounts: {
      data: Array<{
        bank_name: string;
        last4: string;
        routing_number: string;
      }>;
    };
    capabilities: Record<string, string>;
  };
}
