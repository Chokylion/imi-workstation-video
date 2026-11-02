// Marks layer: anchored labels, dimension lines on the object, subtitles, end card.
// Every label hangs on a 3D point projected each frame; every number on screen is in FACTS.md.
import * as THREE from 'three';
import { seg, ss, eo } from '/core/lib.js';
import * as TL from './timeline.js';

const { T, LBL, VO } = TL;
const cv = document.getElementById('ov'), g = cv.getContext('2d');
const SANS = '"Inter", sans-serif', MONO = '"JBMono", monospace';
const INK = '#f1efe9', DIM = 'rgba(241,239,233,.64)', ACC = '#ff6b3d', LINE = 'rgba(241,239,233,.78)';
const SUB = { font: `400 31px ${SANS}`, safe: 1560 };

let CUES = [], texts = [];
export async function initOverlay() {
  let dur = {};
  try { dur = await (await fetch('voice/dur.json')).json(); } catch {}
  // each subtitle holds ≥ max(1.8 s, speech + 0.6 s) and ends before the next line starts
  CUES = VO.map((v, i) => {
    const d = dur[v.id] || 3, next = VO[i + 1] ? VO[i + 1].t - .12 : T.card - .1;
    return { id: v.id, t0: v.t - .05, t1: Math.min(next, v.t + Math.max(1.8, d + .6)), text: v.en };
  });
  window.CUES = CUES;
}
export const overlayTexts = () => texts;
export function subcheck() {
  g.font = SUB.font; const out = VO.map(v => ({ id: v.id, w: Math.round(g.measureText(v.en).width) }));
  return { safe: SUB.safe, ok: out.every(o => o.w <= SUB.safe), cues: out };
}

const v3 = new THREE.Vector3();
let CAM, Wd, Hd;
const proj = v => { v3.copy(v).project(CAM); return [(v3.x + 1) / 2 * Wd, (1 - v3.y) / 2 * Hd, v3.z]; };
const fade = (t, a, d = .3) => ss(seg(t, a, a + d));

// one label: anchor dot + leader (diagonal then horizontal) + index / name / spec
function label(t, o) {
  const { t0, t1, a, lx, ly, idx, name, spec, id, align = 'left' } = o;
  const dl = eo(seg(t, t0, t0 + .38)), tx = fade(t, t0 + .18, .32), out = 1 - fade(t, t1 - .3, .3);
  if (dl <= 0 || out <= 0) return;
  const [ax, ay] = a, dir = align === 'left' ? 1 : -1, ex = lx - dir * 34;
  g.globalAlpha = out;
  g.fillStyle = INK; g.beginPath(); g.arc(ax, ay, 4, 0, 7); g.fill();
  g.strokeStyle = 'rgba(241,239,233,.38)'; g.lineWidth = 1.2; g.beginPath(); g.arc(ax, ay, 4 + 7 * dl, 0, 7); g.stroke();
  const s1 = Math.hypot(ex - ax, ly - ay), s2 = Math.abs(lx - dir * 14 - ex), len = (s1 + s2) * dl;
  g.strokeStyle = LINE; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ax, ay);
  if (len <= s1) g.lineTo(ax + (ex - ax) * len / s1, ay + (ly - ay) * len / s1);
  else { g.lineTo(ex, ly); g.lineTo(ex + dir * (len - s1), ly); }
  g.stroke();
  if (tx <= 0) return;
  g.globalAlpha = out * tx; const dx = (1 - tx) * 10 * dir;
  g.font = `500 32px ${SANS}`; const wn = g.measureText(name).width;
  g.font = `400 19px ${MONO}`; const ws = spec ? g.measureText(spec).width : 0;
  const pad = idx ? 40 : 0, w = pad + Math.max(wn, ws);
  const x0 = align === 'left' ? lx : lx - w;
  g.fillStyle = 'rgba(12,13,15,.55)'; g.fillRect(x0 - 12 + dx, ly - 34, w + 24, spec ? 76 : 50);    // dark backing: never text on a bright part
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  if (idx) { g.fillStyle = ACC; g.font = `500 16px ${MONO}`; g.fillText(idx, x0 + dx, ly - 2); }
  g.fillStyle = INK; g.font = `500 32px ${SANS}`; g.fillText(name, x0 + pad + dx, ly + 4);
  if (spec) { g.fillStyle = DIM; g.font = `400 19px ${MONO}`; g.fillText(spec, x0 + pad + dx, ly + 32); }
  if (tx > .99 && out > .99) texts.push({ id, text: name + (spec ? ' ' + spec : ''), x0: Math.max(0, x0 - 12), y0: ly - 34, x1: Math.min(Wd, x0 + w + 12), y1: ly + (spec ? 42 : 16) });
}

