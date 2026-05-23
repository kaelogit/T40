/** Canonical product URL — prefers slug, falls back to id for legacy links */
export function getProductHref(product: { slug?: string | null; id: string }): string {
  return `/product/${product.slug?.trim() || product.id}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
