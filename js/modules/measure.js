/* Measuring GDD from one 1 MHz window: delay slope against phase parabola, under fading. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'measure.nav': 'Как измерять GDD', 'measure.part': 'Часть 11 · Измерение',
      'measure.title': 'GDD по окну в 1 МГц: наклон задержки или кривизна фазы',
      'measure.short': 'Почему по одному сеансу GDD удаётся оценить лишь с точностью ±4 мкс/МГц и почему фазовый метод на этой трассе её занижает.',
      'measure.lede': 'Смоделирован участок сеанса на трассе Кипр — Йошкар-Ола шириной 1 МГц: при 100 кГц/с это 10 с записи. Одно и то же окно пересчитывается в GDD двумя способами — прямой по задержкам отдельных столбцов и параболой по их фазам. За эти 10 с фаза эха успевает уйти из-за замираний, и парабола принимает этот уход за дисперсию.',
      'measure.sig': 'Доплеровское расширение', 'measure.snr': 'ОСШ на 0,1 с, в среднем по окну', 'measure.D': 'Истинная GDD',
      'measure.seg': 'Отрезок для БПФ', 'measure.seg041': '0,41 с, как в ionozond', 'measure.seg01': '0,1 с', 'measure.new': 'Новый сеанс',
      'measure.k.d': 'По наклону задержки', 'measure.k.p': 'По кривизне фазы', 'measure.k.n': 'Столбцов: задержка / фаза',
      'measure.k.nv': '{a} / {b} из {n}', 'measure.l.pt': 'задержка в столбце', 'measure.l.drop': 'замирание, ниже 15 дБ',
      'measure.l.ph': 'фаза в столбце', 'measure.l.fit': 'аппроксимация', 'measure.l.true': 'истинная',
      'measure.cap.d': 'Задержка: аппроксимация прямой',
      'measure.cap.p': 'Фаза за вычетом линейной части: аппроксимация параболой',
      'measure.aria.d': 'Зависимость задержки от частоты в окне 1 МГц: истинная и подобранная прямые.',
      'measure.aria.p': 'Зависимость фазы от частоты за вычетом линейной части: истинная и подобранная параболы.',
      'measure.x.f': 'МГц от начала окна (0,1 МГц = 1 с)', 'measure.y.d': 'задержка − 9 мс, мкс', 'measure.y.p': 'фаза, рад',
      'measure.na': 'Сеансов в усреднении', 'measure.run': 'Рассчитать 300 реализаций', 'measure.running': 'Идёт расчёт…',
      'measure.k.rd': 'Наклон: СКО ошибки', 'measure.k.rp': 'Парабола: СКО ошибки', 'measure.k.mp': 'Парабола: смещение оценки',
      'measure.l.hd': 'наклон задержки', 'measure.l.hp': 'кривизна фазы',
      'measure.aria.h': 'Распределение ошибки GDD по 300 реализациям для двух методов.',
      'measure.x.h': 'ошибка GDD, мкс/МГц (в крайние столбцы попадает всё, что за ±24)',
      'measure.y.h': 'доля реализаций, %',
      'measure.model': 'Модель намеренно проста. Замирания — сумма 40 синусоид с гауссовым распределением доплеровских частот; мощность нормирована на среднее по окну, как в эталонной обработке. Ошибка задержки в столбце складывается из его среднего доплеровского сдвига (10 мкс на 1 Гц при 100 кГц/с) и шума 60·(0,1 с / длительность столбца)/√ОСШ мкс — при таких значениях модель совпадает с полной БПФ-обработкой синтетических записей. Фаза столбца — фаза замираний в его центре плюс шум; она разворачивается по столбцам с ОСШ выше 6 дБ. Полная обработка синтетики при 0,37 Гц и 18 дБ дала: по наклону ±3,6 мкс/МГц при 0,41 с и ±4,4 при 0,1 с, по параболе ±6,7 и ±5,9 со смещением −4,8 и −2,4. В канале без замираний наклон даёт ±0,7 и ±2,8, а парабола точна.',
    },
    en: {
      'measure.nav': 'Measuring GDD',
      'measure.part': 'Part 11 · Measurement',
      'measure.title': 'GDD from one 1 MHz window: delay slope against phase parabola',
      'measure.short': 'Why one sweep only pins GDD to about ±4 µs/MHz, and why the phase method reads it low on this path.',
      'measure.lede': 'A simulated stretch of a Cyprus sweep, 1 MHz wide, which is 10 s at 100 kHz/s. The same window is turned into GDD two ways: a straight line through each column’s delay, and a parabola through each column’s phase. Fading makes the echo’s phase wander over those 10 s, and the parabola reads that wander as dispersion.',
      'measure.sig': 'Doppler spread', 'measure.snr': 'Signal per 0.1 s, window mean', 'measure.D': 'True GDD', 'measure.seg': 'Spectrum length',
      'measure.seg041': '0.41 s, console', 'measure.seg01': '0.1 s',
      'measure.new': 'New sweep',
      'measure.k.d': 'Delay-slope result', 'measure.k.p': 'Phase-fit result', 'measure.k.n': 'Columns used, delay / phase', 'measure.k.nv': '{a} / {b} of {n}',
      'measure.l.pt': 'delay of a column', 'measure.l.drop': 'in a fade, below 15 dB', 'measure.l.ph': 'phase of a column', 'measure.l.fit': 'fit', 'measure.l.true': 'truth',
      'measure.cap.d': 'Delay: a straight line', 'measure.cap.p': 'Phase, straight-line part removed: a parabola',
      'measure.aria.d': 'Delay against frequency in one 1 MHz window, with the true and the fitted straight line.',
      'measure.aria.p': 'Phase against frequency with the straight-line part removed, with the true and the fitted parabola.',
      'measure.x.f': 'MHz into the window (0.1 MHz = 1 s)', 'measure.y.d': 'delay − 9 ms, µs', 'measure.y.p': 'phase, rad',
      'measure.na': 'Captures averaged per result', 'measure.run': 'Run 300 trials', 'measure.running': 'Running…',
      'measure.k.rd': 'Delay slope, RMS error', 'measure.k.rp': 'Phase fit, RMS error', 'measure.k.mp': 'Phase fit, mean error',
      'measure.l.hd': 'delay slope', 'measure.l.hp': 'phase fit',
      'measure.aria.h': 'Distribution of the GDD error over 300 trials for both methods.',
      'measure.x.h': 'GDD error, µs/MHz (the end bins hold everything beyond ±24)', 'measure.y.h': 'share of trials, %',
      'measure.model': 'The model is deliberately small. Fading is a sum of 40 sinusoids with Gaussian-distributed Doppler frequencies, its power normalised to the window mean as in the reference processing. A column’s delay error is its mean Doppler shift (10 µs per Hz at 100 kHz/s) plus noise of 60·(0.1 s / column)/√SNR µs, which matches full FFT processing of synthetic captures. Its phase is the fading phase at the column centre plus noise, unwrapped across the columns that pass 6 dB. Full processing of synthetic captures gave, at 0.37 Hz and 18 dB: delay slope ±3.6 µs/MHz at 0.41 s and ±4.4 at 0.1 s, phase fit ±6.7 and ±5.9 with a bias of −4.8 and −2.4; in a still channel the slope gives ±0.7 and ±2.8 and the phase fit is exact.',
    },
  });

  const state = { sig: 0.37, snr: 18, D: 15, seg: 0.41, na: 1 };
  const M = 40, TP = 2 * Math.PI;
  const rn = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TP * Math.random()); };
  const wrap = a => a - TP * Math.round(a / TP);
  function lin(xs, ys) {
    const n = xs.length; let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n; let sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
    const b = sxy / sxx; return [my - b * mx, b];
  }
  function quad(xs, ys) {
    const S = [0, 0, 0, 0, 0], T = [0, 0, 0];
    for (let i = 0; i < xs.length; i++) { let p = 1; for (let j = 0; j < 5; j++) { S[j] += p; if (j < 3) T[j] += p * ys[i]; p *= xs[i]; } }
    const A = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]];
    for (let i = 0; i < 3; i++) for (let r = i + 1; r < 3; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < 4; c++) A[r][c] -= f * A[i][c]; }
    const c = [0, 0, 0];
    for (let i = 2; i >= 0; i--) { let s = A[i][3]; for (let j = i + 1; j < 3; j++) s -= A[i][j] * c[j]; c[i] = s / A[i][i]; }
    return c;
  }

  // One window of N columns; fading sampled at column edges and centres.
  function sweep() {
    const { sig, snr, D, seg } = state, N = Math.round(10 / seg), fm = [], th = [];
    for (let m = 0; m < M; m++) { fm.push(sig * rn()); th.push(TP * Math.random()); }
    const ph = new Float64Array(2 * N + 1), g2 = new Float64Array(2 * N + 1);
    for (let i = 0; i <= 2 * N; i++) {
      const t = i * seg / 2; let re = 0, im = 0;
      for (let m = 0; m < M; m++) { const a = TP * fm[m] * t + th[m]; re += Math.cos(a); im += Math.sin(a); }
      ph[i] = Math.atan2(im, re); g2[i] = re * re + im * im;
    }
    // Unit mean power over the window, as the reference simulation normalises its fading: the SNR
    // control is this sweep's mean SNR, so a still channel is not one long fade.
    let gm = 0; for (let i = 0; i <= 2 * N; i++) gm += g2[i] / (2 * N + 1);
    for (let i = 0; i <= 2 * N; i++) g2[i] /= gm;
    const s0 = Math.pow(10, snr / 10) * seg / 0.1, K = 60 * 0.1 / seg;
    const dx = [], dy = [], drop = [], px = [], pw = [];
    for (let k = 0; k < N; k++) {
      const c = 2 * k + 1, x = (k + 0.5) / N - 0.5, s = Math.max(s0 * g2[c], 1e-6), sdb = 10 * Math.log10(s);
      const fd = wrap(ph[c + 1] - ph[c - 1]) / (TP * seg);
      const tau = D * x - 10 * fd + K / Math.sqrt(s) * rn();
      if (sdb >= 15) { dx.push(x); dy.push(tau); } else drop.push([x, tau]);
      if (sdb >= 6) { px.push(x); pw.push(wrap(-Math.PI * D * x * x + ph[c] + rn() / Math.sqrt(1.38 * s))); }
    }
    const r = { N, dx, dy, drop, px, dE: NaN, pE: NaN };
    if (dx.length >= 8) { r.df = lin(dx, dy); r.dE = r.df[1]; }
    if (px.length >= 8) {
      const pu = [pw[0]];
      for (let i = 1; i < pw.length; i++) pu.push(pu[i - 1] + wrap(pw[i] - pw[i - 1]));
      r.pu = pu; r.pf = quad(px, pu); r.pE = -r.pf[2] / Math.PI;
    }
    return r;
  }

  const xs = Array.from({ length: 51 }, (_, i) => i / 50 - 0.5);
  const xf = v => PG.num(v, v % 1 ? 1 : 0);

  function drawDelay(svg, r) {
    svg.replaceChildren();
    const D = state.D, lim = 10 * Math.ceil((D / 2 + (state.seg < 0.2 ? 40 : 25)) / 10);
    const P = PG.plot(svg, { x0: 52, x1: 344, y0: 12, y1: 210, xd: [0, 1], yd: [-lim, lim], xt: [0, 0.2, 0.4, 0.6, 0.8, 1], xf, xl: PG.t('measure.x.f'), yl: PG.t('measure.y.d'), ylx: 12 });
    const { fx, fy, g } = P;
    PG.el(g, 'line', { x1: fx(0), y1: fy(-D / 2), x2: fx(1), y2: fy(D / 2), stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: .7 });
    if (r.df) PG.el(g, 'line', { x1: fx(0), y1: fy(r.df[0] - r.df[1] / 2), x2: fx(1), y2: fy(r.df[0] + r.df[1] / 2), style: 'stroke:var(--accent)', 'stroke-width': 2.2 });
    r.drop.forEach(([x, v]) => PG.el(g, 'circle', { cx: fx(x + 0.5), cy: fy(v), r: 3, fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: .45 }));
    r.dx.forEach((x, i) => PG.el(g, 'circle', { cx: fx(x + 0.5), cy: fy(r.dy[i]), r: 3.2, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 1 }));
  }

  function drawPhase(svg, r) {
    svg.replaceChildren();
    const D = state.D, pts = r.pf ? r.px.map((x, i) => [x, r.pu[i] - r.pf[0] - r.pf[1] * x]) : [];
    const ys = pts.map(p => p[1]).concat([-Math.PI * D / 4, r.pf ? r.pf[2] / 4 : 0, 0]);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    const pad = Math.max(1, 0.1 * (hi - lo)); lo -= pad; hi += pad;
    const P = PG.plot(svg, { x0: 44, x1: 344, y0: 12, y1: 210, xd: [0, 1], yd: [lo, hi], xt: [0, 0.2, 0.4, 0.6, 0.8, 1], xf, xl: PG.t('measure.x.f'), yl: PG.t('measure.y.p'), ylx: 12 });
    const { fx, fy, g } = P;
    PG.el(g, 'path', { d: PG.path(xs.map(x => [fx(x + 0.5), fy(-Math.PI * D * x * x)])), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: .7 });
    if (r.pf) PG.el(g, 'path', { d: PG.path(xs.map(x => [fx(x + 0.5), fy(r.pf[2] * x * x)])), fill: 'none', style: 'stroke:var(--warn)', 'stroke-width': 2.2 });
    pts.forEach(([x, v]) => PG.el(g, 'path', { d: `M${(fx(x + 0.5)).toFixed(1)},${(fy(v) - 4).toFixed(1)} l3.6,6.4 h-7.2 z`, style: 'fill:var(--warn)' }));
  }

  const EDGES = []; for (let e = -24; e <= 24; e += 2) EDGES.push(e);
  function hist(errs) {
    const h = new Array(EDGES.length - 1).fill(0);
    errs.forEach(e => { const v = PG.clamp(e, -23.9, 23.9); h[Math.floor((v + 24) / 2)]++; });
    return h.map(c => 100 * c / Math.max(errs.length, 1));
  }

  function drawHist(svg, h1, h2) {
    svg.replaceChildren();
    const top = Math.max(10, 1.15 * Math.max(...h1, ...h2));
    const P = PG.plot(svg, { x0: 52, x1: 744, y0: 12, y1: 196, xd: [-24, 24], yd: [0, top], xt: [-24, -16, -8, 0, 8, 16, 24], xl: PG.t('measure.x.h'), yl: PG.t('measure.y.h'), ylx: 12 });
    const { fx, fy, g } = P;
    const step = (h, cls, dash) => {
      const pts = [[fx(-24), fy(0)]];
      h.forEach((v, i) => { pts.push([fx(EDGES[i]), fy(v)], [fx(EDGES[i + 1]), fy(v)]); });
      pts.push([fx(24), fy(0)]);
      PG.el(g, 'path', { d: PG.path(pts) + ' Z', style: `fill:var(${cls})`, opacity: .1 });
      PG.el(g, 'path', { d: PG.path(pts.slice(1, -1)), fill: 'none', style: `stroke:var(${cls})`, 'stroke-width': 2, 'stroke-dasharray': dash || null });
    };
    step(h1, '--accent');
    step(h2, '--warn', '5 4');
    PG.el(g, 'line', { x1: fx(0), y1: 12, x2: fx(0), y2: 196, stroke: 'currentColor', opacity: .35 });
  }

  const rms = a => a.length ? Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) : NaN;
  const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;

  PG.register({
    id: 'measure',
    mount(root) {
      const sd = PG.svg(360, 252, PG.t('measure.aria.d')), sp = PG.svg(360, 252, PG.t('measure.aria.p')), sh = PG.svg(760, 236, PG.t('measure.aria.h'));
      const c1 = PG.cards([{ key: 'd', label: PG.t('measure.k.d') }, { key: 'p', label: PG.t('measure.k.p') }, { key: 'n', label: PG.t('measure.k.n') }]);
      const c2 = PG.cards([{ key: 'rd', label: PG.t('measure.k.rd') }, { key: 'rp', label: PG.t('measure.k.rp') }, { key: 'mp', label: PG.t('measure.k.mp') }]);
      const us = v => isFinite(v) ? PG.num(v, 1) + ' ' + PG.U('usMHz') : '–';
      const runLabel = PG.h('span', null, PG.t('measure.run'));

      const newSweep = () => {
        const r = sweep();
        drawDelay(sd, r); drawPhase(sp, r);
        c1.set('d', us(r.dE)); c1.set('p', us(r.pE));
        c1.set('n', PG.t('measure.k.nv', { a: r.dx.length, b: r.px.length, n: r.N }));
      };
      const runTrials = () => {
        runLabel.textContent = PG.t('measure.running');
        setTimeout(() => {
          const e1 = [], e2 = [];
          for (let t = 0; t < 300; t++) {
            let a = 0, b = 0, ca = 0, cb = 0;
            for (let j = 0; j < state.na; j++) {
              const r = sweep();
              if (isFinite(r.dE)) { a += r.dE; ca++; }
              if (isFinite(r.pE)) { b += r.pE; cb++; }
            }
            if (ca) e1.push(a / ca - state.D);
            if (cb) e2.push(b / cb - state.D);
          }
          drawHist(sh, hist(e1), hist(e2));
          c2.set('rd', '± ' + us(rms(e1))); c2.set('rp', '± ' + us(rms(e2)));
          const m = mean(e2); c2.set('mp', (m > 0 ? '+' : '') + us(m));
          runLabel.textContent = PG.t('measure.run');
        }, 20);
      };
      const both = () => { newSweep(); runTrials(); };

      const ctl = PG.h('div', { class: 'ctl' },
        PG.slider({ label: PG.t('measure.sig'), min: 0, max: 0.6, step: 0.01, value: state.sig, fmt: v => PG.num(v, 2) + ' ' + PG.U('Hz'), onInput: v => { state.sig = v; newSweep(); }, onChange: runTrials }).root,
        PG.slider({ label: PG.t('measure.snr'), min: 12, max: 30, step: 1, value: state.snr, fmt: v => PG.num(v, 0) + ' ' + PG.U('dB'), onInput: v => { state.snr = v; newSweep(); }, onChange: runTrials }).root,
        PG.slider({ label: PG.t('measure.D'), min: 0, max: 40, step: 1, value: state.D, fmt: v => PG.num(v, 0) + ' ' + PG.U('usMHz'), onInput: v => { state.D = v; newSweep(); }, onChange: runTrials }).root,
        PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('measure.seg'))),
          PG.seg([{ value: 0.41, label: PG.t('measure.seg041') }, { value: 0.1, label: PG.t('measure.seg01') }], state.seg, v => { state.seg = v; both(); })));

      root.append(
        PG.h('div', { class: 'panel' }, ctl,
          PG.h('div', { class: 'row' }, PG.h('button', { type: 'button', onclick: newSweep }, PG.t('measure.new')))),
        c1.root,
        PG.legend([['dot', 'background:var(--accent)', PG.t('measure.l.pt')], ['ring', '', PG.t('measure.l.drop')], ['tri', 'border-bottom-color:var(--warn)', PG.t('measure.l.ph')],
          ['line', 'border-color:var(--ink)', PG.t('measure.l.fit')], ['dash', 'border-color:var(--faint)', PG.t('measure.l.true')]]),
        PG.h('div', { class: 'two' },
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('measure.cap.d')), sd),
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('measure.cap.p')), sp)),
        PG.h('div', { class: 'panel', style: 'margin-top:16px' },
          PG.h('div', { class: 'ctl' },
            PG.slider({ label: PG.t('measure.na'), min: 1, max: 10, step: 1, value: state.na, fmt: v => PG.num(v, 0), onInput: v => { state.na = v; }, onChange: runTrials }).root,
            PG.h('div', { style: 'display:flex;align-items:end' }, PG.h('button', { type: 'button', class: 'primary', onclick: runTrials }, runLabel))),
          PG.h('div', { style: 'margin-top:12px' }, c2.root),
          PG.legend([['line', 'border-color:var(--accent)', PG.t('measure.l.hd')], ['dash', 'border-color:var(--warn)', PG.t('measure.l.hp')]]),
          sh),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px' }, PG.t('measure.model')));
      both();
    },
  });
})();
