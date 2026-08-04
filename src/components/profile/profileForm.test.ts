import assert from "node:assert/strict";
import test from "node:test";

import { getPostalError } from "./profileForm";

test("getPostalError trims whitespace before validating postal codes", () => {
  assert.equal(getPostalError("   "), "");
  assert.equal(getPostalError(" 12345 "), "");
  assert.equal(getPostalError("1234 "), "Postal code must be 5 digits");
});
