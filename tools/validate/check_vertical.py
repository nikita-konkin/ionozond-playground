"""Vertical-incidence model, independently of the JavaScript: h'(f) from a parabolic E + F2 profile against the
closed form for one layer, GDD of a daytime profile, and its oblique image over 2634 km (secant law, curved-earth
mirror) against the measured median law. PG.vi in js/core.js must give the same numbers.

    python3 tools/validate/check_vertical.py
"""
import math
import numpy as np

C = 299.792458          # km per ms

def profile(p, dh=0.25):
    lays = [(p["foF2"], p["hmF2"], p["ymF2"])]
    if p.get("foE", 0) > 0.3:
        lays.append((p["foE"], p["hmE"], p["ymE"]))
    hb = min(hm - ym for _, hm, ym in lays)
    h = np.arange(hb, p["hmF2"] + dh / 2, dh)
    f2 = np.zeros_like(h)
    for fo, hm, ym in lays:
        z = (h - hm) / ym
        v = fo * fo * (1 - z * z)
        v[(h < hm - ym)] = 0
        v[h > hm] = fo * fo if fo != p["foF2"] else v[h > hm]
        f2 = np.maximum(f2, v)
    f2 = np.maximum.accumulate(f2)          # no valley: monotone up to hmF2
    return h, f2

def hv(f, h, f2):
    """h' for piecewise-linear f_N^2: each interval integrates exactly to 2*dh/(sqrt(u1)+sqrt(u2))."""
    F = f * f
    if F >= f2[-1]:
        return math.nan
    i = int(np.searchsorted(f2, F, side="right"))   # first index with f2 > F
    if i == 0:
        return h[0]
    u = 1 - f2[:i] / F                                # all > 0 up to i-1
    su = np.sqrt(u)
    main = (2 * np.diff(h[:i]) / (su[:-1] + su[1:])).sum()
    hr = h[i - 1] + (F - f2[i - 1]) / (f2[i] - f2[i - 1]) * (h[i] - h[i - 1])
    return h[0] + main + 2 * (hr - h[i - 1]) / su[-1]

def analytic(f, fo, hm, ym):
    x = f / fo
    return hm - ym + 0.5 * ym * x * math.log((1 + x) / (1 - x))

print("== single parabolic layer, numeric against analytic")
p = dict(foF2=8.0, hmF2=300, ymF2=100, foE=0)
h, f2 = profile(p)
for x in (0.2, 0.5, 0.8, 0.9, 0.95, 0.99, 0.999):
    f = x * 8
    a, n = analytic(f, 8, 300, 100), hv(f, h, f2)
    print(f"  f/fo={x:5.3f}: analytic {a:8.2f} km  numeric {n:8.2f} km  diff {n - a:+.3f}")

def gdd_vi(f, h, f2, df=0.01):
    a, b = hv(f - df, h, f2), hv(f + df, h, f2)
    return 1000 * 2 / C * (b - a) / (2 * df)          # us/MHz

print("== day profile: foE 2.8 @110/20, foF2 9.5 @290/90")
day = dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=290, ymF2=90)
h, f2 = profile(day)
for f in (1.5, 2.5, 2.75, 2.85, 3.0, 4, 6, 8, 9, 9.3, 9.45):
    v = hv(f, h, f2); g = gdd_vi(f, h, f2)
    print(f"  f {f:5.2f}: h' {v:7.1f} km  tau {2*v/C:6.3f} ms  GDD {g:8.1f} us/MHz  Bmax {1000/math.sqrt(abs(g)) if g > 0 else float('inf'):7.1f} kHz")

print("== oblique image over 2634 km (curved-earth mirror, secant law), against the measured law")
R = 6371.0; D = 2634.0; th = D / (2 * R)
def oblique(prof, n=6000):
    h, f2 = profile(prof)
    fo = math.sqrt(f2[-1])
    fv = np.linspace(0.3, fo * 0.99999, n)
    hvv = np.array([hv(x, h, f2) for x in fv])
    AB = np.sqrt(R * R + (R + hvv) ** 2 - 2 * R * (R + hvv) * math.cos(th))
    phi = np.arcsin(R * math.sin(th) / AB)
    elev = np.pi / 2 - (np.pi - th - phi) + 0                     # angle OAB - 90 deg, sign flipped
    elev = (np.pi - th - phi) - np.pi / 2
    fob = fv / np.cos(phi); tau = 2 * AB / C
    ok = elev > 0
    return fv[ok], fob[ok], tau[ok], hvv[ok], np.degrees(elev[ok])
law = lambda x: 7.5 * (1 / np.sqrt(1 - x) - 1)
for name, prof in (("day", day), ("night", dict(foE=0, foF2=3.6, hmF2=330, ymF2=110)),
                   ("day, thin F2", dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=280, ymF2=60)),
                   ("day, thick F2", dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=320, ymF2=130))):
    fv, fob, tau, hvv, el = oblique(prof)
    k = int(np.argmax(fob)); MUF = fob[k]
    lf, lt = fob[:k], tau[:k]                                      # lower ray
    print(f"  {name}: foF2 {prof['foF2']}, MUF {MUF:5.2f} MHz (M = {MUF/prof['foF2']:.2f}), lower ray from {lf[0]:5.2f} MHz at {lt[0]:.3f} ms (elev {el[0]:.1f} deg), nose at {tau[k]:.3f} ms")
    sel = lf > 0.5 * MUF
    for x in (0.61, 0.71, 0.81, 0.86, 0.91, 0.96, 0.99):
        fx = x * MUF
        if fx < lf[0]:
            print(f"     x={x:.2f}: below the lowest geometric ray"); continue
        i = np.searchsorted(lf, fx)
        if i < 3 or i >= len(lf) - 3:
            continue
        g = (lt[i + 2] - lt[i - 2]) / (lf[i + 2] - lf[i - 2]) * 1000
        print(f"     x={x:.2f}: physics GDD {g:7.1f} us/MHz | law {law(x):6.1f} | delay {lt[i]:.3f} ms")
