export type SocialPlatformId =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "youtube"
  | "pinterest"
  | "whatsapp";

export type SocialPlatform = {
  id: SocialPlatformId;
  label: string;
  /** Brand colour for the icon circle */
  color: string;
  href: string | null;
};

/**
 * Platforms shown in the footer (top to bottom order).
 * Remove any id here to hide it completely — even if an env URL is set.
 */
export const SOCIAL_PLATFORM_ORDER: SocialPlatformId[] = [
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "youtube",
  "pinterest",
  "whatsapp",
];

const PLATFORM_META: Record<
  SocialPlatformId,
  { label: string; color: string; envKey: string }
> = {
  instagram: {
    label: "Instagram",
    color: "#E4405F",
    envKey: "NEXT_PUBLIC_INSTAGRAM_URL",
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    envKey: "NEXT_PUBLIC_FACEBOOK_URL",
  },
  tiktok: {
    label: "TikTok",
    color: "#000000",
    envKey: "NEXT_PUBLIC_TIKTOK_URL",
  },
  x: {
    label: "X",
    color: "#000000",
    envKey: "NEXT_PUBLIC_X_URL",
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    envKey: "NEXT_PUBLIC_YOUTUBE_URL",
  },
  pinterest: {
    label: "Pinterest",
    color: "#BD081C",
    envKey: "NEXT_PUBLIC_PINTEREST_URL",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "#25D366",
    envKey: "NEXT_PUBLIC_WHATSAPP_URL",
  },
};

function readEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value || null;
}

/** Footer + contact: configured platforms with optional links. */
export function getSocialPlatforms(): SocialPlatform[] {
  return SOCIAL_PLATFORM_ORDER.map((id) => {
    const meta = PLATFORM_META[id];
    return {
      id,
      label: meta.label,
      color: meta.color,
      href: readEnv(meta.envKey),
    };
  });
}

/** @deprecated use getSocialPlatforms */
export type SocialLink = { label: string; href: string };

/** Linked platforms only — for anywhere that needs actual URLs. */
export function getSocialLinks(): SocialLink[] {
  return getSocialPlatforms()
    .filter((p): p is SocialPlatform & { href: string } => Boolean(p.href))
    .map((p) => ({ label: p.label, href: p.href }));
}
