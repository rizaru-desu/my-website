# Changelog

All notable changes to this project will be documented in this file.

This repo now follows a lightweight SemVer-style versioning approach:
- Git tags use the `vX.Y.Z` format
- the application source version stays in `package.json`
- runtime version metadata is available from `/api/version`

## [0.1.0] - 2026-04-09

Initial tagged portfolio platform release.

### Added

- bold public portfolio experience across home, projects, blog, and resume routes
- editorial admin workspace with protected navigation and architect-only user management
- Better Auth, Prisma-backed auth models, RBAC, and two-factor account security flows
- live visitor analytics pipeline for public routes with Upstash dedup and Prisma persistence

### Notes

- content CMS surfaces are substantial, but many non-auth domains are still partial or mock-backed
- CI/CD and deploy scripts are intentionally managed separately from this release tag
