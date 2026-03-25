# Collaboration Status Log — Usage Guide

This folder contains the shared async daily status log for the team. It is designed for teams working across different time zones so everyone can stay informed about what others are working on, any blockers, and when they'll be back online.

---

## 📄 Files

| File | Description |
|------|-------------|
| `daily-status.md` | The running status log — all team members append entries here |

---

## ✍️ How to Add Your Daily Update

### Using Cline (Recommended)

Open Cline in VS Code and paste the following prompt:

```
/update-status

Name: <your name>
Today's Work: <what you finished today>
In Progress: <what you are still working on>
Blockers: <any blockers or "None">
Handoff: <anything your teammate needs to act on>
```

**Example:**

```
/update-status

Name: skumawat
Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
In Progress: Hero block animation refinement
Blockers: None
Handoff: PR #42 is approved, needs merge — branch feature/carousel-fix
```

Cline will automatically:
- Detect today's date
- Format your entry correctly
- Append it under the correct date section in `daily-status.md`

---

### Manual Update (Alternative)

If you prefer to update manually, append the following block to `daily-status.md` under today's date section:

```markdown
### 🌍 <Your Name>
- ✅ Today's Work: ...
- 🔄 In Progress: ...
- 🚧 Blockers: ...
- **Handoff Notes:** ...

---
```

---

## 🔄 Workflow

1. At the **end of your workday**, run the `/update-status` prompt in Cline
2. Cline updates `daily-status.md` with your entry
3. **Commit and push** the change:
   ```bash
   git add docs/collaboration/daily-status.md
   git commit -m "chore: EOD status update [skumawat]"
   git push
   ```
4. Your teammate in another time zone will **pull the latest** and see your update when they start their day

---

## 📌 Tips

- Keep "Handoff Notes" action-oriented — tell your teammate exactly what they need to do, not just what you did
- A new `## YYYY-MM-DD` heading is created per day; multiple team members add their entries under the same day heading
