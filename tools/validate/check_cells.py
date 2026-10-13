"""Cell-shape check: a synthetic dechirped capture -> Hann FFT columns -> 8 dB gate -> the console's own
speckle filter (delete_small_objects from ionozond/python/lfp_products.py). Compare with the table on the
"FFT length and cell" page.

    python3 tools/validate/check_cells.py [path/to/ionozond/python]
"""
import os
import sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "..", "ionozond", "python"))
from lfp_products import delete_small_objects

FIF = 40e3

def run(k, slope, span, dop, snr4096, N, seed, tau0=19e-3, T=14.0):
    rng = np.random.default_rng(seed)
    n = int(T * FIF); t = np.arange(n) / FIF
    ta = T / 2 - span * 1e6 / k / 2; tb = ta + span * 1e6 / k
    on = (t >= ta) & (t < tb)
    tau = tau0 + slope * 1e-12 * k * np.clip(t - ta, 0, None)          # s
    phase = -2 * np.pi * k * np.cumsum(tau) / FIF
    if dop > 0:
        M = 40; fm = rng.normal(0, dop, M); th = rng.uniform(0, 2 * np.pi, M)
        g = np.exp(1j * (2 * np.pi * np.outer(t, fm) + th)).sum(1) / np.sqrt(M)
    else:
        g = np.ones(n)
    w4 = np.hanning(4096)
    A = np.sqrt(10 ** (snr4096 / 10) * (w4 ** 2).sum()) / w4.sum()
    x = A * g * np.exp(1j * phase) * on + (rng.normal(size=n) + 1j * rng.normal(size=n)) / np.sqrt(2)
    w = np.hanning(N); nf = n // N
    X = np.fft.fft(x[: nf * N].reshape(nf, N) * w, axis=1)
    snr = abs(X) ** 2 / (w ** 2).sum()
    fb = np.fft.fftfreq(N, 1 / FIF)
    beat0 = -k * tau0
    rows = np.argsort(fb)
    fb = fb[rows]; snr = snr[:, rows]
    r0 = np.searchsorted(fb, beat0 - k * (slope * 1e-12 * span * 1e6) - 80 * FIF / N)
    r1 = np.searchsorted(fb, beat0 + 80 * FIF / N)
    snr = snr[:, r0:r1]; fb = fb[r0:r1]
    occ = snr >= 10 ** 0.8
    kept = delete_small_objects(np.where(occ, snr, 0).astype(np.float32)) > 0
    # trace cells: frames overlapping the trace, rows within 4 bins of the trace's beat range
    fr_t0 = np.arange(nf) * N / FIF; fr_t1 = fr_t0 + N / FIF
    cols = np.where((fr_t1 > ta) & (fr_t0 < tb))[0]
    blo = -k * (tau0 + slope * 1e-12 * span * 1e6) - 4 * FIF / N; bhi = beat0 + 4 * FIF / N
    rr = np.where((fb >= blo) & (fb <= bhi))[0]
    sub_o = occ[np.ix_(cols, rr)]; sub_k = kept[np.ix_(cols, rr)]
    rows_per_col = sub_o.sum(1).max() if sub_o.size else 0
    return int(sub_k.sum()), int(sub_o.sum()), len(cols), int(rows_per_col)

for dop, reps in ((0.0, 3), (0.5, 9)):
    print(f"Magadan preset: 500 kHz/s, 0.6 MHz, 40 us/MHz, SNR 18 dB at 4096, Doppler {dop} Hz ({reps} runs, median)")
    for N in (2048, 4096, 8192, 16384, 32768):
        res = np.array([run(500.0084e3, 40, 0.6, dop, 18, N, s) for s in range(reps)])
        kk, oo, cc, rpc = np.median(res, 0)
        print(f"  N {N:6d}: columns {cc:3.0f}, rows/column {rpc:3.0f}, kept/occupied {kk:4.0f}/{oo:4.0f}  ({res[:,0].min()}..{res[:,0].max()} kept)")
print("Cyprus mid preset: 100 kHz/s, 2 MHz, 6 us/MHz, 0.37 Hz, SNR 18 at 4096")
for N in (4096, 16384):
    res = np.array([run(100e3, 6, 2.0, 0.37, 18, N, s, tau0=9.0e-3, T=40.0) for s in range(3)])
    kk, oo, cc, rpc = np.median(res, 0)
    print(f"  N {N:6d}: columns {cc:3.0f}, rows/column {rpc:3.0f}, kept/occupied {kk:4.0f}/{oo:4.0f}")
