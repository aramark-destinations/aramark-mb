# Code Generation Checklist for AI Agents

**USE THIS CHECKLIST:** Every time you generate or edit JavaScript/CSS code

## Pre-Generation Review

Before writing any code, confirm you will follow:

- [ ] Single quotes (`'`) not double quotes (`"`)
- [ ] NO trailing spaces at end of lines
- [ ] Arrow function params always have parens: `(x) =>` not `x =>`
- [ ] Max line length 100 characters
- [ ] Import paths include `.js` extension
- [ ] Unused params prefixed with `_`
- [ ] Use console.error/warn/info/debug, NOT console.log
- [ ] Import aliases for naming conflicts

## Post-Generation Validation

After generating code, ALWAYS:

1. **Visual check** - Scan for trailing spaces (end of lines)
2. **Run lint** - Execute `pnpm run lint:fix`
3. **Review fixes** - Check what auto-fix changed
4. **Verify** - Ensure code still works correctly

## Quick Reference

```javascript
// CORRECT
import { util } from './util.js';
const message = 'text';
const fn = (x) => x * 2;
export function handler({ used, _unused }) {
  console.error('Error');
}

// WRONG
import { util } from './util';
const message = "text";
const fn = x => x * 2;
export function handler({ used, unused }) {
  console.log('Debug');
}
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Trailing spaces | Auto-formatting, copy-paste | Remove all spaces at line ends |
| Name collision | Import same name as local function | Use import alias |
| Line too long | Long strings, long JSDoc | Split across lines with `+` or shorten |
| Missing .js | Forgot extension | Always add `.js` to imports |

## ESLint Config Location

- Config: `.eslintrc.js` (Airbnb base + custom rules)
- Ignore: `.eslintignore`
- Run: `pnpm run lint` or `pnpm run lint:fix`

---

**REMEMBER:** It's easier to generate correct code than fix it afterward!
