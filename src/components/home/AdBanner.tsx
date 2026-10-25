import Image from "next/image";
import type { AdBannerRecord } from "@/repositories/ad-banner.repository";

export function AdBanner({ banner }: { banner: AdBannerRecord }) {
  const content = (
    <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-border/60 md:aspect-[16/5] md:rounded-[2rem]">
      <Image
        src={banner.imageUrl}
        alt={banner.altText}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
      />
      <span className="absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm select-none md:bottom-3 md:right-4 md:text-[10px]">
        Sponsored
      </span>
    </div>
  );

  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`${banner.altText} — sponsored advertisement`}
      >
        {content}
      </a>
    );
  }

  return (
    <div aria-label={`${banner.altText} — sponsored advertisement`}>
      {content}
    </div>
  );
}
