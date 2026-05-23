export type BundleDetails = {
  includes?: string[];
  unavailable?: string[];
  partial?: boolean;
};

export function parseBundleDetails(raw: unknown): BundleDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const includes = Array.isArray(obj.includes)
    ? obj.includes.filter((x): x is string => typeof x === "string")
    : undefined;
  if (!includes?.length) return null;
  const unavailable = Array.isArray(obj.unavailable)
    ? obj.unavailable.filter((x): x is string => typeof x === "string")
    : undefined;
  return {
    includes,
    unavailable: unavailable?.length ? unavailable : undefined,
    partial: obj.partial === true,
  };
}

export function isGiftSetLine(size: string | null | undefined): boolean {
  return size?.toLowerCase() === "gift set";
}
