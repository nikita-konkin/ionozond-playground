"""Bring stretches of dechirped echo for the subchannel frequency response page, as js/data/fr.js.

    PYTHONPATH=…/ionograms-handler python tools/fr_data.py \\
        …/lfm_ionogram-NIC1-yoshkar-ola-ch0-000-1792216810.00.h5@18-22 ...

Each argument is a sounding and the stretch of sweep to keep, in MHz: an .h5
product with an echo window, an .h5 with ``z`` or an .lfs recording, read by
muf.sim.fast.record_of. The page cuts that stretch into subchannels itself, so
it needs the complex samples, not an ionogram: they are kept at the record's
own rate, as signed bytes, with one scale per sounding.

The modes' delay curves come from the simulator page's data (js/data/sim.js),
matched by file name, so that both pages show the same state. A sounding the
simulator page does not carry gets no curves, and the page then gates on the
strongest echo alone.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "js" / "data" / "fr.js"
SIM = ROOT / "js" / "data" / "sim.js"

#: Bytes keep 127 steps a side; the top 0.01 % of samples, interference spikes, are clipped.
FULL = 127
TOP = 99.99


def simdata() -> dict:
    if not SIM.exists():
        return {}
    text = SIM.read_text(encoding="utf-8")
    return {d["source"]: d for d in json.loads(text[text.index("["):text.rindex("]") + 1])}


def curves(entry: dict | None, lo: float, hi: float) -> list[dict]:
    if not entry:
        return []
    out = []
    freq, per_us = entry["freq"], entry.get("km_per_us") or 0.3
    for m in entry["modes"]:
        pts = [(freq["lo"] + i * freq["step"], km / per_us) for i, km in enumerate(m["km"])
               if km is not None and lo <= freq["lo"] + i * freq["step"] <= hi]
        if len(pts) >= 2:
            out.append({"name": m["name"], "f": [round(f, 5) for f, _ in pts],
                        "us": [round(u, 2) for _, u in pts]})
    return out


def stamp(path: Path) -> str:
    found = re.search(r"-(\d{10})\.\d+\.h5$", path.name)
    if not found:
        return ""
    return datetime.fromtimestamp(int(found.group(1)), timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def stretch(arg: str, known: dict) -> dict:
    from muf.sim import fast

    path, _, span = arg.rpartition("@")
    lo, hi = (float(v) for v in span.split("-"))
    path = Path(path)
    rec = fast.record_of(path)
    n0 = max(0, int(np.ceil((float(rec.time_at(lo)) - rec.t_first_s) * rec.sr_hz)))
    n1 = min(rec.samples.size, int(np.floor((float(rec.time_at(hi)) - rec.t_first_s) * rec.sr_hz)))
    if n1 - n0 < rec.sr_hz:
        raise ValueError(f"{path.name}: {lo}-{hi} MHz is outside the record")
    z = rec.samples[n0:n1]
    parts = np.concatenate([z.real, z.imag])
    scale = float(np.percentile(np.abs(parts), TOP)) / (FULL - 7)
    q = np.empty(2 * z.size, dtype=np.int8)
    q[0::2] = np.clip(np.round(z.real / scale), -FULL, FULL)
    q[1::2] = np.clip(np.round(z.imag / scale), -FULL, FULL)
    clipped = float(np.mean(np.abs(parts) / scale > FULL))
    entry = known.get(path.name)
    t0 = rec.t_first_s + n0 / rec.sr_hz
    print(f"{path.name}: {lo}-{hi} MHz, {z.size} samples at {rec.sr_hz:.1f} Hz, "
          f"median |z| {np.median(np.abs(z)) / scale:.1f} steps, clipped {clipped:.2%}, "
          f"{len(curves(entry, lo, hi))} mode curves")
    return {
        "source": path.name, "utc": entry["utc"] if entry else stamp(path),
        "circuit": entry["circuit"] if entry else "",
        "f_lo": float(rec.freq_at(t0)), "f_hi": float(rec.freq_at(t0 + z.size / rec.sr_hz)),
        "sr_hz": rec.sr_hz, "rate_hz_s": rec.rate_hz_s, "t0_s": t0,
        "sweep_hz_at_0": rec.sweep_hz_at_0, "shift_hz": rec.shift_hz,
        "km_per_hz": rec.km_per_hz, "range_zero_km": rec.range_zero_km,
        "km_per_us": rec.km_per_us, "n": int(z.size), "scale": scale,
        "iq": base64.b64encode(q.tobytes()).decode("ascii"),
        "modes": curves(entry, lo, hi),
    }


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("stretch", nargs="+", help="SOUNDING@LO-HI, the stretch in MHz")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args(argv)
    known = simdata()
    data = [stretch(a, known) for a in args.stretch]
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        "/* Dechirped echo for the subchannel frequency response page, written by tools/fr_data.py.\n"
        "   Real soundings, complex samples as signed bytes: rebuild it, do not edit it. */\n"
        f"PG.frData = {blob};\n", encoding="utf-8", newline="\n")
    print(f"{len(data)} stretches -> {args.out} ({args.out.stat().st_size / 1e3:.0f} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
