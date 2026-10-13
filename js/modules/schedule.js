/* The sounder's one-at-a-time scheduler, and the rep:offset → chirptime conversion. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'schedule.nav': 'Расписание станций', 'schedule.part': 'Части 7–9 · Расписание',
      'schedule.title': 'Расписание: кого успеет записать приёмник',
      'schedule.short': 'Планировщик ionozond шаг за шагом: ближайший старт не раньше чем через 3 с, запись целиком, около секунды на выходные файлы. Станция, чей старт пришёлся на чужую запись, молча пропускается — бывает, что в каждом цикле.',
      'schedule.lede': 'Приёмник сжимает ЛЧМ-сигнал на лету и в каждый момент следит только за одним передатчиком. Для каждой активной станции он находит ближайший старт не раньше чем через 3 с и записывает ту, чей старт наступает первым. Запись длится заданное время, затем около секунды уходит на выходные файлы (.lfp, .h5), после чего поиск начинается заново. Станция, чей старт пришёлся на чужую запись, просто ждёт следующего периода. Если так происходит в каждом цикле, она не записывается никогда — и журнал об этом молчит.',
      'schedule.sc': 'Сценарий', 'schedule.sc.now': 'Текущее расписание', 'schedule.sc.bad': 'Ошибка: NIC4 с chirptime 105',
      'schedule.sc.three': 'Третья станция 300:291', 'schedule.h': 'Интервал', 'schedule.min': 'мин',
      'schedule.t0': 'Запуск ionozond, с после чч:00:00', 'schedule.th.on': 'Вкл.', 'schedule.th.name': 'Станция', 'schedule.th.rep': 'rep, с',
      'schedule.th.ct': 'chirptime, с', 'schedule.th.dur': 'dur, с', 'schedule.th.rate': 'k, кГц/с', 'schedule.th.lo': 'Гетеродин, МГц',
      'schedule.th.band': 'Полоса записи', 'schedule.th.got': 'Записано', 'schedule.add': 'Добавить станцию', 'schedule.del': 'Удалить',
      'schedule.newst': 'станция {n}', 'schedule.cap': 'Что запишет приёмник за {a}–{b} с после чч:00:00',
      'schedule.aria': 'Временная диаграмма: плановые окна станций, записанные и пропущенные сеансы, занятость приёмника.',
      'schedule.radio': 'приёмник', 'schedule.x': 'время после чч:00:00, мм:сс', 'schedule.l.rec': 'записано',
      'schedule.l.skip': 'пропущено: приёмник занят', 'schedule.l.busy': 'выходные файлы + упреждение ≥ 3 с',
      'schedule.k.busy': 'Занятость приёмника', 'schedule.k.caps': 'Записей', 'schedule.k.free': 'Самое длинное свободное окно',
      'schedule.w.never': '«{n}» не записывается ни разу: каждый её старт приходится на чужую запись. Сдвиньте chirptime или выберите другой сеанс того же передатчика.',
      'schedule.w.some': '«{n}» записывается не в каждом цикле: {a} из {b}.',
      'schedule.w.dur': '«{n}»: dur {d} с больше fs/k = {m} с. Через {m} с частота передатчика выходит за пределы полосы приёмника, и хвост записи пуст.',
      'schedule.w.ct': '«{n}»: chirptime должен лежать в пределах от 0 до rep.',
      'schedule.w.ok': 'Все активные станции записываются в каждом цикле.', 'schedule.w.lbl': 'Проверка расписания',
      'schedule.w.apply': 'Изменения вступают в силу только при запуске: после правки нажмите СТОП, затем СТАРТ.',
      'schedule.cv.t': 'Пересчёт rep:offset в chirptime',
      'schedule.cv.p': 'В перечнях ЛЧМ-передатчиков (G3PLX, Твенте) время задано в виде rep:offset, где offset — секунда от начала каждого часа, в которую частота передатчика проходит 0 МГц. Расписанию же нужен момент, когда сеанс входит в полосу приёмника: chirptime = (offset + (LO − fs/2)/k) mod rep.',
      'schedule.cv.rep': 'rep передатчика, с', 'schedule.cv.off': 'offset, с', 'schedule.cv.k': 'k, кГц/с', 'schedule.cv.lo': 'гетеродин LO, МГц',
      'schedule.cv.st': 'rep станции, с', 'schedule.cv.pre': 'Примеры', 'schedule.cv.win': 'До входа в полосу', 'schedule.cv.ct': 'chirptime',
      'schedule.cv.dur': 'Наибольший dur = fs/k', 'schedule.cv.band': 'Полоса приёмника',
      'schedule.cv.alt': 'Все сеансы передатчика за период станции (rep станции кратен его rep) — можно выбрать тот, что ни с кем не сталкивается:',
      'schedule.cv.use': 'В расписание',
      'schedule.model': 'Модель повторяет алгоритм из части 8: упреждение 3 с, около 1 с на выходные файлы, при одновременных стартах побеждает станция, стоящая в таблице выше. Старты раньше чем через 3 с после запуска ionozond не учитываются. Частота дискретизации fs = 25 МГц, полоса приёмника — LO ± 12,5 МГц.',
    },
    en: {
      'schedule.nav': 'Station schedule',
      'schedule.part': 'Parts 7–9 · Operating',
      'schedule.title': 'The schedule: which stations the receiver actually records',
      'schedule.short': 'The console’s scheduler step by step: the next start at least 3 s ahead, the whole capture, a second for products. A station whose start falls inside another capture is skipped silently, sometimes every cycle.',
      'schedule.lede': 'The receiver dechirps live and follows one transmitter at a time. For every active station it finds the next start at least 3 s ahead and records whichever comes first. The capture runs its full duration, then about a second goes on products (.lfp, .h5), and it looks again. A station whose start fell inside another capture just waits for its next period. If that happens every cycle, it is never recorded, and nothing in the log says so.',
      'schedule.sc': 'Scenario', 'schedule.sc.now': 'Now', 'schedule.sc.bad': 'The mistake: NIC4 at chirptime 105', 'schedule.sc.three': 'A third station, 300:291',
      'schedule.h': 'Horizon', 'schedule.min': 'min', 'schedule.t0': 'Console start, s after hh:00:00',
      'schedule.th.on': 'On', 'schedule.th.name': 'Station', 'schedule.th.rep': 'rep, s', 'schedule.th.ct': 'chirptime, s', 'schedule.th.dur': 'dur, s', 'schedule.th.rate': 'k, kHz/s', 'schedule.th.lo': 'LO, MHz', 'schedule.th.band': 'Band recorded', 'schedule.th.got': 'Recorded',
      'schedule.add': 'Add station', 'schedule.newst': 'station {n}', 'schedule.del': 'Remove',
      'schedule.cap': 'What the receiver records, {a}–{b} s after hh:00:00',
      'schedule.aria': 'Timeline: each station’s planned windows, recorded and skipped, and when the receiver is busy.',
      'schedule.radio': 'receiver', 'schedule.x': 'time after hh:00:00, mm:ss',
      'schedule.l.rec': 'recorded', 'schedule.l.skip': 'skipped: receiver busy', 'schedule.l.busy': 'products + ≥3 s lead',
      'schedule.k.busy': 'Receiver busy', 'schedule.k.caps': 'Captures', 'schedule.k.free': 'Longest free gap',
      'schedule.w.never': '“{n}” is never recorded: every one of its starts falls inside another capture. Move its chirptime or take another of the same transmitter’s sweeps.',
      'schedule.w.some': '“{n}” is not recorded every cycle: {a} of {b}.',
      'schedule.w.dur': '“{n}”: dur {d} s is longer than fs/k = {m} s. After {m} s the transmitter has left the receiver’s window, so the end of the capture is empty.',
      'schedule.w.ct': '“{n}”: chirptime must lie between 0 and rep.',
      'schedule.w.ok': 'Every active station is recorded in every cycle.',
      'schedule.w.lbl': 'Schedule check',
      'schedule.w.apply': 'Settings reach the console only when it starts: after editing, press STOP and then START.',
      'schedule.cv.t': 'Converting rep:offset to chirptime',
      'schedule.cv.p': 'Chirp lists (G3PLX, Twente) give timing as rep:offset, where offset is the second after each full hour at which the sweep passes 0 MHz. The schedule wants the moment it enters the receiver’s window: chirptime = (offset + (LO − fs/2)/k) mod rep.',
      'schedule.cv.rep': 'Transmitter rep, s', 'schedule.cv.off': 'offset, s', 'schedule.cv.k': 'k, kHz/s', 'schedule.cv.lo': 'LO, MHz', 'schedule.cv.st': 'Station rep, s',
      'schedule.cv.pre': 'Examples',
      'schedule.cv.win': 'To the window', 'schedule.cv.ct': 'chirptime', 'schedule.cv.dur': 'Longest dur = fs/k', 'schedule.cv.band': 'Receiver window',
      'schedule.cv.alt': 'Every sweep of the transmitter within the station’s period (the station’s rep is a multiple of its rep); pick the one that does not collide:',
      'schedule.cv.use': 'Add to schedule',
      'schedule.model': 'The model follows the algorithm in Part 8: 3 s lead, about 1 s for products, and on equal starts the station higher in the table wins. Starts less than 3 s after the console starts are not counted. fs = 25 MHz, receiver window LO ± 12.5 MHz.',
    },
  });

  const FS = 25, LEAD = 3, PROD = 1;
  const SC = {
    now: [
      { name: 'NIC4_280', rep: 300, ct: 10, dur: 105, rate: 100, lo: 20, on: true },
      { name: 'Sodankylä', rep: 300, ct: 121.0015, dur: 50, rate: 500.0084, lo: 16, on: true },
    ],
    bad: [
      { name: 'NIC4_280', rep: 300, ct: 105, dur: 105, rate: 100, lo: 20, on: true },
      { name: 'Sodankylä', rep: 300, ct: 121.0015, dur: 50, rate: 500.0084, lo: 16, on: true },
    ],
    three: [
      { name: 'NIC4_280', rep: 300, ct: 10, dur: 105, rate: 100, lo: 20, on: true },
      { name: 'Sodankylä', rep: 300, ct: 121.0015, dur: 50, rate: 500.0084, lo: 16, on: true },
      { name: '300:291', rep: 300, ct: 66, dur: 105, rate: 100, lo: 20, on: true },
    ],
  };
  const clone = a => a.map(s => Object.assign({}, s));
  const state = { sc: 'now', st: clone(SC.now), h: 900, t0: 0, cv: { rep: 300, off: 235, k: 100, lo: 20, srep: 300 } };

  function simulate() {
    const act = state.st.filter(s => s.on && s.rep > 0 && s.dur > 0 && s.ct >= 0 && s.ct < s.rep);
    const t0 = state.t0, t1 = t0 + state.h, caps = [];
    let t = t0;
    for (let guard = 0; guard < 2000; guard++) {
      let best = null;
      for (const s of act) {
        const st = s.ct + Math.ceil((t + LEAD - s.ct) / s.rep - 1e-9) * s.rep;
        if (!best || st < best.st - 1e-9) best = { s, st };
      }
      if (!best || best.st >= t1) break;
      caps.push({ s: best.s, a: best.st, b: best.st + best.s.dur });
      t = best.st + best.s.dur + PROD;
    }
    const due = new Map();
    for (const s of act) {
      const list = [];
      for (let st = s.ct + Math.ceil((t0 + LEAD - s.ct) / s.rep - 1e-9) * s.rep; st < t1; st += s.rep)
        list.push({ a: st, b: st + s.dur, rec: caps.some(c => c.s === s && Math.abs(c.a - st) < 1e-6) });
      due.set(s, list);
    }
    return { act, caps, due, t0, t1 };
  }

  const mmss = v => { const m = Math.floor(v / 60), s = Math.round(v - 60 * m); return m + ':' + String(s).padStart(2, '0'); };
  const trim = s => s.replace(/([.,]\d*?)0+$/, '$1').replace(/[.,]$/, '');
  const n4 = v => trim(PG.num(v, 4));

  function draw(svg, R) {
    const rows = R.act.length + 1, rh = 34, y0 = 10, H = y0 + rows * rh + 46;
    svg.setAttribute('viewBox', `0 0 760 ${H}`);
    svg.replaceChildren();
    const x0 = 112, x1 = 748, fx = v => x0 + (v - R.t0) / (R.t1 - R.t0) * (x1 - x0), yb = y0 + rows * rh;
    const step = state.h <= 600 ? 60 : state.h <= 1800 ? 300 : 600;
    const gg = PG.el(svg, 'g', { stroke: 'currentColor', 'stroke-width': .7, opacity: .14 });
    for (let v = Math.ceil(R.t0 / step) * step; v <= R.t1; v += step) {
      PG.el(gg, 'line', { x1: fx(v), x2: fx(v), y1: y0, y2: yb });
      PG.text(svg, fx(v), yb + 15, mmss(v), { 'text-anchor': 'middle', opacity: .62 });
    }
    PG.text(svg, (x0 + x1) / 2, yb + 34, PG.t('schedule.x'), { 'text-anchor': 'middle', opacity: .78 });
    const cid = PG.uid('clip');
    PG.el(PG.el(PG.el(svg, 'defs'), 'clipPath', { id: cid }), 'rect', { x: x0, y: 0, width: x1 - x0, height: H });
    const g = PG.el(svg, 'g', { 'clip-path': `url(#${cid})` });
    R.act.forEach((s, i) => {
      const y = y0 + i * rh + 6, h = rh - 12;
      PG.text(svg, x0 - 8, y + h / 2 + 4, s.name, { 'text-anchor': 'end', 'font-size': 11.5 });
      R.due.get(s).forEach(d => {
        PG.el(g, 'rect', { x: fx(d.a), y, width: Math.max(fx(d.b) - fx(d.a), 1.5), height: h, rx: 2,
          style: d.rec ? 'fill:var(--accent);stroke:var(--accent)' : 'fill:var(--warn-soft);stroke:var(--warn)', 'stroke-dasharray': d.rec ? null : '4 3', opacity: d.rec ? .85 : 1 });
        if (!d.rec) PG.text(g, fx(d.a) + 4, y + h / 2 + 4, '×', { style: 'fill:var(--warn)', 'font-size': 13 });
      });
      PG.el(svg, 'line', { x1: x0, x2: x1, y1: y0 + (i + 1) * rh, y2: y0 + (i + 1) * rh, stroke: 'currentColor', opacity: .12 });
    });
    const y = y0 + R.act.length * rh + 6, h = rh - 12;
    PG.text(svg, x0 - 8, y + h / 2 + 4, PG.t('schedule.radio'), { 'text-anchor': 'end', 'font-size': 11.5, opacity: .7 });
    R.caps.forEach(c => {
      PG.el(g, 'rect', { x: fx(c.a), y, width: Math.max(fx(c.b) - fx(c.a), 1.5), height: h, style: 'fill:var(--ink)', opacity: .55 });
      PG.el(g, 'rect', { x: fx(c.b), y, width: Math.max(fx(c.b + PROD + LEAD) - fx(c.b), 1), height: h, style: 'fill:var(--faint)', opacity: .35 });
    });
    PG.el(svg, 'rect', { x: x0, y: y0, width: x1 - x0, height: yb - y0, fill: 'none', stroke: 'currentColor', opacity: .5 });
  }

  PG.register({
    id: 'schedule',
    mount(root) {
      const svg = PG.svg(760, 160, PG.t('schedule.aria')), cap = PG.h('p', { class: 'cap' });
      const cards = PG.cards([{ key: 'busy', label: PG.t('schedule.k.busy') }, { key: 'caps', label: PG.t('schedule.k.caps') }, { key: 'free', label: PG.t('schedule.k.free') }]);
      const note = PG.note(), tbody = PG.h('tbody'), got = new Map(), band = new Map();

      const numIn = (obj, key, w, onSet) => PG.h('input', { type: 'number', step: 'any', value: obj[key], style: `width:${w}em`,
        oninput: e => { const v = parseFloat(e.target.value); if (isFinite(v)) { obj[key] = v; onSet(); } } });

      function rowsTable() {
        got.clear(); band.clear();
        tbody.replaceChildren(...state.st.map((s, i) => {
          const g = PG.h('td', { class: 'num' }), b = PG.h('td', { class: 'num' });
          got.set(s, g); band.set(s, b);
          return PG.h('tr', null,
            PG.h('td', null, PG.h('input', { type: 'checkbox', checked: s.on, 'aria-label': PG.t('schedule.th.on'), onchange: e => { s.on = e.target.checked; update(); } })),
            PG.h('td', null, PG.h('input', { type: 'text', value: s.name, oninput: e => { s.name = e.target.value; update(); } })),
            PG.h('td', null, numIn(s, 'rep', 5.5, update)), PG.h('td', null, numIn(s, 'ct', 8.5, update)), PG.h('td', null, numIn(s, 'dur', 5.5, update)),
            PG.h('td', null, numIn(s, 'rate', 8.5, update)), PG.h('td', null, numIn(s, 'lo', 5, update)), b, g,
            PG.h('td', null, PG.h('button', { type: 'button', title: PG.t('schedule.del'), onclick: () => { state.st.splice(i, 1); rowsTable(); update(); } }, '✕')));
        }));
      }

      function update() {
        const R = simulate();
        cap.textContent = PG.t('schedule.cap', { a: PG.num(R.t0, 0), b: PG.num(R.t1, 0) });
        draw(svg, R);
        const busy = R.caps.reduce((a, c) => a + Math.min(c.b, R.t1) - c.a, 0);
        let free = 0, t = R.t0;
        R.caps.forEach(c => { free = Math.max(free, c.a - LEAD - t); t = c.b + PROD; });
        free = Math.max(free, R.t1 - t);
        cards.set('busy', PG.num(100 * busy / state.h, 0) + ' %', PG.num(busy, 0) + ' / ' + PG.num(state.h, 0) + ' ' + PG.U('s'));
        cards.set('caps', String(R.caps.length));
        cards.set('free', PG.num(Math.max(0, free), 0) + ' ' + PG.U('s'));
        const warn = [];
        state.st.forEach(s => {
          const fl = s.lo - FS / 2, fh = fl + s.rate / 1000 * Math.min(s.dur, FS * 1000 / s.rate);
          if (band.has(s)) band.get(s).textContent = PG.num(fl, 1) + '–' + PG.num(fh, 1) + ' ' + PG.U('MHz');
          if (!s.on) { if (got.has(s)) got.get(s).textContent = '–'; return; }
          if (!(s.ct >= 0 && s.ct < s.rep)) { warn.push(PG.t('schedule.w.ct', { n: s.name })); if (got.has(s)) got.get(s).textContent = '–'; return; }
          const d = R.due.get(s) || [], a = d.filter(x => x.rec).length;
          if (got.has(s)) { got.get(s).textContent = a + ' / ' + d.length; got.get(s).style.color = a < d.length ? 'var(--warn)' : ''; }
          if (d.length && a === 0) warn.push(PG.t('schedule.w.never', { n: s.name }));
          else if (a < d.length) warn.push(PG.t('schedule.w.some', { n: s.name, a, b: d.length }));
          const m = FS * 1000 / s.rate;
          if (s.dur > m + 0.5) warn.push(PG.t('schedule.w.dur', { n: s.name, d: n4(s.dur), m: n4(m) }));
        });
        note.set(warn.length ? 'caution' : '', PG.t('schedule.w.lbl'), ...(warn.length ? warn : [PG.t('schedule.w.ok')]), PG.t('schedule.w.apply'));
      }

      const scSeg = PG.seg(['now', 'bad', 'three'].map(v => ({ value: v, label: PG.t('schedule.sc.' + v) })), state.sc, v => {
        state.sc = v; state.st = clone(SC[v]); rowsTable(); update();
      });
      const hSeg = PG.seg([300, 600, 900, 1800, 3600].map(v => ({ value: v, label: v < 3600 ? v / 60 + ' ' + PG.t('schedule.min') : '1 ' + PG.U('h') })), state.h, v => { state.h = v; update(); });
      const t0S = PG.slider({ label: PG.t('schedule.t0'), min: 0, max: 300, step: 1, value: state.t0, fmt: v => PG.num(v, 0) + ' ' + PG.U('s'), onInput: v => { state.t0 = v; update(); } });

      /* ----------------------------------------------------- converter */
      const cv = state.cv, out = PG.cards([{ key: 'win', label: PG.t('schedule.cv.win') }, { key: 'ct', label: PG.t('schedule.cv.ct') }, { key: 'dur', label: PG.t('schedule.cv.dur') }, { key: 'band', label: PG.t('schedule.cv.band') }]);
      const alts = PG.h('div', { class: 'row' });
      const cvIns = {};
      const cvField = (key, lab) => { cvIns[key] = numIn(cv, key, 7, convert); return PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('schedule.cv.' + (lab || key)))), cvIns[key]); };
      function convert() {
        const k = cv.k * 1e3, toWin = (cv.lo - FS / 2) * 1e6 / k, ct = ((cv.off + toWin) % cv.rep + cv.rep) % cv.rep;
        const m = FS * 1e6 / k;
        out.set('win', n4(toWin) + ' ' + PG.U('s'), '(LO − ' + PG.num(12.5, 1) + ' ' + PG.U('MHz') + ') / k');
        out.set('ct', n4(ct) + ' ' + PG.U('s'), '(' + n4(cv.off) + ' + ' + n4(toWin) + ') mod ' + n4(cv.rep));
        out.set('dur', n4(m) + ' ' + PG.U('s'));
        out.set('band', PG.num(cv.lo - FS / 2, 1) + '–' + PG.num(cv.lo + FS / 2, 1) + ' ' + PG.U('MHz'));
        const n = cv.srep > 0 && cv.rep > 0 ? Math.max(1, Math.min(60, Math.round(cv.srep / cv.rep))) : 1;
        alts.replaceChildren(...Array.from({ length: n }, (_, j) => {
          const c = ct + j * cv.rep;
          return PG.h('button', { type: 'button', title: PG.t('schedule.cv.use'), onclick: () => {
            state.st.push({ name: n4(cv.rep) + ':' + n4(cv.off), rep: cv.srep, ct: +c.toFixed(4), dur: +Math.min(m, 250).toFixed(4), rate: cv.k, lo: cv.lo, on: true });
            rowsTable(); update();
          } }, '+ ' + n4(c));
        }));
      }
      const CVP = [
        ['Кипр 300:235', 'Cyprus 300:235', { rep: 300, off: 235, k: 100, lo: 20, srep: 300 }],
        ['Соданкюля 60:54,0016', 'Sodankylä 60:54.0016', { rep: 60, off: 54.0016, k: 500.0084, lo: 16, srep: 300 }],
        ['300:291 (Иркутск?)', '300:291 (Irkutsk?)', { rep: 300, off: 291, k: 100, lo: 20, srep: 300 }],
        ['JORN 450:17', 'JORN 450:17', { rep: 450, off: 17, k: 125, lo: 20, srep: 450 }],
      ];

      root.append(
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'stack' },
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('schedule.sc'))), scSeg),
            PG.h('div', { class: 'ctl' }, PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('schedule.h'))), hSeg), t0S.root))),
        PG.h('div', { class: 'tablewrap' }, PG.h('table', null,
          PG.h('thead', null, PG.h('tr', null, ['on', 'name', 'rep', 'ct', 'dur', 'rate', 'lo', 'band', 'got'].map(k => PG.h('th', null, PG.t('schedule.th.' + k))), PG.h('th'))), tbody)),
        PG.h('div', { class: 'row', style: 'margin:-6px 0 16px' }, PG.h('button', { type: 'button', onclick: () => {
          state.st.push({ name: PG.t('schedule.newst', { n: state.st.length + 1 }), rep: 300, ct: 200, dur: 50, rate: 100, lo: 20, on: true }); rowsTable(); update();
        } }, '+ ' + PG.t('schedule.add'))),
        cards.root,
        PG.h('div', { class: 'panel' }, cap,
          PG.legend([['box', 'background:var(--accent)', PG.t('schedule.l.rec')], ['box', 'background:var(--warn-soft);border:1px dashed var(--warn)', PG.t('schedule.l.skip')], ['box', 'background:var(--faint);opacity:.5', PG.t('schedule.l.busy')]]),
          svg),
        note.root,
        PG.h('h2', null, PG.t('schedule.cv.t')),
        PG.h('p', { class: 'lede', style: 'font-size:14.5px;margin-bottom:12px' }, PG.t('schedule.cv.p')),
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'field', style: 'margin-bottom:12px' }, PG.h('label', null, PG.h('span', null, PG.t('schedule.cv.pre'))),
            PG.h('div', { class: 'seg' }, CVP.map(([ru, en, v]) => PG.h('button', { type: 'button', onclick: () => {
              Object.assign(cv, v); for (const key in cvIns) cvIns[key].value = cv[key]; convert();
            } }, PG.lang === 'ru' ? ru : en)))),
          PG.h('div', { class: 'ctl', style: 'grid-template-columns:repeat(auto-fit,minmax(130px,1fr))' }, cvField('rep'), cvField('off'), cvField('k'), cvField('lo'), cvField('srep', 'st'))),
        out.root,
        PG.h('p', { style: 'font-size:14px;color:var(--muted);margin:0 0 6px' }, PG.t('schedule.cv.alt')),
        alts,
        PG.h('p', { class: 'lede', style: 'font-size:13.5px;margin-top:24px' }, PG.t('schedule.model')));
      rowsTable(); update(); convert();
    },
  });
})();
