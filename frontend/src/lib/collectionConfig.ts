export const COLLECTION_SLUGS = ["heritage", "signature"] as const;
export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

export interface CollectionMeta {
  slug: CollectionSlug;
  bannerImage: string;
  /** Dedicated gateway-card image. May be replaced by a brand-supplied asset. */
  cardImage: string;
  /** Shown if `cardImage` is missing, keeps both cards at the same dark premium level. */
  cardImageFallback: string;
  other: CollectionSlug;
}

export const COLLECTIONS: Record<CollectionSlug, CollectionMeta> = {
  heritage: {
    slug: "heritage",
    bannerImage: "/Produit/maison-1.jpg",
    // Real existing image used now. Swap cardImage to /Produit/heritage-card.jpg
    // once you drop the dedicated dark photo in public/Produit/.
    cardImage: "/Produit/collier-trefle.jpg",
    cardImageFallback: "/Produit/collier-trefle.jpg",
    other: "signature",
  },
  signature: {
    slug: "signature",
    bannerImage: "/Produit/maison-2.jpg",
    cardImage: "/Produit/bague-lien-eternel.jpg",
    cardImageFallback: "/Produit/bague-lien-eternel.jpg",
    other: "heritage",
  },
};

export function isValidCollection(slug: string): slug is CollectionSlug {
  return (COLLECTION_SLUGS as readonly string[]).includes(slug);
}
