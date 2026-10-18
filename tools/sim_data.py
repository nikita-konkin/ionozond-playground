"""Bring the channel simulator's data into the playground, as js/data/sim.js.

    python tools/sim_data.py sim.json                 # -> js/data/sim.js
    python tools/sim_data.py console.html --out FILE

The data is built in ionograms-handler, where the simulator lives:

    python docs/ui/console.py SOUNDING ... --json sim.json

runs muf.sim.check on each sounding (an .lfs recording, or an .h5 product with
an echo window) and writes what the page draws: the ionograms, cropped and
encoded, and the checks' numbers. A console.html built there carries the same
data and is read too.

This script only checks the data's shape and wraps it as a classic script,
``PG.simData = [...]``, so the page also works opened from disk, where a fetch
of a JSON file is refused. Without js/data/sim.js the page asks for a file.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "js" / "data" / "sim.js"

#: What the page reads from every sounding.
KEYS = ("source", "utc", "circuit", "freq", "range", "bin_km", "db", "maps", "modes",
        "muf", "correlation", "natural", "realisations", "channel")
MODE_KEYS = ("name", "f_lo", "f_hi", "km", "cn0", "profile", "origin", "summary")


def read(path: Path) -> list:
    text = path.read_text(encoding="utf-8")
    if text.lstrip().startswith("<"):
        found = re.search(r"const DATA = (.*?);\r?\n", text, re.S)
        if not found:
            raise ValueError(f"{path}: no console data in the page")
        text = found.group(1)
    data = json.loads(text)
    if not isinstance(data, list) or not data:
        raise ValueError(f"{path}: not a list of soundings")
    return data


def check(data: list) -> list[str]:
    """What is missing or inconsistent, one line each; empty if the data is whole."""
    problems = []
    for k, d in enumerate(data):
        name = d.get("source", f"#{k}")
        missing = [key for key in KEYS if key not in d]
        if missing:
            problems.append(f"{name}: missing {', '.join(missing)}")
            continue
        cells = d["freq"]["n"] * len(d["range"]["km"])
        for key, blob in d["maps"].items():
            if len(base64.b64decode(blob)) != cells:
                problems.append(f"{name}: map {key} is not {d['freq']['n']} x "
                                f"{len(d['range']['km'])}")
        if "real" not in d["maps"]:
            problems.append(f"{name}: no real map")
        for m in d["modes"]:
            gone = [key for key in MODE_KEYS if key not in m]
            if gone:
                problems.append(f"{name}: mode {m.get('name', '?')} missing {', '.join(gone)}")
            elif len(m["km"]) != d["freq"]["n"]:
                problems.append(f"{name}: mode {m['name']} curve is not one value a row")
        ch = d["channel"]
        if len(base64.b64decode(ch["h"])) != ch["n_f"] * ch["n_t"]:
            problems.append(f"{name}: channel map is not {ch['n_f']} x {ch['n_t']}")
    return problems


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("source", type=Path, help="sim.json or console.html from docs/ui/console.py")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args(argv)
    data = read(args.source)
    problems = check(data)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        f"/* The channel simulator's data, written by tools/sim_data.py from {args.source.name}.\n"
        "   Real soundings and the checks' results: rebuild it, do not edit it. */\n"
        f"PG.simData = {blob};\n", encoding="utf-8")
    circuits = sorted({d["circuit"] for d in data})
    print(f"{len(data)} soundings, {', '.join(circuits)} -> {args.out} "
          f"({args.out.stat().st_size / 1e3:.0f} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
