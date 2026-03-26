# Bug Hunt — Aramark MB Block Remediation

## Context

21 NO-GO blocks require remediation. Known bug categories across these blocks:

- **Schema/implementation mismatches** — UE JSON schema fields don't match what the block JS expects
- **Missing lifecycle hooks** — blocks don't call `window.BlockName?.hooks?.onBefore`/`onAfter`
- **Broken event delegation** — click/keyboard events attached to wrong elements or not bubbling
- **Wrong localStorage namespace** — blocks storing state under incorrect keys

This superpower assembles the skills and agent instructions needed to investigate and fix a specific block bug systematically.

## Available Skills

Load these skills before beginning any investigation:

| Skill | When to Use |
|---|---|
| `eds/block-audit` | First — validate the full block against spec before touching code |
| `eds/block-development` | When implementing the fix |
| `eds/block-testing` | When writing tests to prevent regression |
| `eds/block-research` | When the fix requires understanding similar patterns in other blocks |
| `eds/pre-merge-check` | Last — verify the fix before creating a PR |
| `superpowers:systematic-debugging` | Global framework skill — structured hypothesis-driven debugging |
| `superpowers:root-cause-tracing` | Global framework skill — trace from symptom back to root cause |

## Agent Instructions

### 1. Orient

Before writing a single line of code:

1. Read `blocks/{block-name}/ticket-details.md` — this is the authoritative spec
2. Read `blocks/{block-name}/{block-name}.js` and `blocks/{block-name}/{block-name}.css`
3. Read `blocks/{block-name}/_{block-name}.json` (UE schema) if it exists
4. Run `eds/block-audit` — get the full PASS/FAIL report before touching anything

### 2. Identify Root Cause

Use `superpowers:systematic-debugging` approach (load the global skill if available):

- Do **not** guess at the fix based on the symptom description
- Trace the execution path from entry (`decorate()`) to the failing behavior
- For schema mismatches: compare field names in `_{block-name}.json` against field references in `{block-name}.js`
- For lifecycle issues: check that `window.BlockName?.hooks?.onBefore` is called before implementation and `onAfter` after
- For event issues: verify event listeners are on the correct element and that events use `bubbles: true`
- For localStorage issues: grep for `localStorage.getItem`/`setItem` calls and verify the key namespace

### 3. Fix

Use `eds/block-development` skill for implementation.

- Fix the root cause, not the symptom
- If fixing a schema mismatch, update `_{block-name}.json` and run `pnpm build:json`
- If fixing lifecycle hooks, follow Block Pattern A exactly (see `project-knowledge/technical/technical-standards.md`)
- Run `pnpm build:css` if any `.scss` was touched

### 4. Verify

1. Write a regression test using `eds/block-testing` skill (for logic bugs) or `eds/e2e-testing` (for interaction bugs)
2. Run `pnpm lint` — zero errors required
3. Run `pnpm test` — all tests must pass
4. Run `eds/pre-merge-check` — must be GO before creating PR

### 5. Report

After the fix:
- Update block status in `docs/audits/SUMMARY.md` if appropriate
- Note any patterns found that affect other NO-GO blocks (T2 update to `project-knowledge/technical/technical-standards.md`)

## Parallel Investigation Pattern

For investigating multiple blocks simultaneously, spawn one subagent per block:

```
Subagent 1: Investigate blocks/accordion — read ticket-details.md, run block-audit, identify root cause
Subagent 2: Investigate blocks/carousel — read ticket-details.md, run block-audit, identify root cause
Subagent 3: Investigate blocks/tabs — read ticket-details.md, run block-audit, identify root cause
```

Collect root cause reports before beginning any fixes. Cross-reference patterns across blocks before fixing — the same root cause may appear in multiple blocks.
