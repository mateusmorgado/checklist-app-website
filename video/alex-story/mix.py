# Builds the soundtrack for the Alex story: synthesised music and sound effects, plus the voice lines,
# mixed once per language. Usage: python3 mix.py <clips dir> <out dir>
# The clips dir holds r1_en.wav ... a5_de.wav (44.1 kHz mono, 16 bit). Writes mix-en.wav and mix-de.wav.
import sys, wave, os
import numpy as np

SR = 44100
LEN = 35.0
N = int(LEN * SR)
rng = np.random.default_rng(7)
LINES = {'r1': 0.7, 'a1': 4.1, 'a2': 7.6, 'a3': 10.75, 'a4': 13.5, 'a5': 15.95, 'r2': 19.55, 'r3': 30.3}


def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def tt(d):
    return np.arange(int(d * SR)) / SR


def add(buf, t0, x, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    x = x[:len(buf) - i]
    buf[i:i + len(x)] += x * g


def env(d, a=.005, r=None):
    t = tt(d)
    e = np.minimum(1, t / a)
    if r: e *= np.exp(-t / r)
    fade = np.minimum(1, (d - t) / .01)
    return e * fade


def lp(x, a):  # one-pole low pass, a in (0, 1]
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a * (x[i] - s); y[i] = s
    return y


def noise(d):
    return rng.uniform(-1, 1, int(d * SR)).astype(np.float32)


def ov(*xs):  # sums sounds of different lengths
    out = np.zeros(max(len(x) for x in xs), np.float32)
    for x in xs: out[:len(x)] += x
    return out


hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def pluck(m, d=.35, r=.09):  # marimba-ish
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .02)) * env(d, .002, r)

def bell(m, d=.8):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .12) + .25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .05)) * env(d, .002, .25)

def bass(m, d=.3):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .45 * np.sin(4 * np.pi * f * t) + .2 * np.sin(6 * np.pi * f * t)) * env(d, .004, .16)

def kick(d=.3):
    t = tt(d); ph = 2 * np.pi * np.cumsum(45 + 110 * np.exp(-t / .035)) / SR
    return np.sin(ph) * env(d, .001, .11)

def hat(d=.05):
    n = noise(d); n = n - lp(n, .5)
    return n * env(d, .001, .015)

def clap(d=.18):
    n = noise(d); n = n - lp(n, .15)
    e = sum(np.exp(-np.maximum(0, tt(d) - o) / .012) * (tt(d) >= o) for o in (0, .012, .024)) + np.exp(-tt(d) / .06) * .6
    return n * e * .6

def stab(ms, d=.25, r=.1):  # chord of plucks with a saw-ish edge
    t = tt(d); out = np.zeros_like(t)
    for m in ms:
        f = hz(m)
        out += sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 6))
    return out / len(ms) * env(d, .003, r)

def pad(ms, d):
    t = tt(d); out = np.zeros_like(t)
    for m in ms:
        f = hz(m)
        out += np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.003 * t)
    a = np.minimum(1, t / .15) * np.minimum(1, (d - t) / .3)
    return out / len(ms) * a

