import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Extracts the UploadThing file key from a URL or key string.
 * Returns null if the URL is not a valid UploadThing file URL/key.
 */
export function extractUploadThingFileKey(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // If it's a raw file key without slashes or HTTP protocol
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    if (!trimmed.includes("/")) return trimmed;
    return null;
  }

  // Check if domain belongs to UploadThing
  const isUploadThingDomain =
    trimmed.includes("utfs.io") ||
    trimmed.includes("ufs.sh") ||
    trimmed.includes("uploadthing") ||
    trimmed.includes("uploadthing-prod");

  if (!isUploadThingDomain) return null;

  // Extract key after /f/ if present
  if (trimmed.includes("/f/")) {
    const parts = trimmed.split("/f/");
    const keyWithParams = parts[parts.length - 1];
    return keyWithParams.split("?")[0].split("#")[0];
  }

  // Fallback: extract last path segment
  try {
    const parsed = new URL(trimmed);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment ? lastSegment.split("?")[0].split("#")[0] : null;
  } catch {
    return null;
  }
}

/**
 * Deletes a file from UploadThing by its URL or file key.
 * Fails gracefully with a logged error if deletion fails or if the URL is not an UploadThing URL.
 */
export async function deleteUploadThingFile(fileUrlOrKey: string | null | undefined): Promise<boolean> {
  const key = extractUploadThingFileKey(fileUrlOrKey);
  if (!key) return false;

  try {
    const response = await utapi.deleteFiles(key);
    if (!response.success) {
      console.error(`[UploadThing] Failed to delete file key "${key}":`, response);
      return false;
    }

    console.log(`[UploadThing] Deleted file key "${key}":`, response);
    return true;
  } catch (error) {
    console.error(`[UploadThing] Failed to delete file key "${key}":`, error);
    return false;
  }
}

/**
 * Deletes multiple files from UploadThing by their URLs or file keys.
 */
export async function deleteUploadThingFiles(fileUrlOrKeys: (string | null | undefined)[]): Promise<boolean> {
  const keys = fileUrlOrKeys
    .map((url) => extractUploadThingFileKey(url))
    .filter((k): k is string => Boolean(k));

  if (keys.length === 0) return false;

  try {
    const response = await utapi.deleteFiles(keys);
    if (!response.success) {
      console.error(`[UploadThing] Failed to delete file keys:`, keys, response);
      return false;
    }

    console.log(`[UploadThing] Deleted file keys:`, keys, response);
    return true;
  } catch (error) {
    console.error(`[UploadThing] Failed to delete file keys:`, keys, error);
    return false;
  }
}
