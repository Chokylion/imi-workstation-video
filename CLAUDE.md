# Working-style rules (Claude Code)

These are the rules the agent followed while making this video. `sh setup.sh --add-rules` appends them to `~/.claude/CLAUDE.md`, so they apply to every project. You can also copy them by hand.

# skill-router
- **skill-router** (`~/.claude/skills/skill-router/SKILL.md`) - auto-detect a task, pick & chain the right skills, show the pipeline for confirmation, then run them. Trigger: `/router`
When the user types `/router`, invoke the skill-router skill before doing anything else.

# Default working style (ALWAYS)
For any non-trivial task (a build, design, research effort, or multi-step request), work this way by default — even without `/router`:
1. **Route first.** Classify the task and pick the right skill or skill-chain (skill-router logic). Show the pipeline as a short flowchart / yes-no trace and get a quick confirm before running skills.
2. **Design before building.** Lead creative/build work with `superpowers:brainstorming`; lead any bug with `superpowers:systematic-debugging`. Never write code or scaffold before the approach is agreed.
3. **One question at a time.** When clarifying, ask a single focused question per message (multiple-choice when possible) — do not batch many questions or make big assumptions about intent.
4. **Verify before claiming done.** Close build chains with a `*-verification` / `verification-before-completion` step; report failures honestly.
5. **👔 CEO review loop (ALWAYS, at the end).** After the crews finish, run the CEO stage (`~/.claude/skills/skill-router/references/ceo-review.md`): re-read the user's ORIGINAL prompt, score the result against it, add one concrete improvement idea. If meaningfully improvable → loop back through the relevant crews with those notes. **Auto-decide, max 3 loops.** Stop early when it's strong.
6. **📋 Brief report.** End every run with a short report: what was built, how many CEO loops ran + what each improved, how it matches the original ask, honest gaps.
Skip this only for trivial one-liners or when the user explicitly says to just do it.
