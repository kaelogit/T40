export function getSiteUrl(): string {
  let url: string;
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  } else if (process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  } else {
    url = "http://localhost:3000";
  }

  // OG tags, sitemap, and payment callbacks must use HTTPS in production.
  if (
    url.startsWith("http://") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1")
  ) {
    url = url.replace(/^http:\/\//, "https://");
  }

  return url;
}
