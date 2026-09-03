"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle2, X, ChevronRight, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getProfile } from "@/app/(app)/profile/actions";
import { getCompletion } from "@/components/profile/profileForm";
import { cn } from "@/lib/utils";

type BannerState = "idle" | "loading" | "visible" | "dismissed" | "hidden";

export function CompleteProfileBanner() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [state, setState] = useState<BannerState>("idle");
  const [percent, setPercent] = useState(0);
  const [remaining, setRemaining] = useState<string[]>([]);

  // Don't show on the profile page itself — user is already there
  const isProfilePage = pathname === "/profile";

  useEffect(() => {
    if (isPending) return;
    // Not logged in — hide banner
    if (!session?.user) {
      setState("hidden");
      return;
    }
    // Already on profile page — hide banner
    if (isProfilePage) {
      setState("hidden");
      return;
    }

    setState("loading");

    getProfile()
      .then((result) => {
        if (!result.success) {
          setState("hidden");
          return;
        }

        const form = {
          fullName: result.data.name,
          email: result.data.email,
          phone: result.data.phone ?? "",
          house: result.data.houseNo ?? "",
          street: result.data.street ?? "",
          area: result.data.area ?? "",
          city: result.data.city ?? "",
          postal: result.data.postalCode ?? "",
        };

        const completion = getCompletion(form);

        if (completion.percent >= 100) {
          setState("hidden");
        } else {
          setPercent(completion.percent);
          setRemaining(completion.remaining);
          setState("visible");
        }
      })
      .catch(() => {
        setState("hidden");
      });
  }, [session, isPending, isProfilePage]);

  const dismiss = () => setState("dismissed");

  if (state !== "visible") return null;

  const missingCount = remaining.length;

  return (
    <div
      role="banner"
      aria-label="Complete your profile"
      className={cn(
        "relative z-40 w-full overflow-hidden",
        "bg-gradient-to-r from-primary via-primary/90 to-secondary/80",
        "animate-in slide-in-from-top-2 duration-500 ease-out",
      )}
    >
      {/* Subtle shimmer overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%)] animate-[shimmer_3s_infinite]"
      />

      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Icon */}
        <span className="flex shrink-0 items-center justify-center rounded-full bg-white/15 p-1.5 backdrop-blur-sm">
          <Sparkles className="size-3.5 text-white" aria-hidden="true" />
        </span>

        {/* Message */}
        <p className="min-w-0 flex-1 text-sm text-white">
          <span className="font-semibold">Complete your profile ({percent}%):</span>{" "}
          <span className="opacity-90">
            {remaining.length > 0
              ? `Please add your ${remaining.map((item) => item.toLowerCase()).join(" and ")} for smooth checkout & delivery updates.`
              : "Please complete your profile details."}
          </span>
        </p>

        {/* Progress pill */}
        <span className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/20">
            <span
              className="block h-full rounded-full bg-white transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className="text-xs font-bold tabular-nums text-white/90">{percent}%</span>
        </span>

        {/* CTA */}
        <Link
          href="/profile"
          id="complete-profile-banner-cta"
          className={cn(
            "ml-1 flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
            "bg-white text-primary shadow-sm transition-all duration-200",
            "hover:bg-white/90 hover:shadow-md active:scale-95",
          )}
          aria-label="Complete your profile"
        >
          <UserCircle2 className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Complete profile</span>
          <span className="sm:hidden">Fix now</span>
          <ChevronRight className="size-3 opacity-70" aria-hidden="true" />
        </Link>

        {/* Dismiss */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss profile completion banner"
          id="complete-profile-banner-dismiss"
          className="ml-1 flex shrink-0 items-center justify-center rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
