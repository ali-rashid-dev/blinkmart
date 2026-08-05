import assert from "node:assert/strict";
import test from "node:test";
import { signupSchema } from "./auth";

test("signupSchema rejects empty password with expected message", () => {
  const result = signupSchema.safeParse({ name: "Alice", email: "a@b.com", password: "" });
  assert.equal(result.success, false);
  const hasPasswordError = result.error.issues.some(
    (i) => i.path[0] === "password" && i.message === "Password must be at least 8 characters"
  );
  assert.ok(hasPasswordError, `Expected password length error not found: ${JSON.stringify(result.error.issues)}`);
});
