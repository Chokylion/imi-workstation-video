"""Indirect Material Inspection Workstation v2: score, foley, voice and mix -> out/mix.wav (+ out/stems/).
90 BPM in G: dry marimba and a round synth bass while the station assembles and the material moves, bowed vibraphone
and glockenspiel once the light is on, a full groove for the people, G major on the end card. Two near-silences:
before the switch and before the pull back. Foley is synthesised and placed from events.json (window.EV).
"""
import os, sys, json
import numpy as np, soundfile as sf, soxr
from scipy.ndimage import uniform_filter1d, maximum_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, noise, lp, hp, bp, env_exp, t_, norm, compress, limit

S.seed(7)
EVJ = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8'))
DUR = EVJ['dur']; EV = EVJ['ev']
TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
T, VO, BPM = TL['T'], TL['VO'], TL['BPM']
BEAT = 60 / BPM; BAR = 4 * BEAT
N = int((DUR + 1.5) * SR)
def buf(): return np.zeros((N, 2), np.float32)
def b(bar, beat=0): return (bar - 1) * BAR + beat * BEAT
rng = np.random.default_rng(11)

# ---------------- score ----------------
CH = [['G3', 'B3', 'D4', 'F#4', 'A4'], ['E3', 'G3', 'B3', 'D4', 'F#4'], ['C3', 'E3', 'G3', 'B3', 'D4'], ['D3', 'F#3', 'A3', 'B3', 'E4']]
ROOT = [43, 40, 36, 38]          # G2 E2 C2 D2 (midi), synthesised bass
def up(p, n): return S.name(S.midi(p) + 12 * n)
ev, kick_t, bass_n = [], [], []
def sec(bar):
    t = b(bar)
    if t < T['assemble']: return 'floor'
    if t < T['measure']: return 'build'
    if t < T['cart']: return 'calm'
    if t < T['quiet']: return 'cart'
    if t < T['cabinet']: return 'light'
    if t < T['chairs']: return 'cab'
    if t < T['pull']: return 'people'
    if t < T['card']: return 'close'
    return 'card'
PAT = [0, 2, 4, 2, 1, 3, 4, 3]
quiet = [(T['quiet'], T['light']), (T['quiet2'], T['pull'])]
def silent(t): return any(a - .02 <= t < z for a, z in quiet)
for bar in range(1, int(round(T['card'] / BAR)) + 1):
    t0 = b(bar); c = CH[(bar - 1) % 4]; r = ROOT[(bar - 1) % 4]; s = sec(bar)
    def mar(n_per_beat, vel, gain=1.0, octave=1):
        step = BEAT / n_per_beat
        for i in range(int(4 * n_per_beat)):
            t = t0 + i * step
            if silent(t) or t >= T['card'] - .02: continue
            ev.append((t, 'marimba', up(c[PAT[i % 8]], octave + (i % 8 == 2)), .3, vel + .16 * (i % n_per_beat == 0), [-.35, .35][i % 2], gain))
    def bass(pattern=(0, 1.5, 2, 3)):
        for k in pattern:
            t = t0 + k * BEAT
            if not silent(t) and t < T['card'] - .02: bass_n.append((t, r, BEAT * .85))
    def kicks(beats, v):
        for k in beats:
            t = t0 + k * BEAT
            if not silent(t) and t < T['card'] - .02: kick_t.append((t, v))
    def hats(n, vel, var='closed'):
        for i in range(4 * n):
            t = t0 + i * BEAT / n
            if not silent(t) and t < T['card'] - .02: ev.append((t, 'hihat', var, None, vel + .12 * (i % 2 == 0), -.3, .3))
    if s == 'floor':
        for k, idx in [(0, 2), (1.5, 4), (2.5, 3)]: ev.append((t0 + k * BEAT, 'vibraphone', up(c[idx], 0), 1.6, .36, .2 - .2 * k, .9))
        ev.append((t0, 'vibraphone_bowed', c[1], BAR * .95, .34, 0, .7))
    elif s == 'build':
        mar(2, .42); bass(); kicks((0, 2), .95); hats(2, .25)
    elif s == 'calm':
        mar(2, .32, .8); bass((0, 2, 3)); hats(2, .18, 'pedal')
        if bar % 2 == 0: ev.append((t0, 'vibraphone_bowed', up(c[2], 0), BAR * 1.02, .32, -.2, .6))
    elif s == 'cart':
        mar(4, .38, .85); bass(); kicks((0, 2), .9); hats(4, .2)
    elif s == 'light':
        for j, p in enumerate(c[1:4]): ev.append((t0 + j * .05, 'vibraphone_bowed', up(p, 0), BAR * 1.02, .4, -.4 + .4 * j, .8))
        for k, idx in [(0, 4), (1.5, 2), (2.5, 3)]: ev.append((t0 + k * BEAT, 'vibraphone', up(c[idx], 1), 1.4, .3, .3 - .2 * k, .55))
        kicks((0,), .5); hats(2, .15, 'pedal')
    elif s == 'cab':
        mar(2, .4, .9); bass(); kicks((0, 2), .85); hats(2, .22)
    elif s == 'people':
        mar(4, .42, .95); bass((0, 1.5, 2, 3, 3.5)); kicks((0, 1, 2, 3), .9); hats(4, .24)
        ev.append((t0 + BEAT, 'hihat', 'open', None, .3, .3, .25))
    elif s == 'close':
        mar(2, .4, .9); bass((0, 2)); kicks((0,), 1.0)
