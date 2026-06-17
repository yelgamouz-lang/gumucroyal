import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionPageClient } from "@/components/pages/CollectionPageClient";
import { fetchProducts } from "@/lib/products";
import { isValidCollection, COLLECTIONS, type CollectionSlug } from "@/lib/collectionConfig";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [{ slug: "heritage" }, { slug: "signature" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidCollection(slug)) return {};

  const titles: Record<CollectionSlug, string> = {
    heritage: "Collection Héritage — Bijoux traditionnels marocains | GUMÜÇ Royal",
    signature: "Collection Signature — Bijoux modernes | GUMÜÇ Royal",
  };
  const descriptions: Record<CollectionSlug, string> = {
    heritage:
      "Découvrez la Collection Héritage GUMÜÇ Royal — bijoux inspirés du patrimoine marocain, symboles de chance, finition dorée. Paiement à la livraison.",
    signature:
      "Découvrez la Collection Signature GUMÜÇ Royal — designs contemporains et architecturaux, zircons taille brillant, acier inoxydable. Paiement à la livraison.",
  };

  return {
    title: titles[slug as CollectionSlug],
    description: descriptions[slug as CollectionSlug],
  };
}

export default async function CollectionSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isValidCollection(slug)) {
    notFound();
  }

  const products = await fetchProducts();

  return (
    <CollectionPageClient
      initialProducts={products}
      collection={slug as CollectionSlug}
    />
  );
}
