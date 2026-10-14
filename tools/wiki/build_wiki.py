"""Builds the wiki page from ionozond/docs/ionogram-physics.html, in English and Russian.

    python tools/wiki/build_wiki.py [--missing] [path/to/ionogram-physics.html]

The document is cut into text blocks by source position: paragraphs, headings, list items, table
cells, captions, SVG labels and aria-labels. Everything between them, the figures included, is
carried over byte for byte. The Russian page swaps each block for its translation from
tools/wiki/physics.ru.json, keyed by the English block itself, so a block whose English changes
loses its translation, stays in English and is counted. --missing prints those blocks as JSON,
ready to translate and merge. Output: js/wiki/physics.js.
"""
import html.parser
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT.parent / 'ionozond' / 'docs' / 'ionogram-physics.html'
RU = ROOT / 'tools' / 'wiki' / 'physics.ru.json'
OUT = ROOT / 'js' / 'wiki' / 'physics.js'

INLINE = {'a', 'b', 'i', 'em', 'strong', 'var', 'sub', 'sup', 'code', 'span', 'br', 'small', 'kbd', 'abbr', 'tspan', 's', 'u', 'q', 'mark', 'wbr'}
VOID = {'br', 'wbr', 'img', 'meta', 'link', 'hr', 'input', 'col', 'area', 'base', 'source', 'track', 'embed', 'param'}
ATTRS = ('aria-label', 'title', 'alt')
# Pages next to the document in ionozond/docs that the playground has its own version of.
LINKS = {'gdd-playground.html': '#gdd', 'gdd-demo.html': '#measure'}


class Cut(html.parser.HTMLParser):
    """Collects (start, end) spans of every text block and translatable attribute value."""

    def __init__(self, text, begin):
        super().__init__(convert_charrefs=False)
        self.text, self.begin = text, begin
        self.lines = [0] + [m.end() for m in re.finditer('\n', text)]
        self.stack, self.units, self.attrs, self.loose = [], [], [], []

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def _attrs(self, at):
        raw = self.get_starttag_text()
        for name in ATTRS:
            m = re.search(r'\s%s="([^"]*)"' % name, raw)
            if m:
                self.attrs.append((at + m.start(1), at + m.end(1)))

    def handle_starttag(self, tag, attrs):
        at = self.off()
        self._attrs(at)
        if tag in VOID:
            return self.handle_startendtag(tag, attrs, counted=True)
        self.stack.append(dict(tag=tag, inner=at + len(self.get_starttag_text()), block=False, text=False, own=False, kids=[]))

    def handle_startendtag(self, tag, attrs, counted=False):
        if not counted:
            self._attrs(self.off())
        if self.stack and tag not in INLINE:
            self.stack[-1]['block'] = True

    def _text(self, d):
        if d.strip() and self.stack:
            for e in self.stack:
                e['text'] = True
            self.stack[-1]['own'] = True

    handle_data = _text
    handle_entityref = handle_charref = lambda self, n: self._text('&')

    def handle_endtag(self, tag):
        end, e = self.off(), self.stack.pop()
        if e['tag'] != tag:
            raise SystemExit(f'</{tag}> closes <{e["tag"]}> at offset {end}')
        inline = tag in INLINE
        if not inline and e['inner'] >= self.begin and tag not in ('style', 'script'):
            if not e['block'] and e['text']:
                self.units.append((e['inner'], end))
            elif e['block']:
                self.units += [(a, b) for a, b, t in e['kids'] if t]
                if e['own']:   # bare text beside block children has no block of its own
                    self.loose.append(end)
        if self.stack:
            p = self.stack[-1]
            p['block'] |= not inline or e['block']
            if inline:
                p['kids'].append((e['inner'], end, e['text']))


def key(s):
    return re.sub(r'\s+', ' ', s).strip()


def build(src, ru):
    text = src.read_text(encoding='utf-8')
    begin = text.index('<header class="masthead">')
    cut = Cut(text, begin)
    cut.feed(text)
    if cut.loose:
        print('text loose next to blocks at offsets', cut.loose, file=sys.stderr)
    units = [(a, b) for a, b in cut.units if re.search('[A-Za-z]', re.sub('<[^>]+>', '', text[a:b]))]
    inside = lambda a: any(u0 <= a < u1 for u0, u1 in units)
    spans = sorted(units + [(a, b) for a, b in cut.attrs if a >= begin and not inside(a)
                            and re.search('[A-Za-z]', text[a:b])], reverse=True)
    blocks = [key(text[a:b]) for a, b in spans]

    def page(tr):
        t, n = text, 0
        for (a, b), k in zip(spans, blocks):
            v = tr.get(k) if tr is not None else k
            if v is None:
                v, n = k, n + 1
            t = t[:a] + v + t[b:]
        return t, n

    def fields(t):
        g = lambda pat: re.search(pat, t, re.S).group(1).strip()
        ids = re.findall(r'<section id="([^"]+)"', t)
        body = g(r'(<div class="station">.*?</div>)') + '\n' + g(r'(<nav class="rail".*?</nav>)') + '\n' + g(r'<main class="content">(.*?)</main>') + \
            '\n' + g(r'(<footer>.*?</footer>)')
        body = body.replace('<nav class="rail"', '<nav class="wiki-toc"').replace('<footer>', '<footer class="wiki-foot">')
        for i in ids:
            body = body.replace(f'<section id="{i}">', f'<section id="wiki-{i}">').replace(f'href="#{i}"', f'href="#wiki/{i}"')
        for a, b in LINKS.items():
            body = body.replace(f'href="{a}"', f'href="{b}"')
        return dict(part=g(r'<p class="eyebrow">(.*?)</p>'), title=g(r'<h1>(.*?)</h1>'), lede=g(r'<p class="standfirst">(.*?)</p>'), body=body)

    en, _ = page(None)
    rut, missing = page(ru)
    todo = sorted({k for k in blocks if k not in ru}, key=blocks[::-1].index)
    return dict(en=fields(en), ru=fields(rut)), missing, todo, len(spans), len(set(ru) - set(blocks))


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    args =[a for a in sys.argv[1:] if not a.startswith('--')]
    src = pathlib.Path(args[0]) if args else SRC
    ru = json.loads(RU.read_text(encoding='utf-8')) if RU.exists() else {}
    wiki, missing, todo, n, stale = build(src, ru)
    if '--missing' in sys.argv:
        print(json.dumps({k: '' for k in todo}, ensure_ascii=False, indent=1))
        return
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text('/* Generated by tools/wiki/build_wiki.py from ionozond/docs/ionogram-physics.html. Do not edit. */\n'
                   'PG.wiki = ' + json.dumps(wiki, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8', newline='\n')
    print(f'{n} blocks, {len(todo)} without a Russian translation ({missing} places), {stale} translations no longer used; '
          f'wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
