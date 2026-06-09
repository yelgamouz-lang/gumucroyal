/**
 * Central pricing for add-on pieces — single source for product page, checkout, upsell.
 * ADD_PIECE_PRICE_MAD = 69 (configurable via env).
 */

import type { Product } from "@/types/product";

export const ADD_PIECE_PRICE_MAD = Number(process.env.NEXT_PUBLIC_ADD_PIECE_PRICE_MAD || 69);
export const MAX_EXTRA_PIECES = 2;
export const MAX_TOTAL_PIECES = 3;

/** Savings on one add-on piece = real base price − add price. */
export function addPieceSavings(basePriceMad: number): number {
  return Math.max(0, basePriceMad - ADD_PIECE_PRICE_MAD);
}

export function isAddPieceEligible(basePriceMad: number): boolean {
  return basePriceMad > ADD_PIECE_PRICE_MAD;
}

/** Bundle total: main product base + (extra count × ADD_PIECE_PRICE_MAD). */
export function computeOfferTotal(basePriceMad: number, extraCount: number): number {
  const extras = Math.max(0, Math.min(extraCount, MAX_EXTRA_PIECES));
  return basePriceMad + ADD_PIECE_PRICE_MAD * extras;
}

export function computeOfferTotalWithProducts(
  basePriceMad: number,
  extraProducts: Pick<Product, "base_price_mad">[]
): number {
  return computeOfferTotal(basePriceMad, extraProducts.length);
}

/** Sum of per-piece savings for all extras. */
export function totalAddPieceSavings(extraProducts: Pick<Product, "base_price_mad">[]): number {
  return extraProducts.reduce((sum, p) => sum + addPieceSavings(p.base_price_mad), 0);
}

export interface AddPieceCandidate {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  sku: string;
  image_url: string;
  base_price_mad: number;
  add_price_mad: number;
  savings_mad: number;
}

export function productToAddPieceCandidate(product: Product): AddPieceCandidate | null {
  if (!isAddPieceEligible(product.base_price_mad)) return null;
  return productToAddPieceCandidateAlways(product);
}

/** Every catalog product can be picked as an add-on (mobile free choice). */
export function productToAddPieceCandidateAlways(product: Product): AddPieceCandidate {
  return {
    id: product.id,
    slug: product.slug,
    name_fr: product.name_fr,
    name_ar: product.name_ar,
    sku: product.sku,
    image_url: product.images[0]?.url ?? "",
    base_price_mad: product.base_price_mad,
    add_price_mad: ADD_PIECE_PRICE_MAD,
    savings_mad: addPieceSavings(product.base_price_mad),
  };
}

export function buildAddPieceCandidates(products: Product[]): AddPieceCandidate[] {
  return products
    .map(productToAddPieceCandidate)
    .filter((c): c is AddPieceCandidate => c != null);
}

export function buildAllAddPieceCandidates(products: Product[]): AddPieceCandidate[] {
  return products.map(productToAddPieceCandidateAlways);
}

export function findAddPieceCandidate(
  candidates: AddPieceCandidate[],
  id: string | null
): AddPieceCandidate | null {
  if (!id) return null;
  return candidates.find((c) => c.id === id) ?? null;
}

/** How many add-on slots remain before hitting MAX_TOTAL_PIECES. */
export function remainingAddPieceSlots(currentPieceCount: number): number {
  return Math.max(0, Math.min(MAX_EXTRA_PIECES, MAX_TOTAL_PIECES - currentPieceCount));
}

export function checkoutAddOnTotal(addCount: number): number {
  return ADD_PIECE_PRICE_MAD * Math.max(0, Math.min(addCount, MAX_EXTRA_PIECES));
}

/** Sum of per-piece savings for all extras (cumulative gain). */
export function cumulativeAddPieceSavings(
  extraProducts: Pick<Product, "base_price_mad">[]
): number {
  return totalAddPieceSavings(extraProducts);
}

/** Maximum single-piece savings across the store (highest base_price − add price). */
export function maxAddPieceSavings(products: Pick<Product, "base_price_mad">[]): number {
  const eligible = products
    .map((p) => p.base_price_mad)
    .filter((base) => isAddPieceEligible(base));
  if (eligible.length === 0) return 0;
  return addPieceSavings(Math.max(...eligible));
}
