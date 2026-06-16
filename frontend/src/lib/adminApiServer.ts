export const ADMIN_COOKIE = "gumuc_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24;

export function getBackendUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
}
