---
name: skill-router
description: >-
  Auto-detect the user's task, select and chain the right skills from the local library, show the pipeline for confirmation, then execute the chain in order. Use at the start of any non-trivial task when the best skill or skill-chain is unclear, or when the user asks "which skill should I use". Trigger: /router.
---

# Skill Router

A meta-skill that turns a raw prompt into an ordered **pipeline of skills** and
runs them. You (the user) prompt once; the router classifies the task, routes it
to a **crew** (department), picks a chain of that crew's skills, shows it as a
flowchart, and — on confirm — invokes each skill in order.

Mode: **auto-detect + confirm**. The router decides, then asks you to approve or
edit before it runs anything.

## The 7 Crews (your Claude workforce)

Every skill in the library belongs to a **crew**. The router first picks the
crew, then the chain inside it. Full roster in `references/crews.md`.

| Crew | Does | Lead skills |
|---|---|---|
| 🟠 **DEV** | Build, test, ship code | `superpowers:*`, `*-patterns`, `*-testing`, `mcp-builder`, `skill-creator`, `webapp-testing` |
| 🟣 **DESIGN** | UI that isn't templated | `taste-skill`, `frontend-design`, `ui-skills`, `canvas-design`, `theme-factory`, `algorithmic-art` |
| 🔴 **MARKETING** | Copy, SEO, ads that convert | `seo`, `ai-seo`, `cro`, `ad-creative`, `copywriting`, `marketing-psychology` |
| 🔵 **SOCIAL** | Content on autopilot | `social`, `content-strategy`, `video`, `emails`, `pillar-content` |
| 🟢 **FINANCE** | Model numbers before you spend | `pricing`, `investor-materials`, `xlsx`, `market-research` |
| 🟩 **OPS** | Run the business like a machine | `post-mortem`, `launch`, `internal-comms`, `xlsx`, `docx`, `handoff` |
| ⚫ **LEGAL** | Read the fine print | `security-review`, `docx`, `pdf` (+ see gaps in `references/crews.md`) |

## When to Use

- The user types `/router <task>` or asks "which skill(s) should I use for X?".
- A task is non-trivial and the best single skill or ordering is not obvious.
- At the start of a build/design/research effort that will span multiple skills.

Do **not** use it for a task that clearly maps to one skill the user already
named — just invoke that skill.

## How It Works (4 steps)

