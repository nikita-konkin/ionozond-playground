/* Ionozond playground: shared helpers, translations, the GDD model, routing.
   Classic script (no modules) so the site also works opened straight from disk. */
(function () {
  'use strict';
  const PG = window.PG = { modules: [], lang: 'ru', dict: { ru: {}, en: {} } };

  /* ------------------------------------------------------------ language */

  PG.i18n = d => { for (const l in d) Object.assign(PG.dict[l], d[l]); };
  PG.t = (k, v) => {
    const s = PG.dict[PG.lang][k] ?? PG.dict.en[k] ?? k;
    return v ? s.replace(/\{(\w+)\}/g, (_, n) => (v[n] ?? '')) : s;
  };
  PG.U = k => PG.t('u.' + k);
  // Fixed decimals, true minus sign, decimal comma in Russian.
  PG.num = (v, d = 1) => {
    if (v === null || v === undefined || !isFinite(v)) return '–';
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    let s = (+v).toFixed(d);
    if (Math.abs(v) >= 10000) s = s.replace(/^(-?\d+)/, m => m.replace(/\B(?=(\d{3})+$)/g, '_'));
    if (s[0] === '-') s = '−' + s.slice(1);
    s = PG.lang === 'ru' ? s.replace('.', ',') : s;
    return s.replace(/_/g, PG.lang === 'ru' ? '\u202f' : ',');
  };
  PG.sig = (v, n = 2) => {   // n significant digits, never fewer than 0 decimals
    if (!isFinite(v) || v === 0) return PG.num(v, 0);
    const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v))));
    return PG.num(v, Math.min(d, 4));
  };

  PG.i18n({
    ru: {
      'u.MHz': 'МГц', 'u.kHz': 'кГц', 'u.Hz': 'Гц', 'u.us': 'мкс', 'u.ms': 'мс', 'u.s': 'с', 'u.km': 'км', 'u.dB': 'дБ', 'u.usMHz': 'мкс/МГц',
      'u.kHzs': 'кГц/с', 'u.h': 'ч', 'app.eyebrow': 'Ionozond · практикум',
      'app.title': 'ЛЧМ-зондирование ионосферы: интерактивные модели', 'nav.home': 'Обзор', 'nav.label': 'Разделы',
      'theme.label': 'Оформление', 'theme.auto': 'Как в системе', 'theme.light': 'Светлая тема', 'theme.dark': 'Тёмная тема',
      'foot.1': "Интерактивное пособие к справочнику «Ионограммы наклонного ЛЧМ-зондирования» (Oblique Chirp Ionograms). Численные данные приведены по справочнику и результатам обработки записей зондирования на трассе Кипр — Йошкар-Ола за 4–9 февраля 2026 г. В материалах отдельно указано, где представлены результаты измерений, а где — модельные расчёты.",
      'foot.2': "Для работы с локальной копией сайта достаточно открыть index.html: подключение к интернету и запуск сервера не требуются. При отсутствии доступа к Google Fonts используются системные шрифты.",
      'home.title': 'ЛЧМ-зондирование ионосферы: интерактивные модели',
      'home.lede': "Пять интерактивных моделей поясняют методы зондирования на трассе Кипр — Йошкар-Ола и работу программы ionozond. Они показывают влияние ошибок синхронизации и длины БПФ, расписание станций, суточный ход МНЧ и вертикальное зондирование той же ионосферы. В отдельном разделе об имитаторе КВ-канала можно сравнить реальные и синтезированные сеансы.",
      'home.open': 'Открыть', 'foot.build': 'Версия {sha} от {date}',
    },
    en: {
      'u.MHz': 'MHz', 'u.kHz': 'kHz', 'u.Hz': 'Hz', 'u.us': 'µs', 'u.ms': 'ms', 'u.s': 's', 'u.km': 'km', 'u.dB': 'dB',
      'u.usMHz': 'µs/MHz', 'u.kHzs': 'kHz/s', 'u.h': 'h',
      'app.eyebrow': 'Ionozond · playground', 'app.title': 'Oblique chirp sounding: interactive models',
      'nav.home': 'Overview', 'nav.label': 'Sections',
      'theme.label': 'Theme', 'theme.auto': 'Match the system', 'theme.light': 'Light theme', 'theme.dark': 'Dark theme',
      'foot.1': 'A companion to “Oblique Chirp Ionograms” (ionozond/docs/ionogram-physics.html). Numbers come from it and from the Cyprus → Yoshkar-Ola archive of 4–9 February 2026; where a page shows a model rather than a measurement, it says so.',
      'foot.2': 'Runs without a server or a network: open index.html. Fonts come from Google Fonts and fall back to system fonts offline.',
      'home.title': 'Oblique chirp sounding: interactive models',
      'home.lede': 'Five interactive models explore chirptime errors, FFT length, the station schedule, the daily MUF course and vertical sounding for the Cyprus → Yoshkar-Ola path and the ionozond console. The HF channel simulator page shows real soundings alongside soundings synthesised from them.',
      'home.open': 'Open', 'foot.build': 'Version {sha}, {date}',
    },
  });

  /* ------------------------------------------------------------- DOM */

  let uidN = 0;
  PG.uid = p => (p || 'pg') + (++uidN);
  PG.h = (tag, props, ...kids) => {
    const e = document.createElement(tag);
    for (const k in (props || {})) {
      const v = props[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : String(c));
    return e;
  };

  PG.slider = o => {
    const id = PG.uid('s'), out = PG.h('b');
    const input = PG.h('input', { id, type: 'range', min: o.min, max: o.max, step: o.step, value: o.value });
    const refresh = () => { out.textContent = o.fmt(+input.value); };
    input.addEventListener('input', () => { refresh(); if (o.onInput) o.onInput(+input.value); });
    if (o.onChange) input.addEventListener('change', () => o.onChange(+input.value));
    refresh();
    const root = PG.h('div', { class: 'field' }, PG.h('label', { for: id }, PG.h('span', null, o.label), out), input, o.extra || null);
    return { root, input, refresh, set: v => { input.value = v; refresh(); } };
  };

  PG.seg = (opts, cur, onPick) => {
    const wrap = PG.h('div', { class: 'seg', role: 'group' });
    const bs = opts.map(o => PG.h('button', { type: 'button', 'aria-pressed': String(o.value === cur), title: o.title }, o.label));
    bs.forEach((b, i) => b.addEventListener('click', () => {
      bs.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      onPick(opts[i].value);
    }));
    wrap.append(...bs);
    wrap.select = v => bs.forEach((b, i) => b.setAttribute('aria-pressed', String(opts[i].value === v)));
    return wrap;
  };

  PG.cards = items => {
    const els = {};
    const root = PG.h('div', { class: 'cards' }, items.map(it => {
      const v = PG.h('div', { class: 'v' }, '–'), s = PG.h('div', { class: 's' }, it.sub || '');
      els[it.key] = { v, s };
      return PG.h('div', { class: 'card' }, PG.h('div', { class: 'l', html: it.label }), v, s);
    }));
    return { root, set: (k, v, s) => { els[k].v.textContent = v; if (s !== undefined) els[k].s.textContent = s; } };
  };

  PG.note = () => {
    const lbl = PG.h('span', { class: 'lbl' }), body = PG.h('div');
    const root = PG.h('div', { class: 'note' }, lbl, body);
    return {
      root,
      set: (kind, label, ...paras) => {
        root.className = 'note' + (kind ? ' ' + kind : '');
        lbl.textContent = label;
        body.replaceChildren(...paras.filter(Boolean).map(p => PG.h('p', null, p)));
      },
    };
  };

  PG.legend = items => PG.h('div', { class: 'legend' }, items.map(([cls, style, label]) =>
    PG.h('span', null, PG.h('i', { class: 'sw ' + cls, style }), label)));

  /* ------------------------------------------------------------- SVG */

  const NS = 'http://www.w3.org/2000/svg';
  PG.el = (p, tag, a) => {
    const e = document.createElementNS(NS, tag);
    for (const k in (a || {})) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  };
  PG.text = (p, x, y, s, a) => {
    const e = PG.el(p, 'text', Object.assign({ x, y, 'font-size': 11, fill: 'currentColor', 'font-family': 'IBM Plex Mono, ui-monospace, monospace' }, a || {}));
    e.textContent = s;
    return e;
  };
  PG.path = pts => pts.length ? 'M' + pts.map(p => (+p[0]).toFixed(1) + ',' + (+p[1]).toFixed(1)).join(' L') : '';
  PG.svg = (w, h, aria) => PG.el(null, 'svg', { class: 'fig', viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': aria || '' });

  PG.ticks = (a, b, n) => {
    const step0 = (b - a) / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(step0))), r = step0 / mag;
    const step = (r >= 7.5 ? 10 : r >= 3.5 ? 5 : r >= 1.5 ? 2 : 1) * mag, out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9 * Math.abs(step); v += step) out.push(+v.toFixed(10));
    return out;
  };

  // Axes, grid, frame and a clipped group for the data. Returns scales and the group.
  PG.plot = (svg, o) => {
    const { x0, x1, y0, y1, xd, yd } = o;
    const fx = v => x0 + (v - xd[0]) / (xd[1] - xd[0]) * (x1 - x0);
    const fy = v => y1 - (v - yd[0]) / (yd[1] - yd[0]) * (y1 - y0);
    const xt = o.xt || PG.ticks(xd[0], xd[1], o.nx || 6), yt = o.yt || PG.ticks(yd[0], yd[1], o.ny || 5);
    const xf = o.xf || (v => PG.num(v, 0)), yf = o.yf || (v => PG.num(v, 0));
    if (o.grid !== false) {
      const g = PG.el(svg, 'g', { stroke: 'currentColor', 'stroke-width': .7, opacity: .12 });
      xt.forEach(v => PG.el(g, 'line', { x1: fx(v), y1: y0, x2: fx(v), y2: y1 }));
      yt.forEach(v => PG.el(g, 'line', { x1: x0, y1: fy(v), x2: x1, y2: fy(v) }));
    }
    const id = PG.uid('clip');
    PG.el(PG.el(PG.el(svg, 'defs'), 'clipPath', { id }), 'rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
    const g = PG.el(svg, 'g', { 'clip-path': `url(#${id})` });
    PG.el(svg, 'rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.1, opacity: .55 });
    const lab = PG.el(svg, 'g', { opacity: .62 });
    xt.forEach(v => PG.text(lab, fx(v), y1 + 15, xf(v), { 'text-anchor': 'middle' }));
    yt.forEach(v => PG.text(lab, x0 - 6, fy(v) + 4, yf(v), { 'text-anchor': 'end' }));
    if (o.xl) PG.text(svg, (x0 + x1) / 2, y1 + 33, o.xl, { 'text-anchor': 'middle', opacity: .78 });
    if (o.yl) {
      const yx = o.ylx ?? 14, ym = (y0 + y1) / 2;
      PG.text(svg, yx, ym, o.yl, { 'text-anchor': 'middle', opacity: .78, transform: `rotate(-90 ${yx} ${ym})` });
    }
    return { fx, fy, g, xt, yt };
  };

  /* ------------------------------------------------------------- numbers */

  PG.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PG.rng = seed => {   // mulberry32 + Box–Muller
    let s = seed >>> 0;
    const u = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const n = () => { let a = 0; while (!a) a = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u()); };
    return { u, n };
  };

  // Colour tables for canvas maps: 256 RGB steps through [position, [r, g, b]] stops.
  PG.hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  PG.lut = stops => {
    const out = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const x = i / 255;
      let k = 0;
      while (k < stops.length - 2 && x > stops[k + 1][0]) k++;
      const [x0, c0] = stops[k], [x1, c1] = stops[k + 1], u = PG.clamp((x - x0) / (x1 - x0), 0, 1);
      for (let j = 0; j < 3; j++) out[i * 3 + j] = c0[j] + u * (c1[j] - c0[j]);
    }
    return out;
  };
  PG.VIRIDIS = PG.lut(['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#fde725']
    .map((c, i, a) => [i / (a.length - 1), PG.hex(c)]));

  /* ------------------------------------------- model shared by the pages */

  PG.model = {
    b: 7.5, MUF_MIN: 18, tau1F: 8950,
    scale(M) { return M < this.MUF_MIN ? this.MUF_MIN / M : 1; },
    tauL(f, M, t0) { const x = Math.min(f / M, 1); return (t0 ?? this.tau1F) + this.scale(M) * this.b * M * (2 * (1 - Math.sqrt(1 - x)) - x); },
    tauU(f, M) { return this.tauL(M, M) + this.scale(M) * 2 * this.b * M * 1.6 * Math.sqrt(Math.max(0, 1 - f / M)); },
  };

  /* ------------------------------------------------ vertical incidence */

  // Parabolic E and F2 layers, no valley between them, no magnetic field (the O trace). h'(f) is
  // integrated exactly over a piecewise-linear f_N² profile: each step contributes
  // 2Δh/(√u₁ + √u₂), u = 1 − f_N²/f², so the reflection singularity never has to be sampled.
  // Checked against the closed form for one parabolic layer to 0.02 km up to 0.99 foF2.
  const C_KM_MS = 299.792458;
  PG.vi = {
    C: C_KM_MS,
    PRESETS: {
      day: { foE: 2.8, hmE: 110, ymE: 20, foF2: 9.5, hmF2: 290, ymF2: 90 },
      dusk: { foE: 1.6, hmE: 110, ymE: 20, foF2: 6.5, hmF2: 310, ymF2: 100 },
      night: { foE: 0, hmE: 110, ymE: 20, foF2: 4.4, hmF2: 330, ymF2: 110 },
    },
    profile(p, dh) {
      dh = dh || 0.25;
      const lays = [[p.foF2, p.hmF2, p.ymF2, true]];
      if (p.foE > 0.3) lays.push([p.foE, p.hmE, p.ymE, false]);
      const hb = Math.min(...lays.map(l => l[1] - l[2]));
      const n = Math.floor((p.hmF2 - hb) / dh) + 1, h = new Float64Array(n), f2 = new Float64Array(n);
      let run = 0;
      for (let i = 0; i < n; i++) {
        const hh = hb + i * dh;
        let v = 0;
        for (const [fo, hm, ym, top] of lays) {
          if (hh < hm - ym) continue;
          const z = (hh - hm) / ym;
          v = Math.max(v, hh > hm && !top ? fo * fo : fo * fo * (1 - z * z));
        }
        run = Math.max(run, v);
        h[i] = hh; f2[i] = run;
      }
      return { p, h, f2, fmax: Math.sqrt(f2[n - 1]) };
    },
    hv(f, P) {   // virtual height, km; NaN where the wave goes through
      const F = f * f, h = P.h, f2 = P.f2, n = h.length;
      if (!(f > 0) || F >= f2[n - 1]) return NaN;
      let lo = 0, hi = n - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (f2[m] > F) hi = m; else lo = m + 1; }
      const i = lo;
      if (i === 0) return h[0];
      let s = 0, sa = Math.sqrt(1 - f2[0] / F);
      for (let k = 1; k < i; k++) { const sb = Math.sqrt(1 - f2[k] / F); s += 2 * (h[k] - h[k - 1]) / (sa + sb); sa = sb; }
      const hr = h[i - 1] + (F - f2[i - 1]) / (f2[i] - f2[i - 1]) * (h[i] - h[i - 1]);
      return h[0] + s + 2 * (hr - h[i - 1]) / sa;
    },
    tau(f, P) { return 2 * this.hv(f, P) / C_KM_MS; },                 // ms
    // X trace, roughly: it reflects where f_N² = f(f − f_H), so read the O trace there.
    hvX(f, P, fH) { return f > fH ? this.hv(Math.sqrt(f * (f - fH)), P) : NaN; },
    // The same ionosphere seen over an oblique path: secant law and Martyn's equivalent path with a
    // curved-earth mirror at h'. Rays that would need a negative elevation are dropped.
    oblique(P, D) {
      const R = 6371, th = (D || 2634) / (2 * R), fo = P.p.foF2, fvs = [];
      for (let i = 1; i <= 500; i++) fvs.push(0.3 + (fo - 0.3) * i / 501);
      for (let i = 0; i <= 900; i++) fvs.push(fo * (1 - 0.5 * Math.pow(10, -5 * i / 900)));
      fvs.sort((a, b) => a - b);
      const out = { f: [], tau: [], k: -1, muf: NaN };
      for (const fv of fvs) {
        if (fv <= P.p.foE) continue;
        const hv = this.hv(fv, P);
        if (!isFinite(hv)) continue;
        const AB = Math.sqrt(R * R + (R + hv) ** 2 - 2 * R * (R + hv) * Math.cos(th));
        const phi = Math.asin(Math.min(1, R * Math.sin(th) / AB));
        if (Math.PI / 2 - th - phi < 0) continue;                   // elevation below the horizon
        const f = fv / Math.cos(phi);
        out.f.push(f); out.tau.push(2 * AB / C_KM_MS);
        if (!(f <= out.muf)) { out.muf = f; out.k = out.f.length - 1; }
      }
      return out;
    },
  };

  /* ------------------------------------------------------------- shell */

  PG.register = m => PG.modules.push(m);

  const home = {
    id: 'home',
    mount(root) {
      root.append(PG.h('div', { class: 'home' }, PG.modules.map((m, i) =>
        PG.h('a', { class: 'tile', href: '#' + m.id },
          PG.h('span', { class: 'eyebrow' }, PG.t(m.id + '.part')),
          PG.h('b', null, PG.t(m.id + '.title')),
          PG.h('span', { class: 'd' }, PG.t(m.id + '.short'))))));
    },
  };

  // #page or #page/section; the section is the element with id page-section. Moving between
  // sections of the page already on screen only scrolls, unless redraw asks for a fresh mount.
  function route(redraw) {
    const [id, sub] = location.hash.replace('#', '').split('/');
    const m = PG.modules.find(x => x.id === id) || home;
    const target = () => sub && document.getElementById(m.id + '-' + sub);
    if (!redraw && sub && route.last === m.id && target()) {
      target().scrollIntoView();
      if (m.onRoute) m.onRoute(sub);
      route.sub = sub; return;
    }
    const main = document.getElementById('main');
    main.replaceChildren();
    const isHome = m === home;
    main.append(
      PG.h('span', { class: 'eyebrow part-no' }, isHome ? PG.t('app.eyebrow') : PG.t(m.id + '.part')),
      PG.h('h1', null, isHome ? PG.t('home.title') : PG.t(m.id + '.title')),
      PG.h('p', { class: 'lede' }, isHome ? PG.t('home.lede') : PG.t(m.id + '.lede')));
    const body = PG.h('div');
    main.append(body);
    m.mount(body);
    if (PG.references) PG.references.annotate(main, m.id);
    document.title = (isHome ? '' : PG.t(m.id + '.title') + ' · ') + PG.t('app.eyebrow');
    document.querySelectorAll('nav.rail a').forEach(a => a.setAttribute('aria-current', a.dataset.id === m.id ? 'page' : 'false'));
    if (target()) target().scrollIntoView();
    else if (route.last !== m.id || route.sub) window.scrollTo(0, 0);
    if (m.onRoute) m.onRoute(sub);
    route.last = m.id; route.sub = sub;
  }

  // The commit the deployed site was built from (js/build.js, written by the deploy workflow): its
  // short hash, linked to the commit, and its date. A copy run from the repository has none.
  function footBuild() {
    const p = document.querySelector('.foot .build'), b = PG.build;
    if (!p || !b) return;
    const date = new Date(b.date).toLocaleDateString(PG.lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const [pre, post] = PG.t('foot.build', { sha: '{sha}', date }).split('{sha}');
    p.replaceChildren(pre, PG.h('a', { class: 'mono', href: b.url + '/commit/' + b.sha }, b.sha.slice(0, 7)), post);
    p.hidden = false;
  }

  function shell() {
    document.documentElement.lang = PG.lang;
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = PG.t(e.dataset.i18n); });
    footBuild();
    const nav = document.querySelector('nav.rail');
    nav.setAttribute('aria-label', PG.t('nav.label'));
    nav.replaceChildren(
      PG.h('a', { href: '#home', 'data-id': 'home' }, PG.t('nav.home')),
      ...PG.modules.map(m => PG.h('a', { href: '#' + m.id, 'data-id': m.id }, PG.t(m.id + '.nav'))));
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === PG.lang)));
    document.querySelector('.theme').setAttribute('aria-label', PG.t('theme.label'));
    document.querySelectorAll('.theme button').forEach(b => {
      const l = PG.t('theme.' + b.dataset.themeSet);
      b.setAttribute('aria-label', l); b.title = l;
      b.setAttribute('aria-pressed', String(b.dataset.themeSet === PG.theme));
    });
  }

  // 'auto' follows prefers-color-scheme; 'light' and 'dark' set data-theme, which the stylesheet
  // checks before the media query. Charts use CSS variables only, so nothing needs redrawing.
  PG.theme = 'auto';
  PG.setTheme = t => {
    PG.theme = t === 'light' || t === 'dark' ? t : 'auto';
    if (PG.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', PG.theme);
    try { localStorage.setItem('pg-theme', PG.theme); } catch (e) { /* private mode */ }
    document.querySelectorAll('.theme button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === PG.theme)));
  };

  PG.setLang = l => {
    PG.lang = l === 'en' ? 'en' : 'ru';
    try { localStorage.setItem('pg-lang', PG.lang); } catch (e) { /* private mode */ }
    shell();
    route(true);
  };

  PG.start = () => {
    let saved = null;
    try { saved = localStorage.getItem('pg-lang'); } catch (e) { /* private mode */ }
    const q = new URLSearchParams(location.search).get('lang');
    PG.lang = q === 'en' || q === 'ru' ? q : saved === 'en' ? 'en' : 'ru';
    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => PG.setLang(b.dataset.lang)));
    let th = null;
    try { th = localStorage.getItem('pg-theme'); } catch (e) { /* private mode */ }
    PG.setTheme(new URLSearchParams(location.search).get('theme') || th);
    document.querySelectorAll('.theme button').forEach(b => b.addEventListener('click', () => PG.setTheme(b.dataset.themeSet)));
    window.addEventListener('hashchange', () => route());
    shell();
    route();
  };
})();
