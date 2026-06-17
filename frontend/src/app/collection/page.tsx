import type { Metadata } from "next";
import { CollectionPageClient } from "@/components/pages/CollectionPageClient";
import { fetchProducts } from "@/lib/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nos Collections — Héritage & Signature | GUMÜÇ Royal",
  description:
    "Explorez les collections GUMÜÇ Royal : bijoux traditionnels marocains (Héritage) et designs contemporains (Signature). Acier inoxydable finition dorée. Paiement à la livraison.",
};

export default async function CollectionPage() {
  const products = await fetchProducts();
  return <CollectionPageClient initialProducts={products} />;
}