### 1. Classify → pick the crew
Read the prompt and route it to one (or more) of the **7 crews** above using the
signals in `references/crews.md`. A task can span crews (e.g. "build + launch a
landing page" = DESIGN → DEV → MARKETING) — chain across them in order.

Detect intent verbs: *design, build, fix, research, write, launch, deploy,
audit, optimize, orchestrate, model, review*. Then narrow to the crew's skills
via `references/skill-map.md` (the full domain→skill index).

### 2. Select the chain
Walk `references/decision-tree.md` to produce an **ordered list** of skills.
Rules:
- **Process skills lead.** `superpowers:brainstorming` for anything creative/new;
  `superpowers:systematic-debugging` for any bug — these come *first*, then
  implementation skills follow (matches the `using-superpowers` priority rule).
- **Verify at the end.** Close build chains with
  `superpowers:verification-before-completion` (or a `*-verification` skill).
- **Confirm existence.** If unsure a skill name is real, use `skill-scout` (or
  check the skill list) before naming it. Never invent a skill name.
- Keep chains tight — 2 to 6 steps. More than that, split into phases.

### 3. Present the pipeline (always, before running)
Print a compact flow **and** a yes/no decision trace, then stop for approval:

```
🧭 Router — detected: design-first web app  → crews: DESIGN → DEV
Decisions:
  • Design-first?          yes → 🟣 DESIGN crew
  • Web or native app?     web → frontend-design
  • Framework?             React → 🟠 DEV crew: react-patterns
  • Tests needed?          yes → webapp-testing
Pipeline:
  1. superpowers:brainstorming            🟠 DEV
  2. taste-skill:taste-skill              🟣 DESIGN
  3. ui-skills:fixing-accessibility       🟣 DESIGN
  4. my-personal-skills:react-patterns    🟠 DEV
  5. webapp-testing                       🟠 DEV
  6. superpowers:verification-before-completion  🟠 DEV
  ─────────────────────────────────────────────
  7. 👔 CEO REVIEW  → re-check vs your original prompt
       ├─ improvable? loop back (max 3×)
       └─ strong?     stop → 📋 brief report
Proceed?  [ y = run all · edit = change steps · no = cancel ]
```

### 4. Execute
On **y**: invoke each skill in order via the Skill tool, carrying context
forward (each step's output feeds the next). Announce "Running step N: <skill>"
before each.
On **edit**: let the user add/remove/reorder/swap steps, reprint, ask again.
On **no**: stop, suggest they name a skill directly.

### 5. 👔 CEO Review (the loop) — ALWAYS runs after the crews finish
Once the crew pipeline produces a result, run the **CEO stage** (full engine in
`references/ceo-review.md`). The CEO:
1. Re-reads the user's **ORIGINAL prompt** (the very first ask, not the last message).
2. Scores the result against it: *Did we deliver what they actually wanted?*
3. Adds its **own idea** for how it could be meaningfully better.
4. **Decides:**
   - **Improvable** → loop back through the relevant crews with the CEO's notes
     as new instructions. Increment the loop counter.
   - **Strong enough** (or **3 loops reached**) → stop and report.

**Loop cap: 3 rounds max.** Auto-decide each round — do not ask the user
mid-loop. Stop early if the CEO finds no meaningful improvement.

### 6. 📋 Brief report — ALWAYS ends the run
After the loop stops, give a short report (see `references/ceo-review.md` format):
what was built, how many CEO loops ran, what each round improved, and any honest
gaps. Keep it brief.

## Decision Table (seed)

Full tree in `references/decision-tree.md`; crew rosters in `references/crews.md`.
This is the quick reference (organized by crew).

| Crew | Task signal | Chain (process → implement → verify) |
|---|---|---|
| 🟠 DEV | Web app build | brainstorming → `react-patterns`/`ui-to-vue`/`nuxt4-patterns` → `webapp-testing` → `deployment-patterns` |
| 🟠 DEV | Backend / API | brainstorming → `api-design` → `fastapi-patterns`/`django-patterns` → `*-security` → `*-verification` |
| 🟠 DEV | Bug / test failure | `systematic-debugging` → `debug-mantra` → `scrutinize` → `post-mortem` |
| 🟠 DEV | Make a skill / MCP | `skill-scout` → `skill-creator`/`write-a-skill` OR `mcp-builder` |
| 🟣 DESIGN | Landing / redesign | brainstorming → `taste-skill`/`frontend-design` → `fixing-accessibility` → `theme-factory` |
| 🟣 DESIGN | Image → code | `image-to-code`/`web-artifacts-builder` → `frontend-patterns` → verification |
| 🟣 DESIGN | Visual art / gen | `canvas-design`/`algorithmic-art` → verification |
| 🔴 MARKETING | SEO / ads / convert | `seo-audit` → `programmatic-seo`/`ai-seo` → `cro` → `ad-creative` |
| 🔴 MARKETING | Copy | `copywriting` → `marketing-psychology` → `copy-editing` |
| 🔵 SOCIAL | Content / posts | `content-strategy` → `social` → `video`/`pillar-content` |
| 🔵 SOCIAL | Email flows | `emails` → `cold-email` → `ab-testing` |
| 🟢 FINANCE | Model / pitch | `market-research` → `pricing` → `investor-materials` → `xlsx` |
| 🟩 OPS | Launch / run | `launch` → `internal-comms` → `docx`/`xlsx` → `post-mortem` |
| ⚫ LEGAL | Review docs | `security-review` → `pdf`/`docx` (see gaps in `references/crews.md`) |
| — | Big multi-crew build | brainstorming → `writing-plans` → `orch-pipeline` → `verification-before-completion` |
| — | Research (any) | `deep-research`/`market-research` → `research-ops` |
| — | 3D / WebGL | `threejs-fundamentals` → relevant `threejs-*` |

## Notes

- Skill namespaces here: `superpowers:*`, `my-personal-skills:*`, `taste-skill:*`,
  `ui-skills:*`, `ponytail:*`, `threejs-*`; the 9arm skills (`debug-mantra`,
  `post-mortem`, `qwen-agent`, `scrutinize`, `management-talk`, `qwenchance`);
  and the official Anthropic skills (`docx`, `xlsx`, `pptx`, `pdf`,
  `frontend-design`, `canvas-design`, `algorithmic-art`, `web-artifacts-builder`,
  `slack-gif-creator`, `internal-comms`, `theme-factory`, `brand-guidelines`,
  `doc-coauthoring`, `mcp-builder`, `skill-creator`, `webapp-testing`).
- When two skills overlap (e.g. `taste-skill:taste-skill` vs
  `my-personal-skills:design-taste-frontend` vs Anthropic `frontend-design`),
  prefer the one whose description best matches the brief; if tied, prefer the
  more specific, then the official Anthropic one.
- **Multi-crew tasks are normal.** Chain across crews in execution order
  (e.g. DESIGN → DEV → OPS for build-then-launch).
- The router never skips the confirm step — it always shows the pipeline first.
