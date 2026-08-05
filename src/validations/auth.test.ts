import { signupSchema } from "./auth";

const result = signupSchema.safeParse({ name: "Alice", email: "a@b.com", password: "" });
if (result.success) {
  throw new Error("Expected validation to fail for empty password");
}
const hasPasswordError = result.error.issues.some((i) => i.path[0] === "password" && i.message === "Password must be at least 8 characters");
if (!hasPasswordError) {
  // Fail loudly during CI or local runs — this file is a lightweight schema assertion.
  // Use console.error so it's visible even when not run by a test runner.
  console.error("Expected password length error not found", result.error.issues);
  throw new Error("Password length validation message mismatch");
}

console.log("auth schema password test: ok");
