"use client";

import { use, useEffect, useState } from "react";
import { strapiClient } from "@/markket/api.strapi";
import { MainImage } from "../../../components/ui/product.display";
import { Store } from "@/markket/store";
import { Page } from "@/markket/page";
import SubscriptionModal from "./SubscriptionModal";
import PageContent from "@/app/components/ui/page.content";

interface ReceiptPageProps {
  params: Promise<{ slug: string }>;
}

const MARKKET_API =
  process.env.NEXT_PUBLIC_MARKKET_API || "https://api.markket.place";

export default function ProductDisplay({ params }: ReceiptPageProps) {
  const { slug } = use(params);
  const [openModal, setOpenModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [total_amount, setTotal_amount] = useState("");
  const [customer_email, setCustomer_email] = useState("");
  const [shipping_address, setShipping_address] = useState("");
  const [session_id, setSession_id] = useState("");
  const [page, setPage] = useState<Page>();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const pageResponse = await strapiClient.getPage("receipt", slug);
        setPage(pageResponse?.data?.[0] ?? null);

        const storeResponse = await strapiClient.getStore(slug);
        setStore(storeResponse?.data?.[0] ?? null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [slug]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id") || "";
    setSession_id(sessionId);

    async function fetchReceipt(session_id: string) {
      if (!session_id) return;
      console.log("activating receipt page", { session_id });

      try {
        const request = await fetch(`${MARKKET_API}/api/markket`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "stripe.receipt",
            session_id,
          }),
        });

        const response = await request.json();
        console.log(response);
        const address =
          response?.data?.link?.response?.shipping_details?.address;
        setShipping_address(
          address
            ? `${address.line1} ${address.line2} - ${address.city} ${address.state} ${address.postal_code}`
            : ""
        );
        setTotal_amount(
          ((response?.data?.link?.response?.amount_total || 0) / 100).toString()
        );
        setCustomer_email(
          response?.data?.link?.response?.customer_details?.email || ""
        );
      } catch (error) {
        console.error("Error fetching receipt:", error);
      }
    }

    fetchReceipt(sessionId);
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl">
      {page?.SEO?.socialImage && (
        <MainImage title={page?.Title} image={page?.SEO?.socialImage} />
      )}

      <section id="about" className="mb-10 max-w-3xl prose-img:border-0">
        <h1 className="mb-6 text-3xl font-bold tracking-wider sm:text-4xl">
          {page?.Title}
        </h1>
        <PageContent params={{ page: page }} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-wider sm:text-3xl">
          Thank you for your purchase!
        </h2>
      </section>

      <section className="max-w-md mx-auto mt-2 rounded-2xl bg-white bg-opacity-90 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-90">
        <div className="mb-6">
          <h3 className="mb-5 text-2xl font-bold text-yellow-400">
            Order Summary
          </h3>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            <strong className="text-yellow-400">Total Amount:&nbsp;</strong>
            <span data-output="total-amount" className="break-words">
              {total_amount}
            </span>
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            <strong className="text-yellow-400">Customer Email:&nbsp;</strong>
            <span data-output="customer-email" className="break-words">
              {customer_email}
            </span>
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            <strong className="text-yellow-400">Shipping Address:&nbsp;</strong>
            <span data-output="shipping-address" className="break-words">
              {shipping_address}
            </span>
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            <strong className="text-yellow-400">
              Stripe Session ID:&nbsp;
            </strong>
            <code data-output="session-id" className="break-words">
              {session_id}
            </code>
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-white bg-opacity-90 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-90">
        <h3 className="mb-4 text-2xl font-bold tracking-wider text-yellow-500">
          Markkët Updates
        </h3>
        {store ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (
                form.elements.namedItem("email") as HTMLInputElement
              ).value;

              try {
                const response = await fetch(`${MARKKET_API}/api/subscribers`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    data: {
                      Email: email,
                      stores: [store.documentId],
                    },
                  }),
                });

                if (!response.ok) throw new Error();
                form.reset();
                setOpenModal(true);
              } catch (error) {
                console.log(error);
                setOpenErrorModal(true);
              }
            }}
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subscribe to {store.title || store.SEO?.metaTitle}`s newsletter
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-400 dark:bg-gray-500 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 px-2"
                  placeholder="your@email.com"
                />
                <button
                  style={{ color: "black" }}
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-white">Store information is missing.</p>
        )}
        <p className="mt-4 text-center text-sm text-gray-50">
          Join our newsletter to get the latest updates and exclusive offers.
        </p>
      </section>
      {openModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
          <SubscriptionModal onClose={() => setOpenModal(false)} />
        </div>
      )}
      {openErrorModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
          <SubscriptionModal
            error={true}
            title="Error"
            message1="Something went wrong."
            message2="Please try again later or contact support if the issue persists."
            buttonText="Close"
            onClose={() => setOpenErrorModal(false)}
          />
        </div>
      )}
    </div>
  );
}
