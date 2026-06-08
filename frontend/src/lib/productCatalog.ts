/**
 * Prix unitaires réels — synchronisés avec data/products.csv (source unique).
 * Modifier le CSV puis redémarrer le backend (sync auto) et rebuild frontend.
 */
export const CATALOG_BASE_PRICES: Record<string, number> = {
  "bague-lien-eternel": 129,
  "collier-trefle-lumiere": 149,
  "bague-double-signature": 129,
};

export function getCatalogBasePrice(slug: string): number {
  const price = CATALOG_BASE_PRICES[slug];
  if (price === undefined) {
    throw new Error(`Unknown product slug in catalog: ${slug}`);
  }
  return price;
}
