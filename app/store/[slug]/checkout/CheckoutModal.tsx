import { type FC, useEffect, useState } from "react";
import {
  createPaymentLink,
  type PaymentLinkOptions,
} from "../../../scripts/payment";
import { Price } from "@/markket/product";

interface Props {
  prices: Price[];
  product: any;
}

const CheckoutModal: FC<Props> = ({ prices, product }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tip, setTip] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState({} as Price);

  const [options, setOptions] = useState({
    totalPrice: 0,
    product: product.id,
    prices: [],
    stripe_test: product.Name?.match(/test/i),
    includes_shipping: !product.Name?.match(/digital/i),
  } as PaymentLinkOptions);

  // Calculate total whenever inputs change
  useEffect(() => {
    const priceId = selectedPriceId;
    const price = prices.find((p: Price) => p.STRIPE_ID == priceId);
    const basePrice = Number(price?.Price) || 0;
    const subtotal = basePrice * quantity;
    const newTotal = subtotal + tip;
    console.log(prices);

    const option_prices = [
      {
        quantity,
        price: String(selectedPriceId),
        currency: "usd",
      } as unknown as Price,
    ];

    if (tip > 0) {
      option_prices.push({
        unit_amount: String(tip),
        Currency: "usd",
        Product: product.SKU,
      } as unknown as Price);
    }

    setOptions(
      (prevOptions: any) =>
        ({
          ...prevOptions,
          totalPrice: newTotal,
          prices: option_prices,
        } as PaymentLinkOptions)
    );
    console.log(newTotal);
    setTotal(newTotal);
    setSelectedPrice(price || ({} as Price));
  }, [selectedPriceId, quantity, tip]);

  const redirectToPaymentLink = async (event: any) => {
    event.preventDefault();
    console.log("submit event", { options });
    // @TODO: prevent redirect when price or product is missing
    const a = await createPaymentLink(options);
    console.log({ a });
  };

  const handlePriceChange = (event: any) => {
    const price = event.target.value as string;
    setSelectedPriceId(price);
  };

  const handleQuantityChange = (event: any) => {
    const newQuantity = event.target.value as number;
    setQuantity(newQuantity);
  };

  const handleTipChange = (event: any) => {
    const customPrice = event.target.value;
    setTip(parseInt(customPrice, 10));
  };

  return (
    <>
      {/* Modal Trigger Button */}
      <button
        className="w-full mb-5 flex items-center justify-center rounded-md border border-transparent bg-sky-500 px-8 py-3 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Continue to Payment
      </button>
      {isModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50"
          onClick={(e) =>
            (e.target as Element).classList.contains("modal-overlay") &&
            setIsModalOpen(false)
          }
        >
          <div className="modal-content bg-skin-card p-6 rounded-lg max-w-lg w-full bg-white">
            <button
              className="absolute top-4 right-4 text-gray-500"
              onClick={() => setIsModalOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-x"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <form
              data-product-price={product.id}
              data-product-json={JSON.stringify(product)}
              className="product-form-container"
            >
              <div className="hidden md:flex items-center justify-between">
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white">
                  Available Options
                  <br />
                  <small className="text-sm text-gray-500">
                    Pick an option to see more details
                  </small>
                  <br />
                </h3>
              </div>

              <div className="m-4">
                <label htmlFor="price">
                  <strong>Product Options</strong>
                </label>
                <select
                  id="price"
                  name="price"
                  data-input="product.prices"
                  className="block w-full rounded-md border-2 border-solid border-gray-300 py-2 pl-3 pr-10 text-base focus:border-accent-500 focus:outline-none focus:ring-accent-500 dark:border-gray-300 dark:bg-gray-400"
                  onChange={handlePriceChange}
                >
                  <option value=""></option>
                  {prices.map((price: any) => (
                    <option value={price.STRIPE_ID} key={price.STRIPE_ID}>
                      {price.Name.replace(/_/gi, " ")} - ${price.Price}{" "}
                      {price.Currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="m-4">
                <label htmlFor="quantity">
                  <strong>Quantity multiplier</strong>
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  data-input="quantity"
                  className="w-full rounded-md border-2 border-solid border-gray-300 py-2 pl-3 pr-10 text-base focus:border-accent-500 focus:outline-none focus:ring-accent-500 dark:border-gray-300 dark:bg-gray-400"
                  onChange={handleQuantityChange}
                />
              </div>

              <div className="m-4">
                <label htmlFor="custom-price">
                  <strong>Tip || Custom Price</strong>
                </label>
                <input
                  type="number"
                  id="custom-price"
                  placeholder="0"
                  name="custom-price"
                  className="w-full rounded-md border-2 border-solid border-gray-300 py-2 pl-3 pr-10 text-base focus:border-accent-500 focus:outline-none focus:ring-accent-500 dark:border-gray-300 dark:bg-gray-400"
                  onChange={handleTipChange}
                />
              </div>

              <div className="m-4">
                <label htmlFor="total">
                  <strong>Total</strong>
                </label>
                <p className="text-4xl">${total || 0}</p>
              </div>

              <div className="m-4">
                <button
                  disabled={total <= 0}
                  data-action-button="submit"
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-sky-500 px-8 py-3 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={redirectToPaymentLink}
                >
                  Continue to Payment
                </button>
              </div>
              <div className="m-4">
                <p className="text-md">
                  {total > 0
                    ? selectedPrice?.Description ||
                      "Continue using custom price"
                    : "Please select a price and quantity to continue"}
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutModal;
