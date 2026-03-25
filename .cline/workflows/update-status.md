# Update Daily Status

## Description
Appends your daily EOD (End of Day) status entry to the team collaboration log at `docs/collaboration/daily-status.md`. Use this at the end of your workday so teammates in other time zones can see what you've done and what needs their attention.

## Prompt Format

When the user runs this workflow, they will provide input in this format:

```
/update-status

Name: <name>
Today's Work: <comma-separated list of completed tasks>
In Progress: <comma-separated list of in-progress tasks>
Blockers: <blockers or "None">
Handoff: <handoff notes for teammate or "None">
```

## Instructions

1. **Read** the current content of `docs/collaboration/daily-status.md`

2. **Detect today's date** in `YYYY-MM-DD` format

3. **Check** if a heading for today's date (`## YYYY-MM-DD`) already exists in the file:
   - If it **exists**: append the new entry under that date heading, before the final `---`
   - If it **does not exist**: append a new date heading followed by the entry at the end of the file

4. **Format** the entry exactly as:

```markdown
### 🌍 <Name>
- ✅ Today's Work: <Today's Work>
- 🔄 In Progress: <In Progress>
- 🚧 Blockers: <Blockers>
- **Handoff Notes:** <Handoff>

---
```

5. **Write** the updated content back to `docs/collaboration/daily-status.md`

6. **Confirm** to the user what was written and remind them to commit and push:
   ```
   git add docs/collaboration/daily-status.md
   git commit -m "chore: EOD status update [<Name>]"
   git push
   ```

## Example Input

```
/update-status

Name: skumawat
Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
In Progress: Hero block animation refinement
Blockers: None
Handoff: PR #42 is approved and needs merge — branch feature/carousel-fix
```

## Example Output (appended to daily-status.md)

```markdown
## 2026-03-25

### 🌍 skumawat
- ✅ Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
- 🔄 In Progress: Hero block animation refinement
- 🚧 Blockers: None
- **Handoff Notes:** PR #42 is approved and needs merge — branch feature/carousel-fix

---
