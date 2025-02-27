import { Price } from "@/markket/product";

const MARKKET_API = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place';

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

  const request = await fetch(`${MARKKET_API}/api/markket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const response = await request.json();

  console.log("Payment link", { request, response });

  const url = response?.data?.link?.response?.url;

  if (request.ok && url) {
    window.location.href = url;
  }
  return request;
};
