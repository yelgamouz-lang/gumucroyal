export const COLLECTION_SLUGS = ["heritage", "signature"] as const;
export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

export interface CollectionMeta {
  slug: CollectionSlug;
  bannerImage: string;
  cardImage: string;
  other: CollectionSlug;
}

export const COLLECTIONS: Record<CollectionSlug, CollectionMeta> = {
  heritage: {
    slug: "heritage",
    bannerImage: "/Produit/maison-1.jpg",
    cardImage: "/Produit/collier-trefle.jpg",
    other: "signature",
  },
  signature: {
    slug: "signature",
    bannerImage: "/Produit/maison-2.jpg",
    cardImage: "/Produit/bague-lien-eternel.jpg",
    other: "heritage",
  },
};

export function isValidCollection(slug: string): slug is CollectionSlug {
  return (COLLECTION_SLUGS as readonly string[]).includes(slug);
}
