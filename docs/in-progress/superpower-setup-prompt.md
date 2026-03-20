You are helping me implement Superpowers in this codebase. [text](https://github.com/complexthings/superpowers)

## Primary goal

Your job is to analyze this repository, analyze the out-of-the-box Superpowers skills, analyze the custom/project skills in .shopping/kai-poc/.agents/, and then design and begin implementing a project-specific Superpowers system for this codebase.

The desired outcome is not just “install Superpowers.”
The desired outcome is:
1. understand how this project works
2. understand what skills already exist
3. identify which existing skills should be reused as-is
4. identify which skills need project-specific augmentation
5. identify which new custom skills are needed
6. identify what belongs in project instructions/docs vs skills vs automation/scripts
7. implement the foundation in a maintainable, repeatable way for this codebase

## Inputs you must analyze

You will have access to:
1. the current codebase
2. the Superpowers repo with out-of-the-box skills
3. copy of existing projec that is heavily customized with Superpowers skills: .shopping/kai-poc/.agents/ and is EDS-based
4. a markdown get-started / onboarding doc for Superpowers on this project (docs/in-progress/superpowers-get-started-guide.md)

Treat all of these as source material to analyze and reconcile.

## Non-goals

Do NOT:
- blindly copy another project’s setup
- create a giant monolithic skill if the system should be split into smaller skills
- generate random best practices that are not grounded in this repo
- invent architecture without checking for existing patterns
- add unnecessary abstraction
- claim “done” without verifying what was actually implemented

## What I want from you

Before making changes, perform a structured discovery phase. Feel free to use /bulk to break this into smaller tasks. be interactive and ask questions if you need clarification. If you have to infer anything about this codebase, state your assumptions clearly. Create a clear plan before implementing anything. This should be a collaborative and iterative process

### Phase 1: Repository analysis
Analyze this codebase and determine:
- project type and architecture
- relevant app/framework/build tooling
- block/component patterns
- existing conventions for directories, naming, docs, tickets, and solution design artifacts
- whether there are existing AI-related instructions, CLAUDE.md, AGENTS.md, or similar guidance
- where project-specific process documentation should live
- where reusable skills would be most useful
- where automation/scripts would be better than skill text

Specifically look for:
- component/block directories
- token usage and styling conventions
- shared utilities
- design/system docs in-repo
- implementation patterns that repeat
- Adobe / EDS / front-end conventions if present

### Phase 2: Superpowers OOTB skill analysis
Analyze the Superpowers out-of-the-box skills and produce:
- a categorized list of the most relevant skills for this codebase
- which skills should be adopted directly with no change
- which skills are relevant but too generic and need project-specific guidance layered on top
- which skills are irrelevant for this repo

Do not just summarize. Evaluate them against this project.

### Phase 3: Existing project-skill analysis
Analyze the custom skills from the other project and determine:
- which are portable
- which are too project-specific to reuse directly
- which contain useful process patterns we should extract
- which should be transformed into:
  - repo instructions
  - reusable skills
  - scripts/automation
  - templates/checklists

### Phase 4: Gap analysis
After analyzing the repo + OOTB skills + existing custom skills, identify:
- missing capabilities
- duplicated capabilities
- conflicting guidance
- brittle or overly project-specific skill logic
- places where the process should be standardized for this codebase

### Phase 5: Proposed implementation model
Then propose the recommended system for this repo using these buckets:

#### A. Project instructions / governance
What should live in:
- CLAUDE.md
- AGENTS.md
- team onboarding docs
- process docs
- templates/checklists

#### B. Reused OOTB skills
Which OOTB Superpowers skills should be used directly

#### C. Wrapped or extended skills
Which OOTB skills should be paired with project instructions or thin project-level overlays

#### D. New custom skills
Which new skills should be added for this repo, why they exist, and their scope

#### E. Scripts / automations
Which tasks should be automated instead of encoded as skill prose

## Important decision rules

Use these rules when deciding where something belongs:

### Put it in project instructions if it is:
- specific to this repo
- a team convention
- a directory rule
- a naming rule
- a required source-of-truth doc rule
- an implementation guardrail that applies broadly to this project

### Put it in a skill if it is:
- a reusable reasoning process
- a repeatable analysis workflow
- a structured implementation/review/verification pattern
- something that could be applied more than once

### Put it in automation/scripts if it is:
- mechanical
- enforceable
- repetitive
- file-moving / extraction / generation work
- something that is better executed than described

## Deliverables format

Work in this order and do not skip ahead.

### Deliverable 1: Findings summary
Give me a concise, practical summary with these sections:
- What this repo appears to be
- How it currently works
- Existing patterns worth preserving
- Risks / inconsistencies / missing structure
- Where Superpowers would provide the most value

### Deliverable 2: Skill mapping table
Create a table with columns:
- Skill / capability
- Source (OOTB / existing project skill / new)
- Recommended action (reuse / adapt / replace / discard)
- Why
- Where it should live (skill / CLAUDE.md / AGENTS.md / script / doc)

### Deliverable 3: Proposed file/folder structure
Show the proposed folder structure for implementing the system in this repo.

### Deliverable 4: Implementation plan
Create a phased implementation plan with:
- Phase
- Goal
- Files to create/update
- Dependencies
- Validation steps
- Risk notes

### Deliverable 5: First implementation pass
After I approve the plan, begin implementation in small steps.

## Execution behavior

When you begin implementation:
- make the smallest meaningful changes first
- prefer additive changes over destructive changes
- keep docs and structure clean
- show me exactly what files you want to create/update before large changes
- validate assumptions against the repo before writing anything
- favor explicitness over magic

## Quality bar

Any recommended system must:
- fit this codebase
- be understandable by other developers
- avoid overengineering
- reduce copy/paste AI behavior
- encourage reuse of existing patterns
- create a repeatable developer workflow
- be maintainable over time

## Extra context for what I ultimately want

I want a system where AI can intelligently:
- understand incoming work/request context
- compare it to existing code and patterns
- compare it to project docs / solution design docs
- find reusable tokens/utilities/components first
- follow Adobe / EDS / front-end best practices relevant to this repo
- produce a consistent implementation and validation flow
- avoid the pattern of “copy, paste, rename, random code, done”

Be concrete, repo-aware, and opinionated where appropriate.
Do not give generic AI workflow advice unless it is tied directly to this project.