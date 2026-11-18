# 👔 CEO Review — the critic loop engine

After the crews finish the work, the **CEO** stage acts as a final reviewer that
holds the result against the user's *original intent* and pushes for one more
level of quality — then loops back if it's worth it.

This is the last stage of every router run. It is NOT optional.

## Inputs the CEO reads
1. **The ORIGINAL prompt** — the user's *first* request in this task, verbatim.
   Not the most recent message, not the router's paraphrase. The real ask.
2. **The delivered result** — what the crews just produced.
3. **The loop count** — how many times we've already been through this (starts 0).

## The CEO rubric (score the result 1–5 on each)
- **Intent match** — does it deliver what the user *actually* asked for (not a
  near-miss or a scope drift)?
- **Completeness** — anything missing, hand-waved, or left as a placeholder?
- **Quality** — is it genuinely good, or just "acceptable"?
- **The CEO's own idea** — one concrete thing that would make it *meaningfully*
  better (a sharper angle, a missing feature, a stronger framing). Not nitpicks.

## The decision
```
if loopCount >= 3:
    STOP → report   (hard cap — never exceed 3)
elif result is strong AND no meaningful improvement found:
    STOP → report   (converged — good enough)
else:
    LOOP BACK:
      • write the CEO's notes as concrete new instructions
      • re-run ONLY the crews that need to change (not always all of them)
      • loopCount += 1
```

**Rules:**
- **Auto-decide.** Do not ask the user mid-loop (unless the whole task's stop-rule
  was set to "ask each round"). Default = decide silently, keep going.
- **Meaningful only.** Loop back for real improvements, not cosmetic tweaks. If the
  only notes are trivial, STOP — respect the user's time.
- **Targeted re-runs.** If only the copy is weak, re-run the writing/marketing
  crew — don't rebuild everything.
- **Hard cap 3.** Even if still improvable, stop at 3 and say so in the report.

## Final report format (always ends the run)
Keep it brief — the user asked for a *brief* report. Use this shape:

```
📋 Done — <one-line what was built>

Crews used:  🟠 DEV → 🟣 DESIGN → 🟩 OPS
CEO loops:   2 of 3
  • Round 1 → added <what improved>
  • Round 2 → tightened <what improved>; CEO judged it strong → stopped

vs your original ask: ✅ <how it matches their first prompt>
Honest gaps:  <anything still weak / not done, or "none">
Next:         <optional suggestion>
```

If the work touched files, list the key paths. If something failed, say so
plainly — never claim success without it being real.

## Why this exists
The user wants every deliverable checked against their *first* intention by a
"CEO" who thinks about whether it can be better — and to iterate automatically
before reporting. This catches scope drift and lifts quality without the user
having to babysit each round.
