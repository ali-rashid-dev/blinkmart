import { Megaphone } from "lucide-react";
import { AdminAdBannerPanel } from "./AdminAdBannerPanel";
import { listAdBanners } from "@/repositories/ad-banner.repository";

export default async function AdminAdsPage() {
  let initialBanners: Awaited<ReturnType<typeof listAdBanners>> = [];

  try {
    initialBanners = await listAdBanners();
  } catch (error) {
    console.error("[AdminAds] Failed to load ad banners:", error);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="size-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Ads
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Create, schedule, and manage advertising banners shown on the storefront.
        </p>
      </div>
      <AdminAdBannerPanel initialBanners={initialBanners} />
    </div>
  );
}
