---
name: collab/update-status
description: Append a daily EOD status entry to the team collaboration log.
when_to_use: at the end of the workday to log completed work, in-progress items, blockers, and handoff notes for teammates in other time zones
version: 1.0.0
---

# Update Daily Status

## Overview

Appends a daily EOD (End of Day) status entry to `docs/collaboration/daily-status.md` so teammates in other time zones can see what was done and what needs their attention.

---

## Input Format

The user provides:

```
Name: <name>
Today's Work: <comma-separated list of completed tasks>
In Progress: <comma-separated list of in-progress tasks>
Blockers: <blockers or "None">
Handoff: <handoff notes for teammate or "None">
```

---

## Step 1: Read the Current Log

Read `docs/collaboration/daily-status.md` in full.

---

## Step 2: Detect Today's Date

Determine today's date in `YYYY-MM-DD` format.

---

## Step 3: Find or Create the Date Heading

Check whether a `## YYYY-MM-DD` heading for today already exists in the file:

- **Exists** — append the new entry under that heading, before the final `---`
- **Does not exist** — append a new date heading followed by the entry at the end of the file

---

## Step 4: Format the Entry

```markdown
### <Name>
- Today's Work: <Today's Work>
- In Progress: <In Progress>
- Blockers: <Blockers>
- **Handoff Notes:** <Handoff>

---
```

---

## Step 5: Write the File

Write the updated content back to `docs/collaboration/daily-status.md`.

---

## Step 6: Confirm and Remind

Confirm what was written, then show the commit commands:

```
git add docs/collaboration/daily-status.md
git commit -m "chore: EOD status update [<Name>]"
git push
```

---

## Example

**Input:**

```
Name: skumawat
Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
In Progress: Hero block animation refinement
Blockers: None
Handoff: PR #42 is approved and needs merge — branch feature/carousel-fix
```

**Appended to `docs/collaboration/daily-status.md`:**

```markdown
## 2026-03-25

### skumawat
- Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
- In Progress: Hero block animation refinement
- Blockers: None
- **Handoff Notes:** PR #42 is approved and needs merge — branch feature/carousel-fix

---
```
