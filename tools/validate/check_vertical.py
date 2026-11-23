"""Vertical-incidence model, independently of the JavaScript: h'(f) against the closed form for
one parabolic layer, and the oblique projection over 2634 km by the secant law.

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

print("== oblique image over 2634 km (curved-earth mirror, secant law)")
day = dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=290, ymF2=90)
h, f2 = profile(day)
R = 6371.0; D = 2634.0; th = D / (2 * R)
def oblique(prof, n=6000):
    h, f2 = profile(prof)
    fo = prof["foF2"]
    fv = np.linspace(0.3, fo * 0.99999, n)
    hvv = np.array([hv(x, h, f2) for x in fv])
    AB = np.sqrt(R * R + (R + hvv) ** 2 - 2 * R * (R + hvv) * math.cos(th))
    phi = np.arcsin(R * math.sin(th) / AB)
    elev = (np.pi - th - phi) - np.pi / 2
    fob = fv / np.cos(phi); tau = 2 * AB / C
    ok = (elev > 0) & (fv > prof.get("foE", 0))
    return fv[ok], fob[ok], tau[ok], hvv[ok], np.degrees(elev[ok])
for name, prof in (("day", day), ("night", dict(foE=0, foF2=4.4, hmF2=330, ymF2=110)),
                   ("day, thin F2", dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=280, ymF2=60)),
                   ("day, thick F2", dict(foE=2.8, hmE=110, ymE=20, foF2=9.5, hmF2=320, ymF2=130))):
    fv, fob, tau, hvv, el = oblique(prof)
    k = int(np.argmax(fob)); MUF = fob[k]
    lower = [k]
    for i in range(k - 1, -1, -1):
        if fob[i] < fob[lower[-1]]:
            lower.append(i)
        elif fob[i] > fob[lower[-1]] + 0.3:
            break
    lf, lt = fob[lower[::-1]], tau[lower[::-1]]
    print(f"  {name}: foF2 {prof['foF2']}, MUF {MUF:5.2f} MHz (M = {MUF/prof['foF2']:.2f}), lower ray from {lf[0]:5.2f} MHz at {lt[0]:.3f} ms (elev {el[lower[-1]]:.1f} deg), nose at {tau[k]:.3f} ms")
    target = 0.6 * MUF
    if lf[0] <= target <= lf[-1]:
        print(f"    1F delay at 0.6 MUF: {np.interp(target, lf, lt):.3f} ms")