# ---------- music ----------
def music():
    m = np.zeros(N, np.float32)
    # part A: quirky, 132 bpm, C - Am - F - G, until the bomb goes off
    b = 60 / 132; t0 = 0.05
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
    i = 0
    while True:
        bt = t0 + i * b
        if bt >= 15.7: break
        root, ch = prog[(i // 4) % 4]
        add(m, bt, kick(), .55 if i % 2 == 0 else .3)
        add(m, bt + b / 2, hat(), .18); add(m, bt, hat(), .1)
        add(m, bt, bass(root if i % 2 == 0 else root + 7, b * .9), .32)
        if i % 2 == 1: add(m, bt, stab([c + 12 for c in ch], .18, .05), .12)
        # bouncy marimba arpeggio on 8ths
        for k in range(2):
            add(m, bt + k * b / 2, pluck(ch[(i * 2 + k) % 3] + 12), .16)
        i += 1
    # tiny fade into the boom
    # part B: happy, 128 bpm, D - A - Bm - G, from the co-pilot's return
    b = 60 / 128; t0 = 19.2
    prog = [(38, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (43, [62, 67, 71])]
    mel = [74, 76, 78, 81, 78, 76, 74, 76, 73, 76, 78, 76, 74, 73, 71, 73, 74, 78, 81, 83, 81, 78, 76, 78, 79, 78, 76, 74, 76, 74, 71, 74]
    i = 0
    while True:
        bt = t0 + i * b
        if bt >= 33.3: break
        root, ch = prog[(i // 4) % 4]
        add(m, bt, kick(), .5)
        add(m, bt + b / 2, hat(), .2)
        if i % 2 == 1: add(m, bt, clap(), .3)
        add(m, bt, bass(root, b * .5), .34); add(m, bt + b / 2, bass(root + 12, b * .4), .2)
        add(m, bt + b / 2, stab(ch, .2, .06), .14)
        if bt > 26.6:  # the montage gets the bell tune on top
            add(m, bt, bell(mel[(i * 2) % len(mel)]), .13); add(m, bt + b / 2, bell(mel[(i * 2 + 1) % len(mel)]), .1)
        else:
            add(m, bt, pluck(mel[i % len(mel)], .3, .08), .1)
        i += 1
    # final chord on the end card
    add(m, 33.35, pad([62, 66, 69, 74], 1.6), .22); add(m, 33.35, bass(38, 1.2), .4); add(m, 33.35, kick(), .6)
    add(m, 33.35, stab([74, 78, 81, 86], .9, .35), .2)
    return m

# ---------- sound effects ----------
def sweep(f0, f1, d, shape='exp', vib=0, vr=0):
    t = tt(d); k = t / d
    f = f0 * (f1 / f0) ** k if shape == 'exp' else f0 + (f1 - f0) * k
    if vib: f = f * (1 + vib * np.sin(2 * np.pi * vr * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def whoosh(d=.45):
    n = noise(d); t = tt(d); out = np.zeros_like(n); s = 0.0; s2 = 0.0
    a = .02 + .25 * np.sin(np.pi * t / d) ** 2
    for i in range(len(n)):
        s += a[i] * (n[i] - s); s2 += a[i] * (s - s2); out[i] = s - s2 * .5
    return out * np.sin(np.pi * t / d) ** 1.5 * 2.2

def pop():
    return ov(sweep(320, 1100, .12) * env(.12, .002, .05), sweep(900, 300, .05) * env(.05, .001, .015) * .5)

def thump(d=.35, f=70):
    t = tt(d); return (np.sin(2 * np.pi * np.cumsum(f + 90 * np.exp(-t / .02)) / SR) * env(d, .001, .09) + lp(noise(d), .2) * env(d, .001, .03) * 1.5)

def boing(d=.6, f=180):
    t = tt(d); ff = f * (1 + .6 * np.exp(-t / .15) * np.sin(2 * np.pi * 14 * t)) * (1 + t * .8)
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * env(d, .002, .22)

def beep(f=1500, d=.06):
    t = tt(d); return np.sign(np.sin(2 * np.pi * f * t)) * .4 * env(d, .002) + np.sin(2 * np.pi * f * t) * .4 * env(d, .002)

def chirp():
    return sweep(2600, 4200, .07) * env(.07, .003, .03)

def boom():
    d = 1.6; t = tt(d)
    low = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-t / .08)) / SR) * env(d, .002, .35)
    n = lp(noise(d), .08); n2 = lp(noise(d), .35)
    return low * 1.0 + n * env(d, .002, .45) * 3 + n2 * env(d, .001, .08) * .8

def sfx():
    s = np.zeros(N, np.float32)
    for t0 in (0.33, 19.27, 29.87): add(s, t0, pop(), .45)                      # co-pilot pops up
    for c in (3.6, 6.9, 10.35, 12.7, 19.2, 33.35, 26.7, 27.7, 28.7, 29.7):      # wipes and montage cuts
        add(s, c - .22, whoosh(.44), .3 if c in (26.7, 27.7, 28.7, 29.7) else .38)
    k = .1
    while k < 3.5: add(s, k, thump(.12, 120), .07); k += 1 / 3.6                # footsteps in town
    add(s, 4.02, sweep(330, 230, .28) * env(.28, .01, .2), .18); add(s, 4.3, sweep(250, 160, .4, vib=.04, vr=7) * env(.4, .01, .3), .2)  # "bwomp"
    add(s, 7.15, thump(.4, 55), .7); add(s, 7.15, lp(noise(.15), .5) * env(.15, .001, .03), .25)  # door slam
    # freeze: a little record scratch
    sc = sweep(900, 200, .25, vib=.3, vr=25) * env(.25, .002, .12) * .5 + (noise(.25) - lp(noise(.25), .3)) * env(.25, .002, .08) * .3
    add(s, 7.45, sc, .3)
    k = 10.45
    while k < 11.5: add(s, k, thump(.08, 160), .12); k += .143                   # pocket pats
    add(s, 10.78, stab([48, 51, 54, 60], .6, .25), .3); add(s, 10.78, stab([36, 42], .6, .25), .25)  # panic sting
    for i in range(14): add(s, 12.95 + i * .04, bell(96 + (i * 5) % 12, .4), .04)   # butterfly sparkle
    k = 12.7                                                                         # slow bomb beeps, then faster
    while k < 14.9: add(s, k, beep(1200, .05), .05); k += 2 / 3
    k, gap = 14.9, .2
    while k < 15.72: add(s, k, beep(1700, .045), .12); k += gap; gap = max(.06, gap * .82)
    add(s, 15.75, boom(), .55)
    add(s, 16.5, sweep(1900, 380, .95, vib=.015, vr=9) * env(.95, .03), .14)        # slide whistle down
    add(s, 16.5, whoosh(.95), .25)
    add(s, 17.73, boing(.7, 150), .45); add(s, 17.73, thump(.3, 60), .4)               # lands on the bed
    for i in range(9): add(s, 17.95 + i * .14 + (i % 3) * .03, chirp(), .09)          # dizzy tweets
    for t0 in (20.2, 21.5, 22.85, 24.55): add(s, t0, bell(88, 1.0), .2); add(s, t0, pop(), .2)  # badges
    for n in range(3): add(s, 26.7 + n / 2.2, boing(.3, 260), .18)                     # hops out of the door
    add(s, 27.75, ov(thump(.2, 90), bell(55, .4) * .4), .3); add(s, 28.62, ov(thump(.25, 70), bell(52, .5) * .5), .4)  # bar clanks
    sl = (noise(.45) - lp(noise(.45), .2)) * (.5 + .5 * np.sin(2 * np.pi * 18 * tt(.45))) * env(.45, .02, .2)
    add(s, 29.05, sl, .12)                                                             # sip
    for i, t0 in enumerate((30.3, 31.05, 32.05)):                                     # taps
        add(s, t0 - .02, ov(thump(.05, 400) * .4, hat(.03)), .35); add(s, t0 + .05, bell(84 + i * 3, .5), .16); add(s, t0 + .12, bell(91 + i * 3, .5), .14)
    add(s, 32.12, stab([74, 79, 83, 86], .8, .3), .18); add(s, 32.15, pop(), .3)
    add(s, 33.45, pop(), .35); add(s, 33.5, whoosh(.3), .2)
    return s

# ---------- mix ----------
def main(clips, out):
    mus, fx = music(), sfx()
    for lang in ('en', 'de'):
        v = np.zeros(N, np.float32)
        for k, t0 in LINES.items():
            x = read(os.path.join(clips, f'{k}_{lang}.wav')); x = x / (np.abs(x).max() + 1e-9) * .8
            add(v, t0, x, 1.0)
        # duck the music under the voice
        e = np.abs(v); w = int(.05 * SR); e = np.convolve(e, np.ones(w) / w, 'same')
        e = lp(np.minimum(1, e * 12)[::50], .25).repeat(50)[:N]
        e = np.pad(e, (0, N - len(e)))
        mm = mus * (1 - .65 * e)
        mix = v + mm * .62 + fx * .85
        mix[int(34.4 * SR):] *= np.linspace(1, 0, N - int(34.4 * SR))
        mix = mix / np.abs(mix).max() * .93
        st = np.stack([mix, mix], 1)
        with wave.open(os.path.join(out, f'mix-{lang}.wav'), 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((st * 32767).astype(np.int16).tobytes())
        print('wrote', lang)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
