// Indirect Material Inspection Workstation: the single timeline (seconds). Picture, voice, score, subtitles and checks read this file.
// 90 BPM, 4/4: one beat = 0.6667 s, one bar = 2.6667 s. Landings, the switch and the cuts sit on beats.
export const BPM = 90;
export const BEAT = 60 / BPM, BAR = 4 * BEAT;
export const b = (bar, beat = 0) => +((bar - 1) * BAR + beat * BEAT).toFixed(4);

export const T = {
  floor: 0, assemble: b(3), measure: b(6), material: b(9), cart: b(11), cartOut: b(11, .4), cartBack: b(12, 1),
  quiet: b(13, 2.4), light: b(14), lamp: b(17), lampSwing: b(17, 1.5), cabinet: b(20), doorOpen: b(20, 1.5), doorClose: b(22, 1),
  key: b(22, 2.8), rail: b(22, 3.5), chairs: b(24), chairRoll: b(24, .3), ghosts: b(25, .5), quiet2: b(26, 2.5), pull: b(27), card: b(29), end: b(31),
};
export const DUR = T.end;

// assembly: each part drops into place in a wave (top of the stack last), each landing on a half-beat
export const DROP = {
  frame: b(3), worktop: b(3, 1), rail: b(3, 2), cabinet: b(3, 3), light: b(4), lamp: b(4, 1), cart: b(4, 2), chairA: b(4, 3), chairB: b(4, 3.5),
};
export const DROPDUR = .9, DROPH = 1100;   // fall time (s) and height (mm)

// narration (Kokoro af_heart, English): `say` is in voice/lines.json, `en` is the subtitle (digits, as on the spec sheet)
export const VO = [
  { id: 'l01', t: 0.6, en: "We're setting up a new location: the Indirect Material Inspection station." },
  { id: 'l02', t: 5.9, en: 'One workbench, one material cart, one magnifying lamp, and seats for 1 or 2 operators.' },
  { id: 'l03', t: 13.6, en: 'The bench is 1550 mm long, 750 deep, and 2200 tall.' },
  { id: 'l04', t: 21.6, en: 'A blue, powder-coated steel frame carries a 25 mm white laminate top.' },
  { id: 'l05', t: 27.4, en: 'On the left, a stainless steel cart brings material in, and takes it back when the check is done.' },
  { id: 'l06', t: 35.3, en: 'The LED panel reaches 700 mm forward, on angled brackets, lighting the whole worktop.' },
  { id: 'l07', t: 43.0, en: 'At the left rear corner, an ESD magnifying lamp swings over the center, for close visual checks.' },
  { id: 'l08', t: 50.9, en: 'Above, a full-length cabinet, with one wide door and a key lock, keeps tools and samples secure.' },
  { id: 'l09', t: 57.3, en: 'Along the back, a 4-outlet power rail.' },
  { id: 'l10', t: 61.6, en: 'Two blue ESD chairs, with foot rings and casters, seat 1 or 2 operators.' },
  { id: 'l11', t: 70.0, en: 'One location. Everything the inspector needs, within reach.' },
];

// label and dimension windows [t0, t1]; anchors and words live in overlay.js
export const LBL = {
  dimL: [14.5, 21.0], dimD: [16.2, 21.0], dimH: [17.6, 21.0],
  frame: [21.9, 27.0], top: [23.2, 27.1],
  cart: [29.4, 34.0],
  led: [36.0, 42.4], reach: [37.6, 42.4], bracket: [38.8, 42.5], sw: [39.3, 42.5],
  lamp: [44.6, 50.3],
  cab: [52.0, 56.6], lock: [53.0, 57.0],
  rail: [57.3, 61.2],
  chair: [62.4, 68.6], ops: [64.6, 68.6],
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
  [21.9, 'l', [560, 905, 1080], [120, 845, 380], 32, 0],
  [26.4, 'l', [160, 915, 1100], [-260, 832, 380], 32, 0],
  [27.6, 'l', [-2550, 1500, 3050], [-1250, 480, 0], 30, 0],
  [33.4, 'l', [-2300, 1450, 2900], [-1150, 520, 0], 30, 0],
  [34.5, 'l', [520, 1150, 2700], [180, 1820, 0], 32, 0],
  [42.3, 'l', [1050, 1350, 2600], [260, 1860, 40], 32, 0],
  [43.2, 'l', [250, 1650, 2000], [-420, 1080, -60], 32, 0],
  [50.2, 'l', [80, 1520, 1650], [-380, 1060, -20], 32, 0],
  [51.0, 'l', [380, 1500, 2350], [0, 1600, -200], 30, 0],
  [56.6, 'l', [300, 1560, 1950], [0, 1600, -200], 30, 0],
  [57.4, 'l', [760, 1330, 1050], [120, 900, -300], 32, 0],
  [61.0, 'l', [620, 1300, 980], [40, 900, -300], 32, 0],
  [61.9, 'o', 22, 9, 4700, [0, 750, 350], 30, 0],
  [68.9, 'o', 36, 12, 4500, [0, 800, 350], 30, 0],
  [71.6, 'o', 32, 31, 8600, [-450, 800, 250], 30, 0],
  [74.5, 'o', 30, 30, 8400, [-450, 800, 250], 30, -320],
  [80.0, 'o', 42, 28, 8000, [-450, 800, 250], 30, -320],
];
