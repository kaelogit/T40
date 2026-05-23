export function getR2Endpoint(): string | null {
  const endpoint = process.env.R2_ENDPOINT?.replace(/\/$/, "");
  if (endpoint) return endpoint;

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (!accountId) return null;

  return `https://${accountId}.r2.cloudflarestorage.com`;
}

/** Hostname for Next.js `images.remotePatterns` — from R2_PUBLIC_HOSTNAME or parsed from R2_PUBLIC_URL. */
export function getR2PublicHostname(): string | null {
  const explicit = process.env.R2_PUBLIC_HOSTNAME?.trim();
  if (explicit) return explicit;

  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!publicUrl) return null;

  try {
    return new URL(publicUrl).hostname;
  } catch {
    return null;
  }
}

export function hasR2EnvConfig(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL &&
      getR2Endpoint()
  );
}