// dimension line between two 3D points; ext = [[from, to], …] extension lines
function dimension(t, o) {
  const { t0, t1, A, B, ext = [], text, id, sub } = o;
  const k = eo(seg(t, t0, t0 + .6)), out = 1 - fade(t, t1 - .3, .3);
  if (k <= 0 || out <= 0) return;
  const a = proj(A), b = proj(B), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  g.globalAlpha = out; g.strokeStyle = ACC; g.lineWidth = 2;
  for (const [p, q] of ext) { const p1 = proj(p), q1 = proj(q); g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p1[0] + (q1[0] - p1[0]) * k, p1[1] + (q1[1] - p1[1]) * k); g.stroke(); }
  g.beginPath(); g.moveTo(mx + (a[0] - mx) * k, my + (a[1] - my) * k); g.lineTo(mx + (b[0] - mx) * k, my + (b[1] - my) * k); g.stroke();
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (const p of [a, b]) { g.save(); g.translate(p[0], p[1]); g.rotate(ang - Math.PI / 4); g.beginPath(); g.moveTo(-8 * k, 0); g.lineTo(8 * k, 0); g.stroke(); g.restore(); }
  const tA = fade(t, t0 + .4, .3); if (tA <= 0) return;
  let ra = ang; if (ra > Math.PI / 2) ra -= Math.PI; if (ra < -Math.PI / 2) ra += Math.PI;
  g.save(); g.translate(mx, my); g.rotate(ra); g.globalAlpha = out * tA; g.textAlign = 'center';
  g.font = `500 26px ${MONO}`; const w = g.measureText(text).width;
  g.fillStyle = 'rgba(14,15,17,.75)'; g.fillRect(-w / 2 - 10, -40, w + 20, 36);
  g.fillStyle = INK; g.fillText(text, 0, -13);
  if (sub) { g.font = `400 18px ${SANS}`; g.fillStyle = DIM; g.fillText(sub, 0, -50); }
  g.restore(); g.textAlign = 'left';
  if (tA > .99 && out > .99) texts.push({ id, text: (sub ? sub + ' ' : '') + text, x0: Math.max(0, mx - w / 2 - 40), y0: Math.max(0, my - 72), x1: Math.min(Wd, mx + w / 2 + 40), y1: my + 36 });
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function drawOverlay(t, cam, ctx) {
  CAM = cam; Wd = ctx.W; Hd = ctx.H; texts = [];
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, Wd, Hd);
  const A = ctx.anchors, P = k => proj(A[k]());
  const L = (k, o) => { const w = LBL[k]; if (t > w[0] - .05 && t < w[1] + .05) { const a = P(k); label(t, { id: k, t0: w[0], t1: w[1], a, ...o(a) }); } };
  // the location, before anything stands on it
  if (t > .8 && t < 6.2) { const a = P('tape'); label(t, { id: 'loc', t0: .8, t1: 6.1, a, lx: a[0] + 120, ly: a[1] + 90, name: 'Proposed location', spec: 'Indirect Material Inspection' }); }
  // overall dimensions, drawn on the floor and up the rear upright
  const D = (k, o) => { const w = LBL[k]; if (t > w[0] - .05 && t < w[1] + .05) dimension(t, { id: k, t0: w[0], t1: w[1], ...o }); };
  D('dimL', { A: V(-775, 0, 470), B: V(775, 0, 470), ext: [[V(-775, 0, 380), V(-775, 0, 500)], [V(775, 0, 380), V(775, 0, 500)]], text: '1550 mm', sub: 'length' });
  D('dimD', { A: V(870, 0, 375), B: V(870, 0, -375), ext: [[V(780, 0, 375), V(900, 0, 375)], [V(780, 0, -375), V(900, 0, -375)]], text: '750 mm', sub: 'depth' });
  D('dimH', { A: V(860, 0, -375), B: V(860, 2200, -375), ext: [[V(780, 2200, -375), V(890, 2200, -375)]], text: '2200 mm', sub: 'height' });
  D('reach', { A: V(800, 2235, -375), B: V(800, 2235, 325), ext: [[V(775, 2200, -375), V(800, 2250, -375)], [V(775, 2200, 325), V(800, 2250, 325)]], text: '700 mm', sub: 'forward reach' });
  L('frame', a => ({ lx: a[0] + 120, ly: a[1] + 190, idx: '01', name: 'Frame', spec: '40 × 40 mm steel · blue' }));
  L('top', a => ({ lx: a[0] - 140, ly: a[1] - 240, idx: '02', name: 'Worktop', spec: 'white Formica · 25 mm', align: 'right' }));
  L('cart', a => ({ lx: a[0] + 260, ly: a[1] - 200, name: 'Material cart', spec: 'stainless · 750 × 600 × 600 mm' }));
  L('led', a => ({ lx: a[0] - 120, ly: a[1] + 230, idx: '03', name: 'LED linear light', spec: '1550 × 300 mm · full length', align: 'right' }));
  L('bracket', a => ({ lx: a[0] - 150, ly: a[1] + 190, align: 'right', name: 'Support brackets', spec: '≈ 45°' }));
  L('sw', a => ({ lx: a[0] + 190, ly: a[1] - 130, name: 'ON/OFF switch', spec: '' }));
  L('lamp', a => ({ lx: a[0] - 140, ly: a[1] - 250, align: 'right', idx: '04', name: 'ESD LED magnifier', spec: 'left rear corner · arm to center' }));
  L('cab', a => ({ lx: a[0] - 140, ly: a[1] - 230, idx: '05', name: 'Upper cabinet', spec: '1550 × 300 × 400 mm · white', align: 'right' }));
  L('lock', a => ({ lx: a[0] + 260, ly: a[1] + 170, name: 'Full-width door', spec: 'key lock' }));
  L('rail', a => ({ lx: a[0] + 260, ly: a[1] + 210, idx: '06', name: 'Power rail', spec: '4 outlets · 1550 mm' }));
  L('chair', a => ({ lx: a[0] + 260, ly: a[1] - 170, idx: '07', name: 'ESD operator chairs ×2', spec: 'blue · foot ring · casters' }));
  L('ops', a => ({ lx: a[0] - 260, ly: a[1] - 150, name: 'Operators', spec: '1–2 per station', align: 'right' }));
  // subtitles: one centred line at the bottom, soft shadow, no box
  const NOSUB = new URLSearchParams(location.search).has('nosub');
  for (const c of NOSUB ? [] : CUES) {
    if (t < c.t0 || t > c.t1) continue;
    const k = Math.min(fade(t, c.t0, .12), 1 - fade(t, c.t1 - .12, .12));
    g.globalAlpha = k; g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 18; g.font = SUB.font;
    g.lineJoin = 'round'; g.strokeStyle = 'rgba(10,11,13,.55)'; g.lineWidth = 5; g.strokeText(c.text, Wd / 2, Hd - 64);   // reads on the white worktop too
    g.fillStyle = INK; g.fillText(c.text, Wd / 2, Hd - 64);
    g.shadowBlur = 0; g.textAlign = 'left';
  }
  // end card, left; the station keeps turning on the right
  const k0 = T.card;
  if (t > k0) {
    const items = [
      { id: 'cardK', font: `500 18px ${MONO}`, col: ACC, text: 'PROPOSED LOCATION', y: 392, d: .1 },
      { id: 'cardT', font: `300 74px ${SANS}`, col: INK, text: 'Indirect Material', y: 480, d: .2 },
      { id: 'cardT2', font: `300 74px ${SANS}`, col: INK, text: 'Inspection Workstation', y: 560, d: .3 },
      { id: 'cardS', font: `400 20px ${MONO}`, col: DIM, text: 'Workbench · cabinet · cart · magnifier · 2 chairs', y: 630, d: .5 },
      { id: 'cardC', font: `400 17px ${MONO}`, col: DIM, text: '3D model built from the specification sheet', y: 668, d: .65 },
    ];
    g.globalAlpha = fade(t, k0, .5); g.fillStyle = ACC; g.fillRect(150, 345, 56 * eo(seg(t, k0, k0 + .6)), 4);
    for (const it of items) {
      const a = fade(t, k0 + it.d, .45); if (a <= 0) continue;
      g.globalAlpha = a; g.font = it.font; g.fillStyle = it.col; g.fillText(it.text, 150, it.y + (1 - a) * 10);
      if (a > .99) texts.push({ id: it.id, text: it.text, x0: 150, y0: it.y - 70, x1: 150 + g.measureText(it.text).width, y1: it.y + 12 });
    }
  }
  g.globalAlpha = 1;
}
