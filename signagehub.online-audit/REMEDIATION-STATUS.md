# SEO remediation status — 28-10-2026

## Applied in the current workspace

- Replaced the locale-dependent root 404 with a small static bilingual page carrying `noindex` metadata. This removes translation and route-navigation lookups from the global fallback.
- Added `noindex,nofollow` metadata to the CMS route-group layout and removed the five CMS UI routes from `robots.txt` disallow rules, allowing crawlers to read the noindex directive. API/player endpoints remain disallowed.
- Added permanent redirects for Vietnamese unlocalized aliases to the localized canonical routes.
- The current working tree already contains per-route sitemap dates, localized three-plan `SoftwareApplication` offers, updated metadata, and hardened JSON-LD escaping; these were present before this remediation turn and are now included in the local build.

## Not applied to production

Production was not deployed. `deploy/pull-and-up.sh` performs `git reset --hard origin/main` before building, which would discard the existing uncommitted workspace changes. Production still needs a safe release from the intended commit/build so its 500 handling, CMS directives, aliases, sitemap and schema match this workspace.

## Not applicable to current product

No movie-detail pages, template-detail URLs or public pagination exist in this project. No new content URLs were invented. Current localized pages self-canonicalize and the six gallery cards stay on the gallery URL.

## Preview

Local production build is running at `http://localhost:3100/vi`.
