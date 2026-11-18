#!/bin/sh
# Sets up the film engine this skill needs. Runs once; safe to run again.
#   sh setup.sh           download lemo-opuscar + OpenMontage (tested versions), packages, voice/music assets (about 2 GB, 10-20 min)
#   sh setup.sh --check   report what is installed; change nothing
# Runs in Git Bash on Windows, and in any terminal on macOS / Linux.
set -e
LEMO_URL=https://github.com/lemomo-ai/lemo-opuscar.git
LEMO_SHA=bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00     # the version that made this video
OM_URL=https://github.com/calesthio/OpenMontage.git
OM_SHA=195eab24478dc9363326aec437aefc3701635ddf
LEMO=${LEMO_OPUSCAR_HOME:-$HOME/lemo-opuscar}
OM=${OPENMONTAGE_HOME:-$HOME/OpenMontage}

MODE=all
for a in "$@"; do
  case $a in
    --check) MODE=check ;;
    -h|--help) sed -n '2,5p' "$0"; exit 0 ;;
    *) echo "unknown option: $a (try: sh setup.sh --help)"; exit 1 ;;
  esac
done
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) WIN=1 ;; *) WIN=0 ;; esac
HERE=$(pwd)

ok()   { echo "  ✓ $*"; }
warn() { echo "  ! $*"; }
die()  { echo "  ✗ $*"; exit 1; }
short() { echo "$1" | cut -c1-7; }

tools() {
  echo "== tools"
  miss=0
  for t in git node ffmpeg uv; do
    if command -v "$t" >/dev/null 2>&1; then ok "$t"; else warn "$t not found"; miss=1; fi
  done
  if command -v node >/dev/null 2>&1; then
    nv=$(node -v | sed 's/^v\([0-9]*\).*/\1/')
    [ "$nv" -ge 20 ] || { warn "Node $nv is too old: version 20 or newer is needed"; miss=1; }
  fi
  if command -v ffmpeg >/dev/null 2>&1; then
    fv=$(ffmpeg -version 2>/dev/null | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9][0-9]*\)\..*/\1/p')
    [ -n "$fv" ] && [ "$fv" -ge 7 ] || warn "ffmpeg 7 or newer is recommended (found: ${fv:-unknown})"
  fi
  if [ $miss = 1 ]; then
    if [ $WIN = 1 ]; then echo "    Windows: winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg astral-sh.uv   (then reopen Git Bash)"
    else echo "    macOS: brew install git node ffmpeg uv    Linux: your package manager, and https://docs.astral.sh/uv/"; fi
  fi
  return $miss
}

# Clone a library at the tested commit. An existing clone is never changed.
lib() {   # name dir url sha
  if [ -d "$2/.git" ]; then
    have=$(git -C "$2" rev-parse HEAD)
    if [ "$have" = "$4" ]; then ok "$1 at the tested commit $(short "$4") ($2)"
    else warn "$1 is at commit $(short "$have"), not the tested $(short "$4"); left as it is ($2)"
      [ "$(git -C "$2" config --get lemo.managed)" != true ] || echo "    this clone updates itself to the newest version whenever lemo-opuscar's setup runs; to keep a pin, first: git -C \"$2\" config --unset lemo.managed"
      echo "    to use the tested version: git -C \"$2\" fetch --depth 1 origin $4 && git -C \"$2\" checkout FETCH_HEAD"; fi
    return 0
  fi
  if [ "$MODE" = check ]; then warn "$1 not found at $2"; return 0; fi
  [ -e "$2" ] && die "$2 exists but is not a git clone: move it away, then run this again"
  echo "  … downloading $1"
  git init -q "$2"
  git -C "$2" config core.autocrlf false               # keep its shell scripts runnable on Windows
  git -C "$2" remote add origin "$3"
  git -C "$2" fetch -q --depth 1 origin "$4"
  git -C "$2" checkout -q FETCH_HEAD
  ok "$1 at the tested commit $(short "$4") ($2)"
}

venv_py() { if [ -x "$LEMO/.venv/Scripts/python.exe" ]; then echo "$LEMO/.venv/Scripts/python.exe"; else echo "$LEMO/.venv/bin/python"; fi; }

lemo_ready() {   # quiet check: packages import and all three asset packs are present
  [ -f "$LEMO/core/render/video.mjs" ] || return 1
  [ -d "$LEMO/node_modules/playwright-core" ] || return 1
  "$(venv_py)" -c "import numpy, scipy, soundfile, kokoro_onnx, faster_whisper" >/dev/null 2>&1 || return 1
  [ -f "$LEMO/core/tts/kokoro-v1.0.onnx" ] && [ -f "$LEMO/core/assets/polyhaven/photo_studio_loft_hall_2k.hdr" ] && [ -d "$LEMO/core/audio/instruments/vcsl" ]
}

lemo_deps() {
  echo "== lemo-opuscar packages and assets (about 1.5 GB the first time)"
  [ -f "$LEMO/core/render/video.mjs" ] || { warn "lemo-opuscar is missing at $LEMO"; return 0; }
  echo "  … checking the Python packages (can take a minute or two)"
  if lemo_ready; then ok "packages, voice model, studio lighting and instruments"; return 0; fi
  [ "$MODE" = check ] && { warn "not fully set up yet: run sh setup.sh"; return 0; }
  cd "$LEMO"
  export LEMO_OPUSCAR_HOME="$LEMO" PYTHONUTF8=1 PYTHONIOENCODING=utf-8 HF_HUB_DISABLE_SYMLINKS_WARNING=1
  if [ $WIN = 1 ]; then
    # Windows venvs keep Python in Scripts\, but the library's scripts call .venv/bin/python
    [ -d .venv ] || uv venv --quiet --python 3.12 .venv
    [ -e .venv/bin ] || powershell -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$LEMO/.venv/bin")' -Target '$(cygpath -w "$LEMO/.venv/Scripts")' | Out-Null"
  fi
  sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice || {
    [ $WIN = 1 ] || die "lemo-opuscar's setup failed (see above)"
    warn "lemo-opuscar's setup stopped early on Windows; installing the Python packages directly"; }
  [ $WIN = 0 ] || uv pip install --quiet --python .venv/Scripts/python.exe -r requirements.txt -r requirements-voice.txt
  [ -f core/assets/polyhaven/photo_studio_loft_hall_2k.hdr ] || sh tools/fetch.sh hdri
  [ -f core/tts/kokoro-v1.0.onnx ] || sh tools/fetch.sh voice
  [ -d core/audio/instruments/vcsl ] || sh tools/fetch.sh instruments vcsl
  cd "$HERE"
  lemo_ready && ok "packages, voice model, studio lighting and instruments" || die "lemo-opuscar is not complete: read the messages above"
}

tools || { [ "$MODE" = check ] || die "install the missing tools above, then run this again"; }
echo "== libraries"; lib lemo-opuscar "$LEMO" "$LEMO_URL" "$LEMO_SHA"; lib OpenMontage "$OM" "$OM_URL" "$OM_SHA"
lemo_deps
[ "$MODE" = check ] || echo "Ready: the film engine is in $LEMO"
