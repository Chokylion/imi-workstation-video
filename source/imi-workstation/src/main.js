// Indirect Material Inspection Workstation (Exploded Teardown style). render(t) draws one frame; everything is a function of t.
// Model in millimetres from the specification sheet: x along the bench (left −), y up, z toward the operator (+).
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makePost } from '/core/three/post.js';
import { clamp, lerp, seg, ss, eio, eo, track } from '/core/lib.js';
import { initOverlay, drawOverlay, overlayTexts, subcheck } from './overlay.js';
import * as TL from './timeline.js';

const { T, DUR, DROP, DROPDUR, DROPH, CAM } = TL;
const W = innerWidth || 1920, H = innerHeight || 1080;
const Q = new URLSearchParams(location.search);

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(2); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 30, 60000);
const SSAA = +(Q.get('ssaa') || 2);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: true, aoRadius: 55, aoThickness: 60, aoScale: 1.4, aoAmt: .6 });
post.bloom.strength = .32; post.bloom.radius = .5; post.bloom.threshold = 1.5;
post.vig.uniforms.amt.value = .32; post.vig.uniforms.contrast.value = .08; post.vig.uniforms.warm.value = .1;
{
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d');
  const gr = g.createRadialGradient(980, 460, 60, 960, 540, 1250);
  gr.addColorStop(0, '#36383c'); gr.addColorStop(.45, '#24262a'); gr.addColorStop(1, '#0d0e10');
  g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
}
const hdr = await new RGBELoader().loadAsync('/core/assets/polyhaven/photo_studio_loft_hall_2k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(hdr).texture;
scene.environmentIntensity = .42; scene.environmentRotation = new THREE.Euler(0, 1.9, 0);
RectAreaLightUniformsLib.init();
const key = new THREE.DirectionalLight('#fff6ee', 1.45);
key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
Object.assign(key.shadow.camera, { left: -3600, right: 3600, top: 3600, bottom: -3600, near: 500, far: 22000 });
key.shadow.bias = -.0004; key.shadow.normalBias = 2.5; key.shadow.radius = 5; key.shadow.blurSamples = 16;
scene.add(key, key.target);
const rim = new THREE.RectAreaLight('#dfe9ff', 1.7, 3400, 900); scene.add(rim);
const top = new THREE.RectAreaLight('#ffffff', .22, 4200, 4200); scene.add(top);
const fill = new THREE.DirectionalLight('#f2f5fa', .55); scene.add(fill, fill.target);   // soft front fill riding with the camera (no falloff), so faces toward the lens never go brown
const panel = new THREE.RectAreaLight('#fff6ea', 0, 1500, 280); scene.add(panel);       // the LED linear light, pointing down at the worktop
scene.add(new THREE.HemisphereLight('#c9d3e0', '#1a1712', .16));

// ---------- materials ----------
const M = {
  blue: new THREE.MeshPhysicalMaterial({ color: '#1f58a8', roughness: .42, clearcoat: .25, clearcoatRoughness: .5 }),        // powder-coated steel tube
  laminate: new THREE.MeshPhysicalMaterial({ color: '#eeede8', roughness: .38, clearcoat: .35, clearcoatRoughness: .35 }),   // white Formica
  edge: new THREE.MeshStandardMaterial({ color: '#ecebe7', roughness: .5 }),
  cabinet: new THREE.MeshPhysicalMaterial({ color: '#f1f1ee', roughness: .42, clearcoat: .15 }),
  cabIn: new THREE.MeshStandardMaterial({ color: '#c9c8c3', roughness: .7 }),
  recess: new THREE.MeshStandardMaterial({ color: '#2b2d31', roughness: .6 }),
  chrome: new THREE.MeshStandardMaterial({ color: '#d8dbe0', roughness: .16, metalness: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: '#cdd3da', roughness: .4, metalness: 1 }),       // stainless, brushed
  alu: new THREE.MeshStandardMaterial({ color: '#b9bdc2', roughness: .35, metalness: .9 }),
  housing: new THREE.MeshStandardMaterial({ color: '#5f636a', roughness: .55, metalness: .3 }),     // painted light housing: no mirror highlight before it switches on
  diffuser: new THREE.MeshStandardMaterial({ color: '#d9d9d6', emissive: '#fff4e4', emissiveIntensity: 0, roughness: .5 }),
  black: new THREE.MeshPhysicalMaterial({ color: '#2c2d31', roughness: .5, clearcoat: .2 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#232325', roughness: .9 }),
  outlet: new THREE.MeshStandardMaterial({ color: '#f0efea', roughness: .5 }),
  hole: new THREE.MeshStandardMaterial({ color: '#141415', roughness: .8 }),
  rockerOff: new THREE.MeshStandardMaterial({ color: '#7d2a22', roughness: .4, emissive: '#ff3b1f', emissiveIntensity: 0 }),
  vinyl: new THREE.MeshPhysicalMaterial({ color: '#1c4fb0', roughness: .55, sheen: .3, sheenRoughness: .7, sheenColor: '#9bb8ff' }),   // blue ESD seat
  lens: new THREE.MeshPhysicalMaterial({ color: '#cfe3ea', roughness: .05, metalness: 0, transparent: true, opacity: .35, clearcoat: 1 }),
  ledRing: new THREE.MeshStandardMaterial({ color: '#eeeeee', emissive: '#f4f8ff', emissiveIntensity: 0 }),
  esd: new THREE.MeshStandardMaterial({ color: '#f2c400', roughness: .5 }),
  tape: new THREE.MeshStandardMaterial({ color: '#f0c419', roughness: .6 }),
  card: new THREE.MeshStandardMaterial({ color: '#b48a5a', roughness: .85 }),
  bin: new THREE.MeshStandardMaterial({ color: '#5b6068', roughness: .6 }),
  ghost: new THREE.MeshPhysicalMaterial({ color: '#f3f1ea', emissive: '#ffffff', emissiveIntensity: .35, roughness: .6, transparent: true, opacity: 0, depthWrite: false }),
};
const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
const box = (w, h, d, mat, x, y, z, parent) => { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); parent.add(m); return m; };
const cyl = (r, h, mat, x, y, z, parent, seg = 32, axis = 'y') => {
  const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat)); m.position.set(x, y, z);
  if (axis === 'x') m.rotation.z = Math.PI / 2; if (axis === 'z') m.rotation.x = Math.PI / 2; parent.add(m); return m;
};
const rbox = (w, h, d, r, mat, x, y, z, parent) => { const m = sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat)); m.position.set(x, y, z); parent.add(m); return m; };

