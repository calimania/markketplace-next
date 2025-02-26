import { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    robots: {
      index: false,
      follow: false,
    }
  };
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
    {children}
    </>
  );
};
