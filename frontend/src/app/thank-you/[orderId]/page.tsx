import type { Metadata } from "next";
import { ThankYouPageClient } from "@/components/thank-you/ThankYouPageClient";
import { fetchProducts } from "@/lib/products";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ThankYouPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const products = await fetchProducts();
  return <ThankYouPageClient orderId={orderId} initialProducts={products} />;
}