# end card: one hit, a rolled G major chord, glockenspiel answering the opening vibraphone
tc = T['card']; kick_t.append((tc, 1.15)); bass_n.append((tc, 43, 3.2))
for j, p in enumerate(['G2', 'D3', 'G3', 'B3', 'D4', 'G4']): ev.append((tc + j * .05, 'marimba', p, 2.6, .6, -.5 + .2 * j, 1.0))
for p in ['G3', 'B3', 'D4']: ev.append((tc, 'vibraphone_bowed', p, 4.6, .42, 0, .8))
for k, p in [(1.0, 'D6'), (1.5, 'B5'), (2.0, 'G6')]: ev.append((tc + k * BEAT * 2, 'glockenspiel', p, 2.2, .38, .25, .42))
# the switch: a rising glockenspiel figure as the light strikes; one ping per stop
for i, p in enumerate(['G5', 'B5', 'D6', 'F#6', 'A6']): ev.append((T['light'] + .08 + i * .07, 'glockenspiel', p, 1.6, .32, -.4 + .2 * i, .4))
for e in EV:
    GL = {'shelf': 'B5', 'cart': 'D6', 'bin': 'B5', 'lamp': 'G6', 'cab': 'B5', 'tools': 'D6', 'rail': 'D6', 'note': 'B5', 'chair': 'G6'}
    if e['type'] == 'label' and e['id'] in GL:
        ev.append((e['t'], 'glockenspiel', GL[e['id']], 1.8, .34, .2, .36))

music = np.asarray(S.render([e for e in ev if e[0] < DUR], dur=N / SR, master=False), np.float32)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def bassnote(m, d):                             # round bass: sine with 2nd/3rd harmonics, soft pluck
    tt = t_(d + .15); f = hz(m)
    x = np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)
    e = (1 - np.exp(-tt / .006)) * np.exp(-tt / .9) * np.clip((d + .15 - tt) / .15, 0, 1)
    return lp(x * e, 1400) * .6
def kick(v=1.0):
    d = .45; tt = t_(d); f = 52 + 88 * np.exp(-tt / .035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * env_exp(d, .15) + np.sin(2 * ph) * .25 * env_exp(d, .05) + hp(noise(d), 3000) * env_exp(d, .003) * .25) * v
pulse = buf()
for t, m, d in bass_n: add(pulse, bassnote(m, d), t, .5)
for t, v in kick_t: add(pulse, kick(v), t, .5)

# ---------------- foley ----------------
fol = buf()
def tick(v=1.0, f=5200):
    d = .03; tt = t_(d); return norm(np.sin(2 * np.pi * f * tt) * env_exp(d, .003) + hp(noise(d), 6000) * env_exp(d, .001) * .4) * v
def pen(v=1.0, d=.55):
    tt = t_(d); return norm(bp(noise(d), 3000, 9000) * np.sin(np.pi * tt / d) ** 2 * (1 + .3 * np.sin(2 * np.pi * 31 * tt))) * v
def tape_pull(d=.8):                           # floor tape unrolling: a crackly peel
    tt = t_(d); crack = (rng.random(len(tt)) < .02) * rng.standard_normal(len(tt))
    return norm(bp(noise(d) * .3 + crack * 3, 1500, 7000) * np.sin(np.pi * tt / d) ** .6)
def swoosh(d=.6, rise=True):
    n = noise(d); out = np.zeros_like(n); tt = t_(d)
    for i in range(0, len(n), 480):
        hi = min(len(n), i + 480); u = i / len(n); u = u if rise else 1 - u
        f = 300 + 3600 * u ** 1.5; out[i:hi] = bp(n[max(0, i - 2400):hi], f * .6, f * 1.4)[-(hi - i):]
    return norm(out * np.sin(np.pi * tt / d) ** 1.5)
def thud(v=1.0, f=70, d=.45):
    tt = t_(d); return norm(np.sin(2 * np.pi * f * tt * (1 - .2 * tt)) * env_exp(d, .09) + lp(noise(d), 400) * env_exp(d, .025) * .6) * v
