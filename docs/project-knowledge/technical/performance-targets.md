# Performance Targets

## Core Web Vitals Thresholds

These targets apply to **full pages**, not individual components. All page types must meet these thresholds.

| Metric | Target | Critical Threshold |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | < 4.0s |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| INP (Interaction to Next Paint) | < 200ms | < 500ms |

**Note:** API response times are outside direct project control (AEM SaaS infrastructure). Focus optimization on frontend rendering, bundle size, and loading strategies.

## Lighthouse Score Targets

| Category | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

Run the `eds/quality-audit` skill for a structured audit against these targets.

## Image Optimization

Responsive image breakpoints for `srcset`/`sizes` attributes:

| Breakpoint | Width |
|---|---|
| Mobile | 375px |
| Tablet | 768px |
| Desktop | 1280px |
| Large Desktop | 1440px |

- Use **WebP** format with JPEG fallback
- Decorative images must use `alt=""`
- Hero images are the primary LCP candidate — prioritize with `loading="eager"` and `fetchpriority="high"`

## Component Performance Budgets

| Component | Budget | Notes |
|---|---|---|
| Accordion | Minimal JS | CSS-first; JS only for expand/collapse state |
| Carousel | TBD | Avoid layout shift on slide change; lazy-load non-visible slides |
| Tabs | Minimal JS | CSS-first; JS only for panel switching |
| Modal | Animation ≤ 300ms | Avoid blocking main thread on open/close |
| Hero | LCP target dominant | Prioritize image loading; no render-blocking scripts |

TBD values will be updated once Lighthouse CI is integrated (tracked in `docs/project/TODOS.md`).

## Bundle Size Guidelines

Bundle budgets are **TBD** — they will be formalized once the Lighthouse CI pipeline is active (tracked as an open TODO in `docs/project/TODOS.md`). Current principles:

- Blocks should be CSS-first; add JS only for behavior that cannot be achieved with CSS
- No third-party libraries in block JS without explicit approval
- Third-party scripts must load async or deferred — never render-blocking

## Performance Testing

**Current state (as of 2026-03-25):** Lighthouse CI is not yet integrated. Tests run locally using the `eds/quality-audit` skill.

Performance regressions are tracked locally. Integrating Lighthouse CI into the GitHub Actions workflow is an open TODO in `docs/project/TODOS.md`.

---

*Last Updated: 2026-03-25*