// ---------- the bench (1550 × 750 × 2200 mm) ----------
const XL = 755, ZF = 355, ZR = -355, TUBE = 40;      // tube centre lines; outer faces at ±775 and ±375
const TOP_Y = 850;                                   // worktop surface (not in the spec: a typical seated-inspection height, never labelled)
const parts = {};
for (const k of Object.keys(DROP)) { parts[k] = new THREE.Group(); scene.add(parts[k]); }
const F = parts.frame;
for (const s of [-1, 1]) {
  box(TUBE, 825, TUBE, M.blue, s * XL, 412.5, ZF, F);                     // front legs, up to the worktop
  box(TUBE, 2200, TUBE, M.blue, s * XL, 1100, ZR, F);                     // rear uprights: full height, nothing above the light
  box(TUBE, TUBE, 670, M.blue, s * XL, 120, 0, F);                        // foot rails
  box(TUBE, TUBE, 670, M.blue, s * XL, 805, 0, F);                        // apron, sides
  box(TUBE, TUBE, 720, M.blue, s * XL, 2180, ZR + 340, F);                // top arms: 700 mm forward from the frame
  const br = box(30, 368, 30, M.blue, s * XL, 2030, ZR + 150, F); br.rotation.x = Math.PI / 4;   // 45° support bracket
}
box(1470, TUBE, TUBE, M.blue, 0, 120, ZR, F);
box(1470, TUBE, TUBE, M.blue, 0, 805, ZF, F); box(1470, TUBE, TUBE, M.blue, 0, 805, ZR, F);
box(1470, TUBE, TUBE, M.blue, 0, 1430, ZR, F); box(1470, TUBE, TUBE, M.blue, 0, 1870, ZR, F);   // cabinet carriers
box(1470, TUBE, TUBE, M.blue, 0, 2180, ZR, F); box(1470, TUBE, TUBE, M.blue, 0, 2180, ZR + 680, F);
for (const s of [-1, 1]) for (const z of [ZF, ZR]) cyl(22, 14, M.rubber, s * XL, 7, z, F, 20);   // levelling feet

