#!/bin/sh
# One command: voice → speech check → cues → events → picture → mix → master → .srt → reading check → poster.
# Windows (Git Bash): the venv's Python is .venv/Scripts/python.exe; elsewhere .venv/bin/python.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}          # clone mode: <repo>/films/<name>/
export LIB PYTHONUTF8=1 HF_HUB_DISABLE_SYMLINKS_WARNING=1
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"; [ -x "$PY" ] || PY="$LIB/.venv/Scripts/python.exe"
NAME=imi-workstation-v2
WORKERS=${WORKERS:-3}
cd "$LIB"

[ -f core/assets/polyhaven/photo_studio_loft_hall_2k.hdr ] || sh tools/fetch.sh hdri
[ -f core/tts/kokoro-v1.0.onnx ] || sh tools/fetch.sh voice
[ -d core/audio/instruments/vcsl ] || sh tools/fetch.sh instruments vcsl

if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/voice/dur.json" ]; then "$PY" core/tts/tts.py "$HERE/voice/lines.json" "$HERE/voice"; fi
"$PY" core/tts/asr_check.py "$HERE/voice/lines.json" "$HERE/voice" --lang en
node "$HERE/tools/export.mjs"

node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 1
"$PY" core/render/srt.py "$HERE/cues.json" "$HERE/$NAME.srt"

node core/render/readcheck.mjs "$HERE" --step 0.1 > "$HERE/out/readcheck.txt" && echo "readcheck ok" || echo "readcheck: see out/readcheck.txt"
node core/render/still.mjs "$HERE" 106 --q nosub=1 --prefix poster_ --out "$HERE/out"
ffmpeg -v error -y -i "$HERE/out/poster_106.jpg" -q:v 2 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
