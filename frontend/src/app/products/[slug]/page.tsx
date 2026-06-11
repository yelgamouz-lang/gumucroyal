import { notFound } from "next/navigation";
import { fetchProduct, fetchProducts, STATIC_PRODUCTS } from "@/lib/products";
import { ProductPageClient } from "@/components/product/ProductPageClient";

export const revalidate = 60;

export async function generateStaticParams() {
  return STATIC_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return {};
  return { title: `${product.name_ar} — GUMÜÇROYAL`, description: product.description_short };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([fetchProduct(slug), fetchProducts()]);
  if (!product) notFound();
  return <ProductPageClient product={product} allProducts={allProducts} />;
}