// worktop: 25 mm white laminate
const WT = parts.worktop;
{ const m = sh(new THREE.Mesh(new THREE.BoxGeometry(1550, 25, 750), M.laminate)); m.position.set(0, TOP_Y - 12.5, 0); WT.add(m); }

// power rail: 4 outlets, 1550 mm, at the rear
const RL = parts.rail;
box(1550, 56, 44, M.alu, 0, TOP_Y + 52, ZR + 42, RL);
const outletX = [-570, -190, 190, 570];
for (const x of outletX) {
  box(86, 44, 4, M.outlet, x, TOP_Y + 52, ZR + 66, RL);
  for (const dx of [-14, 14]) box(5, 13, 3, M.hole, x + dx, TOP_Y + 56, ZR + 68.5, RL);
  cyl(4, 3, M.hole, x, TOP_Y + 42, ZR + 68.5, RL, 12, 'z');
}

// upper cabinet: 1550 × 300 × 400, one full-width door (top-hinged), recessed pull, key lock
const CB = parts.cabinet;
const CY0 = 1450, CY1 = 1850, CZ0 = ZR + 20, CZ1 = CZ0 + 300;
box(1550, 400, 14, M.cabinet, 0, 1650, CZ0 + 7, CB);
box(1550, 14, 300, M.cabinet, 0, CY1 - 7, CZ0 + 150, CB); box(1550, 14, 300, M.cabinet, 0, CY0 + 7, CZ0 + 150, CB);
box(14, 400, 300, M.cabinet, -768, 1650, CZ0 + 150, CB); box(14, 400, 300, M.cabinet, 768, 1650, CZ0 + 150, CB);
box(1520, 10, 270, M.cabIn, 0, 1655, CZ0 + 150, CB);                                                  // shelf
for (const [x, w, h, mat] of [[-560, 260, 150, M.bin], [-260, 260, 150, M.bin], [160, 200, 120, M.card], [430, 240, 170, M.bin]]) box(w, h, 220, mat, x, CY0 + 14 + h / 2, CZ0 + 150, CB);
for (const [x, w, h] of [[-480, 300, 110], [120, 380, 130], [520, 200, 150]]) box(w, h, 200, M.card, x, 1660 + h / 2, CZ0 + 140, CB);
const door = new THREE.Group(); door.position.set(0, CY1, CZ1); CB.add(door);
box(1550, 400, 18, M.cabinet, 0, -200, 9, door);
box(180, 24, 8, M.recess, 0, -372, 15, door);                                                         // recessed pull handle
const lock = cyl(10, 10, M.chrome, 150, -372, 19, door, 24, 'z');
const lockSlot = box(2.5, 12, 3, M.hole, 150, -372, 25, door);

// LED linear light: 1550 × 300, 700 mm forward from the frame, with its ON/OFF switch
const LT = parts.light;
const LZ = ZR + 700 - 150;                                     // centre of the 300 mm fixture at the front of the arms
box(1550, 46, 300, M.housing, 0, 2137, LZ, LT);
const diff = sh(new THREE.Mesh(new THREE.PlaneGeometry(1500, 260), M.diffuser)); diff.rotation.x = Math.PI / 2; diff.position.set(0, 2113.5, LZ); LT.add(diff);
const swBox = box(56, 92, 36, M.black, XL, 1180, ZR + 38, LT);
const rocker = box(26, 40, 10, M.rockerOff, XL, 1180, ZR + 60, LT);

