import { CollectionPageClient } from "@/components/pages/CollectionPageClient";
import { fetchProducts } from "@/lib/products";

export const revalidate = 60;

export default async function CollectionPage() {
  const products = await fetchProducts();
  return <CollectionPageClient initialProducts={products} />;
}
