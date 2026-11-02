# TREATMENT: Indirect Material Inspection Workstation

Style: **Exploded Teardown** (lemo-opuscar `styles/teardown/STYLE.md`).
Direction layer: **OpenMontage** `skills/meta/voice-performance-director.md` (voice plan below) and `skills/meta/reviewer.md` (CHAI review after each stage).
Format: 1920×1080, 24 fps, about 76 s, English AI narrator (Kokoro), burned-in English subtitles plus `.srt`, −14 LUFS.

Purpose (from the brief): a proposal film saying *we will set up a location for Indirect Material Inspection*. It shows a bench with a lockable cabinet, a cart to fetch material, a magnifying lamp for visual checks, and 1–2 operators. The whole workspace is simulated with AI tools only. There is no CAD file, so the model is built from the spec sheet's published dimensions, and the end card says so.

## 1. Three candidate structures
1. **The tour (one orbit, stops)**: the closed station turns, lifts apart once, closes, then the camera stops at each part in order of use. Clear, but it can feel like a list.
2. **A day of one lot ("how it works")**: follow the material through the station. The cart rolls in, the light switches on, the lamp swings over, the cabinet locks the sample away, the operator sits. Every part appears exactly when the workflow needs it.
3. **Empty floor → station**: start on an empty marked floor area (the "location"), then the parts assemble one by one around the operator space.