// ESD LED magnifying lamp at the left rear corner of the worktop
const LP = parts.lamp;
const lampBase = new THREE.Group(); lampBase.position.set(-705, TOP_Y, ZR + 60); LP.add(lampBase);
box(70, 40, 90, M.black, 0, 20, 0, lampBase); box(70, 90, 18, M.black, 0, -45, -36, lampBase);     // edge clamp
cyl(13, 130, M.black, 0, 95, 0, lampBase, 20);
const yaw = new THREE.Group(); yaw.position.y = 150; lampBase.add(yaw);
const sho = new THREE.Group(); yaw.add(sho);
for (const dx of [-14, 14]) cyl(7, 420, M.black, dx, 210, 0, sho, 12);
const spring1 = cyl(9, 220, M.chrome, 0, 230, 22, sho, 12);
const elb = new THREE.Group(); elb.position.y = 420; sho.add(elb);
cyl(18, 44, M.black, 0, 0, 0, elb, 20, 'x');
for (const dx of [-14, 14]) cyl(7, 420, M.black, dx, 210, 0, elb, 12);
const headJ = new THREE.Group(); headJ.position.y = 420; elb.add(headJ);
const head = new THREE.Group(); headJ.add(head);
{
  const yoke = box(20, 60, 20, M.black, 0, -20, 0, head);
  const ring = sh(new THREE.Mesh(new THREE.TorusGeometry(100, 20, 20, 64), M.black)); ring.rotation.x = Math.PI / 2; ring.position.set(0, -60, 110); head.add(ring);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(84, 84, 8, 48), M.lens); lens.position.set(0, -60, 110); head.add(lens);
  const led = new THREE.Mesh(new THREE.TorusGeometry(92, 4, 8, 64), M.ledRing); led.rotation.x = Math.PI / 2; led.position.set(0, -80, 110); head.add(led);
  box(150, 14, 18, M.black, 0, -60, 225, head);                                                       // front handle
  const esd = new THREE.Mesh(new THREE.CircleGeometry(16, 3), M.esd); esd.rotation.x = -Math.PI / 2; esd.rotation.z = Math.PI / 2; esd.position.set(0, -39, 40); head.add(esd);  // yellow ESD triangle
}
const LAMP_A = [-0.6, 0.35, 0.35], LAMP_B = [0.96, 0.88, 0.95];   // [yaw, shoulder, elbow] parked → over the centre
function setLamp(u) {
  const [a0, b0, c0] = LAMP_A, [a1, b1, c1] = LAMP_B;
  yaw.rotation.y = lerp(a0, a1, u); sho.rotation.x = lerp(b0, b1, u); elb.rotation.x = lerp(c0, c1, u);
  headJ.rotation.x = -(sho.rotation.x + elb.rotation.x);                                                // the lens stays level
}

// stainless steel material cart: 750 × 600 × 600 (handle above), on the left side
const CT = parts.cart;
const cart = new THREE.Group(); CT.add(cart);
const CART_X = -1260;
const wheels = [];
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  const fork = box(30, 70, 50, M.steel, sx * 250, 80, sz * 320, cart);
  const w = cyl(50, 32, M.rubber, sx * 250, 50, sz * 320, cart, 24, 'z'); wheels.push(w);
  box(25, 490, 25, M.steel, sx * 287, 355, sz * 362, cart);
}
for (const y of [190, 590]) {
  box(600, 8, 750, M.steel, 0, y - 26, 0, cart);
  box(600, 34, 6, M.steel, 0, y - 9, 372, cart); box(600, 34, 6, M.steel, 0, y - 9, -372, cart);
  box(6, 34, 750, M.steel, 297, y - 9, 0, cart); box(6, 34, 750, M.steel, -297, y - 9, 0, cart);
}
for (const sx of [-1, 1]) cyl(12, 340, M.steel, sx * 250, 760, -362, cart, 16);
cyl(14, 524, M.steel, 0, 930, -362, cart, 16, 'x');
const load = new THREE.Group(); cart.add(load);
box(260, 180, 320, M.card, -120, 664, -150, load); box(220, 140, 260, M.card, 140, 644, 180, load); box(380, 120, 300, M.bin, 0, 234, 0, load);

