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

  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.includes("/")) return null;
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const isUploadThingDomain =
    hostname === "utfs.io" ||
    hostname === "ufs.sh" ||
    hostname.endsWith(".ufs.sh") ||
    hostname === "uploadthing-prod.s3.us-west-2.amazonaws.com";

  if (!isUploadThingDomain) return null;

  const fileMarkerIndex = parsed.pathname.lastIndexOf("/f/");
  if (fileMarkerIndex >= 0) {
    const key = parsed.pathname.slice(fileMarkerIndex + 3);
    return key || null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? null;
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
