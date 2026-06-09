const CALL_START_HOUR = 9;
const CALL_END_HOUR = 21;
const TZ = "Africa/Casablanca";

/** Whether the call center is open at the given instant (Morocco time, 9h–21h). */
export function isWithinCallWindow(at: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(at);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return hour >= CALL_START_HOUR && hour < CALL_END_HOUR;
}

type CallBannerKey = "thankYou.callBannerNow" | "thankYou.callBannerLater";

export function getCallBannerKey(at: Date = new Date()): CallBannerKey {
  return isWithinCallWindow(at) ? "thankYou.callBannerNow" : "thankYou.callBannerLater";
}

export function parseOrderTimestamp(confirmedAt?: string | null): Date {
  if (confirmedAt) {
    const parsed = new Date(confirmedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/** i18n key for the honest call-back banner on Thank You. */
export function resolveCallBannerKey(confirmedAt?: string | null): CallBannerKey {
  return getCallBannerKey(parseOrderTimestamp(confirmedAt));
}
