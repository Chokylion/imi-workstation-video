// timeline.js → timeline.json (for mix.py) and cues.json (for the .srt); cue timing matches overlay.js
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TL = await import(pathToFileURL(path.join(HERE, 'src/timeline.js')).href);
const dur = JSON.parse(fs.readFileSync(path.join(HERE, 'voice/dur.json'), 'utf8'));
const { T, VO, BPM, DUR } = TL;
fs.writeFileSync(path.join(HERE, 'timeline.json'), JSON.stringify({ BPM, DUR, T, DROP: TL.DROP, VO }, null, 1));
const cues = VO.map((v, i) => {
  const next = VO[i + 1] ? VO[i + 1].t - .12 : T.card - .1;
  return { t0: +(v.t - .05).toFixed(3), t1: +Math.min(next, v.t + Math.max(1.8, dur[v.id] + .6)).toFixed(3), text: v.en };
});
fs.writeFileSync(path.join(HERE, 'cues.json'), JSON.stringify(cues, null, 1));
for (const [i, c] of cues.entries()) if (c.t1 - c.t0 < dur[VO[i].id] + .5) console.error(`! cue ${VO[i].id} is shorter than its speech`);
console.log('timeline.json, cues.json:', cues.length, 'cues');
