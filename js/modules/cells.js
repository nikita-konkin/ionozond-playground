/* FFT length against sweep rate: the shape of one ionogram cell, and what the speckle filter keeps. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'cells.nav': 'Длина БПФ и ячейка', 'cells.part': 'Часть 6 · От сеанса к пикселю',
      'cells.title': 'Каждой скорости перестройки — своя длина БПФ',
      'cells.short': 'Ячейка ионограммы — это k·N/f_ПЧ по частоте на f_ПЧ/(k·N) по задержке. При 500 кГц/с БПФ на 16 384 точки даёт приплюснутую ячейку: след не удерживается в одной строке, и фильтр мелких объектов его стирает.',
      'cells.lede': 'Спектр по N отсчётам при ПЧ 40 кГц охватывает N/40 000 с записи. За это время частота передатчика уходит на k·N/f_ПЧ — это ширина столбца, а разрешение спектра f_ПЧ/N, делённое на k, — высота строки по задержке. Чтобы ячейка сохраняла форму, N нужно менять как 1/√k. Ниже короткий след переносится на эту сетку с учётом отклика окна Ханна и проходит через фильтр мелких объектов ionozond: окно 9 × 3, порог — 11 соседей.',
      'cells.rate': 'Скорость перестройки', 'cells.N': 'Длина БПФ', 'cells.trace': 'Пример следа', 'cells.p.mag': 'Магадан, ночь',
      'cells.p.mid': 'Кипр, середина 1F', 'cells.p.nose': 'Кипр, у МНЧ', 'cells.p.vi': 'Вертикальное, у foF2',
      'cells.span': 'Протяжённость следа', 'cells.slope': 'Наклон следа', 'cells.dop': 'Доплеровское расширение (СКО)',
      'cells.snr': 'ОСШ в столбце при N = 4096', 'cells.k.cell': 'Ячейка', 'cells.k.cols': 'Столбцов на следе',
      'cells.k.rows': 'Строк задержки на столбец', 'cells.k.win': 'Окно фильтра 9 × 3', 'cells.k.shape': 'Форма относительно 100 кГц/с и 16 384',
      'cells.k.same': 'Та же форма при', 'cells.flat': 'приплюснута в {v} раза', 'cells.tall': 'вытянута в {v} раза',
      'cells.square': 'как у исходной', 'cells.same.v': 'N ≈ {n}', 'cells.same.s': 'ближайшие: {a} и {b}', 'cells.same.x': 'ровно степень двойки',
      'cells.cap': 'Сетка на участке {f} × {t}: столбец {w}, строка {b}',
      'cells.aria': 'Сетка ячеек ионограммы с перенесённым на неё следом и результатом работы фильтра мелких объектов.',
      'cells.x': 'частота, МГц', 'cells.y': 'задержка от начала окна, мкс', 'cells.l.kept': 'выше порога, сохранено',
      'cells.l.del': 'выше порога, стёрто фильтром', 'cells.l.true': 'истинный след', 'cells.l.noise': 'шум',
      'cells.v.lbl': 'Фильтр мелких объектов',
      'cells.v.kept': 'След уцелел: фильтр пропустил {k} из {n} ячеек, превысивших порог.',
      'cells.v.part': 'След частично стёрт: осталось {k} из {n} ячеек. Пропадают концы и тонкие участки.',
      'cells.v.gone': 'След стёрт целиком: ни одна из {n} ячеек не набрала 11 соседей в окне 9 × 3.',
      'cells.v.none': 'След ни в одной ячейке не превысил порог.',
      'cells.v.why': 'След в одну строку набирает не больше 9 соседей, а нужно 11. След шириной в 3 столбца — тоже не больше 9, сколько бы строк он ни занимал.',
      'cells.th.N': 'БПФ', 'cells.th.cell': 'Ячейка', 'cells.th.cols': 'Столбцов', 'cells.th.rows': 'Строк на столбец',
      'cells.th.peak': 'Пик в ячейке', 'cells.th.kept': 'Осталось после фильтра',
      'cells.tbl': 'Все длины БПФ для выбранной скорости и следа. Щёлкните по строке, чтобы показать её на сетке. Более длинный спектр накапливает больше энергии (вдвое на каждое удвоение N), но лишь до тех пор, пока след не выходит за пределы одной строки.',
      'cells.model': 'Модель: в каждом столбце след занимает отрезок задержек, заданный его наклоном на ширине столбца; мощность распределяется по строкам с откликом окна Ханна (−1,4 дБ посередине между отсчётами, −6 дБ по амплитуде в соседнем) с усреднением по отрезку и по гауссову доплеровскому разбросу σ/k. Пиковое ОСШ в ячейке растёт пропорционально N. Ячейка считается превысившей порог, если её ОСШ не меньше 8 дБ; ionozond вычисляет порог по методу Розина из самого спектра, так что здесь он условный. Шумовые выбросы появляются с вероятностью e^(−6,3) на ячейку. Фильтр: окно 9 столбцов × 3 строки с центром в ячейке, требуется не меньше 11 занятых ячеек (включая её саму), как в lfp_products.py. Проверено полной обработкой: синтетическая запись, БПФ с окном Ханна и сама функция delete_small_objects из lfp_products.py дают ту же картину (Магадан, 0,5 Гц: при 8192 остаётся 10 ячеек из 16, при 16 384 — ни одной из 15). Замирания модель не учитывает: в настоящей записи число уцелевших ячеек сильно меняется от сеанса к сеансу — при 4096 от 7 до 33.',
    },
    en: {
      'cells.nav': 'FFT length and cell shape',
      'cells.part': 'Part 6 · From sweep to pixel',
      'cells.title': 'One FFT length per sweep rate',
      'cells.short': 'A cell is k·N/f_IF of sweep by f_IF/(k·N) of delay. At 500 kHz/s, 16 384 points make a flat cell, the trace leaves its bin, and the speckle filter deletes it.',
      'cells.lede': 'An N-point spectrum at the 40 kHz IF lasts N/40 000 s. Meanwhile the transmitter moves k·N/f_IF in frequency, which is the column width, and the spectral bin f_IF/N divided by k is the height of a delay row. Keeping the cell’s shape needs N to scale as 1/√k. Below, a short trace is rasterised onto that grid with a Hann window’s bin response and then put through the console’s speckle filter: a 9 × 3 window and a threshold of 11 neighbours.',
      'cells.rate': 'Sweep rate', 'cells.N': 'FFT length', 'cells.trace': 'Example trace',
      'cells.p.mag': 'Magadan at night', 'cells.p.mid': 'Cyprus, mid 1F', 'cells.p.nose': 'Cyprus near MUF', 'cells.p.vi': 'Vertical, near foF2',
      'cells.span': 'Trace extent', 'cells.slope': 'Trace slope', 'cells.dop': 'Doppler spread (RMS)', 'cells.snr': 'Column SNR at N = 4096',
      'cells.k.cell': 'Cell', 'cells.k.cols': 'Columns on the trace', 'cells.k.rows': 'Delay bins per column', 'cells.k.win': '9 × 3 filter window', 'cells.k.shape': 'Shape against 100 kHz/s · 16 384', 'cells.k.same': 'Same shape at',
      'cells.flat': '{v}× flatter', 'cells.tall': '{v}× taller', 'cells.square': 'as the original',
      'cells.same.v': 'N ≈ {n}', 'cells.same.s': 'nearest: {a} and {b}', 'cells.same.x': 'a power of two already',
      'cells.cap': 'Cells over {f} × {t}: column {w}, bin {b}',
      'cells.aria': 'Grid of ionogram cells with the rasterised trace and the result of the speckle filter.',
      'cells.x': 'frequency, MHz', 'cells.y': 'delay into the window, µs',
      'cells.l.kept': 'above threshold, kept', 'cells.l.del': 'above threshold, deleted by the filter', 'cells.l.true': 'true trace', 'cells.l.noise': 'noise',
      'cells.v.lbl': 'Speckle filter',
      'cells.v.kept': 'Trace kept: {k} of {n} cells above threshold survive the filter.',
      'cells.v.part': 'Trace partly deleted: {k} of {n} cells remain. The ends and thin stretches go first.',
      'cells.v.gone': 'Trace deleted outright: none of its {n} cells collects 11 neighbours in the 9 × 3 window.',
      'cells.v.none': 'The trace does not rise above threshold in any cell.',
      'cells.v.why': 'A one-row trace collects at most 9 neighbours, and 11 are needed. So does a three-column trace, however many rows it covers.',
      'cells.th.N': 'FFT', 'cells.th.cell': 'Cell', 'cells.th.cols': 'Columns', 'cells.th.rows': 'Bins/column', 'cells.th.peak': 'Peak bin', 'cells.th.kept': 'Left after the filter',
      'cells.tbl': 'Every FFT length for the chosen rate and trace. Click a row to show it. A longer spectrum collects more energy (×2 per doubling of N), but only while the trace stays in one bin.',
      'cells.model': 'Model: in each column the trace covers the delays its slope sweeps across the column width; power is spread over bins by a Hann window’s response (−1.4 dB midway between bins, −6 dB in amplitude one bin off), averaged along that stretch and over a Gaussian Doppler spread σ/k. Peak bin SNR grows as N. A cell is “above threshold” at SNR ≥ 8 dB; the console’s Rosin threshold is set per spectrum, so this one is nominal. Noise spikes appear with probability e^(−6.3) per cell. Filter: a 9-column × 3-row window centred on the cell, needing ≥ 11 occupied (the cell itself included), as in lfp_products.py. Checked by full processing: a synthetic capture, a Hann-windowed FFT and lfp_products.py’s own delete_small_objects give the same picture (Magadan, 0.5 Hz: 10 of 16 cells left at 8192, none of 15 at 16 384). The model leaves fading out: in a real capture the number of surviving cells varies a lot from sweep to sweep, from 7 to 33 at 4096.',
    },
  });

  const FIF = 40e3, NS = [2048, 4096, 8192, 16384, 32768], GATE = Math.pow(10, 0.8);
  const RATES = [50e3, 100e3, 125e3, 500.0084e3];
  const PRESETS = {
    mag: { rate: 500.0084e3, N: 16384, f0: 5.3, span: 0.6, slope: 40, dop: 0.5, snr: 18 },
    mid: { rate: 100e3, N: 16384, f0: 15, span: 2, slope: 6, dop: 0.37, snr: 18 },
    nose: { rate: 100e3, N: 16384, f0: 24.5, span: 1, slope: 30, dop: 0.37, snr: 18 },
    // vertical sounder at 50 kHz/s, daytime F2 at 8.0–8.5 MHz (0.84–0.89 foF2): 250–400 µs/MHz
    vi: { rate: 50e3, N: 16384, f0: 8.0, span: 0.5, slope: 300, dop: 0.3, snr: 18 },
  };
  const state = Object.assign({ preset: 'mag' }, PRESETS.mag);

  const hann = d => { const a = Math.abs(d); if (a < 1e-9) return 1; if (Math.abs(1 - a * a) < 1e-9) return 0.5; const x = Math.PI * d; return Math.sin(x) / x / (1 - d * d); };
  const GH = [[-2.857, 0.0113], [-1.356, 0.2221], [0, 0.5333], [1.356, 0.2221], [2.857, 0.0113]];

  // Rasterise the trace onto the grid of length N and run the speckle filter.
  function grid(N) {
    const { rate: k, f0, span, slope, dop, snr } = state;
    const W = k * N / FIF / 1e6, bin = FIF / N / k * 1e6;   // MHz, µs
    const marg = Math.max(0.1, 2 * W);
    const fv0 = f0 - marg, fv1 = f0 + span + marg;
    const H = Math.max(slope * span + 60, 12 * bin);
    const tv0 = -(H - slope * span) / 2;
    const nc = Math.ceil((fv1 - fv0) / W), nr = Math.ceil(H / bin);
    const val = new Float32Array(nc * nr), occ = new Uint8Array(nc * nr), noise = new Uint8Array(nc * nr);
    const E0 = Math.pow(10, snr / 10) * N / 4096, sd = dop / k * 1e6 / bin;   // Doppler spread in bins
    let cols = 0, maxRows = 0, peak = 0;
    for (let c = 0; c < nc; c++) {
      const fa = fv0 + c * W, fb = fa + W, oa = Math.max(fa, f0), ob = Math.min(fb, f0 + span);
      if (ob <= oa) continue;
      cols++;
      const E = E0 * (ob - oa) / W, mus = [];
      for (let m = 0; m < 8; m++) mus.push((slope * (oa - f0 + (m + 0.5) / 8 * (ob - oa)) - tv0) / bin - 0.5);
      let rows = 0;
      const r0 = Math.max(0, Math.floor(Math.min(...mus) - 3 - 3 * sd)), r1 = Math.min(nr - 1, Math.ceil(Math.max(...mus) + 3 + 3 * sd));
      for (let r = r0; r <= r1; r++) {
        let p = 0;
        for (const mu of mus) for (const [z, w] of GH) p += w * hann(r - mu - z * sd) ** 2;
        const v = E * p / 8, i = c * nr + r;
        val[i] = v; peak = Math.max(peak, v);
        if (v >= GATE) { occ[i] = 1; rows++; }
      }
      maxRows = Math.max(maxRows, rows);
    }
    const rng = PG.rng(11 + N);
    for (let i = 0; i < nc * nr; i++) if (!occ[i] && rng.u() < Math.exp(-GATE)) { occ[i] = 1; noise[i] = 1; val[i] = GATE * (1 + rng.u()); }
    const keep = new Uint8Array(nc * nr);
    let nOcc = 0, nKeep = 0;
    for (let c = 0; c < nc; c++) for (let r = 0; r < nr; r++) {
      const i = c * nr + r;
      if (!occ[i]) continue;
      let n = 0;
      for (let dc = -4; dc <= 4; dc++) for (let dr = -1; dr <= 1; dr++) {
        const cc = c + dc, rr = r + dr;
        if (cc >= 0 && cc < nc && rr >= 0 && rr < nr) n += occ[cc * nr + rr];
      }
      keep[i] = n >= 11 ? 1 : 0;
      if (!noise[i]) { nOcc++; nKeep += keep[i]; }
    }
    return { N, W, bin, fv0, fv1, tv0, H, nc, nr, val, occ, noise, keep, cols, maxRows, peakDb: 10 * Math.log10(Math.max(peak, 1e-9)), nOcc, nKeep };
  }

  const KM_US = 0.299792458;
  const fmtW = mhz => mhz >= 1 ? PG.num(mhz, 2) + ' ' + PG.U('MHz') : PG.num(mhz * 1000, mhz < 0.01 ? 1 : 0) + ' ' + PG.U('kHz');
  const fmtBin = us => PG.sig(us * KM_US, 2) + ' ' + PG.U('km');
  const fmtN = n => PG.lang === 'ru' ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  function draw(svg, G) {
    svg.replaceChildren();
    const P = PG.plot(svg, { x0: 56, x1: 744, y0: 12, y1: 300, xd: [G.fv0, G.fv1], yd: [G.tv0, G.tv0 + G.H], nx: 8, ny: 6,
      xf: v => PG.num(v, G.fv1 - G.fv0 < 1.5 ? 2 : 1), xl: PG.t('cells.x'), yl: PG.t('cells.y'), ylx: 12, grid: false });
    const { fx, fy, g } = P, cw = fx(G.fv0 + G.W) - fx(G.fv0), rh = fy(G.tv0) - fy(G.tv0 + G.bin);
    if (G.nc <= 140 && G.nr <= 90) {
      const gl = PG.el(g, 'g', { stroke: 'currentColor', 'stroke-width': .6, opacity: .16 });
      for (let c = 1; c < G.nc; c++) PG.el(gl, 'line', { x1: fx(G.fv0 + c * G.W), x2: fx(G.fv0 + c * G.W), y1: 12, y2: 300 });
      for (let r = 1; r < G.nr; r++) PG.el(gl, 'line', { x1: 56, x2: 744, y1: fy(G.tv0 + r * G.bin), y2: fy(G.tv0 + r * G.bin) });
    }
    for (let c = 0; c < G.nc; c++) for (let r = 0; r < G.nr; r++) {
      const i = c * G.nr + r;
      if (!G.occ[i]) continue;
      const x = fx(G.fv0 + c * G.W), y = fy(G.tv0 + (r + 1) * G.bin);
      const op = G.keep[i] ? PG.clamp(0.35 + 10 * Math.log10(G.val[i]) / 40, 0.35, 1) : 0.55;
      PG.el(g, 'rect', { x: x + .5, y: y + .5, width: Math.max(cw - 1, .8), height: Math.max(rh - 1, .8),
        style: G.keep[i] ? 'fill:var(--accent)' : G.noise[i] ? 'fill:none;stroke:var(--faint)' : 'fill:var(--warn)', opacity: op.toFixed(2) });
    }
    const { f0, span, slope } = state;
    PG.el(g, 'line', { x1: fx(f0), y1: fy(0), x2: fx(f0 + span), y2: fy(slope * span), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .75 });
  }

  PG.register({
    id: 'cells',
    mount(root) {
      const svg = PG.svg(760, 340, PG.t('cells.aria')), cap = PG.h('p', { class: 'cap' });
      const cards = PG.cards([{ key: 'cell', label: PG.t('cells.k.cell') }, { key: 'cols', label: PG.t('cells.k.cols') }, { key: 'rows', label: PG.t('cells.k.rows') },
        { key: 'win', label: PG.t('cells.k.win') }, { key: 'shape', label: PG.t('cells.k.shape') }, { key: 'same', label: PG.t('cells.k.same') }]);
      const note = PG.note(), tbody = PG.h('tbody');
      const rateSeg = PG.seg(RATES.map(r => ({ value: r, label: PG.num(Math.round(r / 1e3), 0) + ' ' + PG.U('kHzs') })), state.rate, v => { state.rate = v; update(); });
      const nSeg = PG.seg(NS.map(n => ({ value: n, label: fmtN(n) })), state.N, v => { state.N = v; update(); });
      const sl = {
        span: PG.slider({ label: PG.t('cells.span'), min: 0.2, max: 3, step: 0.05, value: state.span, fmt: v => PG.num(v, 2) + ' ' + PG.U('MHz'), onInput: v => { state.span = v; update(); } }),
        // square-law scale: fine steps for oblique traces (0–100), reach for vertical ones (up to 1000)
        slope: PG.slider({ label: PG.t('cells.slope'), min: 0, max: 1000, step: 1, value: Math.round(1000 * Math.sqrt(state.slope / 1000)), fmt: () => PG.num(state.slope, 0) + ' ' + PG.U('usMHz'), onInput: v => { state.slope = Math.round(1000 * (v / 1000) ** 2); update(); } }),
        dop: PG.slider({ label: PG.t('cells.dop'), min: 0, max: 5, step: 0.05, value: state.dop, fmt: v => PG.num(v, 2) + ' ' + PG.U('Hz'), onInput: v => { state.dop = v; update(); } }),
        snr: PG.slider({ label: PG.t('cells.snr'), min: 0, max: 30, step: 1, value: state.snr, fmt: v => PG.num(v, 0) + ' ' + PG.U('dB'), onInput: v => { state.snr = v; update(); } }),
      };
      const presetSeg = PG.seg(['mag', 'mid', 'nose', 'vi'].map(p => ({ value: p, label: PG.t('cells.p.' + p) })), state.preset, p => {
        Object.assign(state, PRESETS[p], { preset: p });
        for (const key in sl) sl[key].set(key === 'slope' ? Math.round(1000 * Math.sqrt(state.slope / 1000)) : state[key]);
        rateSeg.select(state.rate); nSeg.select(state.N);
        update();
      });

      function update() {
        const G = grid(state.N), k = state.rate, s0 = 100e3 * 16384;
        const sh = Math.pow(k * state.N / s0, 2), same = 16384 * Math.sqrt(100e3 / k);
        const lo = Math.pow(2, Math.floor(Math.log2(same))), hi = 2 * lo;
        cap.textContent = PG.t('cells.cap', { f: fmtW(G.fv1 - G.fv0), t: PG.num(G.H, 0) + ' ' + PG.U('us'), w: fmtW(G.W), b: PG.sig(G.bin, 2) + ' ' + PG.U('us') });
        cards.set('cell', fmtW(G.W) + ' × ' + fmtBin(G.bin), PG.sig(G.bin, 3) + ' ' + PG.U('us') + ' · ' + PG.num(state.N / FIF, 3) + ' ' + PG.U('s'));
        cards.set('cols', String(G.cols), PG.num(state.span / G.W, 1));
        cards.set('rows', String(G.maxRows), PG.num(state.slope * G.W / G.bin, 1) + ' (' + PG.U('usMHz') + ' × ' + fmtW(G.W) + ')');
        cards.set('win', fmtW(9 * G.W) + ' × ' + fmtBin(3 * G.bin));
        cards.set('shape', Math.abs(Math.log(sh)) < 0.05 ? PG.t('cells.square') : sh > 1 ? PG.t('cells.flat', { v: PG.sig(sh, 2) }) : PG.t('cells.tall', { v: PG.sig(1 / sh, 2) }));
        const pow2 = Math.abs(Math.log2(same) - Math.round(Math.log2(same))) < 0.01;
        cards.set('same', PG.t('cells.same.v', { n: fmtN(pow2 ? Math.round(same) : Math.round(same / 100) * 100) }), pow2 ? PG.t('cells.same.x') : PG.t('cells.same.s', { a: fmtN(lo), b: fmtN(hi) }));
        const vk = !G.nOcc ? 'cells.v.none' : G.nKeep === 0 ? 'cells.v.gone' : G.nKeep < 0.8 * G.nOcc ? 'cells.v.part' : 'cells.v.kept';
        note.set(vk === 'cells.v.kept' ? '' : 'caution', PG.t('cells.v.lbl'), PG.t(vk, { k: G.nKeep, n: G.nOcc }), vk === 'cells.v.kept' ? null : PG.t('cells.v.why'));
        draw(svg, G);
        tbody.replaceChildren(...NS.map(N => {
          const g2 = N === state.N ? G : grid(N);
          const bad = g2.nOcc === 0 || g2.nKeep < 0.8 * g2.nOcc;
          const tr = PG.h('tr', { class: bad ? 'bad' : null, style: 'cursor:pointer', onclick: () => { state.N = N; nSeg.select(N); update(); } },
            PG.h('td', { class: 'num' }, fmtN(N)), PG.h('td', { class: 'num' }, fmtW(g2.W) + ' × ' + fmtBin(g2.bin)),
            PG.h('td', { class: 'num' }, String(g2.cols)), PG.h('td', { class: 'num' }, String(g2.maxRows)),
            PG.h('td', { class: 'num' }, PG.num(g2.peakDb, 1) + ' ' + PG.U('dB')), PG.h('td', { class: 'num' }, g2.nKeep + ' / ' + g2.nOcc));
          if (N === state.N) tr.style.outline = '2px solid var(--accent)';
          return tr;
        }));
      }

      root.append(
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'stack' },
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('cells.trace'))), presetSeg),
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('cells.rate'))), rateSeg),
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('cells.N'))), nSeg)),
          PG.h('div', { class: 'ctl' }, sl.span.root, sl.slope.root, sl.dop.root, sl.snr.root)),
        cards.root,
        PG.h('div', { class: 'panel' }, cap,
          PG.legend([['box', 'background:var(--accent)', PG.t('cells.l.kept')], ['box', 'background:var(--warn);opacity:.6', PG.t('cells.l.del')],
            ['box', 'border:1px solid var(--faint)', PG.t('cells.l.noise')], ['dash', 'border-color:var(--faint)', PG.t('cells.l.true')]]),
          svg),
        note.root,
        PG.h('p', { class: 'lede', style: 'font-size:14px;margin-bottom:8px' }, PG.t('cells.tbl')),
        PG.h('div', { class: 'tablewrap' }, PG.h('table', null,
          PG.h('thead', null, PG.h('tr', null, ['N', 'cell', 'cols', 'rows', 'peak', 'kept'].map(k => PG.h('th', null, PG.t('cells.th.' + k))))), tbody)),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px' }, PG.t('cells.model')));
      update();
    },
  });
})();
