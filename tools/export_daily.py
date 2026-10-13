"""Export the daily MUF course for the playground's "The day" page.

    python3 tools/export_daily.py lfs_feb2026.npz out_dir [--date 2026-02-04] [--path "Cyprus → Yoshkar-Ola"]

Input is the batch file written by lfs_tools/lfs_batch.py: per sweep an `epoch`
and an `snr` row of 2500 cells, 10 kHz each, from 7.5 MHz. The MUF of a sweep is
the top edge of its trace, found the same way as in lfs_tools/dispersion_stats.py:
the highest cell around which at least 5 of 30 neighbouring cells reach 15 dB.
At or above 32.4 MHz that edge is the top of the recording, not the MUF, so the
value is kept and flagged as censored. The 30-cell window puts the edge about
0.1 MHz above the last detected cell, as in dispersion_stats.py.

One JSON file per UTC day is written to out_dir as muf_YYYY-MM-DD.json:

    {"path": ..., "date": "2026-02-04", "step_s": 300, "source": "lfs_feb2026.npz",
     "epoch": [...], "muf_mhz": [... or null], "censored": [...]}

Load it on the page with "Load a day (JSON)".
"""
import argparse
import datetime as dt
import json
import os

import numpy as np

SNR_MIN, TOP, WIN, NEED = 15.0, 32.4, 30, 5


def freqs(m):
    return 7.5 + 0.01 * (np.arange(m) + 0.5)


def edge_top(det_row, f):
    c = np.convolve(det_row.astype(int), np.ones(WIN, int), mode="same")
    i = np.where(c >= NEED)[0]
    return float(f[i.max()]) if i.size else float("nan")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("npz")
    ap.add_argument("out_dir")
    ap.add_argument("--date", help="only this UTC day, YYYY-MM-DD")
    ap.add_argument("--path", default="Cyprus → Yoshkar-Ola")
    a = ap.parse_args()

    d = np.load(a.npz)
    ep = d["epoch"].astype(np.int64)
    snr = d["snr"].astype(float)
    f = freqs(snr.shape[1])
    with np.errstate(invalid="ignore"):
        det = snr >= SNR_MIN
    muf = np.array([edge_top(r, f) for r in det])
    order = np.argsort(ep)
    ep, muf = ep[order], muf[order]

    days = (ep // 86400) * 86400
    os.makedirs(a.out_dir, exist_ok=True)
    written = 0
    for d0 in np.unique(days):
        date = dt.datetime.fromtimestamp(int(d0), dt.timezone.utc).strftime("%Y-%m-%d")
        if a.date and date != a.date:
            continue
        sel = days == d0
        e, m = ep[sel], muf[sel]
        step = int(np.median(np.diff(e))) if e.size > 1 else 300
        doc = {
            "path": a.path, "date": date, "step_s": step, "source": os.path.basename(a.npz),
            "epoch": [int(v) for v in e],
            "muf_mhz": [None if not np.isfinite(v) else round(float(v), 2) for v in m],
            "censored": [bool(np.isfinite(v) and v >= TOP) for v in m],
        }
        out = os.path.join(a.out_dir, f"muf_{date}.json")
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, ensure_ascii=False, separators=(",", ":"))
        n_ok = int(np.isfinite(m).sum())
        print(f"{out}: {e.size} sweeps, MUF found in {n_ok}, censored {sum(doc['censored'])}")
        written += 1
    if not written:
        raise SystemExit("no sweeps" + (f" on {a.date}" if a.date else ""))


if __name__ == "__main__":
    main()
