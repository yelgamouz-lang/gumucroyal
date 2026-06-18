const COLLECTIONS_GATEWAY_ID = "collections-gateway";

function getScrollOffset() {
  // Mobile header is fixed (~4rem) — keep gateway title visible below it.
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
    return 72;
  }
  return 16;
}

/** Scroll to the home « two worlds » gateway section (Héritage / Signature). Stays on the same page. */
export function scrollToCollectionsGateway() {
  const el = document.getElementById(COLLECTIONS_GATEWAY_ID);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offset = getScrollOffset();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
  window.history.replaceState(null, "", `#${COLLECTIONS_GATEWAY_ID}`);
}

export { COLLECTIONS_GATEWAY_ID };
