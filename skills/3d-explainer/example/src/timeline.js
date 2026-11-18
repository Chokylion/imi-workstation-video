// Indirect Material Inspection Workstation v2: the single timeline (seconds). Picture, voice, score, subtitles and checks read this file.
// 90 BPM, 4/4: one beat = 0.6667 s, one bar = 2.6667 s. Landings, the switch and the cuts sit on beats.
// v2 (from "Indirect Material location.pptx"): 30 mm ESD worktop, lower shelf, 2-level cart, ESD bin, 8X lamp, tools in the cabinet, notebook.
export const BPM = 90;
export const BEAT = 60 / BPM, BAR = 4 * BEAT;
export const b = (bar, beat = 0) => +((bar - 1) * BAR + beat * BEAT).toFixed(4);

export const T = {
  floor: 0, assemble: b(3), measure: b(6), material: b(9), shelf: b(12), cart: b(14), cartOut: b(14, .2), cartBack: b(14, 2.5), binFlap: b(17, 1),
  quiet: b(18, 2.4), light: b(19), lamp: b(22), lampSwing: b(22, 1.5), cabinet: b(25), doorOpen: b(25, 1.5), tools: b(27, 1.5), doorClose: b(29, 3),
  key: b(30, .5), rail: b(31, 1), note: b(32, 3.4), chairs: b(35), chairRoll: b(35, .3), ghosts: b(36, .5), quiet2: b(37, 2.5), pull: b(38), card: b(40), end: b(42, 2.5),
};
export const DUR = T.end;

// assembly: each part drops into place in a wave (top of the stack last), each landing on a half-beat
export const DROP = {
  frame: b(3), shelf: b(3, .5), worktop: b(3, 1), rail: b(3, 2), cabinet: b(3, 3), light: b(4), lamp: b(4, 1), notebook: b(4, 1.5),
  cart: b(4, 2), bin: b(4, 2.5), chairA: b(4, 3), chairB: b(4, 3.5),
};
export const DROPDUR = .9, DROPH = 1100;   // fall time (s) and height (mm)

// narration (Kokoro af_heart, English): `say` is in voice/lines.json, `en` is the subtitle (digits, as on the spec sheet)
export const VO = [
  { id: 'l01', t: 0.6, en: "We're setting up a new location: the Indirect Material Inspection station." },
  { id: 'l02', t: 5.9, en: 'One workbench, one material cart, one magnifying lamp, a notebook, and seats for 1 or 2 operators.' },
  { id: 'l03', t: 13.6, en: 'The bench is 1550 mm long, 750 deep, and 2200 tall.' },
  { id: 'l04', t: 21.5, en: 'A blue, powder-coated steel frame carries a 30 mm worktop, with a white ESD dissipative laminate.' },
  { id: 'l05', t: 29.5, en: 'Below, a lower shelf in the same laminate, its edge protected by a stainless steel angle.' },
  { id: 'l06', t: 35.55, en: 'On the left, a 2-level stainless steel cart brings material in, and takes it back when the check is done.' },
  { id: 'l07', t: 42.0, en: 'Beside it, a black ESD bin for waste, with a push lid.' },
  { id: 'l08', t: 48.63, en: 'The LED panel reaches 700 mm forward, on angled brackets, lighting the whole worktop.' },
  { id: 'l09', t: 56.33, en: 'At the left rear corner, an 8× ESD magnifying lamp swings over the center, for close visual checks.' },
  { id: 'l10', t: 64.3, en: 'Above, a full-length cabinet, with one wide door and a key lock, keeps the measuring tools secure.' },
  { id: 'l11', t: 70.65, en: 'Inside: digital verniers, a micrometer on its stand, a thickness gauge, a tape measure, and a steel ruler.' },
  { id: 'l12', t: 80.6, en: 'Along the back, a 4-outlet power rail.' },
  { id: 'l13', t: 84.9, en: 'On the right side, a notebook computer.' },
  { id: 'l14', t: 90.93, en: 'Two blue ESD chairs, with foot rings and casters, seat 1 or 2 operators.' },
  { id: 'l15', t: 99.33, en: 'One location. Everything the inspector needs, within reach.' },
];

