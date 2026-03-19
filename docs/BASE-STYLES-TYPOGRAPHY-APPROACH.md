# Base Styles & Typography — Discussion Points for Lead

A set of questions and observations before starting implementation. Each point includes context and a concrete example to make the decision clear.

---

## 1. How are `fonts.scss` and `typography.scss` associated with `styles.scss`?

**Current situation:**
The build script compiles every `.scss` file in `styles/` independently into `dist/styles/`:

```
sass styles/:dist/styles/
```

This means `dist/styles/fonts.css`, `dist/styles/typography.css`, and `dist/styles/styles.css` are all generated — but `head.html` only loads **one** stylesheet:

```html
<link rel="stylesheet" href="/dist/styles/styles.css"/>
```

So currently:
- `fonts.css` → ✅ loaded separately by AEM's runtime (injected by `aem.js` / `scripts.js`)
- `typography.css` → ❌ **compiled but never loaded** — its styles are dead code in the browser

**Question for lead:**
Should `typography.css` be explicitly imported inside `styles.scss`? And should `fonts.scss` also be imported there, or does AEM handle it separately?

**Proposed approach:**
```scss
/* styles/styles.scss */
@import url('fixed-tokens.css');   /* already there */
@import url('typography.css');     /* add this — wires up typography rules */
```

`fonts.scss` would remain separate since AEM loads it via a different mechanism (lazy font loading after LCP).

---

## 2. Typography styles exist in both `styles.scss` and `typography.scss` — which file should own them?

**Current situation — duplication exists:**

`styles/styles.scss` defines heading and body rules:
```scss
/* styles/styles.scss */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font-family);
  line-height: var(--line-height-snug);  /* ← different value */
}
h1 { font-size: var(--heading-font-size-xxl); }
```

`styles/typography.scss` also defines heading rules:
```scss
/* styles/typography.scss */
h1 { font-size: var(--heading-font-size-h1); }  /* ← different token */
h1, h2, h3, h4 {
  font-family: var(--heading-font-family);
  line-height: var(--heading-line-height-heading);  /* ← different value */
}
```

**The problem:** If both files are loaded, the browser sees two sets of heading rules. Cascade order determines which wins — which is fragile and hard to debug.

**Question for lead:**
Should `typography.scss` be the **single source of truth** for all element-level styles, with `styles.scss` holding only tokens (`:root` variables) and page-level layout?

**Proposed split:**

| File | Owns |
|---|---|
| `styles.scss` | `:root` token definitions, `@font-face` fallbacks, `body`, `header`, `.section` layout |
| `typography.scss` | All element rules: `h1–h6`, `p`, `ul/ol`, `a`, `button`, `code`, forms, tables |

---

## 3. Token naming inconsistency — `--heading-line-height-heading` vs `--heading-line-height`

**Current situation:**
`styles/styles.scss` defines:
```css
--heading-line-height-heading: 1.3em;
```

`styles/typography.scss` references:
```css
h1 { line-height: var(--heading-line-height-heading); }
```

But the Figma-aligned token name used elsewhere is `--heading-line-height`. These two names refer to the same value but are inconsistent.

**Question for lead:**
Should we standardise on `--heading-line-height` as the canonical token name and remove `--heading-line-height-heading`?

**Proposed fix:**
```css
/* styles/styles.scss :root */
--heading-line-height: 1.3em;  /* replaces --heading-line-height-heading */
```
```scss
/* styles/typography.scss */
h1, h2, h3, h4 {
  line-height: var(--heading-line-height);  /* consistent reference */
}
```

---

## 4. Legacy heading size tokens — when do we clean them up?

**Current situation:**
`styles/styles.scss` has two parallel sets of heading size tokens:

```css
/* Legacy (used by existing blocks) */
--heading-font-size-xxl: 55px;
--heading-font-size-xl:  44px;
--heading-font-size-l:   34px;

/* Figma-aligned (new semantic tokens) */
--heading-font-size-h1: 28px;  /* mobile */
--heading-font-size-h2: 24px;
```

And `typography.scss` uses the old tokens:
```css
h1 { font-size: var(--heading-font-size-h1); }   /* new */
h2 { font-size: var(--heading-font-size-xl); }    /* old — inconsistent */
```

**Question for lead:**
Should we audit all blocks before removing legacy tokens? Or can we map old → new tokens first (keep both temporarily) and migrate blocks in a follow-up ticket?

**Proposed bridge approach (safe migration):**
```css
/* Keep old names as aliases pointing to new values */
--heading-font-size-xxl: var(--heading-font-size-h1);  /* blocks still work */
--heading-font-size-xl:  var(--heading-font-size-h2);
/* Remove once all blocks are migrated */
```

---



## Summary of Decisions Needed

| # | Question | Options |
|---|---|---|
| 1 | Import `typography.css` inside `styles.scss`? | Yes (recommended) / No (keep separate) |
| 2 | `typography.scss` as single source of truth for element styles? | Yes / Keep split |
| 3 | Rename `--heading-line-height-heading` → `--heading-line-height`? | Yes / Keep both |
| 4 | Legacy token cleanup strategy | Alias bridge now, migrate blocks in follow-up / Full cleanup now |