// two blue ESD operator chairs: foot ring, gas lift, five casters
function chair(parent) {
  const g = new THREE.Group(); parent.add(g);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + .3, arm = new THREE.Group(); arm.rotation.y = a; g.add(arm);
    box(34, 26, 300, M.alu, 0, 82, 150, arm); cyl(26, 22, M.rubber, 0, 30, 290, arm, 16, 'x'); box(20, 40, 20, M.black, 0, 60, 290, arm);
  }
  cyl(42, 60, M.alu, 0, 90, 0, g, 24);
  cyl(24, 430, M.black, 0, 330, 0, g, 20); cyl(17, 120, M.chrome, 0, 530, 0, g, 20);
  const ring = sh(new THREE.Mesh(new THREE.TorusGeometry(220, 11, 12, 64), M.chrome)); ring.rotation.x = Math.PI / 2; ring.position.y = 420; g.add(ring);
  for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.rotation.y = i / 3 * Math.PI * 2; g.add(s); box(10, 10, 200, M.chrome, 0, 420, 110, s); }
  box(300, 24, 260, M.black, 0, 595, 0, g);
  rbox(450, 80, 430, 28, M.vinyl, 0, 650, 0, g);
  box(40, 300, 26, M.black, 0, 760, 220, g);
  const back = rbox(400, 240, 70, 26, M.vinyl, 0, 940, 235, g); back.rotation.x = -.1;
  return g;
}
const chairs = [chair(parts.chairA), chair(parts.chairB)];
const CHAIR = [{ x: -390, z0: 1250, z1: 660 }, { x: 390, z0: 1250, z1: 660 }];

// ghost operators (1–2 per station): translucent seated figures, not characters
const ghosts = [];
function limb(a, b, r, parent) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(1, len - 2 * r), 6, 16), M.ghost);
  m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); parent.add(m); return m;
}
for (const c of chairs) {
  const g = new THREE.Group(); c.add(g); ghosts.push(g);
  limb([0, 760, 30], [0, 1180, 70], 115, g);                                     // torso
  const hd = new THREE.Mesh(new THREE.SphereGeometry(95, 24, 18), M.ghost); hd.position.set(0, 1360, 10); g.add(hd);
  for (const s of [-1, 1]) {
    limb([s * 100, 720, 20], [s * 110, 720, -380], 70, g);                      // thighs toward the bench
    limb([s * 110, 720, -380], [s * 120, 430, -250], 55, g);                    // shins down to the foot ring
    limb([s * 175, 1160, 60], [s * 200, 960, -150], 45, g);                     // upper arms
    limb([s * 200, 960, -150], [s * 130, 900, -420], 40, g);                    // forearms on the worktop
  }
}

