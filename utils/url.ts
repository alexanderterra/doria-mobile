const ALLOWED_URL_SCHEMES = ["https://", "http://", "mailto:"];

export function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;

  const trimmed = url.trim().toLowerCase();

  return ALLOWED_URL_SCHEMES.some((scheme) => trimmed.startsWith(scheme));
}