// label and dimension windows [t0, t1]; anchors and words live in overlay.js
export const LBL = {
  dimL: [14.5, 21.2], dimD: [15.6, 21.2], dimH: [16.7, 21.2], dimTop: [17.0, 21.2],
  frame: [21.9, 27.4], top: [23.2, 28.8],
  shelf: [30.1, 35.0],
  cart: [37.6, 42.7], bin: [42.4, 46.3],
  led: [49.33, 55.73], reach: [50.93, 55.73], bracket: [52.13, 55.83], sw: [52.63, 55.83],
  lamp: [57.93, 63.63],
  cab: [65.3, 69.9], tools: [70.75, 76.75], lock: [76.8, 80.5],
  rail: [80.7, 84.6], note: [85.0, 89.2],
  chair: [91.73, 97.93], ops: [93.93, 97.93],
};

// camera: [t, 'o', az°, el°, dist, target[x,y,z], fov, shiftX] or [t, 'l', eye[x,y,z], target[x,y,z], fov, shiftX]
// world millimetres: x along the bench (left −), y up, z toward the front (+); az 0 looks at the front of the bench
export const CAM = [
  [0.0, 'o', 38, 40, 8200, [-450, 200, 350], 30, 0],
  [5.2, 'o', 31, 34, 7300, [-450, 500, 300], 30, 0],
  [9.5, 'o', 12, 25, 7700, [-420, 950, 150], 30, 0],
  [13.1, 'o', -16, 21, 7400, [-200, 1050, 50], 30, 0],
  [14.2, 'o', -24, 23, 6300, [0, 1050, 0], 30, 160],
  [20.9, 'o', -36, 25, 6050, [0, 1050, 0], 30, 160],
  [21.9, 'l', [560, 945, 1080], [120, 885, 380], 32, 0],                 // macro: frame tube and worktop edge
  [27.6, 'l', [60, 955, 1100], [-320, 872, 380], 32, 0],
  [29.0, 'l', [1500, 560, 600], [-200, 330, -170], 32, 0],             // under the worktop: the lower shelf
  [34.6, 'l', [1350, 540, 520], [-100, 320, -170], 32, 0],
  [35.6, 'l', [-2550, 1500, 3050], [-1250, 500, 0], 30, 0],              // the cart, then the bin beside it
  [42.0, 'l', [-2300, 1450, 2900], [-1150, 540, 50], 30, 0],
  [42.7, 'l', [-1900, 1050, 2300], [-1000, 330, 560], 32, 0],
  [46.4, 'l', [-1750, 1000, 2150], [-980, 330, 560], 32, 0],
  [47.83, 'l', [520, 1190, 2700], [180, 1860, 0], 32, 0],
  [55.63, 'l', [1050, 1390, 2600], [260, 1900, 40], 32, 0],
  [56.53, 'l', [250, 1690, 2000], [-420, 1120, -60], 32, 0],
  [63.53, 'l', [80, 1560, 1650], [-380, 1100, -20], 32, 0],
  [64.33, 'l', [380, 1540, 2350], [0, 1640, -200], 30, 0],                // the cabinet, door opening
  [69.9, 'l', [300, 1600, 1950], [0, 1640, -200], 30, 0],
  [70.6, 'l', [200, 1900, 1000], [-80, 1520, -200], 32, 0],               // into the open cabinet: the measuring tools
  [76.5, 'l', [80, 1880, 900], [-180, 1515, -200], 32, 0],
  [77.0, 'l', [420, 1520, 1900], [100, 1600, -150], 30, 0],               // the door shuts, the key turns
  [80.4, 'l', [370, 1530, 1780], [100, 1600, -150], 30, 0],
  [80.7, 'l', [-80, 1080, 850], [-190, 945, -330], 32, 0],                // the power rail
  [84.3, 'l', [-130, 1075, 770], [-235, 945, -330], 32, 0],
  [84.9, 'l', [1250, 1450, 1500], [540, 960, 60], 32, 0],                 // the notebook, right side
  [89.2, 'l', [1130, 1415, 1380], [520, 960, 60], 32, 0],
  [91.23, 'o', 22, 9, 4700, [0, 790, 350], 30, 0],
  [98.23, 'o', 36, 12, 4500, [0, 840, 350], 30, 0],
  [100.93, 'o', 32, 31, 8600, [-450, 840, 250], 30, 0],
  [103.83, 'o', 30, 30, 8400, [-450, 840, 250], 30, -320],
  [111.0, 'o', 44, 28, 7900, [-450, 840, 250], 30, -320],
];
