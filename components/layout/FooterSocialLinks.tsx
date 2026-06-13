import { getSocialPlatforms } from "@/lib/site/social";
import { SocialIcon } from "@/components/layout/SocialIcons";

export default function FooterSocialLinks() {
  const platforms = getSocialPlatforms();

  if (platforms.length === 0) return null;

  return (
    <div className="pt-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] font-heading text-t40-white/40 mb-3">
        Follow us
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        {platforms.map((platform) => {
          const isDark = platform.id === "tiktok" || platform.id === "x";
          const circleClass =
            "flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-t40-black";
          const ringClass = isDark ? " ring-1 ring-white/20" : "";

          const icon = (
            <SocialIcon id={platform.id} className="h-[18px] w-[18px] text-white" />
          );

          if (platform.href) {
            return (
              <a
                key={platform.id}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.label}
                title={platform.label}
                className={`${circleClass}${ringClass}`}
                style={{ backgroundColor: platform.color }}
              >
                {icon}
              </a>
            );
          }

          return (
            <span
              key={platform.id}
              title={`${platform.label} — link coming soon`}
              aria-label={`${platform.label} (link coming soon)`}
              className={`${circleClass}${ringClass} opacity-45 cursor-default`}
              style={{ backgroundColor: platform.color }}
            >
              {icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}
