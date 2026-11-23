(function () {
  'use strict';

  PG.i18n({
    ru: {
      'daily.nav': 'Сутки: ход МНЧ',
      'daily.title': 'Суточный ход МНЧ',
      'daily.short': 'Суточный ход МНЧ на трассе Кипр — Йошкар-Ола для модельных или архивных суток.',
      'daily.lede': 'МНЧ на трассе Кипр — Йошкар-Ола обычно растёт после восхода и снижается после захода. Выберите время и рабочую частоту, чтобы сравнить её с МНЧ. График показывает модельные сутки или сеансы из загруженного архива.',
      'daily.cap.muf': 'Суточный ход МНЧ. Оранжевые точки отмечают архивные сеансы, в которых след достигает верхней границы записи. Щелчок по графику выбирает частоту и время.',
      'daily.aria.muf': 'График суточного хода МНЧ с выбранной частотой и временем.',
      'daily.part': 'Часть 13 · Суточный ход',
      'daily.f': 'Рабочая частота',
      'daily.t': 'Время',
      'daily.night': 'МНЧ ночью',
      'daily.day': 'МНЧ днём',
      'daily.new': 'Другие сутки',
      'daily.nic4': 'NIC4: dur 105 с, запись только до 18 МГц',
      'daily.load': 'Загрузить сутки (JSON)',
      'daily.model': 'Вернуться к модели',
      'daily.src.model': 'модельные сутки, Кипр — Йошкар-Ола, февраль',
      'daily.src.file': 'архив: {p}, {d}, сеансов: {n}',
      'daily.k.t': 'Время, UTC',
      'daily.k.m': 'МНЧ',
      'daily.k.x': 'f / МНЧ',
      'daily.k.h1': 'Часов с модой 1F на f',
      'daily.no1f': 'нет 1F: f выше МНЧ',
      'daily.cens': '≥ 32,4: край полосы записи',
      'daily.x.t': 'время, UTC',
      'daily.y.f': 'частота, МГц',
      'daily.l.muf': 'МНЧ',
      'daily.l.f': 'выбранная частота',
      'daily.l.cut': 'NIC4: выше 18 МГц не записывается',
      'daily.err': 'Не удалось прочитать файл: {e}',
      'daily.n.lbl': 'Что важно помнить',
      'daily.n.3': 'Модельные сутки: ночью МНЧ около {n} МГц, днём — около {d} МГц, восход около 04:40 UTC, заход около 14:10 UTC, плюс медленные колебания с периодом порядка 2 ч. Настоящие сутки можно выгрузить из архива скриптом tools/export_daily.py.',
    },
    en: {
      'daily.nav': 'The day: MUF',
      'daily.title': 'MUF through the day',
      'daily.short': 'Daily MUF on the Cyprus → Yoshkar-Ola path for a model day or a day from the archive.',
      'daily.lede': 'On the Cyprus → Yoshkar-Ola path, MUF usually rises after sunrise and falls after sunset. Pick a time and working frequency to compare it with the MUF. The chart shows a model day or the soundings in an archive file.',
      'daily.cap.muf': 'MUF through the day. Orange dots mark archived soundings in which the trace reaches the upper edge of the recording. Click the chart to pick a frequency and time.',
      'daily.aria.muf': 'Chart of MUF through the day, with the selected frequency and time.',
      'daily.part': 'Part 13 · Daily course',
      'daily.f': 'Working frequency',
      'daily.t': 'Time',
      'daily.night': 'MUF at night',
      'daily.day': 'MUF by day',
      'daily.new': 'Another day',
      'daily.nic4': 'NIC4: dur 105 s, recorded only up to 18 MHz',
      'daily.load': 'Load a day (JSON)',
      'daily.model': 'Back to the model',
      'daily.src.model': 'model day, Cyprus → Yoshkar-Ola, February',
      'daily.src.file': 'archive: {p}, {d}, {n} sweeps',
      'daily.k.t': 'Time, UTC',
      'daily.k.m': 'MUF',
      'daily.k.x': 'f / MUF',
      'daily.k.h1': 'Hours with 1F at f',
      'daily.no1f': 'no 1F: f above MUF',
      'daily.cens': '≥ 32.4: edge of the recording',
      'daily.x.t': 'time, UTC',
      'daily.y.f': 'frequency, MHz',
      'daily.l.muf': 'MUF',
      'daily.l.f': 'chosen frequency',
      'daily.l.cut': 'NIC4: nothing recorded above 18 MHz',
      'daily.err': 'Could not read the file: {e}',
      'daily.n.lbl': 'Keep in mind',
      'daily.n.3': 'Model day: MUF about {n} MHz at night and {d} MHz by day, sunrise near 04:40 UTC, sunset near 14:10 UTC, slow wander with a period of about 2 h. A real day can be exported from the archive with tools/export_daily.py.',
    },
  });

  const TOP = 32.4, F0 = 7.5;
  const state = { night: 12, day: 30, seed: 4, f: 18, t: 12, nic4: false, data: null };

  const sig = z => 1 / (1 + Math.exp(-z));
  const dayFrac = h => sig((h - 4.67) / 0.35) * sig((14.17 - h) / 0.6);
  function modelDay() {
    const r = PG.rng(state.seed), phi = Math.exp(-5 / 140), sd = 1.2, n = 288;
    const t = [], m = [];
    let e = sd * r.n();
    for (let i = 0; i < n; i++) {
      const h = i * 24 / n, s = dayFrac(h);
      e = phi * e + sd * Math.sqrt(1 - phi * phi) * r.n();
      const v = Math.max(8, state.night + (state.day - state.night) * s + e * (0.6 + 0.4 * s));
      t.push(h); m.push(v);
    }
    return { t, m, c: [], step: 24 / n };
  }
  const day = () => state.data || modelDay();
  const valid = M => M !== null && isFinite(M);

  const hhmm = h => { const m = Math.round(h * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const nearest = (D, h) => { let k = 0; for (let i = 1; i < D.t.length; i++) if (Math.abs(D.t[i] - h) < Math.abs(D.t[k] - h)) k = i; return k; };

  function drawMuf(svg, D) {
    svg.replaceChildren();
    const top = Math.max(32.5, Math.ceil(Math.max(...D.m) / 5) * 5);
    const yt = [F0, 10, 15, 20, 25, 30, top];
    const { fx, fy, g } = PG.plot(svg, { x0: 52, x1: 744, y0: 12, y1: 312, xd: [0, 24], yd: [F0, top],
      xt: [0, 3, 6, 9, 12, 15, 18, 21, 24], xf: v => String(v).padStart(2, '0') + ':00',
      yt, yf: v => PG.num(v, v % 1 ? 1 : 0), xl: PG.t('daily.x.t'), yl: PG.t('daily.y.f'), ylx: 12 });
    if (state.nic4) {
      PG.el(g, 'rect', { x: fx(0), y: fy(top), width: fx(24) - fx(0), height: fy(18) - fy(top), style: 'fill:var(--ground)', opacity: .72 });
      PG.el(g, 'line', { x1: fx(0), x2: fx(24), y1: fy(18), y2: fy(18), style: 'stroke:var(--warn)', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' });
    }
    let seg = [];
    const out = () => {
      if (seg.length > 1) PG.el(g, 'path', { d: PG.path(seg), fill: 'none', style: 'stroke:var(--ink)', 'stroke-width': 1.6 });
      if (seg.length === 1) PG.el(g, 'circle', { cx: seg[0][0], cy: seg[0][1], r: 2, style: 'fill:var(--ink)' });
      seg = [];
    };
    D.t.forEach((h, i) => {
      if (!valid(D.m[i])) { out(); return; }
      seg.push([fx(h), fy(D.m[i])]);
    });
    out();
    D.t.forEach((h, i) => { if (D.c[i] && valid(D.m[i])) PG.el(g, 'circle', { cx: fx(h), cy: fy(D.m[i]), r: 2.5, style: 'fill:var(--warn)' }); });
    PG.el(g, 'line', { x1: fx(0), x2: fx(24), y1: fy(state.f), y2: fy(state.f), style: 'stroke:var(--accent)', 'stroke-width': 2 });
    PG.el(g, 'line', { x1: fx(state.t), x2: fx(state.t), y1: 12, y2: 312, style: 'stroke:var(--accent)', 'stroke-width': 1.2, 'stroke-dasharray': '2 3' });
    PG.el(g, 'circle', { cx: fx(state.t), cy: fy(state.f), r: 5, style: 'fill:none;stroke:var(--accent)', 'stroke-width': 2 });
    return top;
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
    return { t, m, c, step, path: j.path || '?', date, n: t.length };
  }

  function mount(root) {
    const sm = PG.svg(760, 352, PG.t('daily.aria.muf'));
    const src = PG.h('span', { class: 'eyebrow', style: 'display:block;margin-bottom:10px' });
    const err = PG.h('p', { class: 'err' });
    const cards = PG.cards(['t', 'm', 'x', 'h1'].map(k => ({ key: k, label: PG.t('daily.k.' + k) })));
    const note = PG.note();
    let top;

    const fS = PG.slider({ label: PG.t('daily.f'), min: F0, max: TOP, step: 0.1, value: state.f, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.f = v; update(); } });
    const tS = PG.slider({ label: PG.t('daily.t'), min: 0, max: 23.9167, step: 1 / 12, value: state.t, fmt: v => hhmm(v), onInput: v => { state.t = v; update(); } });
    const nS = PG.slider({ label: PG.t('daily.night'), min: 8, max: 18, step: 0.5, value: state.night, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.night = v; update(); } });
    const dS = PG.slider({ label: PG.t('daily.day'), min: 18, max: 36, step: 0.5, value: state.day, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.day = v; update(); } });
    const modelCtl = PG.h('div', { class: 'ctl', style: 'margin-top:12px' }, nS.root, dS.root,
      PG.h('div', { style: 'display:flex;align-items:end' }, PG.h('button', { type: 'button', onclick: () => { state.seed++; update(); } }, PG.t('daily.new'))));
    const back = PG.h('button', { type: 'button', onclick: () => { state.data = null; file.value = ''; err.textContent = ''; update(); } }, PG.t('daily.model'));
    const file = PG.h('input', { type: 'file', accept: '.json,application/json', style: 'display:none', onchange: e => {
      const fl = e.target.files[0]; if (!fl) return;
      fl.text().then(txt => { state.data = parse(txt); err.textContent = ''; update(); }).catch(x => { err.textContent = PG.t('daily.err', { e: x.message }); });
    } });
    sm.addEventListener('click', e => {
      const pt = sm.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(sm.getScreenCTM().inverse());
      if (q.x < 52 || q.x > 744 || q.y < 12 || q.y > 312) return;
      state.t = Math.round(PG.clamp((q.x - 52) / (744 - 52) * 24, 0, 23.9167) * 12) / 12;
      state.f = Math.round(PG.clamp(F0 + (312 - q.y) / 300 * (top - F0), F0, TOP) * 10) / 10;
      fS.set(state.f); tS.set(state.t); update();
    });
    sm.style.cursor = 'crosshair';

    function update() {
      const D = day(), f = state.f;
      modelCtl.style.display = state.data ? 'none' : '';
      back.style.display = state.data ? '' : 'none';
      src.textContent = state.data ? PG.t('daily.src.file', { p: D.path, d: D.date, n: D.n }) : PG.t('daily.src.model');
      top = drawMuf(sm, D);
      legend.lastElementChild.style.display = state.nic4 ? '' : 'none';
      const i = nearest(D, state.t), M = D.m[i];
      cards.set('t', hhmm(D.t[i]));
      cards.set('m', !valid(M) ? '–' : (D.c[i] ? '≥ ' + PG.num(TOP, 1) : PG.num(M, 1)) + ' ' + PG.U('MHz'),
        D.c[i] ? PG.t('daily.cens') : '');
      cards.set('x', valid(M) ? PG.num(f / M, 2) : '–', valid(M) && f > M ? PG.t('daily.no1f') : '');
      cards.set('h1', PG.num(D.m.filter(M => valid(M) && f <= M).length * D.step, 1) + ' ' + PG.U('h'));
      note.set('', PG.t('daily.n.lbl'), PG.t('daily.n.3', { n: PG.num(state.night, 0), d: PG.num(state.day, 0) }));
      note.root.hidden = !!state.data;
    }

    const legend = PG.legend([
      ['line', 'border-color:var(--ink)', PG.t('daily.l.muf')],
      ['line', 'border-color:var(--accent)', PG.t('daily.l.f')],
      ['dash', 'border-color:var(--warn)', PG.t('daily.l.cut')],
    ]);
    const nic4 = PG.h('input', { type: 'checkbox', checked: state.nic4, onchange: e => { state.nic4 = e.target.checked; update(); } });

    root.append(
      PG.h('div', { class: 'panel' },
        PG.h('div', { class: 'ctl' }, fS.root, tS.root),
        modelCtl,
        PG.h('div', { class: 'row' },
          PG.h('label', { class: 'check' }, nic4, PG.t('daily.nic4')),
          PG.h('button', { type: 'button', onclick: () => file.click() }, PG.t('daily.load')), back, file),
        err),
      cards.root,
      PG.h('div', { class: 'panel' }, src, PG.h('p', { class: 'cap' }, PG.t('daily.cap.muf')), legend, sm),
      note.root);
    update();
  }

  PG.register({ id: 'daily', mount });
})();
