const approvedImageHostnames = new Set(["images.unsplash.com"]);

export function getSupportedImageSrc(value: string | null | undefined): string | null {
  const src = value?.trim();
  if (!src) return null;

  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  try {
    const url = new URL(src);
    return url.protocol === "https:" && approvedImageHostnames.has(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}