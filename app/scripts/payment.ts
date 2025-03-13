import { Price } from "@/markket/product";
import { markketConfig } from "@/markket/config";

export type PaymentLinkOptions = {
  totalPrice: number;
  product: string;
  prices: Price[];
  includes_shipping: boolean;
  stripe_test: boolean;
};

export const createPaymentLink = async (
  options: PaymentLinkOptions,
  isTest: boolean = true
): Promise<Response> => {
  console.log("Creating payment link", { options, isTest });

  const prices = options.prices;

  const body = {
    prices,
    total: options.totalPrice,
    product: options.product,
    action: "stripe.link",
    includes_shipping: options.includes_shipping,
    stripe_test: options.stripe_test,
  };

  const request = await fetch(new URL('/api/markket', markketConfig.api), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const response = await request.json();

  const url = response?.data?.link?.response?.url;

  if (request.ok && url) {
    window.location.href = url;
  }

  return request;
};
