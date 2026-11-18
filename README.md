# Indirect Material Inspection Workstation: 3D explainer video

![preview](preview-v2.gif)

**▶ Watch:** https://chokylion.github.io/imi-workstation-video/
**⬇ Download v2:** [imi-workstation-v2.mp4](https://github.com/Chokylion/imi-workstation-video/releases/download/v2/imi-workstation-v2.mp4) (111 s, 1920×1080, English narration and subtitles)
**🛠 How I made it, and how you can too:** [HOW-I-MADE-THIS.md](HOW-I-MADE-THIS.md): every skill and tool used, my exact prompts, a copy-paste prompt, requirements and setup.

## Install the skill (make your own video)

For GitHub Copilot (the app, CLI or VS Code), run this in any terminal. It needs [Node.js](https://nodejs.org) 20+.

```
npx -y skills add Chokylion/imi-workstation-video -g -a github-copilot -s 3d-explainer -y --copy
```

Then ask Copilot:

> Make a 3D explainer video of [your item] from [path to your spec .pptx or .pdf]

The first time, the skill sets up the film engine by itself (about 2 GB, 10–20 minutes, once). It installs to `~/.copilot/skills/3d-explainer`. For Claude Code, replace `github-copilot` with `claude-code`. Licences are in [`THIRD-PARTY.md`](THIRD-PARTY.md).

The proposed location for indirect material inspection (**v2**, from the updated specification slides):
- a workbench (1550 × 750 × 2200 mm, worktop at 880–900 mm) with a blue powder-coated steel frame and a 30 mm white ESD dissipative laminate top
- a lower shelf in the same laminate, with a stainless steel L-angle edge
- a lockable upper cabinet (1550 × 300 × 400 mm, no shelves inside) holding the measuring tools: digital verniers (1000 mm and 200 mm), a micrometer with stand, a thickness gauge, a tape measure and a steel ruler
- an LED linear light and a 4-outlet power rail
- a 2-level stainless steel material cart (750 × 500 × 900 mm) and a black ESD waste bin with a push lid on the left
- an 8× ESD LED magnifying lamp at the left rear corner
- a notebook computer on the right
- two blue ESD operator chairs for 1–2 operators
- shared from nearby areas: a surface resistance meter, a voltage meter and a Keyence digital microscope

Made entirely with AI tools: Claude Code + [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) (Exploded Teardown style) + [OpenMontage](https://github.com/calesthio/OpenMontage) directing skills. The 3D model is built from the specification and is an illustration, not a manufacturing drawing.

Other files:
- [FACTS-v2.md](FACTS-v2.md): every number, traced to its slide, plus the conflicts between the slides.
- [CREDITS](CREDITS): assets and licences.
- [`source/imi-workstation-v2/`](source/imi-workstation-v2/): the full film source.

**Version 1** (2 Nov 2026, first spec, 80 s):
- [imi-workstation.mp4](https://github.com/Chokylion/imi-workstation-video/releases/download/v1/imi-workstation.mp4)
- [FACTS.md](FACTS.md)
- [`source/imi-workstation/`](source/imi-workstation/)
