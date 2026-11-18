# Checks before saying "done"

Run these from `~/lemo-opuscar`, with `F=films/<name>`, `PY=.venv/Scripts/python.exe` (`.venv/bin/python` on macOS/Linux) and `export PYTHONUTF8=1`.

## Before the full render (cheap, so run them often)
| Check | Command | Pass |
|---|---|---|
| Voice lines | `$PY core/tts/tts.py $F/voice/lines.json $F/voice` then `$PY core/tts/asr_check.py $F/voice/lines.json $F/voice --lang en` | Every line matches its `asr` (or `text`), and every number is right |
| Label reading time | `mkdir -p $F/out && node $F/tools/export.mjs && node core/render/events.mjs $F && node core/render/readcheck.mjs $F --step 0.1 > $F/out/readcheck.txt` | Exit code 0 and no `BAD` lines (`grep BAD $F/out/readcheck.txt`). Exit 2 means the check could not run, which is not a pass. |
| Stills | `node core/render/still.mjs $F 4 12 24 ... --prefix c_ --out $F/stills`, then `$PY core/render/sheet.py $F/stills/sheet.jpg $F/stills/c_*.jpg --cols 5 --w 384` | Look at the sheet with your own eyes: no problems from step 7 of the skill |
| Facts | Compare every number in `voice/lines.json` and `src/overlay.js` with `FACTS.md` | Every number has a source row |

## After the full render
| Check | Command | Pass |
|---|---|---|
| Format | `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact $F/<name>.mp4` | 1920×1080, 24 fps, video and audio both present, expected length |
| Black frames | `ffmpeg -v info -i $F/<name>.mp4 -vf blackdetect=d=0.1:pix_th=0.05 -an -f null - 2>&1 \| grep -c black_start` | 0 |
| Loudness | `ffmpeg -i $F/<name>.mp4 -af ebur128=peak=true -f null - 2>&1 \| tail -12` (the build log prints it too) | About −14 LUFS integrated; true peak ≤ −1 dBTP |
| Whisper on the final mix | `ffmpeg -v error -y -i $F/<name>.mp4 -ac 1 -ar 16000 $F/out/final16k.wav`, then `$PY -c "from faster_whisper import WhisperModel; m=WhisperModel('base.en',compute_type='int8'); [print(f'{s.start:5.1f} {s.text}') for s in m.transcribe('$F/out/final16k.wav')[0]]"` | Every line is heard, the numbers are right, and the music never covers the voice |
| Timing | `grep BAD $F/out/readcheck.txt; grep "shorter than its speech" $F/build.log`. build.sh writes these files but **finishes even when they fail**, so a finished build proves nothing about timing. | Both greps print nothing |
| Watch it once | Full speed, with sound | Nothing surprising. Note gaps such as a long stretch with no voice. |

Finish with the outputs: `<name>.mp4`, `<name>.srt`, `poster.jpg`, `FACTS.md`, `TREATMENT.md`, `CREDITS`, `build.sh`.
