# Third-party tools

The `3d-explainer` skill is mine. On first use it downloads two libraries made by other people, at the versions that made this video:

| What | Made by | Licence | Version that made this video |
|---|---|---|---|
| **lemo-opuscar** (film library: Exploded Teardown style, renderer, Kokoro voice, sampler, mixer) | Lemo Lab | MIT | commit [`bebbbe1`](https://github.com/lemomo-ai/lemo-opuscar/commit/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00) (1 Nov 2026) |
| **OpenMontage** (directing guides: `skills/meta/voice-performance-director.md`, `skills/meta/reviewer.md`) | calesthio | AGPL-3.0 | commit [`195eab2`](https://github.com/calesthio/OpenMontage/commit/195eab24478dc9363326aec437aefc3701635ddf) (28 Oct 2026) |

[`skills/3d-explainer/scripts/setup.sh`](skills/3d-explainer/scripts/setup.sh) checks out exactly these versions. If either library is already cloned, it is left as it is. To try the latest instead, run `git -C ~/lemo-opuscar fetch --depth 1 origin main && git -C ~/lemo-opuscar checkout FETCH_HEAD`, and the same for `~/OpenMontage`.

Engines that lemo-opuscar installs: three.js (MIT), Kokoro TTS (Apache-2.0), faster-whisper (MIT), VCSL samples (CC0), Playwright (Apache-2.0), plus ffmpeg (LGPL/GPL), which you install yourself. The fonts in `example/` and `source/` are Inter and JetBrains Mono (SIL OFL 1.1); their licence texts sit next to them. Assets used inside the film are listed in [`CREDITS`](CREDITS).

While making v2 I also used Anthropic's pptx skill, inside Claude Code, to read the PowerPoint spec. It is Anthropic's ("All rights reserved"), so it isn't copied here. The 3d-explainer skill doesn't need it: it reads a .pptx as a zip.
