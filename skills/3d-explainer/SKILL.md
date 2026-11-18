---
name: 3d-explainer
description: Use when someone wants a 3D explainer, walkthrough or proposal video of a physical item (workstation, bench, cabinet, cart, machine, fixture, product), built from a spec sheet, PowerPoint, PDF, CAD view or sketches, with the camera visiting each part while a narrator explains it; especially with lemo-opuscar's Exploded Teardown style, or on a Windows laptop with integrated graphics.
---

# 3D explainer video from a spec

## Overview
Proven on the IMI workstation video (80 s v1, 111 s v2, 1080p, Intel UHD laptop). Three ideas make it work:
- **Copy the worked example instead of starting blank.** The example is `source/imi-workstation-v2/` in github.com/Chokylion/imi-workstation-video, usually cloned to `~/imi-workstation-video`.
- **Trace every number to the spec.**
- **Catch timing problems before the full render.** The full render takes 25–40 minutes. A mistake caught afterwards costs another full render.

## Before you start
Run `sh ~/imi-workstation-video/setup.sh --check`. If a tool, package or skill shows `!`, run `sh ~/imi-workstation-video/setup.sh` first. It handles the Windows problems listed in `references/windows-setup.md`.

A library at a different commit stays `!`, because setup.sh never changes an existing clone. Either run the pin command it prints, or tell the user that version is untested and carry on. Libraries: `~/lemo-opuscar` (film engine) and `~/OpenMontage` (directing guides).

**OpenMontage needs no install.** Read two of its markdown files and apply them: `~/OpenMontage/skills/meta/voice-performance-director.md` (pace, pauses, emphasis, test the hardest line first) and `~/OpenMontage/skills/meta/reviewer.md` (the review after each stage). Never set up its Remotion or Python pipeline for this.

## Steps
1. **Facts.** Read the spec, and look at every image in it too: CAD views, sketches, photos.
   - For a .pptx, use the pptx skill. Without it: a .pptx is a zip, so read `ppt/slides/*.xml` and look at `ppt/media/`.
   - For a .pdf, use the pdf skill.

   Write `FACTS.md` with one row per number: value, unit, source slide or page, and the quoted words. Photos give look and colour, never numbers. Where sources disagree, use the newest one; if you can't tell which is newest, ask. Log every conflict in FACTS.md and in the final report so a human confirms it.

   Sizes that appear nowhere are drawn but **never spoken or labelled as numbers**.
2. **Ask one question at a time**, multiple choice: the style first (default Exploded Teardown), then the voice (default Kokoro `af_heart` at speed 0.95). Never send a list of questions.
3. **Copy the example.** Copy `source/imi-workstation-v2` to `~/lemo-opuscar/films/<name>/`.

   **Delete `voice/*.wav`, `voice/dur.json` and `voice/words.json`.** If they stay, build.sh skips voice generation and reuses the IMI narration. The same rule applies later: after you edit `lines.json`, build with `VOICE=1` to make the voice again.

   In `build.sh`, change `NAME` and the poster time. The poster time appears twice: in `still.mjs … <t>` and in `poster_<t>.jpg`. Pick a time inside the new end card. The fonts (OFL) are already in `fonts/`.

   For a different length, re-time `T` in bars (90 BPM, so one bar is 2.67 s); `T.end` sets the length.

   Edit every place the item appears. To find anything left behind, grep `src mix.py voice index.html` for the example's numbers and words. Include half-sizes, which appear as coordinates (775, 375). For example: `1550|750|2200|775|375|700|Indirect|cabinet|cart|lamp`.

   | File | What to change |
   |---|---|
   | `src/main.js` | The three.js model, in true millimetres |
   | `src/timeline.js` | Beats `T`, drops, labels, camera shots, and `VO` (subtitle text and times) |
   | `src/overlay.js` | Labels and dimension lines |
   | `voice/lines.json` | The spoken narration (the same lines as `VO`) |
   | `mix.py` | Its music sections and sound effects use `T`'s beat names directly (`T['cart']`, `T['light']` …). Rename or remove them together, or it fails with a KeyError. |

   Keep these names the same across files:
   - the `T` beat names in timeline.js, main.js and mix.py (export.mjs needs `T.card`)
   - the `DROP` names and the parts in main.js
   - the `LBL` names and the label ids in overlay.js
   - each `VO` id, its `lines.json` id and its `voice/<id>.wav`
   - the sound-event types that main.js pushes and the ones mix.py plays

   `tools/export.mjs` writes `timeline.json` (read by mix.py) and `cues.json` (read for the .srt). Its warning `cue … shorter than its speech` counts as a failure: lengthen that `VO` window.
4. **Treatment.** Write `TREATMENT.md`: 2–3 story structures, the chosen one, a shot list and the sound plan. Show it before building the model.
5. **Voice.** Spell numbers out in `text` ("fifteen hundred fifty millimeters") and put the digit form in `asr`. Generate the voice, then run `asr_check.py`. Reword any line Whisper mishears: "waste bin" was heard as "waistband".
6. **Label timing, before any render.** Every label window must last **at least 2.2 s + 0.067 s per non-space character**. This is readcheck's rule (characters ÷ 15 + 1.5 s) plus 0.7 s for the fades. Then run `export.mjs`, `events.mjs` and `readcheck.mjs` on the timeline. All three run without rendering. Fix every `BAD` now.
7. **Stills review.** Render 15–20 stills, one at the middle of each label window plus one at each big move in `T`, and make a contact sheet (`still.mjs`, `sheet.py`). Look for:
   - white surfaces that look tan
   - a light that looks on before its switch moment
   - glints on metal (use matte tops and housings)
   - parts that hit each other
   - labels off screen or covering other labels
   - shots where one object hides another
8. **Full render** in the background: `WORKERS=2 sh build.sh > build.log 2>&1`. If the system stops it for low memory, kill the leftover render process tree before retrying (see the windows reference). Don't retry with more workers.
9. **Checks**: every row in `references/checks.md`. Report failures honestly.
10. **CEO review** against the original request (max 3 loops), then a short report covering the slide conflicts and any honest gaps.

## Common mistakes
| Mistake | Fix |
|---|---|
| Building the film from a blank folder | Copy the worked example (step 3). |
| Keeping the example's `voice/*.wav` and `dur.json` | Delete them, or the new film plays the old narration. |
| Running readcheck only after the full render | Run it on the timeline before rendering (step 6). This cost one extra 40-minute render on v2. |
| `WORKERS=3` on a 16 GB laptop | Use 2. Three ran out of memory. |
| Silently picking one side of a spec conflict | Log it in FACTS.md and in the report. |
| Saying numbers that aren't in the spec | Draw the part, but don't say or label the number. |
| Bare `python3` on Windows | Use `.venv/Scripts/python.exe`. The Store stub hangs. |
