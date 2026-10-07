import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import {
  extractUploadThingFileKey,
  deleteUploadThingFile,
  deleteUploadThingFiles,
} from "./uploadthing-server";

test("UploadThing Server Helpers", async (t) => {
  await t.test("extractUploadThingFileKey extracts key correctly from various URL formats", () => {
    // utfs.io format
    assert.equal(
      extractUploadThingFileKey("https://utfs.io/f/abc123xyz-file.png"),
      "abc123xyz-file.png"
    );

    // ufs.sh format
    assert.equal(
      extractUploadThingFileKey("https://fmcupnguk1.ufs.sh/f/987xyz-image.jpg"),
      "987xyz-image.jpg"
    );

    // URL with query parameters or hash
    assert.equal(
      extractUploadThingFileKey("https://utfs.io/f/sample-key.png?v=1#preview"),
      "sample-key.png"
    );

    // S3 uploadthing format
    assert.equal(
      extractUploadThingFileKey("https://uploadthing-prod.s3.us-west-2.amazonaws.com/s3key123"),
      "s3key123"
    );

    // Raw key
    assert.equal(extractUploadThingFileKey("raw-key-12345"), "raw-key-12345");

    // Non-UploadThing URLs return null
    assert.equal(
      extractUploadThingFileKey("https://images.unsplash.com/photo-12345"),
      null
    );

    // Local assets return null
    assert.equal(extractUploadThingFileKey("/images/apple.png"), null);

    // Empty or invalid input
    assert.equal(extractUploadThingFileKey(""), null);
    assert.equal(extractUploadThingFileKey(null), null);
    assert.equal(extractUploadThingFileKey(undefined), null);
  });

  await t.test("deleteUploadThingFile handles non-UploadThing URLs gracefully without error", async () => {
    const result = await deleteUploadThingFile("https://images.unsplash.com/photo-12345");
    assert.equal(result, false, "Should return false for non-UploadThing URL");
  });

  await t.test("deleteUploadThingFiles handles empty list gracefully", async () => {
    const result = await deleteUploadThingFiles(["https://example.com/test.png", null]);
    assert.equal(result, false, "Should return false when no valid UploadThing keys found");
  });
});
