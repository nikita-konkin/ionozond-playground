"""Capture the simulator notes' interface figures from the current playground.

    python tools/capture_simdoc.py

Requires Playwright, its Chromium browser, and Pillow. Uses the embedded demonstration
data, the light theme, and the same initial session in both languages. No
server is needed. Rebuild numerical data separately with tools/sim_data.py.
"""

from __future__ import annotations

import argparse
import math
import re
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", type=Path, default=ROOT / "img")
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    sizes = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(
            viewport={"width": 1365, "height": 1000}, device_scale_factor=1.5
        )
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        for lang in ("ru", "en"):
            # Reload to reset session, mode, maps and frequency to their defaults.
            page.goto(
                (ROOT / "index.html").as_uri() + f"?lang={lang}&theme=light#sim",
                wait_until="networkidle",
            )
            page.wait_for_function("document.querySelectorAll('.sim-ion').length === 2")
            page.evaluate("document.fonts.ready")
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            for name, first, last in (("ionograms", 2, 2), ("verdicts", 4, 5)):
                clip = page.evaluate(
                    """([first, last]) => {
                        const children = document.querySelector('.sim').children;
                        const a = children[first].getBoundingClientRect();
                        const b = children[last].getBoundingClientRect();
                        return {x: a.x + scrollX, y: a.y + scrollY,
                                width: a.width, height: b.bottom - a.top};
                    }""",
                    [first, last],
                )
                clip = {
                    key: math.floor(value) if key in ("x", "y") else math.ceil(value) + 1
                    for key, value in clip.items()
                }
                target = args.out_dir / f"sim-{name}-{lang}.jpg"
                page.screenshot(
                    path=str(target), type="jpeg", quality=90, clip=clip, full_page=True
                )
                with Image.open(target) as image:
                    sizes[target.name] = image.size
                print(target)
        browser.close()
        if errors:
            raise RuntimeError("\n".join(errors))
    if args.out_dir.resolve() == (ROOT / "img").resolve():
        notes = ROOT / "js" / "wiki" / "simdoc.js"
        text = notes.read_text(encoding="utf-8")
        for name, (width, height) in sizes.items():
            pattern = rf'(<img src="img/{re.escape(name)}"[^>]* width=")\d+(" height=")\d+'
            text, count = re.subn(
                pattern, lambda m: f'{m[1]}{width}{m[2]}{height}', text
            )
            if count != 1:
                raise ValueError(f"Expected one figure for {name}, got {count}")
        notes.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
