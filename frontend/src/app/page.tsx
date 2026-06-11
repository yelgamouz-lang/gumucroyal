import { HomePageClient } from "@/components/pages/HomePageClient";
import { fetchProducts } from "@/lib/products";
import { HERO_POSTER } from "@/lib/heroMedia";

export const revalidate = 60;

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <>
      <link rel="preload" as="image" href={HERO_POSTER} fetchPriority="high" />
      <HomePageClient initialProducts={products} />
    </>
  );
}
