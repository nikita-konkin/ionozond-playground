"""What the dispersion number GDD*B^2 does to a pulse, for a Hann-shaped and a flat band.
Sets the flat / noticeable / dispersive thresholds (1 and 5) used on the pages.

    python3 tools/validate/check_pulse.py
"""
import math
import numpy as np
K = 2049
f = np.linspace(-0.5, 0.5, K)                         # band B = 1, GDD in units of 1/B^2
tt = np.linspace(-12, 12, 4801)
def width(a):
    p = a ** 2
    m = (p * tt).sum() / p.sum()
    return math.sqrt((p * (tt - m) ** 2).sum() / p.sum())
def run(w, P):
    ph = -math.pi * P * f ** 2                        # tau(f) = P*f -> phi = -2*pi*int tau df
    E = lambda phase: abs((w * np.exp(1j * (2 * np.pi * np.outer(tt, f) + phase))).sum(1))
    h, r = E(ph), E(0 * ph)
    return 20 * np.log10(h.max() / r.max()), width(h) / width(r)
for name, w in (("Hann band", np.hanning(K)), ("flat band", np.ones(K))):
    print(name)
    for P in (0.1, 0.3, 0.5, 1, 2, 3, 5, 10):
        pk, gr = run(w, P)
        print(f"  GDD*B^2 = {P:5.1f}: peak {pk:6.2f} dB, RMS width x{gr:5.2f}")