**Chosen: 3 opening into 2.** The brief is "we will define a location", so the opening image is the empty location. The station then assembles in a wave (the native "wave lift", run in reverse) and the camera follows a material flow. Cart in → light on → lamp → cabinet locked → operators seated. This gives the list a reason and an order. The ending pulls back to the full location with its dimensions drawn on it (the style's ending "closed with its dimensions drawn on it").

## 2. Logline and arc
An empty patch of factory floor becomes an inspection station, and we watch it come together part by part, as the material it will check would meet it.
Setup: empty location → turn: the light switches on and the work starts → ending: the complete station, measured, with its name.

## 3. Benchmark (grammar only)
- Learn: furniture/workspace configurator films (parts arriving in a staggered wave, slow orbit), industrial-equipment launch films (a macro on the one mechanism that matters), engineering drawings (leader lines, dimension ticks).
- Don't take: any brand's products, layouts, typefaces, music or logos.

## 4. Shot list
| # | t (s) | Framing / angle | Move | Why |
|---|---|---|---|---|
| 1 | 0–6 | High 3/4 wide on an empty floor with a taped footprint | Slow push in | "A location": the space exists before the furniture |
| 2 | 6–15 | Same, wide | Orbit 40° while the frame rises, then worktop, cabinet, light panel lift in from above (wave) | The whole, in assembly order |
| 3 | 15–24 | High 3/4 drift | Drift; dimension lines draw on L, W, H | Size and precision |
| 4 | 24–30 | Grazing macro along the worktop edge and frame tube | Dolly | Material: 25 mm laminate, 40×40 steel |
| 5 | 30–38 | Medium on the left side | Track left; the cart rolls in | The flow starts: material arrives |
| 6 | 38–47 | Medium low, looking up under the light panel | Rise; near-silence, then switch click, panel on | Turn: the work begins (peak, "lights on" native move) |
| 7 | 47–53 | Close on the left-rear corner | Slow push; lamp arm swings to the centre | The tool of visual inspection |
| 8 | 53–60 | Medium front of cabinet | Push; the door swings open and shut, key turns | "Lockable" (one real motion) |
| 9 | 60–64 | Close behind the bench | Dive along the rear rail | Hidden detail: 4 outlets |
| 10 | 64–70 | Low front 3/4 | Low orbit; chairs roll in, two ghost operators sit | 1–2 operators |
| 11 | 70–76 | Wide | Fast pull back to the full location; title card | Synthesis |

## 5. Beat sheet and voice lines (spoken text spells numbers out; subtitles use digits)
| id | t0 | Line (subtitle) |
|---|---|---|
| l01 | 0.8 | We're setting up a new location: the Indirect Material Inspection station. |
| l02 | 6.5 | One workbench, one material cart, one magnifying lamp, and seats for one or two operators. |
| l03 | 15.5 | The bench is 1550 mm long, 750 mm deep, and 2200 mm tall. |
| l04 | 24.2 | A blue powder-coated steel frame carries a 25 mm white laminate top. |
| l05 | 30.5 | On the left, a stainless steel cart brings material in, and takes it back when the check is done. |
| l06 | 40.0 | The LED panel reaches 700 mm forward on angled brackets, lighting the whole worktop. |
| l07 | 47.5 | At the left rear corner, an ESD magnifying lamp swings over the center for close visual checks. |
| l08 | 53.5 | Above, a full-length cabinet with one wide door and a key lock keeps tools and samples secure. |
| l09 | 60.3 | Along the back, a four-outlet power rail. |
| l10 | 64.3 | Two blue ESD chairs, with foot rings and casters, seat one or two operators. |
| l11 | 70.8 | One location. Everything the inspector needs, within reach. |

Final timings are re-placed from the real TTS durations (DIRECTOR §7 hold rules).

## 6. Voice performance (OpenMontage contract)
```json
{
  "performance_intent": "Calm, close, confident facilities narrator presenting a proposal to managers.",
  "pacing_profile": "measured",
  "energy_curve": "quiet and curious on the empty floor, warmer as parts arrive, a held beat before the light switches on, deliberate close",
  "pause_policy": "Short pause after each part name; about 0.8 s of near-silence before the switch click; a full stop before 'within reach'.",
  "provider_notes": { "kokoro": "voice af_heart, speed 0.95; offline voice, so rely on punctuation and one sentence per line" }
}
```
Sample gate: generate l06 first (the most performance-sensitive line), check pace and pronunciation (ESD, millimeters), then the rest.

## 7. Cue map
Tempo 96 bpm (0.625 s per beat), 4/4. The sections land on bar lines: empty floor (bars 1–4), assembly (5–10), measures and materials (11–19), the flow (20–30; the switch click on a downbeat after a one-bar near-silence), people (31–36), close (37–40). Mallets (marimba/vibes) dry outside, sustained glass pad during the macros, round bass from the assembly onward, a short kick under each part landing.

## 8. Sound design
| Section | Ambience | Foley | Music |
|---|---|---|---|
| Empty floor | soft factory room tone | tape tick as the footprint draws | sparse vibes |
| Assembly | room tone | airy swoosh per part, soft metal thud per landing | mallets + bass enter |
| Measures | room tone | pen hiss per dimension line, tick per label | mallets, lighter |
| Cart | room tone | caster roll, metal tray rattle | bass + mallets |
| Light | near-silence (room only) | switch click, faint LED hum | glass pad swells after the click |
| Lamp | room | spring-arm creak | pad |
| Cabinet | room | door hinge swing, latch, key turn | mallets |
| Rail | room | small plastic tick | thin |
| Chairs | room | caster rolls, gas-lift puff | full |
| Close | room | whoosh pull back | resolve, ring out |

## 9. Type and subtitles
Names in Inter 500 (30 px), specs in JetBrains Mono (18 px), warm white #f1efe9 at full / 60 %, one accent #ff6b3d only for measured things (dimension lines, label index). Labels: two-digit index · name · one spec line. Subtitles: centred bottom strip with a soft shadow, no box. End card: "Indirect Material Inspection Workstation" / "3D model built from the specification sheet".

## 10. Differences from the demo (checked after reading DEMO.md)
| | Demo (*21 Keys, Opened*) | This film | Differs |
|---|---|---|---|
| Structure | explode → dive inside → close → dimensions | empty location → assemble → follow the material flow → people → pull back | yes |
| Opening | grazing macro on keycaps, one keystroke | empty floor, the location taped out | yes |
| Signature shot | inside the gap under the board | the switch: near-silence, then the LED panel strikes | yes |
| Camera path | one continuous macro-heavy oner | wide orbit, one grazing dolly, then medium stops per part | yes |
| Score | 96 BPM, D minor 9 groove | 90 BPM, G major; vibes on the empty floor, bowed vibes under the light | yes |
| Ending | dimensions on the closed object, then card | pull back to the full location, then card | partly (both end on a card beside the object) |
5 of 6 differ (the style asks for at least 4).
