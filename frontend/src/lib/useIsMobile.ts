"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_MQ = "(max-width: 767px)";

function subscribeMobileMq(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileMqSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileMqServerSnapshot() {
  return false;
}

/** True when viewport is mobile (< 768px). Desktop is unchanged on SSR (false until hydrate). */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMobileMq, getMobileMqSnapshot, getMobileMqServerSnapshot);
}
