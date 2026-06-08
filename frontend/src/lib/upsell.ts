/** Post-checkout upsell — re-exports shared add-piece logic. */

import type { Product } from "@/types/product";
import {
  ADD_PIECE_PRICE_MAD,
  addPieceSavings,
  buildAddPieceCandidates,
  isAddPieceEligible,
  type AddPieceCandidate,
} from "@/lib/addPieceOffer";

export {
  ADD_PIECE_PRICE_MAD as UPSELL_PRICE_MAD,
  addPieceSavings as upsellSavings,
  isAddPieceEligible as isUpsellEligible,
  buildAddPieceCandidates,
  type AddPieceCandidate as UpsellCandidate,
};

/** Excludes products already in order (legacy post-checkout filter). */
export function buildUpsellCandidates(
  products: Product[],
  orderedProductIds: Set<string>
): AddPieceCandidate[] {
  return buildAddPieceCandidates(products).filter((c) => !orderedProductIds.has(c.id));
}

/** Merge API response candidates with local image overrides. */
export function mergeUpsellCandidates(
  apiCandidates: AddPieceCandidate[],
  products: Product[]
): AddPieceCandidate[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return apiCandidates.map((c) => {
    const local = byId.get(c.id);
    const base = local?.base_price_mad ?? c.base_price_mad;
    return {
      ...c,
      image_url: local?.images[0]?.url || c.image_url,
      base_price_mad: base,
      add_price_mad: ADD_PIECE_PRICE_MAD,
      savings_mad: addPieceSavings(base),
    };
  });
}
