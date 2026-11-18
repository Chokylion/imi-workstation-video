#!/bin/sh
# One command to get everything this video needed, for Claude Code.
#   sh setup.sh                 libraries (tested versions), packages, voice/music assets, skills, superpowers
#   sh setup.sh --skills-only   only copy skills/ into ~/.claude/skills
#   sh setup.sh --add-rules     also append CLAUDE.md to ~/.claude/CLAUDE.md (once; your file is backed up first)
#   sh setup.sh --check         report what is installed; change nothing
# Runs in Git Bash on Windows, and in any terminal on macOS / Linux. Safe to run again.
set -e
KIT=$(cd "$(dirname "$0")" && pwd)

LEMO_URL=https://github.com/lemomo-ai/lemo-opuscar.git
LEMO_SHA=bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00     # the version that made this video
OM_URL=https://github.com/calesthio/OpenMontage.git
OM_SHA=195eab24478dc9363326aec437aefc3701635ddf
LEMO=${LEMO_OPUSCAR_HOME:-$HOME/lemo-opuscar}
OM=${OPENMONTAGE_HOME:-$HOME/OpenMontage}
SKILLS=$HOME/.claude/skills
BACKUP=$HOME/.claude/skills-backup                    # outside skills/, so old copies never load
RULES=$HOME/.claude/CLAUDE.md
MARK_BEGIN='<!-- imi-workstation-video rules: begin -->'
MARK_END='<!-- imi-workstation-video rules: end -->'

MODE=all; ADD_RULES=0
for a in "$@"; do
  case $a in
    --skills-only) MODE=skills ;;
    --check) MODE=check ;;
    --add-rules) ADD_RULES=1 ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
    *) echo "unknown option: $a (try: sh setup.sh --help)"; exit 1 ;;
  esac
done
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) WIN=1 ;; *) WIN=0 ;; esac

ok()   { echo "  ✓ $*"; }
warn() { echo "  ! $*"; }
die()  { echo "  ✗ $*"; exit 1; }
short() { echo "$1" | cut -c1-7; }

tools() {
  echo "== tools"
  miss=0
  for t in git node ffmpeg uv claude; do
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
    echo "    Claude Code: https://claude.com/claude-code"
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
  cd "$KIT"
  lemo_ready && ok "packages, voice model, studio lighting and instruments" || die "lemo-opuscar is not complete: read the messages above"
}

skills() {
  echo "== skills -> $SKILLS"
  for s in "$KIT"/skills/*/; do
    n=$(basename "$s")
    if [ -d "$SKILLS/$n" ] && diff -rq "$s" "$SKILLS/$n" >/dev/null 2>&1; then ok "$n (up to date)"; continue; fi
    if [ "$MODE" = check ]; then
      if [ -d "$SKILLS/$n" ]; then warn "$n is installed but differs from this repo"; else warn "$n not installed"; fi
      continue
    fi
    if [ -d "$SKILLS/$n" ]; then
      b="$BACKUP/$n-$(date +%Y%m%d-%H%M%S)"; mkdir -p "$BACKUP"; mv "$SKILLS/$n" "$b"; warn "your old $n was moved to $b"
    fi
    mkdir -p "$SKILLS"; cp -r "$s" "$SKILLS/$n"; ok "$n installed"
  done
}

rules() {
  if [ -f "$RULES" ] && grep -qF "$MARK_BEGIN" "$RULES"; then ok "working-style rules are in $RULES"; return 0; fi
  if [ "$MODE" = check ] || [ $ADD_RULES = 0 ]; then echo "  - working-style rules not added (optional: sh setup.sh --add-rules)"; return 0; fi
  mkdir -p "$(dirname "$RULES")"
  if [ -f "$RULES" ]; then cp "$RULES" "$RULES.bak-$(date +%Y%m%d-%H%M%S)"; fi
  { if [ -s "$RULES" ]; then echo; fi
    echo "$MARK_BEGIN"; sed -n '/^# skill-router/,$p' "$KIT/CLAUDE.md"; echo "$MARK_END"; } >> "$RULES"
  ok "working-style rules appended to $RULES"
}

plugins() {
  echo "== Claude Code plugin"
  command -v claude >/dev/null 2>&1 || { warn "claude not found; after installing Claude Code run: claude plugin install superpowers@claude-plugins-official"; return 0; }
  if claude plugin list 2>/dev/null | grep -q 'superpowers@'; then ok "superpowers"; return 0; fi
  [ "$MODE" = check ] && { warn "superpowers not installed"; return 0; }
  if claude plugin install superpowers@claude-plugins-official; then ok "superpowers installed"
  else warn "could not install superpowers; inside Claude Code type: /plugin install superpowers@claude-plugins-official"; fi
}

case $MODE in
  skills) skills; rules ;;
  check)
    tools || true
    echo "== libraries"; lib lemo-opuscar "$LEMO" "$LEMO_URL" "$LEMO_SHA"; lib OpenMontage "$OM" "$OM_URL" "$OM_SHA"
    lemo_deps; skills; rules; plugins ;;
  all)
    tools || die "install the missing tools above, then run this again"
    echo "== libraries"; lib lemo-opuscar "$LEMO" "$LEMO_URL" "$LEMO_SHA"; lib OpenMontage "$OM" "$OM_URL" "$OM_SHA"
    lemo_deps; skills; rules; plugins
    echo
    echo "Done. Open Claude Code and say, for example:"
    echo "  use the 3d-explainer skill to make a video of <your item> from <path to your spec .pptx or .pdf>"
    ;;
esac
