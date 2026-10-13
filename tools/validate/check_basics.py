"""Independent checks of the shared model: GDD law vs measured medians, 2F geometry, the console's
ray distance and panel window, and the boxcar decimator simulated at 25 MS/s.

    python3 tools/validate/check_basics.py
"""
import math
import numpy as np

b = 7.5
gdd = lambda x: b * (1 / np.sqrt(1 - x) - 1)
tauL = lambda f, M, t0=8950: t0 + b * M * (2 * (1 - np.sqrt(1 - np.minimum(f / M, 1))) - f / M)

print("== 1. GDD law against the measured medians (doc Part 11 table)")
med = {0.61: (2.9, -0.7, 5.7), 0.71: (6.3, 3.2, 9.6), 0.81: (9.2, 5.0, 14.5), 0.86: (13.5, 8.6, 20.1),
       0.91: (17.2, 10.2, 27.4), 0.96: (32.7, 16.4, 51.2), 0.99: (36.5, 15.3, 57.4)}
for x, (m, lo, hi) in med.items():
    g = gdd(x)
    print(f"  x={x:.2f}  fit {g:6.1f}  median {m:5.1f}  IQR {lo:5.1f}..{hi:5.1f}  {'inside IQR' if lo <= g <= hi else 'OUTSIDE IQR'}")
x_cap = 1 - (b / (36.5 + b)) ** 2
print(f"  fit reaches the 0.99 median (36.5) at x = {x_cap:.3f}")

print("== 2. tauL is the integral of the law")
M = 26.0
for f in (10, 18, 22.1, 25):
    h = 1e-4
    num = (tauL(f + h, M) - tauL(f - h, M)) / (2 * h)
    print(f"  f={f:5.1f}: dtau/df {num:8.3f}  law {gdd(f / M):8.3f}")

print("== 3. 2F spacing and 2F/1F MUF ratio, mirror geometry")
D = 2634.0
flat = lambda n, h: 2 * n * math.hypot(D / (2 * n), h) / 299.792458
for h in (250, 300):
    print(f"  h'={h}: 1F {flat(1, h):.2f} ms, 2F {flat(2, h):.2f} ms, spacing {flat(2, h) - flat(1, h):.2f} ms (doc: 9.01/9.66 at 300)")
R = 6371.0
def secphi(Dhop, h):
    th = Dhop / (2 * R)
    AB = math.sqrt(R * R + (R + h) ** 2 - 2 * R * (R + h) * math.cos(th))
    return 1 / math.cos(math.asin(R * math.sin(th) / AB)), 2 * AB
for h in (250, 300, 350):
    s1, _ = secphi(D, h); s2, _ = secphi(D / 2, h)
    print(f"  h'={h}: sec(phi) 1F {s1:.2f}, 2F {s2:.2f}, MUF2/MUF1 {s2 / s1:.2f}")
print("  model (js/core.js) uses tau2F - tau1F = 450 us and r2F = 0.70")

print("== 4. Console ray distance and panel window")
Re = 6378.137
def earth(la1, lo1, la2, lo2):
    la1, lo1, la2, lo2 = map(math.radians, (la1, lo1, la2, lo2))
    dl = lo2 - lo1
    x = math.sin(la1) * math.sin(la2) + math.cos(la1) * math.cos(la2) * math.cos(dl)
    y = math.hypot(math.cos(la2) * math.sin(dl), math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dl))
    return Re * math.atan2(y, x)
ray = lambda d: math.sqrt(40000 + d * d)
rx = (56.38, 47.53)
for name, tx in (("Cyprus (35, 34) as in schedule.ini", (35, 34)), ("Sodankyla 67.37, 26.63", (67.37, 26.63)), ("Sodankyla 67.22, 26.38 (DD.MM typed)", (67.22, 26.38)), ("vertical, same site", rx)):
    d = earth(*tx, *rx)
    print(f"  {name:40s} ground {d:7.1f} km  ray {ray(d):7.1f}  window {ray(d) - 180:7.1f}..{ray(d) + 1500:7.1f} km")

print("== 5. Boxcar decimator, simulated at 25 MS/s")
fs, N = 25e6, 625
Hf = lambda f: abs(math.sin(math.pi * f * N / fs) / (N * math.sin(math.pi * f / fs))) if f else 1.0
n = N * 4096
t = np.arange(n) / fs
for beat in (-910, 19_090, 99_090, 199_090, 500_000 * (1 - 0.0058), 1_500_000 * (1 - 0.0058 / 3)):
    x = np.exp(2j * np.pi * beat * t)
    y = x.reshape(-1, N).mean(1)                      # boxcar mean, then keep one sample in 625
    w = np.hanning(y.size)
    Y = np.fft.fftshift(np.fft.fft(y * w)); fr = np.fft.fftshift(np.fft.fftfreq(y.size, N / fs))
    k = np.argmax(abs(Y))
    amp = abs(Y[k]) / w.sum()
    fold = beat - 40e3 * round(beat / 40e3)
    print(f"  beat {beat/1e3:9.2f} kHz: sim {20*np.log10(amp):6.1f} dB at {fr[k]/1e3:7.2f} kHz | formula {20*np.log10(max(Hf(beat),1e-9)):6.1f} dB, fold {fold/1e3:7.2f} kHz")

