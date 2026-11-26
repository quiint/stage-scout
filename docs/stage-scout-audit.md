# Stage Scout quality audit

Audited November 25, 2026 against the deployed private Sprite and its source.

| Dimension | Score | Key finding |
| --- | ---: | --- |
| Accessibility | 4/4 | Native form controls, labels, live status, poster alt text, skip navigation, focus styles and focused errors are present. |
| Performance | 4/4 | Dependency-free app, lazy posters, bounded 1,000-record catalogue scan and no layout-heavy motion. |
| Responsive design | 4/4 | The two-column layout collapses well and production, venue, and source text wraps safely. |
| Theming | 4/4 | The compact dark-house token palette is consistent and poster imagery supplies the visual colour. |
| Anti-patterns | 4/4 | It reads as a quiet theatrical utility rather than a generic card dashboard. |
| **Total** | **20/20** | **Excellent — release-ready within its stated private scope** |

## Verdict

Pass. The app avoids the common generated-product look: it has one calm discovery task, an editorial hierarchy, source provenance, and no oversized marketing hero, fake engagement metrics, glass panels, or decorative gradients.

## Findings

### Resolved — Save controls are now 44px

**Location:** `public/style.css`, `.save`
**Resolution:** The save control now has a 44px minimum height without changing its visual weight.

### Resolved — Long venue, title, and source text wraps safely

**Location:** `public/style.css`, result rows
**Resolution:** `overflow-wrap:anywhere` and flexible shrinking now cover the result copy and source links.

### Resolved — Errors move focus to their explanation

**Location:** `public/app.js`, search/save error paths
**Resolution:** Errors are announced and focused while preserving the user’s values and previous results.

### Resolved — Long result sets have a skip route

**Location:** `public/index.html`
**Resolution:** A visually-hidden-until-focused skip link leads directly to the labelled results heading.

## Verified strengths

- Poster images load lazily and gracefully fall back to a titled placeholder.
- The server validates dates and location again, limits request bodies, checks request origin, and constrains model suggestions to real catalogue IDs.
- The service is private; its README correctly warns that saved state is shared by allowed Sprite viewers.
- Motion respects reduced-motion preferences.
- Production run dates are explicitly distinguished from guaranteed individual performance times.
