import assert from "node:assert/strict";
import test from "node:test";
import {
  forgotPasswordSchema,
  getFieldErrors,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth";

test("login schema validates and reports field errors", () => {
  const values = { email: "user@example.com", password: "password123" };

  assert.deepEqual(loginSchema.parse(values), values);

  const errors = getFieldErrors(loginSchema, { email: "bad-email", password: "short" });

  assert.equal(errors.email, "Enter a valid email address");
  assert.equal(errors.password, "Password must be at least 8 characters");
});

test("signup schema enforces stronger password rules", () => {
  const valid = signupSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "Strong1!",
  });

  assert.equal(valid.success, true);
  assert.throws(() =>
    signupSchema.parse({ name: "A", email: "x@y.com", password: "short" }),
  );
});

test("forgot and reset schemas cover the password recovery flows", () => {
  assert.equal(forgotPasswordSchema.safeParse({ email: "hello@example.com" }).success, true);

  const resetValid = resetPasswordSchema.safeParse({
    password: "Strong1!",
    confirmPassword: "Strong1!",
    token: "token-123",
  });

  assert.equal(resetValid.success, true);

  const mismatch = getFieldErrors(resetPasswordSchema, {
    password: "Strong1!",
    confirmPassword: "Wrong1!",
    token: "token-123",
  });

  assert.equal(mismatch.confirmPassword, "Passwords don't match");
});
