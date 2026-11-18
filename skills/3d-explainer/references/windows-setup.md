# Windows notes (Git Bash, no WSL)

lemo-opuscar's guide suggests WSL. Running natively in Git Bash worked, with integrated Intel UHD graphics at about 0.6 s per frame and 2 workers. [`scripts/setup.sh`](../scripts/setup.sh) in this skill applies every fix below. This page is for fixing a broken install by hand.

| Problem | What you see | Fix |
|---|---|---|
| The venv keeps Python in `Scripts\`, but the scripts call `.venv/bin/python` | `setup.sh deps` stops: Python not found | Make a junction. In PowerShell: `New-Item -ItemType Junction -Path "$HOME\lemo-opuscar\.venv\bin" -Target "$HOME\lemo-opuscar\.venv\Scripts"` |
| Packages missing after setup | `import kokoro_onnx` fails | `cd ~/lemo-opuscar && uv pip install --python .venv/Scripts/python.exe -r requirements.txt -r requirements-voice.txt` |
| `setup.sh` given a `C:/...` path | Wrong library folder | `export LEMO_OPUSCAR_HOME=$HOME/lemo-opuscar`, which is a `/c/Users/...` style path |
| Unicode output | `tools/fetch.sh` or the voice tools crash while printing an arrow | `export PYTHONUTF8=1` first |
| The `python3` Store stub | A command hangs forever | Never call bare `python3`. Use `~/lemo-opuscar/.venv/Scripts/python.exe`. |
| Memory at 16 GB RAM | The render is killed, or the PC freezes | `WORKERS=2`. Close heavy apps during the render. |
| An orphan render after a kill | `node video.mjs` and `chrome-headless-shell` keep running and holding memory | Find the PID in PowerShell: `Get-CimInstance Win32_Process -Filter "Name='node.exe'" \| ? CommandLine -match 'video.mjs' \| select ProcessId`. Then `taskkill /PID <id> /T /F`. |
| Library cloned earlier, at another version | `setup.sh --check` shows `! … not the tested …` | To switch to the tested version: `git -C ~/lemo-opuscar fetch --depth 1 origin <sha> && git -C ~/lemo-opuscar checkout FETCH_HEAD`. The full SHAs are at the top of `scripts/setup.sh`. A newer version may also work, but it hasn't been tested. |
| The GPU isn't used | The first still prints `[note] WebGL runs on software rendering`, and stills take several seconds each | Try `export LEMO_ANGLE=d3d11`, then `gl` (not tested on this setup), and render a still again after each. Normal speed is about 0.6 s per frame on Intel UHD with the default setting. |
| Clone made by lemo-opuscar's own installer | Pinning works, but the next setup run moves it back to the newest version | It carries `lemo.managed=true`. Run `git -C ~/lemo-opuscar config --unset lemo.managed` before pinning. `setup.sh --check` points this out. |
| Windows line endings in a clone you made yourself | `$'\r': command not found` when a `.sh` runs | Not seen on the PC that made this video. If it happens, move that clone aside and let `setup.sh` clone it again (it uses `core.autocrlf false`). |
| Downloads blocked on a company network | `fetch.sh`, uv or the Whisper model download fail with certificate or proxy errors | Retry on another network, or ask IT to allow github.com and huggingface.co. On the PC that made this video, they worked from inside the company network. |
| ffmpeg or the headless browser disappeared | `ffmpeg: command not found`, or Playwright can't find its browser | Reinstall ffmpeg (`winget install Gyan.FFmpeg`), then run `sh setup.sh` again, which re-runs `deps`. On one PC, `AppData\Local` was wiped partway through a session. |

Check the setup with: `~/lemo-opuscar/.venv/Scripts/python.exe -c "import numpy, scipy, soundfile, kokoro_onnx, faster_whisper; print('ok')"`
