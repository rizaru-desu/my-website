import assert from "node:assert/strict";
import test from "node:test";

import { getNextMessageState } from "../lib/messages.shared.ts";
import { contactSchema } from "../lib/validations/contact.schema.ts";

test("contact schema rejects invalid email and honeypot input", () => {
  const result = contactSchema.safeParse({
    email: "not-an-email",
    message: "This is long enough to look real.",
    name: "Rizal",
    subject: "Hello",
    website: "https://spam.example",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);

    assert.ok(messages.includes("Enter a valid email address."));
    assert.ok(messages.includes("Please leave this field empty."));
  }
});

test("contact schema accepts valid payloads and trims values", () => {
  const result = contactSchema.parse({
    email: "  rizal@example.com ",
    message: "  I would love to discuss a product role with you.  ",
    name: "  Rizal Achmad  ",
    subject: "  Product role  ",
    website: "",
  });

  assert.deepEqual(result, {
    email: "rizal@example.com",
    message: "I would love to discuss a product role with you.",
    name: "Rizal Achmad",
    subject: "Product role",
    website: "",
  });
});

test("archived messages restore to read with archivedAt cleared", () => {
  const now = new Date("2026-04-09T12:00:00.000Z");
  const result = getNextMessageState("ARCHIVED", "READ", now);

  assert.equal(result.status, "READ");
  assert.equal(result.archivedAt, null);
  assert.deepEqual(result.readAt, now);
});

test("read messages can return to unread", () => {
  const result = getNextMessageState("READ", "UNREAD");

  assert.equal(result.status, "UNREAD");
  assert.equal(result.archivedAt, null);
  assert.equal(result.readAt, null);
});
