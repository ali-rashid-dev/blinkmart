"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** URL of the user's profile photo — falls back to initials if absent or fails to load. */
  image?: string | null;
  name?: string | null;
  email?: string | null;
  /** Tailwind size class(es) applied to the Avatar root, e.g. "size-8" or "size-10". */
  className?: string;
}

/**
 * Reusable avatar used across the navbar.
 * Shows the user's photo when available; gracefully falls back to their
 * initial letter (name → email → "?") on load error or when no URL is provided.
 */
export function UserAvatar({ image, name, email, className }: UserAvatarProps) {
  const initial = name
    ? name.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : "?";

  return (
    <Avatar
      className={cn(
        // Override the default rounded-full with rounded-lg to match the navbar style
        "rounded-xl shrink-0",
        className
      )}
    >
      {image && (
        <AvatarImage
          src={image}
          alt={name ?? email ?? "User avatar"}
          className="rounded-xl"
        />
      )}
      <AvatarFallback
        className={cn(
          "rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
