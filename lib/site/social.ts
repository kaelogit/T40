export type SocialLink = {
  label: string;
  href: string;
};

/** Only links with env URLs set are shown — avoids generic instagram.com placeholders. */
export function getSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];

  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim();
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL?.trim();
  const x = process.env.NEXT_PUBLIC_X_URL?.trim();

  if (instagram) links.push({ label: "Instagram", href: instagram });
  if (tiktok) links.push({ label: "TikTok", href: tiktok });
  if (x) links.push({ label: "X", href: x });

  return links;
}
