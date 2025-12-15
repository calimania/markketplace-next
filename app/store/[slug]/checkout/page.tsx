"use client";

import { use } from "react";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDisplay({ params }: CheckoutPageProps) {
  const { slug } = use(params);
  // const [openModal, setOpenModal] = useState(false);

  return (
    <div className="relative mx-auto max-w-4xl">
      {slug}
    </div>
  );
}