def clank(f=420, v=1.0, d=1.0):                # steel tube / frame: inharmonic ring with a dull knock
    tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * k * tt + rng.random()) * env_exp(d, tau) for k, a, tau in [(1, 1, .32), (2.32, .6, .2), (4.1, .35, .12), (6.7, .2, .06)])
    return norm(x + lp(noise(d), 700) * env_exp(d, .02) * 1.2) * v
def board(v=1.0, f=180):                       # laminate top / cabinet panel: dry wooden knock
    d = .25; tt = t_(d); return norm(bp(noise(d), 300, 2200) * env_exp(d, .015) + np.sin(2 * np.pi * f * tt) * env_exp(d, .05) * .8) * v
def rattle(d=.5, v=1.0):                       # trays on the cart
    tt = t_(d); hits = (rng.random(len(tt)) < .0015) * rng.standard_normal(len(tt)) * 4
    return norm(bp(hits + noise(d) * .05, 1800, 7000) * np.exp(-tt / (d * .6))) * v
def casters(d=1.5, v=1.0):                     # wheels on a smooth floor: low rumble with grit
    tt = t_(d); x = lp(noise(d), 260) + bp(noise(d), 1200, 3500) * .08 * (1 + np.sin(2 * np.pi * 9 * tt))
    return norm(x * np.sin(np.pi * tt / d) ** .5) * v
def switch(v=1.0):                             # rocker switch: sharp click + low thock
    d = .14; tt = t_(d)
    return norm(hp(noise(d), 4000) * env_exp(d, .0012) + np.sin(2 * np.pi * 2900 * tt) * env_exp(d, .004) * .4 + np.sin(2 * np.pi * 210 * tt) * env_exp(d, .025) * .9) * v
def creak(d=2.3, v=1.0):                       # spring-balanced arm moving
    tt = t_(d); f = 900 + 250 * np.sin(2 * np.pi * .9 * tt)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (rng.random(len(tt)) < .3) * .3 + bp(noise(d), 2500, 6000) * .2
    return norm(x * np.sin(np.pi * tt / d) ** 2) * v
def hinge(d=1.3):
    tt = t_(d); f = 520 + 180 * tt / d; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + bp(noise(d), 600, 2500) * .3
    return norm(x * np.sin(np.pi * tt / d) ** 1.2)
def puff(d=.5):                                # gas lift settling
    tt = t_(d); return norm(bp(noise(d), 1500, 6000) * np.exp(-tt / .12))
def shimmer(d=1.2):
    tt = t_(d); x = sum(np.sin(2 * np.pi * f * tt + k) for k, f in enumerate([2093, 2637, 3136, 3951]))
    return norm(x * np.sin(np.pi * tt / d) ** 2 * (1 + .4 * np.sin(2 * np.pi * 6 * tt)))

def layer(*xs):                               # sum sounds of different lengths
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
LANDS = {'frame': lambda: layer(clank(380, 1, 1.1) * .7, thud(1, 60) * .6), 'worktop': lambda: board(1, 150), 'rail': lambda: clank(1300, 1, .5),
         'cabinet': lambda: layer(board(1, 110) * .8, thud(.8, 80) * .5), 'light': lambda: clank(900, 1, .7), 'lamp': lambda: board(.8, 420),
         'cart': lambda: layer(rattle(.6), clank(700, .7, .5) * .5), 'shelf': lambda: board(.9, 200), 'notebook': lambda: board(.5, 640),
         'bin': lambda: layer(thud(.6, 120, .3), board(.5, 300)), 'chairA': lambda: layer(thud(.7, 95, .3), rattle(.3) * .3), 'chairB': lambda: layer(thud(.7, 100, .3), rattle(.3) * .3)}
