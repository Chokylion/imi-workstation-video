# Third-party skills and tools

This repo contains my own skills (`skills/`) and my rules (`CLAUDE.md`). The video also needed tools made by other people. Their licences decide how each one reaches you:

| What | Made by | Licence | How you get it | Version that made this video |
|---|---|---|---|---|
| **lemo-opuscar** (film library: Exploded Teardown style, renderer, Kokoro voice, sampler, mixer) | Lemo Lab | MIT | `setup.sh` clones it to `~/lemo-opuscar` | commit [`bebbbe1`](https://github.com/lemomo-ai/lemo-opuscar/commit/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00) (1 Nov 2026) |
| **OpenMontage** (directing skills: `skills/meta/voice-performance-director.md`, `skills/meta/reviewer.md`) | calesthio | AGPL-3.0 | `setup.sh` clones it to `~/OpenMontage`. Only two markdown files are used, so nothing needs installing. | commit [`195eab2`](https://github.com/calesthio/OpenMontage/commit/195eab24478dc9363326aec437aefc3701635ddf) (28 Oct 2026) |
| **superpowers** (Claude Code plugin: brainstorming, verification and other process skills) | Jesse Vincent (obra) | MIT | `setup.sh` runs `claude plugin install superpowers@claude-plugins-official` | 7.0.2 |
| **pptx skill** (read the PowerPoint spec for v2) | Anthropic | Proprietary ("All rights reserved"), so it **is not copied here** | Usually already in Claude Code as `anthropic-skills:pptx`. If `/skills` doesn't list it, run `/plugin marketplace add anthropics/skills` and then `/plugin install document-skills@anthropic-agent-skills` | — |

The two libraries are pinned to these commits because newer versions may change the film tools. `setup.sh` checks out exactly the versions above. To try the latest instead, run `git -C ~/lemo-opuscar fetch --depth 1 origin main && git -C ~/lemo-opuscar checkout FETCH_HEAD`, and the same for `~/OpenMontage`.

Engines that lemo-opuscar installs: three.js (MIT), Kokoro TTS (Apache-2.0), faster-whisper (MIT), VCSL samples (CC0), Playwright (Apache-2.0), plus ffmpeg (LGPL/GPL), which you install yourself. Assets used inside the film itself are listed in [`CREDITS`](CREDITS).
