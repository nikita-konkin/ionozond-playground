/* A day on the path: MUF (or foF2) through the day, and the bandwidth the echo carries at each frequency. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'daily.nav': 'Сутки: полоса без искажений', 'daily.part': 'Часть 11 · Суточный ход',
      'daily.title': 'Сутки на трассе: какую полосу пропускает мода 1F',
      'daily.short': 'Суточный ход МНЧ и карта B_max по частоте и времени — для наклонной трассы и для вертикального зондирования. На фиксированной частоте дисперсия к вечеру растёт: МНЧ опускается к рабочей частоте.',
      'daily.lede': 'Дисперсия определяется отношением f/МНЧ, поэтому на фиксированной частоте она следует за МНЧ. Днём, когда МНЧ около 30 МГц, частота 18 МГц составляет лишь 0,6 МНЧ и почти не искажается, а в сумерки та же частота оказывается вплотную к МНЧ. Карта показывает B_max = 1/√GDD для каждой частоты и каждых 5 минут модельных суток или суток из архива. Для наклонной трассы GDD берётся из медианного закона части 11, для вертикального зондирования — из модели профиля.',
      'daily.geo': 'Зондирование', 'daily.geo.obl': 'Наклонное, Кипр — Йошкар-Ола', 'daily.geo.vi': 'Вертикальное, Йошкар-Ола',
      'daily.f': 'Рабочая частота', 'daily.t': 'Время', 'daily.need': 'Требуемая полоса', 'daily.night': 'МНЧ ночью', 'daily.day': 'МНЧ днём',
      'daily.new': 'Другие сутки', 'daily.nic4': 'NIC4: dur 105 с, запись только до 18 МГц', 'daily.load': 'Загрузить сутки (JSON)',
      'daily.model': 'Вернуться к модели', 'daily.src.model': 'модельные сутки, Кипр — Йошкар-Ола, февраль',
      'daily.src.file': 'архив: {p}, {d}, сеансов: {n}', 'daily.src.vi': ' · вертикальное зондирование: foF2 ≈ МНЧ / {m}',
      'daily.k.t': 'Время, UTC', 'daily.k.m': 'МНЧ', 'daily.k.x': 'f / МНЧ', 'daily.k.g': 'GDD (медиана)', 'daily.k.b': 'B_max',
      'daily.k.h1': 'Часов с модой 1F на f', 'daily.k.hb': 'Часов с B_max не меньше требуемой', 'daily.k.mv': 'foF2', 'daily.k.xv': 'f / foF2',
      'daily.k.gv': 'GDD (по профилю)', 'daily.k.h1v': 'Часов с отражением на f', 'daily.no1f': 'нет 1F: f выше МНЧ',
      'daily.novi': 'нет отражения: f выше foF2', 'daily.cens': '≥ 32,4: край полосы записи', 'daily.extr': 'МНЧ < 18 МГц: закон экстраполирован',
      'daily.cap.map': 'B_max по частоте и времени. Штриховка — выше МНЧ, моды 1F нет. Щелчок по карте выбирает частоту и время.',
      'daily.cap.mapv': 'B_max по частоте и времени для вертикального зондирования. Штриховка — выше foF2, волна уходит сквозь слой. Щелчок по карте выбирает частоту и время.',
      'daily.aria.map': 'Карта наибольшей неискажённой полосы по частоте и времени суток с линиями критической и выбранной частот.',
      'daily.x.t': 'время, UTC', 'daily.y.f': 'частота, МГц', 'daily.l.muf': 'МНЧ', 'daily.l.85': '0,85 МНЧ', 'daily.l.f': 'выбранная частота',
      'daily.l.cut': 'NIC4: выше 18 МГц не записывается', 'daily.l.fo': 'foF2', 'daily.l.foe': 'foE',
      'daily.cap.g': 'GDD на частоте {f} в течение суток', 'daily.cap.b': 'B_max на частоте {f} в течение суток',
      'daily.aria.g': 'Дисперсия на выбранной частоте в течение суток, логарифмическая шкала.',
      'daily.aria.b': 'Наибольшая неискажённая полоса на выбранной частоте в течение суток, логарифмическая шкала.',
      'daily.y.g': '|GDD|, мкс/МГц', 'daily.y.b': 'B_max, кГц', 'daily.err': 'Не удалось прочитать файл: {e}', 'daily.n.lbl': 'Что важно помнить',
      'daily.n.1': 'Карта построена по медиане. Межквартильный разброс GDD при одном и том же f/МНЧ — около ±50 %, так что в отдельном сеансе B_max может оказаться в 1,4 раза уже или шире.',
      'daily.n.2': 'Выше 0,97 МНЧ закон ограничен измеренной медианой вблизи МНЧ — 36,5 мкс/МГц: сама аппроксимация там уходит в бесконечность.',
      'daily.n.4': 'Закон измерен при МНЧ 18–32 МГц. Ночью МНЧ ниже, и там он продолжен пропорционально 1/МНЧ — так ведёт себя профиль ионосферы при том же f/МНЧ. Данными это продолжение пока не подтверждено.',
      'daily.n.5': 'B_max — оценка с запасом: при такой полосе разброс задержки в ней равен 1/B, и импульс почти не искажается. Заметные искажения начинаются примерно при вдвое большей полосе.',
      'daily.n.3': 'Модельные сутки: ночью МНЧ около {n} МГц, днём — около {d} МГц, восход около 04:40 UTC, заход около 14:10 UTC, плюс медленные колебания с периодом порядка 2 ч. Настоящие сутки можно выгрузить из архива скриптом tools/export_daily.py.',
      'daily.n.v1': 'При вертикальном зондировании дисперсия намного сильнее, чем на наклонной трассе: вблизи foF2 и сразу над foE GDD достигает тысяч мкс/МГц, а B_max падает до десятков килогерц. На ионограмме это видно сразу: у критической частоты след круто загибается вверх.',
      'daily.n.v2': 'Профиль модельный: foF2 ≈ МНЧ / {m} (такой коэффициент даёт закон секанса для дневного профиля на этой трассе), слой E днём до 2,8 МГц, hmF2 — 290 км днём и 330 км ночью, полутолщина 90–110 км. Он передаёт общий характер суточного хода, но прогнозом на конкретный день не служит.',
    },
    en: {
      'daily.nav': 'The day: undistorted bandwidth',
      'daily.part': 'Part 11 · Daily course',
      'daily.title': 'A day on the path: the bandwidth 1F carries',
      'daily.short': 'MUF through the day and a map of B_max over frequency and time, for the oblique path and for a vertical sounder. At a fixed frequency, dispersion grows towards evening as the MUF comes down to meet it.',
      'daily.lede': 'Dispersion is set by f/MUF, so at a fixed frequency it follows the MUF. By day, with the MUF near 30 MHz, 18 MHz sits at 0.6 MUF and is barely distorted; at dusk the same frequency finds itself right at the nose. The map shows B_max = 1/√GDD for every frequency and every 5 minutes of a model day, or of a day from the archive. On the oblique path the GDD comes from Part 11’s median law; for a vertical sounder it comes from the profile model.',
      'daily.geo': 'Sounding', 'daily.geo.obl': 'Oblique, Cyprus → Yoshkar-Ola', 'daily.geo.vi': 'Vertical, Yoshkar-Ola',
      'daily.f': 'Working frequency', 'daily.t': 'Time', 'daily.need': 'Bandwidth needed',
      'daily.night': 'MUF at night', 'daily.day': 'MUF by day', 'daily.new': 'Another day',
      'daily.nic4': 'NIC4: dur 105 s, recorded only up to 18 MHz',
      'daily.load': 'Load a day (JSON)', 'daily.model': 'Back to the model',
      'daily.src.model': 'model day, Cyprus → Yoshkar-Ola, February',
      'daily.src.file': 'archive: {p}, {d}, {n} sweeps',
      'daily.src.vi': ' · vertical sounder: foF2 ≈ MUF / {m}',
      'daily.k.t': 'Time, UTC', 'daily.k.m': 'MUF', 'daily.k.x': 'f / MUF', 'daily.k.g': 'GDD (median)', 'daily.k.b': 'B_max', 'daily.k.h1': 'Hours with 1F at f', 'daily.k.hb': 'Hours with B_max ≥ needed',
      'daily.k.mv': 'foF2', 'daily.k.xv': 'f / foF2', 'daily.k.gv': 'GDD (profile)', 'daily.k.h1v': 'Hours with a reflection at f',
      'daily.no1f': 'no 1F: f above MUF', 'daily.novi': 'no reflection: f above foF2', 'daily.cens': '≥ 32.4: edge of the recording', 'daily.extr': 'MUF < 18 MHz: law extended',
      'daily.cap.map': 'B_max over frequency and time. Hatching means above the MUF, no 1F. Click the map to pick a frequency and time.',
      'daily.cap.mapv': 'B_max over frequency and time for a vertical sounder. Hatching means above foF2, where the wave escapes. Click the map to pick a frequency and time.',
      'daily.aria.map': 'Map of the largest undistorted bandwidth over frequency and time of day, with lines for the critical frequency and the chosen frequency.',
      'daily.x.t': 'time, UTC', 'daily.y.f': 'frequency, MHz',
      'daily.l.muf': 'MUF', 'daily.l.85': '0.85 MUF', 'daily.l.f': 'chosen frequency', 'daily.l.cut': 'NIC4: nothing recorded above 18 MHz', 'daily.l.fo': 'foF2', 'daily.l.foe': 'foE',
      'daily.cap.g': 'GDD at {f} through the day', 'daily.cap.b': 'B_max at {f} through the day',
      'daily.aria.g': 'Dispersion at the chosen frequency through the day, logarithmic scale.', 'daily.aria.b': 'Largest undistorted bandwidth at the chosen frequency through the day, logarithmic scale.',
      'daily.y.g': '|GDD|, µs/MHz', 'daily.y.b': 'B_max, kHz',
      'daily.err': 'Could not read the file: {e}',
      'daily.n.lbl': 'Keep in mind',
      'daily.n.1': 'The map is a median. The interquartile spread of GDD at one f/MUF is about ±50 %, so B_max in a single sweep can be 1.4 times narrower or wider.',
      'daily.n.2': 'Above 0.97 MUF the law is held at the measured median near the nose, 36.5 µs/MHz, where the fit itself runs off to infinity.',
      'daily.n.4': 'The law was measured with MUF 18–32 MHz. At night the MUF is lower, and there the law is continued as ∝ 1/MUF, which is how an ionospheric profile behaves at fixed f/MUF. No data has checked that extension.',
      'daily.n.5': 'B_max is a cautious limit: at B_max the delay spread across the band equals 1/B and a pulse barely suffers. It is visibly damaged at about twice that bandwidth.',
      'daily.n.3': 'Model day: MUF about {n} MHz at night and {d} MHz by day, sunrise near 04:40 UTC, sunset near 14:10 UTC, slow wander with a period of about 2 h. A real day can be exported from the archive with tools/export_daily.py.',
      'daily.n.v1': 'A vertical sounder is far more dispersive than the oblique path: near foF2, and just above foE, GDD reaches thousands of µs/MHz and B_max falls to tens of kilohertz. The ionogram shows it directly, as the trace bending upwards at the critical frequency.',
      'daily.n.v2': 'The profile is a model: foF2 ≈ MUF / {m} (the secant law gives that for the daytime profile on this path), an E layer up to 2.8 MHz by day, hmF2 290 km by day and 330 km at night, thickness 90–110 km. It shows the character of a day, not a forecast for a particular one.',
    },
  });

  const TOP = 32.4, MV = 2.7;
  const GEO = {
    obl: { F0: 7.5, F1: 32.5, DF: 0.25, fmin: 7.5, fmax: 32.4, yt: [7.5, 10, 15, 20, 25, 30, 32.5], g: [1, 100], b: [50, 3000] },
    vi: { F0: 1, F1: 14, DF: 0.1, fmin: 1, fmax: 13.9, yt: [1, 2, 4, 6, 8, 10, 12, 14], g: [10, 10000], b: [5, 2000] },
  };
  const BINS = [500, 300, 200, 150, 100];   // kHz edges, widest first → --seq-1 … --seq-6
  const state = { geo: 'obl', night: 12, day: 30, seed: 4, f: { obl: 18, vi: 5 }, t: 12, need: 250, nic4: false, data: null };

  const sig = z => 1 / (1 + Math.exp(-z));
  const dayFrac = h => sig((h - 4.67) / 0.35) * sig((14.17 - h) / 0.6);
  function modelDay() {
    const r = PG.rng(state.seed), phi = Math.exp(-5 / 140), sd = 1.2, n = 288;
    const t = [], m = [], c = [];
    let e = sd * r.n();
    for (let i = 0; i < n; i++) {
      const h = i * 24 / n, s = dayFrac(h);
      e = phi * e + sd * Math.sqrt(1 - phi * phi) * r.n();
      const v = Math.max(8, state.night + (state.day - state.night) * s + e * (0.6 + 0.4 * s));
      t.push(h); m.push(v); c.push(v >= TOP);
    }
    return { t, m, c, step: 24 / n, id: 'model' };
  }
  const day = () => state.data || modelDay();
  const valid = M => M !== null && isFinite(M);

  // Vertical sounder at Yoshkar-Ola: a profile for each moment, from the MUF and the time of day.
  const viProfile = (M, h) => {
    const s = dayFrac(h);
    return PG.vi.profile({ foE: 2.8 * Math.sqrt(s), hmE: 110, ymE: 20, foF2: M / MV, hmF2: 330 - 40 * s, ymF2: 110 - 20 * s }, 0.5);
  };
  // GDD at frequency f and sample i, µs/MHz; NaN where there is no echo.
  function gddAt(f, D, i) {
    const M = D.m[i];
    if (!valid(M)) return NaN;
    if (state.geo === 'obl') return f < M ? PG.model.gddMed(f, M) : NaN;
    return PG.vi.gdd(f, viProfile(M, D.t[i]), 0.02);
  }
  const bAt = g => isFinite(g) ? PG.model.bmax(g) : NaN;
  const binOf = b => { let i = 0; while (i < BINS.length && b < BINS[i]) i++; return i; };   // 0 = widest
  const hhmm = h => { const m = Math.round(h * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const nearest = (D, h) => { let k = 0; for (let i = 1; i < D.t.length; i++) if (Math.abs(D.t[i] - h) < Math.abs(D.t[k] - h)) k = i; return k; };

  // Bins of the map, column by column. The vertical case integrates h'(f) for every cell, so it is cached.
  let cache = { key: '', cols: null };
  function mapBins(D) {
    const G = GEO[state.geo], key = [state.geo, state.night, state.day, state.seed, D.id || D.date, D.t.length].join('|');
    if (cache.key === key) return cache.cols;
    const nr = Math.round((G.F1 - G.F0) / G.DF), cols = [];
    for (let i = 0; i < D.t.length; i++) {
      const M = D.m[i], k = new Int8Array(nr).fill(-1);
      if (valid(M)) {
        if (state.geo === 'obl') {
          for (let r = 0; r < nr; r++) { const f = G.F0 + (r + 0.5) * G.DF; if (f < M) k[r] = binOf(PG.model.bmax(PG.model.gddMed(f, M))); }
        } else {
          const P = viProfile(M, D.t[i]), hv = [];
          for (let r = 0; r <= nr; r++) hv.push(PG.vi.hv(G.F0 + r * G.DF, P));
          for (let r = 0; r < nr; r++) {
            if (!isFinite(hv[r]) || !isFinite(hv[r + 1])) continue;
            k[r] = binOf(PG.model.bmax(1000 * 2 / PG.vi.C * (hv[r + 1] - hv[r]) / G.DF));
          }
        }
      }
      cols.push(k);
    }
    cache = { key, cols };
    return cols;
  }

  function drawMap(svg, D) {
    svg.replaceChildren();
    const G = GEO[state.geo], vi = state.geo === 'vi';
    const P = PG.plot(svg, { x0: 52, x1: 744, y0: 12, y1: 312, xd: [0, 24], yd: [G.F0, G.F1], xt: [0, 3, 6, 9, 12, 15, 18, 21, 24], xf: v => String(v).padStart(2, '0') + ':00',
      yt: G.yt, yf: v => PG.num(v, v % 1 ? 1 : 0), xl: PG.t('daily.x.t'), yl: PG.t('daily.y.f'), ylx: 12, grid: false });
    const { fx, fy, g } = P, w = Math.min(D.step, 0.25);
    // Hatch first: whatever the cells leave uncovered has no echo.
    const hid = PG.uid('hatch');
    const pat = PG.el(PG.el(svg, 'defs'), 'pattern', { id: hid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
    PG.el(pat, 'line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'currentColor', 'stroke-width': 1, opacity: .14 });
    PG.el(g, 'rect', { x: fx(0), y: fy(G.F1), width: fx(24) - fx(0), height: fy(G.F0) - fy(G.F1), fill: `url(#${hid})` });
    const cols = mapBins(D);
    cols.forEach((k, i) => {
      let cur = -1, start = 0;
      const flush = end => { if (cur >= 0) PG.el(g, 'rect', { x: fx(D.t[i] - w / 2), y: fy(G.F0 + end * G.DF), width: Math.max(fx(w) - fx(0) + 1, 1), height: fy(G.F0 + start * G.DF) - fy(G.F0 + end * G.DF), style: `fill:var(--seq-${cur + 1})`, 'shape-rendering': 'crispEdges' }); };
      for (let r = 0; r < k.length; r++) if (k[r] !== cur) { flush(r); cur = k[r]; start = r; }
      flush(k.length);
    });
    if (state.nic4 && !vi) {
      PG.el(g, 'rect', { x: fx(0), y: fy(G.F1), width: fx(24) - fx(0), height: fy(18) - fy(G.F1), style: 'fill:var(--ground)', opacity: .72 });
      PG.el(g, 'line', { x1: fx(0), x2: fx(24), y1: fy(18), y2: fy(18), style: 'stroke:var(--warn)', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' });
    }
    const line = (val, style, dash) => {
      let seg = [];
      const out = () => { if (seg.length > 1) PG.el(g, 'path', { d: PG.path(seg), fill: 'none', style, 'stroke-width': 1.6, 'stroke-dasharray': dash || null }); seg = []; };
      D.t.forEach((h, i) => { const v = val(i, h); if (!isFinite(v)) { out(); return; } seg.push([fx(h), fy(Math.min(v, G.F1))]); });
      out();
    };
    if (vi) {
      line(i => valid(D.m[i]) ? D.m[i] / MV : NaN, 'stroke:var(--ink)');
      line((i, h) => { const e = 2.8 * Math.sqrt(dayFrac(h)); return e > 0.8 ? e : NaN; }, 'stroke:var(--ink)', '5 4');
    } else {
      line(i => valid(D.m[i]) ? D.m[i] : NaN, 'stroke:var(--ink)');
      line(i => valid(D.m[i]) ? 0.85 * D.m[i] : NaN, 'stroke:var(--ink)', '5 4');
      D.t.forEach((h, i) => { if (D.c[i]) PG.el(g, 'circle', { cx: fx(h), cy: fy(G.F1) + 3, r: 1.6, style: 'fill:var(--warn)' }); });
    }
    const f = state.f[state.geo];
    PG.el(g, 'line', { x1: fx(0), x2: fx(24), y1: fy(f), y2: fy(f), style: 'stroke:var(--accent)', 'stroke-width': 2 });
    PG.el(g, 'line', { x1: fx(state.t), x2: fx(state.t), y1: 12, y2: 312, style: 'stroke:var(--accent)', 'stroke-width': 1.2, 'stroke-dasharray': '2 3' });
    PG.el(g, 'circle', { cx: fx(state.t), cy: fy(f), r: 5, style: 'fill:none;stroke:var(--accent)', 'stroke-width': 2 });
    return P;
  }

  // A quantity at the chosen frequency through the day, on a log axis.
  function drawSeries(svg, D, vals, dom, yl, extra) {
    svg.replaceChildren();
    const L = v => Math.log10(v), dec = [];
    for (let e = Math.floor(L(dom[0])); e <= Math.ceil(L(dom[1])); e++) for (const m of [1, 2, 5]) { const v = m * Math.pow(10, e); if (v >= dom[0] && v <= dom[1]) dec.push(L(v)); }
    const P = PG.plot(svg, { x0: 52, x1: 352, y0: 10, y1: 190, xd: [0, 24], yd: [L(dom[0]), L(dom[1])], xt: [0, 6, 12, 18, 24], xf: v => String(v).padStart(2, '0'),
      yt: dec, yf: v => PG.num(Math.pow(10, v), 0), xl: PG.t('daily.x.t'), yl, ylx: 12 });
    const { fx, fy, g } = P;
    if (extra) extra(P, L);
    let seg = [];
    const out = () => { if (seg.length > 1) PG.el(g, 'path', { d: PG.path(seg), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.8 }); seg = []; };
    D.t.forEach((h, i) => { const v = vals[i]; if (!isFinite(v) || v <= 0) { out(); return; } seg.push([fx(h), fy(L(PG.clamp(v, dom[0], dom[1])))]); });
    out();
    PG.el(g, 'line', { x1: fx(state.t), x2: fx(state.t), y1: 10, y2: 190, style: 'stroke:var(--accent)', 'stroke-dasharray': '2 3' });
  }

  function parse(text) {
    const j = JSON.parse(text);
    if (!Array.isArray(j.epoch) || !Array.isArray(j.muf_mhz) || j.epoch.length !== j.muf_mhz.length || !j.epoch.length) throw new Error('epoch[] / muf_mhz[]');
    const d0 = Math.floor(j.epoch[0] / 86400) * 86400, t = [], m = [], c = [];
    j.epoch.forEach((e, i) => {
      if (e < d0 || e >= d0 + 86400) return;
      const v = j.muf_mhz[i];
      t.push((e - d0) / 3600); m.push(v === null || !isFinite(v) ? null : +v);
      c.push(Array.isArray(j.censored) ? !!j.censored[i] : (isFinite(v) && v >= TOP));
    });
    const dts = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b);
    const step = j.step_s ? j.step_s / 3600 : (dts.length ? dts[dts.length >> 1] : 5 / 60);
    const date = j.date || new Date(d0 * 1000).toISOString().slice(0, 10);
    return { t, m, c, step, path: j.path || '?', date, n: t.length, id: 'file:' + date + ':' + t.length };
  }

  function mount(root) {
    const G = GEO[state.geo], vi = state.geo === 'vi';
    const sm = PG.svg(760, 352, PG.t('daily.aria.map')), sg = PG.svg(360, 230, PG.t('daily.aria.g')), sb = PG.svg(360, 230, PG.t('daily.aria.b'));
    const capG = PG.h('p', { class: 'cap' }), capB = PG.h('p', { class: 'cap' }), src = PG.h('span', { class: 'eyebrow', style: 'display:block;margin-bottom:10px' });
    const err = PG.h('p', { class: 'err' });
    const K = vi ? { m: 'mv', x: 'xv', g: 'gv', h1: 'h1v' } : {};
    const cards = PG.cards(['t', 'm', 'x', 'g', 'b', 'h1', 'hb'].map(k => ({ key: k, label: PG.t('daily.k.' + (K[k] || k)) })));
    const note = PG.note();
    let P = null;

    const NB0 = Math.log10(5), NB1 = Math.log10(2000);
    const needS = PG.slider({ label: PG.t('daily.need'), min: 0, max: 1000, step: 1, value: Math.round(1000 * (Math.log10(state.need) - NB0) / (NB1 - NB0)),
      fmt: () => PG.fmtBW(state.need), onInput: v => { state.need = Math.round(Math.pow(10, NB0 + (NB1 - NB0) * v / 1000)); update(); } });
    const fS = PG.slider({ label: PG.t('daily.f'), min: G.fmin, max: G.fmax, step: 0.1, value: state.f[state.geo], fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.f[state.geo] = v; update(); } });
    const tS = PG.slider({ label: PG.t('daily.t'), min: 0, max: 23.9167, step: 1 / 12, value: state.t, fmt: v => hhmm(v), onInput: v => { state.t = v; update(); } });
    const nS = PG.slider({ label: PG.t('daily.night'), min: 8, max: 18, step: 0.5, value: state.night, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.night = v; update(); } });
    const dS = PG.slider({ label: PG.t('daily.day'), min: 18, max: 36, step: 0.5, value: state.day, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.day = v; update(); } });
    const modelCtl = PG.h('div', { class: 'ctl', style: 'margin-top:12px' }, nS.root, dS.root,
      PG.h('div', { style: 'display:flex;align-items:end' }, PG.h('button', { type: 'button', onclick: () => { state.seed++; update(); } }, PG.t('daily.new'))));
    const back = PG.h('button', { type: 'button', onclick: () => { state.data = null; file.value = ''; update(); } }, PG.t('daily.model'));
    const file = PG.h('input', { type: 'file', accept: '.json,application/json', style: 'display:none', onchange: e => {
      const fl = e.target.files[0]; if (!fl) return;
      fl.text().then(txt => { state.data = parse(txt); err.textContent = ''; update(); }).catch(x => { err.textContent = PG.t('daily.err', { e: x.message }); });
    } });
    const geoSeg = PG.seg([{ value: 'obl', label: PG.t('daily.geo.obl') }, { value: 'vi', label: PG.t('daily.geo.vi') }], state.geo, v => {
      state.geo = v; root.replaceChildren(); mount(root);
    });

    sm.addEventListener('click', e => {
      if (!P) return;
      const pt = sm.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(sm.getScreenCTM().inverse());
      if (q.x < 52 || q.x > 744 || q.y < 12 || q.y > 312) return;
      state.t = Math.round(PG.clamp((q.x - 52) / (744 - 52) * 24, 0, 23.9167) * 12) / 12;
      state.f[state.geo] = Math.round(PG.clamp(G.F0 + (312 - q.y) / 300 * (G.F1 - G.F0), G.fmin, G.fmax) * 10) / 10;
      fS.set(state.f[state.geo]); tS.set(state.t); update();
    });
    sm.style.cursor = 'crosshair';

    function update() {
      const D = day(), f = state.f[state.geo];
      modelCtl.style.display = state.data ? 'none' : '';
      back.style.display = state.data ? '' : 'none';
      src.textContent = (state.data ? PG.t('daily.src.file', { p: D.path, d: D.date, n: D.n }) : PG.t('daily.src.model')) + (vi ? PG.t('daily.src.vi', { m: PG.num(MV, 1) }) : '');
      P = drawMap(sm, D);
      const gs = D.t.map((_, i) => gddAt(f, D, i)), bs = gs.map(bAt);
      drawSeries(sg, D, gs.map(Math.abs), G.g, PG.t('daily.y.g'));
      drawSeries(sb, D, bs, G.b, PG.t('daily.y.b'), ({ fx, fy, g }, L) =>
        PG.el(g, 'line', { x1: fx(0), x2: fx(24), y1: fy(L(PG.clamp(state.need, G.b[0], G.b[1]))), y2: fy(L(PG.clamp(state.need, G.b[0], G.b[1]))), style: 'stroke:var(--warn)', 'stroke-dasharray': '5 4' }));
      const fl = PG.num(f, 1) + ' ' + PG.U('MHz');
      capG.textContent = PG.t('daily.cap.g', { f: fl }); capB.textContent = PG.t('daily.cap.b', { f: fl });
      const i = nearest(D, state.t), M = D.m[i], crit = valid(M) ? (vi ? M / MV : M) : NaN;
      cards.set('t', hhmm(D.t[i]));
      cards.set('m', !isFinite(crit) ? '–' : (!vi && D.c[i] ? '≥ ' + PG.num(TOP, 1) : PG.num(crit, 1)) + ' ' + PG.U('MHz'),
        !vi && D.c[i] ? PG.t('daily.cens') : !vi && isFinite(crit) && crit < PG.model.MUF_MIN ? PG.t('daily.extr') : '');
      const ok = isFinite(gs[i]);
      cards.set('x', ok ? PG.num(f / crit, 2) : '–', ok ? '' : PG.t(vi ? 'daily.novi' : 'daily.no1f'));
      cards.set('g', ok ? PG.num(gs[i], Math.abs(gs[i]) < 100 ? 1 : 0) + ' ' + PG.U('usMHz') : '–');
      cards.set('b', ok ? PG.fmtBW(bs[i]) : '–');
      let h1 = 0, hb = 0;
      gs.forEach((g, k) => { if (isFinite(g)) { h1 += D.step; if (bs[k] >= state.need) hb += D.step; } });
      cards.set('h1', PG.num(h1, 1) + ' ' + PG.U('h'));
      cards.set('hb', PG.num(hb, 1) + ' ' + PG.U('h'), '≥ ' + PG.fmtBW(state.need));
      const model = state.data ? null : PG.t('daily.n.3', { n: PG.num(state.night, 0), d: PG.num(state.day, 0) });
      if (vi) note.set('', PG.t('daily.n.lbl'), PG.t('daily.n.v1'), PG.t('daily.n.v2', { m: PG.num(MV, 1) }), PG.t('daily.n.5'), model);
      else note.set('', PG.t('daily.n.lbl'), PG.t('daily.n.1'), PG.t('daily.n.2'), PG.t('daily.n.4'), PG.t('daily.n.5'), model);
    }

    const legend = PG.legend([
      ...['> 500', '300–500', '200–300', '150–200', '100–150', '< 100'].map((l, i) => ['box', `background:var(--seq-${i + 1})`, l + ' ' + PG.U('kHz')]),
      ...(vi ? [['line', 'border-color:var(--ink)', PG.t('daily.l.fo')], ['dash', 'border-color:var(--ink)', PG.t('daily.l.foe')], ['line', 'border-color:var(--accent)', PG.t('daily.l.f')]]
        : [['line', 'border-color:var(--ink)', PG.t('daily.l.muf')], ['dash', 'border-color:var(--ink)', PG.t('daily.l.85')], ['line', 'border-color:var(--accent)', PG.t('daily.l.f')], ['dash', 'border-color:var(--warn)', PG.t('daily.l.cut')]])]);

    root.append(
      PG.h('div', { class: 'panel' },
        PG.h('div', { class: 'field', style: 'margin-bottom:12px' }, PG.h('label', null, PG.h('span', null, PG.t('daily.geo'))), geoSeg),
        PG.h('div', { class: 'ctl' }, fS.root, tS.root, needS.root),
        modelCtl,
        PG.h('div', { class: 'row' },
          vi ? null : PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.nic4, onchange: e => { state.nic4 = e.target.checked; update(); } }), PG.t('daily.nic4')),
          PG.h('button', { type: 'button', onclick: () => file.click() }, PG.t('daily.load')), back, file),
        err),
      cards.root,
      PG.h('div', { class: 'panel' }, src, PG.h('p', { class: 'cap' }, PG.t(vi ? 'daily.cap.mapv' : 'daily.cap.map')), legend, sm),
      PG.h('div', { class: 'two', style: 'margin-bottom:16px' }, PG.h('div', { class: 'panel' }, capG, sg), PG.h('div', { class: 'panel' }, capB, sb)),
      note.root);
    update();
  }

  PG.register({ id: 'daily', mount });
})();
