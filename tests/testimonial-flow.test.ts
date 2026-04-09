import assert from "node:assert/strict";
import test from "node:test";

import { getNextTestimonialState } from "../lib/testimonials.shared.ts";
import { testimonialSchema } from "../lib/validations/testimonial.schema.ts";

test("testimonial schema accepts valid payloads and trims values", () => {
  const result = testimonialSchema.parse({
    _honeypot: "",
    company: "  Finch Labs  ",
    message:
      "  Rizal kept the work easy to review and the delivery confidence stayed high throughout the process.  ",
    name: "  Maya Hartono  ",
    rating: 5,
    relation: "CLIENT",
    role: "  Lead Recruiter  ",
  });

  assert.deepEqual(result, {
    _honeypot: "",
    company: "Finch Labs",
    message:
      "Rizal kept the work easy to review and the delivery confidence stayed high throughout the process.",
    name: "Maya Hartono",
    rating: 5,
    relation: "CLIENT",
    role: "Lead Recruiter",
  });
});

test("testimonial schema rejects short content, invalid rating, and honeypot input", () => {
  const result = testimonialSchema.safeParse({
    _honeypot: "spam",
    company: "",
    message: "Too short",
    name: "Rizal",
    rating: 6,
    relation: "COLLEAGUE",
    role: "Engineer",
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);

    assert.ok(messages.includes("Please write at least 20 characters for the testimonial."));
    assert.ok(messages.includes("Choose a rating between 1 and 5."));
    assert.ok(messages.includes("Please leave this field empty."));
  }
});

test("pending testimonials can be approved", () => {
  const result = getNextTestimonialState(
    {
      featured: false,
      reviewedAt: null,
      status: "PENDING",
    },
    "approve",
    new Date("2026-04-09T12:00:00.000Z"),
  );

  assert.equal(result.status, "APPROVED");
  assert.equal(result.featured, false);
  assert.equal(result.reviewedAt, "2026-04-09T12:00:00.000Z");
});

test("pending testimonials can be rejected", () => {
  const result = getNextTestimonialState(
    {
      featured: false,
      reviewedAt: null,
      status: "PENDING",
    },
    "reject",
    new Date("2026-04-09T12:00:00.000Z"),
  );

  assert.equal(result.status, "REJECTED");
  assert.equal(result.featured, false);
  assert.equal(result.reviewedAt, "2026-04-09T12:00:00.000Z");
});

test("reopening clears featured and returns testimonials to pending", () => {
  const result = getNextTestimonialState(
    {
      featured: true,
      reviewedAt: "2026-04-08T10:00:00.000Z",
      status: "REJECTED",
    },
    "reopen",
  );

  assert.equal(result.status, "PENDING");
  assert.equal(result.featured, false);
  assert.equal(result.reviewedAt, "2026-04-08T10:00:00.000Z");
});

test("only approved testimonials can be featured", () => {
  assert.throws(
    () =>
      getNextTestimonialState(
        {
          featured: false,
          reviewedAt: null,
          status: "PENDING",
        },
        "toggleFeatured",
      ),
    /Only approved testimonials can be featured\./,
  );

  const result = getNextTestimonialState(
    {
      featured: false,
      reviewedAt: "2026-04-09T12:00:00.000Z",
      status: "APPROVED",
    },
    "toggleFeatured",
  );

  assert.equal(result.status, "APPROVED");
  assert.equal(result.featured, true);
  assert.equal(result.reviewedAt, "2026-04-09T12:00:00.000Z");
});
