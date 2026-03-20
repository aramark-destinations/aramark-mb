# Superpowers Get Started Guide
## Project onboarding for developers

This guide is meant to help you start using **Superpowers** on a real project without needing to absorb the whole repository first.

---

## 1. What Superpowers is

Superpowers is a **shared workflow/skills layer** for AI coding tools.

Think of it like this:

- **Claude Code / Cursor / Copilot / Codex** = the engine
- **Superpowers** = the repeatable playbook

Instead of relying on ad hoc prompting every time, Superpowers gives the agent named workflows for planning, debugging, verification, review, and more.

---

## 2. What this means on our project

On this project, Superpowers should be treated as:

- a **structured way to use AI**
- a **shared set of workflows**
- a way to make agent output more consistent across developers

The goal is not to replace your judgment.
The goal is to make AI assistance less sloppy, less random, and more repeatable.

---

## 3. The basic mental model

### Without Superpowers
You might say:

> Fix this issue  
> Build this component  
> Why is this broken

That can work, but the agent may:
- jump to coding too fast
- skip planning
- guess at root causes
- claim success before real validation

### With Superpowers
The expected behavior is more like:

1. clarify the problem
2. choose the right workflow
3. plan or debug systematically
4. implement
5. verify before calling it done

---

## 4. First-time setup

## Install

```bash
npm install -g @complexthings/superpowers-agent
```

## Bootstrap

```bash
superpowers-agent bootstrap
```

## Set up skills in the project

```bash
superpowers setup-skills
```

### What these do

- `install`: installs the CLI globally
- `bootstrap`: wires Superpowers into supported AI tools
- `setup-skills`: prepares project-level skill usage

---

## 5. The 5 skills you should care about first

These are the best starting point for day-to-day development.

## 5.1 Brainstorming

Use when:
- requirements are fuzzy
- you are shaping an approach
- you want options before implementation

Good for:
- feature ideation
- architecture choices
- deciding between implementation paths

---

## 5.2 Writing plans

Use when:
- you already know what needs to be built
- you want a clean implementation map
- the work spans multiple files or steps

Good for:
- breaking work into tasks
- identifying files to touch
- defining validation steps before coding

---

## 5.3 Systematic debugging

Use when:
- something is broken
- symptoms are unclear
- you do not trust first-glance assumptions

Good for:
- isolating root cause
- avoiding guess-and-check debugging
- reducing wasted cycles

---

## 5.4 Verification before completion

Use when:
- the change seems done
- the fix looks right but is not yet proven
- you want to prevent false confidence

Good for:
- checking assumptions
- confirming the real behavior
- making sure “done” actually means done

---

## 5.5 Requesting code review

Use when:
- implementation is complete
- you want a structured review pass
- you want another layer of sanity checking before merge

Good for:
- catching missed issues
- comparing implementation against plan
- improving consistency across the team

---

## 6. Recommended workflow on this project

Use this as the default pattern unless the task is truly tiny.

## For new work

1. **Brainstorming**  
   clarify the request and shape the solution

2. **Writing plans**  
   turn the agreed direction into implementation steps

3. implement the work

4. **Requesting code review**  
   review the change against the plan

5. **Verification before completion**  
   confirm the change actually works

---

## For bug fixing

1. **Systematic debugging**  
   identify real root cause

2. implement the smallest correct fix

3. **Verification before completion**  
   validate the fix with evidence

4. **Requesting code review**  
   optionally run a final review pass for larger changes

---

## 7. How to use this on an actual task

## Example: new feature

Instead of starting with:

> Build this feature

Use a flow like:

> Use brainstorming to help shape the approach for this feature.  
> Once the direction is clear, use writing-plans to break implementation into steps.  
> After implementation, use requesting-code-review and verification-before-completion.

---

## Example: bug

Instead of:

> Fix this bug

Use a flow like:

> Use systematic-debugging to identify the root cause of this issue.  
> After proposing the fix, use verification-before-completion before calling the task done.

---

## 8. Suggested prompts developers can reuse

## Planning prompt

```text
Use brainstorming to help define the best implementation approach for this task.

Context:
- [describe task]
- [list important constraints]
- [list relevant files or systems]

Output:
- recommended approach
- tradeoffs
- risks
- assumptions that need validation
```

## Implementation plan prompt

```text
Use writing-plans for this approved approach.

Context:
- [describe approved solution]
- [list files/components involved]

Output:
- ordered implementation steps
- files likely to change
- validation steps
- edge cases to watch for
```

## Debugging prompt

```text
Use systematic-debugging for this issue.

Symptoms:
- [describe visible behavior]
- [when it happens]
- [what is already ruled out]

Need:
- root cause
- smallest correct fix
- verification steps
```

## Verification prompt

```text
Use verification-before-completion for this change.

Please confirm:
- the original issue is resolved
- no obvious regressions were introduced
- the result is supported by evidence, not assumption
```

## Review prompt

```text
Use requesting-code-review on this completed change.

Please review:
- correctness
- alignment with the plan
- missed edge cases
- unnecessary complexity
- follow-up concerns
```

---

## 9. Project structure and overrides

Superpowers supports project-level configuration and skills.

The important concept is:

- **project-level skills/config** can override broader defaults
- this allows teams to standardize how AI is used in a specific repository

### Practical takeaway

If this project adds custom skill guidance, developers should follow the project version first.

Think of the priority model like:

1. project/repo-specific behavior
2. personal/home behavior
3. global/default behavior

That means the project can define “how we want AI to work here” without depending on every individual developer using the exact same prompting habits.

---

## 10. Team conventions for this project

Recommended team conventions:

- use **brainstorming** before large or ambiguous implementation work
- use **writing-plans** before coding non-trivial changes
- use **systematic-debugging** instead of guess-based debugging
- use **verification-before-completion** before saying a task is finished
- use **requesting-code-review** before merging meaningful changes
- prefer small, evidence-based iterations over big speculative AI output

---

## 11. What not to do

Avoid using Superpowers like this:

- asking for a huge implementation with no planning
- trusting “done” without verification
- debugging by repeatedly trying random fixes
- skipping review because the agent sounds confident

The value comes from following the workflow, not just invoking the tool name.

---

## 12. Quick start checklist

For a new developer joining the project:

- install Superpowers
- run bootstrap
- run `superpowers setup-skills`
- learn the 5 core skills
- use planning for new work
- use systematic debugging for bugs
- use verification before calling changes done
- use code review before merge

---

## 13. One-line explanation you can reuse

> Superpowers is the shared workflow layer we use to make AI-assisted development more structured, consistent, and verifiable on this project.

---

## 14. Suggested rollout approach for the team

If we are adopting this incrementally:

### Phase 1
Use only:
- brainstorming
- writing-plans
- systematic-debugging
- verification-before-completion

### Phase 2
Add:
- requesting-code-review

### Phase 3
Add project-specific conventions or custom skills if needed

This keeps the learning curve small and avoids overwhelming the team.

---

## 15. Final takeaway

Do not think of Superpowers as “another AI tool to learn.”

Think of it as:

- a **shared operating model**
- a **repeatable set of AI workflows**
- a way to improve quality and consistency across developers

Start small.
Use the core skills.
Let the workflow do the heavy lifting.
