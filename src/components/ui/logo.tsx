import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** "full" renders cart icon + kitcomart + tagline, "icon" renders cart icon only */
  variant?: "full" | "icon";
  /** Size preset */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom class for styling container or image */
  className?: string;
  /** If provided, logo is wrapped in a Next.js Link */
  href?: string;
  /** Set true if logo is above the fold */
  priority?: boolean;
}

const sizeConfig = {
  sm: {
    fullWidth: 130,
    fullHeight: 33,
    iconSize: 28,
    className: "h-7",
  },
  md: {
    fullWidth: 160,
    fullHeight: 40,
    iconSize: 36,
    className: "h-9 lg:h-10",
  },
  lg: {
    fullWidth: 200,
    fullHeight: 50,
    iconSize: 44,
    className: "h-12",
  },
  xl: {
    fullWidth: 260,
    fullHeight: 66,
    iconSize: 58,
    className: "h-16",
  },
};

export function Logo({
  variant = "full",
  size = "md",
  className,
  href,
  priority = true,
}: LogoProps) {
  const config = sizeConfig[size];

  const logoGraphic = variant === "icon" ? (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <Image
        src="/logo-icon.png"
        alt="kitcomart logo"
        width={config.iconSize * 2}
        height={config.iconSize * 2}
        priority={priority}
        className="w-auto object-contain transition-transform duration-200 hover:scale-105"
        style={{ height: `${config.iconSize}px` }}
      />
    </div>
  ) : (
    <div className={cn("relative inline-flex items-center shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="kitcomart — Your Everyday Grocery, Online"
        width={config.fullWidth * 2}
        height={config.fullHeight * 2}
        priority={priority}
        className={cn(
          "w-auto object-contain transition-opacity hover:opacity-95 dark:brightness-125 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]",
          config.className
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="kitcomart Home"
        className="inline-flex items-center shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {logoGraphic}
      </Link>
    );
  }

  return logoGraphic;
}