PAN = {'frame': 0, 'shelf': 0, 'notebook': .4, 'bin': -.6, 'worktop': 0, 'rail': .1, 'cabinet': 0, 'light': .1, 'lamp': -.4, 'cart': -.7, 'chairA': -.3, 'chairB': .3}
hum_t = None
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'tape': add(fol, tape_pull(.8), t, .1, [.4, .5, -.3, -.5][e['n']]); add(fol, tick(1, 4200), t + .8, .05)
    elif ty == 'drop': add(fol, swoosh(.8, True), t + .1, .09, PAN[e['part']])
    elif ty == 'land': add(fol, LANDS[e['part']](), t, .34, PAN[e['part']])
    elif ty == 'roll': add(fol, casters(e['d']), t, .22, e.get('pan', 0)); add(fol, rattle(e['d'] * .8, .6), t + .1, .08, e.get('pan', 0))
    elif ty == 'cartStop': add(fol, rattle(.4), t, .16, -.6); add(fol, clank(760, .6, .4), t, .08, -.6)
    elif ty == 'switch': add(fol, switch(1), t, .55, .4)
    elif ty == 'hum': hum_t = t
    elif ty == 'creak': add(fol, creak(e['d']), t, .07, -.3)
    elif ty == 'lampStop': add(fol, board(.6, 520), t, .12, -.2)
    elif ty == 'doorOpen': add(fol, hinge(1.3), t, .12); add(fol, puff(.9), t + .2, .06)
    elif ty == 'doorShut': add(fol, board(1, 120), t, .35); add(fol, tick(1, 3000), t + .03, .12)
    elif ty == 'key': add(fol, tick(1, 2600), t, .12, .2); add(fol, tick(1, 3400), t + .22, .14, .2)
    elif ty == 'flap': add(fol, board(.7, 260), e['t'], .14, -.6); add(fol, board(.4, 330), e['t'] + .35, .08, -.6)
    elif ty == 'wake': add(fol, layer(tick(1, 3900), tick(.8, 5200)), e['t'], .06, .4)
    elif ty == 'ghost': add(fol, shimmer(1.2), t, .035)
    elif ty == 'pull': add(fol, swoosh(1.4, False), t, .28); add(fol, thud(.8), t, .3)
    elif ty == 'card': add(fol, thud(1), t, .3)
    elif ty == 'label': add(fol, tick(1, 4800 + 250 * (len(e['id']) % 5)), t, .06, .4)
    elif ty == 'dim': add(fol, pen(1), t, .08, .3); add(fol, tick(1, 6000), t + .6, .05, .3)
for e in EV:
    if e['type'] == 'roll' and e['t'] >= T['chairs']: add(fol, puff(.4), e['t'] + e['d'], .05, e.get('pan', 0))
tt = np.arange(N) / SR
# room tone: a soft factory air under everything; the LED hum joins at the switch and stays faint
bed = lp(np.cumsum(noise(N / SR)) * .002, 300); bed -= uniform_filter1d(bed, 4800); bed = norm(bed) * .5
air = lp(noise(N / SR), 1200) * .06
hum = (np.sin(2 * np.pi * 100 * tt) * .5 + np.sin(2 * np.pi * 200 * tt) * .2) * (tt >= hum_t) * np.clip((tt - hum_t) / .3, 0, 1)
bedmix = (bed * .02 + air * .02 + hum * .0045)[:, None] * np.ones((1, 2))

# ---------------- silences: music out, room tone only ----------------
def gate(a, z, fade=.12):
    g = np.ones(N, np.float32); i0, i1, f = int(a * SR), int(z * SR), int(fade * SR)
    g[i0:i1] = 0; g[max(0, i0 - f):i0] *= np.linspace(1, 0, min(f, i0)); g[i1:i1 + f] *= np.linspace(0, 1, f)
    return g[:, None]
sil = gate(T['quiet'], T['light'] - .005) * gate(T['quiet2'], T['pull'] - .005)
music *= sil; pulse *= sil

# ---------------- voice ----------------
voice = buf()
for v in VO:
    x, sr = sf.read(os.path.join(HERE, 'voice', v['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    x = hp(x, 80); x = compress(x / (np.abs(x).max() + 1e-9) * .9, thr=.22, ratio=3.0)
    add(voice, x, v['t'], .5, 0)
venv = uniform_filter1d(maximum_filter1d(np.abs(voice).mean(1), int(.25 * SR)), int(.2 * SR))
duck = 1 - .55 * np.clip(venv / (venv.max() + 1e-9) * 4, 0, 1)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
mus = music * .9 + pulse
for c in range(2): mus[:, c] = hp(mus[:, c], 44, 4); fol[:, c] = hp(fol[:, c], 36, 2)
mus *= duck[:, None]
mix = voice * 1.0 + mus * .27 + fol * .9 + bedmix
for c in range(2): mix[:, c] = limit(mix[:, c], .45)
os.makedirs(os.path.join(HERE, 'out/stems'), exist_ok=True)
end = int(DUR * SR); tail = int(.8 * SR)
mix = mix[:end]; mix[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2
sf.write(os.path.join(HERE, 'out/mix.wav'), mix, SR, subtype='PCM_24')
for nm, x in [('voice', voice), ('music', mus * .27), ('foley', fol * .9)]: sf.write(os.path.join(HERE, f'out/stems/{nm}.wav'), x[:end], SR, subtype='PCM_24')
v_on = venv[:end] > venv.max() * .05
print(f'mix {DUR:.2f}s  voice rms {20*np.log10(rms(voice[:end][v_on])):.1f} dBFS  music rms {20*np.log10(rms((mus*.27)[:end][v_on])):.1f} (under voice)  foley rms {20*np.log10(rms((fol*.9)[:end])):.1f}  peak {np.abs(mix).max():.2f}')
