"""Every page renders in both languages without script errors or missing translations, and
every internal link leads to a page and section that exist.

    python tools/validate/check_site.py

Requires Playwright and its Chromium browser. Opens index.html from disk; no server is needed.
"""

from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
WATCH = """() => {
  window.__missing = new Set();
  const t = PG.t;
  PG.t = (k, v) => { if (!(k in PG.dict[PG.lang]) && !(k in PG.dict.en)) window.__missing.add(k); return t(k, v); };
}"""


def visit(page, route: str) -> None:
    page.evaluate("r => { location.hash = r; }", route)
    page.wait_for_timeout(150)


def check(page, lang: str) -> list[str]:
    errors: list[str] = []
    page.on("pageerror", lambda e: errors.append(f"{lang}: script error {e}"))
    page.on("console", lambda m: m.type == "error" and errors.append(f"{lang}: console error {m.text}"))
    page.goto((ROOT / "index.html").as_uri() + f"?lang={lang}")
    page.wait_for_function("window.PG && PG.modules.length > 0")
    page.evaluate(WATCH)
    pages = ["home"] + page.evaluate("PG.modules.map(m => m.id)")
    links: dict[str, str] = {}
    for name in pages:
        visit(page, "#" + name)
        for href in page.evaluate("[...document.querySelectorAll('#main a[href^=\"#\"]')].map(a => a.getAttribute('href'))"):
            links.setdefault(href, name)
    for href, origin in sorted(links.items()):
        target = href.lstrip("#")
        if not target:
            continue
        name, _, sub = target.partition("/")
        if name not in pages:
            errors.append(f"{lang}: link {href} on #{origin} leads to a page that does not exist")
            continue
        if sub:
            visit(page, href)
            if not page.evaluate("id => !!document.getElementById(id)", f"{name}-{sub}"):
                errors.append(f"{lang}: link {href} on #{origin} leads to a section that does not exist")
    for key in sorted(page.evaluate("[...window.__missing]")):
        errors.append(f"{lang}: translation key {key} is missing")
    return errors


def main() -> int:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        errors = []
        for lang in ("ru", "en"):
            context = browser.new_context()
            errors += check(context.new_page(), lang)
            context.close()
        browser.close()
    for line in errors:
        print(line)
    print(f"{len(errors)} problems found" if errors else "all pages and links are intact")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