// the location: a taped footprint on the floor
const tape = [];
{
  const X0 = -2020, X1 = 1120, Z0 = -780, Z1 = 1560, w = 50;
  const segs = [[X0, Z1, X1, Z1], [X1, Z1, X1, Z0], [X1, Z0, X0, Z0], [X0, Z0, X0, Z1]];
  segs.forEach(([x0, z0, x1, z1], i) => {
    const len = Math.hypot(x1 - x0, z1 - z0), g = new THREE.Group(); g.position.set(x0, 1, z0); g.rotation.y = Math.atan2(x1 - x0, z1 - z0); scene.add(g);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2, len + w), M.tape); m.receiveShadow = true; m.position.z = (len + w) / 2 - w / 2; g.add(m);
    tape.push({ g, m, t0: .25 + i * .8 });
  });
}
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.ShadowMaterial({ color: '#000000', opacity: .4 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// ---------- motion ----------
const land = k => DROP[k] + DROPDUR;
function dropY(k, t) {
  const u = seg(t, DROP[k], land(k));
  const fall = DROPH * (1 - u * u);                                                 // falls under gravity, lands on its half-beat
  const settle = u >= 1 ? -6 * Math.exp(-(t - land(k)) * 14) * Math.sin((t - land(k)) * 40) : 0;
  return u <= 0 ? 1e5 : fall + settle;
}
const cartX = t => {
  const out = eio(seg(t, T.cartOut, T.cartOut + 1.5)), back = eo(seg(t, T.cartBack, T.cartBack + 2.0));
  return CART_X - 2600 * out * (1 - back);
};
const chairZ = (i, t) => lerp(CHAIR[i].z0, CHAIR[i].z1, eio(seg(t, T.chairRoll + i * .35, T.chairRoll + i * .35 + 1.8)));
const lampU = t => eio(seg(t, T.lampSwing, T.lampSwing + 2.3));
const doorA = t => 1.2 * eio(seg(t, T.doorOpen, T.doorOpen + 1.3)) * (1 - eio(seg(t, T.doorClose, T.doorClose + .9)));
const lightOn = t => t >= T.light ? 1 - .25 * Math.exp(-(t - T.light) * 9) * (Math.sin((t - T.light) * 70) > 0 ? 1 : 0) : 0;   // a short flicker as the tube strikes

// ---------- camera: monotone keys ----------
const keys = CAM.map(k => {
  const [t, mode] = k; let eye, tgt, fov, shift;
  if (mode === 'o') {
    const [, , az, el, dist, tg, f, s] = k, A = az * Math.PI / 180, E = el * Math.PI / 180;
    tgt = new THREE.Vector3(...tg); eye = tgt.clone().add(new THREE.Vector3(dist * Math.cos(E) * Math.sin(A), dist * Math.sin(E), dist * Math.cos(E) * Math.cos(A))); fov = f; shift = s;
  } else { const [, , e, tg, f, s] = k; eye = new THREE.Vector3(...e); tgt = new THREE.Vector3(...tg); fov = f; shift = s; }
  return [t, [eye.x, eye.y, eye.z, tgt.x, tgt.y, tgt.z, fov, shift]];
});
const camAt = track(keys);
function setCamera(t) {
  const [ex, ey, ez, tx, ty, tz, fov, shift] = camAt(t);
  camera.position.set(ex, ey, ez); camera.fov = fov; camera.lookAt(tx, ty, tz);
  camera.setViewOffset(W, H, shift, 0, W, H); camera.updateProjectionMatrix();
  const dist = Math.hypot(ex - tx, ey - ty, ez - tz);
  post.dof.focus = dist; post.dof.aper = 2.6 * dist / 7; post.dof.maxCoc = 9;
  const A = Math.atan2(ex - tx, ez - tz), la = A - .9;
  key.position.set(-5200 * Math.cos(la) + 600, 7600, 5200 * Math.sin(la) + 2600); key.target.position.set(0, 600, 0);
  rim.position.set(4800 * Math.sin(A + 2.6), 2600, 4800 * Math.cos(A + 2.6)); rim.lookAt(0, 900, 0);
  top.position.set(0, 7000, 0); top.lookAt(0, 0, 0);
  fill.position.set(ex, ey + 900, ez); fill.target.position.set(tx, ty, tz);
}

// ---------- events for the mixer (window.EV) ----------
const EV = [];
tape.forEach((s, i) => EV.push({ t: s.t0, type: 'tape', n: i }));
for (const k of Object.keys(DROP)) EV.push({ t: DROP[k], type: 'drop', part: k }, { t: +land(k).toFixed(3), type: 'land', part: k });
EV.push({ t: T.cartOut, type: 'roll', d: 1.5, pan: -.7 }, { t: T.cartBack, type: 'roll', d: 2.0, pan: -.6 }, { t: T.cartBack + 2.0, type: 'cartStop' });
EV.push({ t: T.quiet, type: 'quiet' }, { t: T.light, type: 'switch' }, { t: T.light + .05, type: 'hum' });
EV.push({ t: T.lampSwing, type: 'creak', d: 2.3 }, { t: T.lampSwing + 2.3, type: 'lampStop' });
EV.push({ t: T.doorOpen, type: 'doorOpen' }, { t: T.doorClose + .9, type: 'doorShut' }, { t: T.key, type: 'key' });
EV.push({ t: T.chairRoll, type: 'roll', d: 1.8, pan: -.3 }, { t: T.chairRoll + .35, type: 'roll', d: 1.8, pan: .3 }, { t: T.ghosts, type: 'ghost' });
EV.push({ t: T.quiet2, type: 'quiet' }, { t: T.pull, type: 'pull' }, { t: T.card, type: 'card' });
for (const [id, [t0]] of Object.entries(TL.LBL)) EV.push({ t: t0, type: id.startsWith('dim') || id === 'reach' ? 'dim' : 'label', id });
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR;

// ---------- anchors for the overlay (world points, read after the pose is set) ----------
const wp = (obj, x = 0, y = 0, z = 0) => obj.localToWorld(new THREE.Vector3(x, y, z));
const anchors = {
  frame: () => wp(F, -380, 790, ZF + 20), top: () => wp(WT, -60, TOP_Y - 12, 375),
  cart: () => wp(cart, 300, 560, 300),
  led: () => wp(LT, 420, 2114, LZ + 60), bracket: () => wp(F, XL, 2030, ZR + 150), sw: () => wp(rocker, 0, 0, 6),
  lamp: () => wp(head, 0, -40, 110),
  cab: () => wp(CB, -420, 1760, CZ1 + 2), lock: () => wp(door, 150, -372, 24),
  rail: () => wp(RL, 190, TOP_Y + 52, ZR + 70),
  chair: () => wp(chairs[1], 0, 950, 270), ops: () => wp(ghosts[0], 0, 1380, 10),
  tape: () => new THREE.Vector3(-2020, 0, 1560),
};

// ---------- frame ----------
await initOverlay();
window.render = t => {
  for (const k of Object.keys(DROP)) { const y = dropY(k, t); parts[k].visible = y < 1e4; parts[k].position.y = y; }
  for (const s of tape) { const u = eio(seg(t, s.t0, s.t0 + .8)); s.g.visible = u > 0; s.m.scale.z = Math.max(1e-3, u); s.m.position.z = s.m.geometry.parameters.depth * u / 2 - 25; }
  const cx = cartX(t); cart.position.x = cx; for (const w of wheels) w.rotation.y = (cx - CART_X) / 50;
  load.visible = t < T.cartOut + .8 ? false : true;                       // empty when it leaves, loaded when it comes back
  for (let i = 0; i < 2; i++) { chairs[i].position.set(CHAIR[i].x, 0, chairZ(i, t)); chairs[i].rotation.y = Math.PI * (i ? .06 : -.06) * (1 - eio(seg(t, T.chairRoll, T.chairRoll + 2.2))); }
  M.ghost.opacity = .26 * ss(seg(t, T.ghosts, T.ghosts + 1.0)) * (1 - ss(seg(t, T.pull + 1.2, T.pull + 2.2)) * .35);
  for (const g of ghosts) g.visible = M.ghost.opacity > .005;
  setLamp(lampU(t)); M.ledRing.emissiveIntensity = 2.2 * seg(t, T.lampSwing + 1.8, T.lampSwing + 2.4);
  door.rotation.x = -doorA(t);
  const kt = seg(t, T.key, T.key + .3); lock.rotation.z = Math.PI / 2 * eio(kt); lockSlot.rotation.z = Math.PI / 2 * eio(kt);
  const on = lightOn(t);
  M.diffuser.emissiveIntensity = 1.9 * on; panel.intensity = 3.6 * on;
  rocker.rotation.x = on > 0 ? -.25 : .25; M.rockerOff.emissiveIntensity = .9 * on;
  panel.position.set(0, 2105, LZ); panel.lookAt(0, 0, LZ);
  setCamera(t);
  post.composer.render();
  drawOverlay(t, camera, { anchors, W, H });
};
window.TEXTS = () => overlayTexts();
window.DBG = t => ({ cam: camAt(t).map(v => +v.toFixed(0)) });
await document.fonts.ready;
window.SUBCHECK = subcheck();
window.render(Number(Q.get('t') || 0));
window.READY = true;
