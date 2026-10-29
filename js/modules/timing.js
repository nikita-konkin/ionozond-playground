/* A wrong chirptime or sweep rate: where the echo lands, and how much the decimator leaves of it. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'timing.nav': 'Ошибка chirptime', 'timing.part': 'Часть 9 · Синхронизация', 'timing.title': 'Неверный chirptime: куда пропадает эхо',
      'timing.short': '1 мс — это 300 км, 0,2 с — край интервала однозначности, чётные секунды — нуль дециматора. Как ошибки момента старта и скорости перестройки частоты выглядят на экране ionozond.',
      'timing.lede': 'Ошибка момента старта Δt сдвигает опорный ЛЧМ-сигнал по частоте на k·Δt, и на ионограмме это неотличимо от дополнительной задержки. Малые ошибки просто смещают след, большие перескакивают через край интервала однозначности ±20 кГц / k, а дециматор — скользящее среднее по 625 отсчётам с нулями АЧХ через каждые 40 кГц — такое эхо ослабляет. Ошибка скорости Δk добавляет к разностной частоте слагаемое, которое растёт на Δk каждую секунду, и след наклоняется.',
      'timing.st': 'Передатчик', 'timing.st.cy': 'Кипр 300:235, 100 кГц/с', 'timing.st.so': 'Соданкюля 60:54, 500 кГц/с',
      'timing.st.vi': 'Йошкар-Ола, вертикальное, 50 кГц/с', 'timing.dt': 'Ошибка chirptime |Δt|', 'timing.sign': 'Знак',
      'timing.late': 'опорный сигнал запаздывает (+)', 'timing.early': 'опорный сигнал опережает (−)', 'timing.dk': 'Ошибка скорости Δk',
      'timing.k.beat': 'Сдвиг разностной частоты k·Δt', 'timing.k.loss': 'Ослабление в дециматоре', 'timing.k.shift': 'Кажущийся сдвиг эха',
      'timing.k.tilt': 'Наклон от Δk за сеанс', 'timing.up': 'выше', 'timing.down': 'ниже',
      'timing.cap.panel': 'Что покажет окно ионограммы: {a}–{b} км группового пути (окно 1680 км)',
      'timing.aria.panel': 'Ионограмма в окне ionozond: ожидаемый и наблюдаемый следы.',
      'timing.x.f': 'частота, МГц', 'timing.y.km': 'групповой путь, км', 'timing.l.exp': 'при верной синхронизации',
      'timing.l.act': 'с ошибкой (чем бледнее, тем сильнее ослаблен)', 'timing.empty.null': 'Пусто: эхо попало в нуль дециматора',
      'timing.empty.out': 'Пусто: эхо за пределами окна',
      'timing.cap.wrap': 'Весь интервал однозначности ±{r} км: где эхо на самом деле',
      'timing.aria.wrap': 'Полоса интервала однозначности с окном ионограммы и положением эха.',
      'timing.panel': 'окно',
      'timing.cap.dec': 'Ослабление в дециматоре в зависимости от |Δt| (при выбранной скорости)',
      'timing.aria.dec': 'Ослабление в дециматоре со скользящим средним в зависимости от ошибки синхронизации, логарифмическая шкала.',
      'timing.x.dec': '|Δt|, с', 'timing.y.dec': 'ослабление, дБ', 'timing.inpanel': 'след в окне', 'timing.th.err': 'Ошибка',
      'timing.th.beat': 'Сдвиг частоты', 'timing.th.loss': 'Ослабление', 'timing.th.where': 'Что увидит оператор',
      'timing.tbl': 'Те же ошибки, что и в таблице документа, пересчитанные для выбранного передатчика и знака. Щёлкните по строке, чтобы показать её на графиках.',
      'timing.v.zero': 'синхронизация верна', 'timing.v.bin': 'сдвиг {d} км — меньше отсчёта задержки, незаметен',
      'timing.v.moved': 'след смещён на {d} км, но ещё в окне',
      'timing.v.out': 'эхо на {d} км, за пределами окна: выглядит как «нет сигнала»',
      'timing.v.wrap': 'перескок через край, около ±{r} км, {l} дБ: размытая энергия у верхнего и нижнего краёв полного интервала',
      'timing.v.null': 'в нуле дециматора ({l} дБ): пусто',
      'timing.v.weak': 'на боковом лепестке дециматора, {l} дБ: тонет в шуме',
      'timing.empty.weak': 'Пусто: дециматор ослабил эхо ниже уровня шума', 'timing.n.lbl': 'Как читать это на экране ionozond',
      'timing.n.1': 'Пустое окно на заведомо открытой трассе — это либо ошибка на чётное число секунд, либо старт не в ту минуту. Энергия, прижатая к краям полного интервала, говорит об ошибке на нечётное число секунд; tools/find_trace.py так её и определяет.',
      'timing.n.2': 'Наклон от Δk нарастает линейно в течение сеанса: при 500 кГц/с ошибка 8,4 Гц/с за 50 с даёт 420 Гц, то есть 0,84 мс, или 250 км. Ошибку скорости выдаёт наклонённый, а не смещённый след.',
      'timing.model': 'Модель: эхо 1F с задержкой 9,1 мс (Кипр) или 5,8 мс (Соданкюля); разностная частота до децимации −k(τ − Δt) − Δk·t; АЧХ дециматора |sin(πfN/fs)/(N·sin(πf/fs))| при N = 625 и fs = 25 МГц; после децимации частота сворачивается по модулю 40 кГц. Окно ионограммы — [D − 180, D + 1500] км, где D — наклонная дальность, которую вычисляет ionozond (2599 км для Кипра, 1639 км для Соданкюли). У вертикального ионозонда передатчик и приёмник стоят рядом, D = 200 км, и окно 20–1700 км группового пути соответствует действующим высотам до 850 км; след в нём — дневной профиль из раздела о вертикальном зондировании при 50 кГц/с и 1–14 МГц, как у станции yoshkar-ola в schedule.ini. Форма наклонных следов схематична.',
    },
    en: {
      'timing.nav': 'Chirptime error',
      'timing.part': 'Part 9 · Timing',
      'timing.title': 'A wrong chirptime: where the echo goes',
      'timing.short': '1 ms is 300 km, 0.2 s is the edge of the range, even seconds sit in a decimator null. Timing and sweep-rate errors as the console shows them.',
      'timing.lede': 'A start-time error Δt shifts the replica by k·Δt in frequency and looks exactly like extra delay. Small errors move the trace. Large ones wrap around the unambiguous ±20 kHz / k range, and the decimator, a 625-sample boxcar with nulls every 40 kHz, attenuates them. A rate error Δk adds a beat that grows by Δk every second, so the trace tilts.',
      'timing.st': 'Transmitter', 'timing.st.cy': 'Cyprus 300:235, 100 kHz/s', 'timing.st.so': 'Sodankylä 60:54, 500 kHz/s', 'timing.st.vi': 'Yoshkar-Ola vertical, 50 kHz/s',
      'timing.dt': 'Chirptime error |Δt|', 'timing.sign': 'Sign', 'timing.late': 'replica late (+)', 'timing.early': 'replica early (−)',
      'timing.dk': 'Sweep-rate error Δk',
      'timing.k.beat': 'Beat offset k·Δt', 'timing.k.loss': 'Decimator loss', 'timing.k.shift': 'Apparent echo shift', 'timing.k.tilt': 'Tilt from Δk over the sweep',
      'timing.up': 'up', 'timing.down': 'down',
      'timing.cap.panel': 'What the panel shows: {a}–{b} km of group path (a 1680 km window)',
      'timing.aria.panel': 'Ionogram over the panel window with the expected and the apparent trace.',
      'timing.x.f': 'frequency, MHz', 'timing.y.km': 'group path, km',
      'timing.l.exp': 'with correct timing', 'timing.l.act': 'with the error (fainter = more attenuated)',
      'timing.empty.null': 'Empty: the echo sits in a decimator null', 'timing.empty.out': 'Empty: the echo is outside the panel',
      'timing.cap.wrap': 'The whole unambiguous range, ±{r} km: where the echo really is',
      'timing.aria.wrap': 'Strip of the unambiguous range with the panel window and the echo position.',
      'timing.panel': 'panel',
      'timing.cap.dec': 'Decimator attenuation against |Δt| (at this sweep rate)',
      'timing.aria.dec': 'Boxcar decimator attenuation against timing error, logarithmic scale.',
      'timing.x.dec': '|Δt|, s', 'timing.y.dec': 'attenuation, dB', 'timing.inpanel': 'trace in panel',
      'timing.th.err': 'Error', 'timing.th.beat': 'Beat', 'timing.th.loss': 'Attenuation', 'timing.th.where': 'What the operator sees',
      'timing.tbl': 'The errors from the document’s table, computed for the chosen transmitter and sign. Click a row to show it.',
      'timing.v.zero': 'timing correct',
      'timing.v.bin': 'moved {d} km, less than a delay bin: invisible',
      'timing.v.moved': 'trace moved {d} km, still in the panel',
      'timing.v.out': 'echo at {d} km, outside the panel: looks like “no signal”',
      'timing.v.wrap': 'on the wrap near ±{r} km, {l} dB: broad energy at the top and bottom of the full range',
      'timing.v.null': 'in a decimator null ({l} dB): gone',
      'timing.v.weak': 'on a decimator sidelobe, {l} dB: lost in the noise',
      'timing.empty.weak': 'Empty: the decimator has pushed the echo below the noise',
      'timing.n.lbl': 'Reading it on the console',
      'timing.n.1': 'An empty panel on a path known to be open is the even-second or wrong-minute case. Energy piled against the edges of the full range is an odd-second error, and tools/find_trace.py reports it as such.',
      'timing.n.2': 'The tilt from Δk grows linearly along the sweep: at 500 kHz/s, 8.4 Hz/s over 50 s is 420 Hz, 0.84 ms, 250 km. A rate error shows as a tilted trace, not a shifted one.',
      'timing.model': 'Model: a 1F echo at 9.1 ms (Cyprus) or 5.8 ms (Sodankylä); beat before decimation −k(τ − Δt) − Δk·t; decimator response |sin(πfN/fs)/(N·sin(πf/fs))| with N = 625, fs = 25 MHz; after decimation the frequency folds modulo 40 kHz. Panel window [D − 180, D + 1500] km, where D is the ray distance the console computes (2599 km for Cyprus, 1639 km for Sodankylä). A vertical sounder has zero range, so D = 200 km and the window is 20–1700 km of group path, virtual heights up to 850 km; its trace is the daytime profile from the vertical-sounding section, at 50 kHz/s over 1–14 MHz like the yoshkar-ola station in schedule.ini. The oblique trace shapes are schematic.',
    },
  });

  const FS = 25e6, NDEC = 625, FIF = 40e3, KM = 299792.458;   // km per second of delay
  const ST = {
    cy: { k: 100e3, tau: 9.1e-3, ray: 2599, flo: 7.5, fhi: 32.5, M: 26 },
    so: { k: 500.0084e3, tau: 5.8e-3, ray: 1639, flo: 3.5, fhi: 28.5, M: 15 },
    vi: { k: 50e3, ray: 200, flo: 1.0, fhi: 14.0, vi: true },
  };
  // The vertical sounder's trace is the daytime profile; its reference delay is the F2 echo at 5 MHz.
  const VP = PG.vi.profile(PG.vi.PRESETS.day);
  ST.vi.M = VP.fmax; ST.vi.tau = PG.vi.tau(5, VP) / 1000;
  const traceOf = S => S.vi ? (f => PG.vi.tau(f, VP) / 1000) : (f => PG.model.tauL(f, S.M, S.tau * 1e6) * 1e-6);
  const state = { st: 'cy', mag: 1e-3, sign: 1, dk: 0 };

  const H = f => { const x = Math.PI * f / FS, s = Math.sin(x); return Math.abs(s) < 1e-15 ? 1 : Math.abs(Math.sin(NDEC * x) / (NDEC * s)); };
  const lossDb = f => Math.min(120, -20 * Math.log10(Math.max(H(f), 1e-6)));
  // A null, rather than a weak sidelobe: well below the sidelobe envelope 1/(N·sin(πf/fs)).
  const inNull = f => lossDb(f) > 10 - 20 * Math.log10(Math.min(1, 1 / (NDEC * Math.abs(Math.sin(Math.PI * f / FS)) + 1e-12)));
  const fold = b => b - FIF * Math.round(b / FIF);

  // Echo at sweep time t (s into the capture) under timing error dt and rate error dk.
  function echo(S, dt, dk, t, tau) {
    const beat = -S.k * (tau - dt) - dk * t;
    const ta = -fold(beat) / S.k;
    return { beat, loss: lossDb(beat), ta, km: ta * KM };
  }
  const win = S => [S.ray - 180, S.ray + 1500];
  const tauMax = S => FIF / 2 / S.k;

  function verdict(S, dt) {
    if (dt === 0) return PG.t('timing.v.zero');
    const e = echo(S, dt, 0, 0, S.tau), [a, b] = win(S), d0 = (e.ta - S.tau) * KM;
    const rk = PG.num(Math.round(tauMax(S) * KM / 1000) * 1000, 0);
    if (e.loss >= 40) return PG.t(inNull(e.beat) ? 'timing.v.null' : 'timing.v.weak', { l: PG.num(-e.loss, 0) });
    if (e.km >= a && e.km <= b) return PG.t(Math.abs(d0) < 7.3 ? 'timing.v.bin' : 'timing.v.moved', { d: PG.num(d0, 0) });
    if (Math.abs(e.ta) >= 0.75 * tauMax(S)) return PG.t('timing.v.wrap', { r: rk, l: PG.num(-e.loss, 0) });
    return PG.t('timing.v.out', { d: PG.num(d0, 0) });
  }

  const trim = s => s.replace(/([.,]\d*?)0+$/, '$1').replace(/[.,]$/, '');
  const fmtDt = v => {
    const a = Math.abs(v);
    if (a === 0) return '0';
    if (a < 1e-3) return trim(PG.sig(v * 1e6, 2)) + ' ' + PG.U('us');
    if (a < 1) return trim(PG.sig(v * 1e3, 3)) + ' ' + PG.U('ms');
    return trim(PG.sig(v, 3)) + ' ' + PG.U('s');
  };
  const fmtHz = v => Math.abs(v) >= 1000 ? trim(PG.sig(v / 1000, 3)) + ' ' + PG.U('kHz') : trim(PG.sig(v, 3)) + ' ' + PG.U('Hz');

  function drawPanel(svg) {
    svg.replaceChildren();
    const S = ST[state.st], [a, b] = win(S), dt = state.sign * state.mag;
    const P = PG.plot(svg, { x0: 56, x1: 744, y0: 12, y1: 250, xd: [S.flo, S.fhi], yd: [a, b], xl: PG.t('timing.x.f'), yl: PG.t('timing.y.km'), ylx: 12, nx: 10 });
    const { fx, fy, g } = P, kM = S.k / 1e6;
    const fs = []; for (let f = S.flo + (S.vi ? 0.05 : 0.6); f < S.M; f += S.vi ? 0.04 : 0.12) fs.push(f);
    const tau = traceOf(S);
    PG.el(g, 'path', { d: PG.path(fs.map(f => [fx(f), fy(tau(f) * KM)])), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: .55 });
    let shown = 0, worst = 0, nul = false;
    fs.forEach(f => {
      const e = echo(S, dt, state.dk, (f - S.flo) / kM, tau(f));
      if (e.loss > worst) { worst = e.loss; nul = inNull(e.beat); }
      if (e.km < a || e.km > b || e.loss >= 40) return;
      shown++;
      PG.el(g, 'circle', { cx: fx(f), cy: fy(e.km), r: 2.6, style: 'fill:var(--accent)', opacity: PG.clamp(1 - e.loss / 40, 0.12, 1).toFixed(2) });
    });
    if (!shown) {
      const key = worst < 40 ? 'timing.empty.out' : nul ? 'timing.empty.null' : 'timing.empty.weak';
      PG.text(svg, 400, 131, PG.t(key), { 'text-anchor': 'middle', 'font-size': 14, style: 'fill:var(--warn)' });
    }
  }

  function drawWrap(svg) {
    svg.replaceChildren();
    const S = ST[state.st], R = tauMax(S) * KM, [a, b] = win(S), dt = state.sign * state.mag;
    const x0 = 56, x1 = 744, fx = v => x0 + (v + R) / (2 * R) * (x1 - x0), y0 = 22, y1 = 58;
    PG.el(svg, 'rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: 'none', stroke: 'currentColor', opacity: .5 });
    const pa = fx(a), pb = Math.max(fx(b), pa + 3);
    PG.el(svg, 'rect', { x: pa, y: y0, width: pb - pa, height: y1 - y0, style: 'fill:var(--accent-soft);stroke:var(--accent)' });
    PG.text(svg, (pa + pb) / 2, y0 - 6, PG.t('timing.panel'), { 'text-anchor': 'middle', style: 'fill:var(--accent)' });
    const tk = PG.ticks(-R, R, 6);
    tk.forEach(v => PG.text(svg, fx(v), y1 + 16, PG.num(v / 1000, 0) + 'k', { 'text-anchor': 'middle', opacity: .62 }));
    PG.text(svg, x1, y1 + 32, PG.U('km'), { 'text-anchor': 'end', opacity: .62 });
    const kM = S.k / 1e6;
    for (let f = S.flo + 0.6; f < S.M; f += 0.5) {
      const e = echo(S, dt, state.dk, (f - S.flo) / kM, S.tau);
      if (e.loss >= 40) continue;
      PG.el(svg, 'rect', { x: fx(e.km) - 1.5, y: y0 + 4, width: 3, height: y1 - y0 - 8, style: 'fill:var(--warn)', opacity: PG.clamp(1 - e.loss / 40, 0.15, 1).toFixed(2) });
    }
  }

  function drawDec(svg) {
    svg.replaceChildren();
    const S = ST[state.st], L0 = -4, L1 = 2;
    const P = PG.plot(svg, { x0: 56, x1: 744, y0: 12, y1: 196, xd: [L0, L1], yd: [-60, 3], xt: [-4, -3, -2, -1, 0, 1, 2],
      xf: v => fmtDt(Math.pow(10, v)),
      yt: [-60, -40, -20, 0], xl: PG.t('timing.x.dec'), yl: PG.t('timing.y.dec'), ylx: 12 });
    const { fx, fy, g } = P, [a, b] = win(S), tk = S.tau * KM;
    const room = (state.sign > 0 ? tk - a : b - tk) / KM;
    if (room > 1e-4) {
      PG.el(g, 'rect', { x: fx(L0), y: 12, width: fx(Math.log10(room)) - fx(L0), height: 184, style: 'fill:var(--accent-soft)' });
      PG.text(g, fx(L0) + 6, 28, PG.t('timing.inpanel'), { style: 'fill:var(--accent)' });
    }
    PG.el(g, 'line', { x1: fx(L0), x2: fx(L1), y1: fy(-40), y2: fy(-40), style: 'stroke:var(--warn)', 'stroke-dasharray': '4 4', opacity: .7 });
    const pts = [];
    for (let i = 0; i <= 6000; i++) { const lv = L0 + (L1 - L0) * i / 6000; pts.push([fx(lv), fy(-Math.min(60, lossDb(S.k * (Math.pow(10, lv) - S.tau * state.sign))))]); }
    PG.el(g, 'path', { d: PG.path(pts), fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: .8 });
    if (state.mag > 0) {
      const lv = PG.clamp(Math.log10(state.mag), L0, L1), l = echo(S, state.sign * state.mag, 0, 0, S.tau).loss;
      PG.el(g, 'line', { x1: fx(lv), x2: fx(lv), y1: 12, y2: 196, style: 'stroke:var(--accent)', 'stroke-width': 1.5 });
      PG.el(g, 'circle', { cx: fx(lv), cy: fy(-Math.min(60, l)), r: 4.5, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 1.5 });
    }
  }

  const PRESETS = [1e-3, 1e-2, 0.2, 1, 2, 3, 5, 60];

  PG.register({
    id: 'timing',
    mount(root) {
      const sp = PG.svg(760, 290, PG.t('timing.aria.panel')), sw = PG.svg(760, 96, PG.t('timing.aria.wrap')), sd = PG.svg(760, 236, PG.t('timing.aria.dec'));
      const capP = PG.h('p', { class: 'cap' }), capW = PG.h('p', { class: 'cap' });
      const cards = PG.cards([{ key: 'b', label: PG.t('timing.k.beat') }, { key: 'l', label: PG.t('timing.k.loss') }, { key: 's', label: PG.t('timing.k.shift') }, { key: 't', label: PG.t('timing.k.tilt') }]);
      const verdictNote = PG.note();
      const tbody = PG.h('tbody');

      const LMIN = -5, LMAX = 2;   // slider covers 10 µs … 100 s
      const toMag = v => Math.pow(10, LMIN + (LMAX - LMIN) * v / 1000);
      const ofMag = m => m <= 0 ? 0 : Math.round(1000 * (Math.log10(m) - LMIN) / (LMAX - LMIN));
      const dtS = PG.slider({ label: PG.t('timing.dt'), min: 0, max: 1000, step: 1, value: ofMag(state.mag), fmt: v => fmtDt(state.mag), onInput: v => { state.mag = toMag(v); update(); } });
      const dkS = PG.slider({ label: PG.t('timing.dk'), min: -20, max: 20, step: 0.2, value: state.dk, fmt: v => PG.num(v, 1) + ' ' + PG.U('Hz') + '/' + PG.U('s'), onInput: v => { state.dk = v; update(); } });
      const signSeg = PG.seg([{ value: 1, label: PG.t('timing.late') }, { value: -1, label: PG.t('timing.early') }], state.sign, v => { state.sign = v; update(); });
      const setMag = m => { state.mag = m; dtS.set(ofMag(m)); update(); };

      function table() {
        const S = ST[state.st];
        tbody.replaceChildren(...PRESETS.map(m => {
          const dt = state.sign * m, e = echo(S, dt, 0, 0, S.tau);
          const tr = PG.h('tr', { class: e.loss >= 40 ? 'bad' : null, style: 'cursor:pointer', onclick: () => setMag(m) },
            PG.h('td', { class: 'num' }, fmtDt(m)), PG.h('td', { class: 'num' }, fmtHz(S.k * m)),
            PG.h('td', { class: 'num' }, PG.num(-e.loss, 1) + ' ' + PG.U('dB')), PG.h('td', null, verdict(S, dt)));
          if (Math.abs(m - state.mag) < 1e-12) tr.style.outline = '2px solid var(--accent)';
          return tr;
        }));
      }

      function update() {
        const S = ST[state.st], dt = state.sign * state.mag, e = echo(S, dt, 0, 0, S.tau), [a, b] = win(S);
        dtS.refresh();
        capP.textContent = PG.t('timing.cap.panel', { a: PG.num(a, 0), b: PG.num(b, 0) });
        capW.textContent = PG.t('timing.cap.wrap', { r: PG.num(Math.round(tauMax(S) * KM / 1000) * 1000, 0) });
        const d = (e.ta - S.tau) * KM, tilt = state.dk * (S.fhi - S.flo) * 1e6 / S.k / S.k * KM;
        cards.set('b', fmtHz(S.k * dt), '');
        cards.set('l', PG.num(-e.loss, 1) + ' ' + PG.U('dB'), 'H(' + fmtHz(e.beat) + ')');
        cards.set('s', PG.num(d, 0) + ' ' + PG.U('km'), fmtDt(e.ta - S.tau) + (Math.abs(d) >= 1 ? ', ' + PG.t(d > 0 ? 'timing.up' : 'timing.down') : ''));
        cards.set('t', PG.num(tilt, 0) + ' ' + PG.U('km'), fmtDt(tilt / KM));
        verdictNote.set(e.loss >= 40 || (Math.abs(e.ta) >= 0.75 * tauMax(S) && dt) ? 'caution' : '', PG.t('timing.n.lbl'),
          (v => v.charAt(0).toUpperCase() + v.slice(1))(verdict(S, dt)) + '.', PG.t('timing.n.1'), PG.t('timing.n.2'));
        drawPanel(sp); drawWrap(sw); drawDec(sd); table();
      }

      root.append(
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'ctl' },
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('timing.st'))),
              PG.seg([{ value: 'cy', label: PG.t('timing.st.cy') }, { value: 'so', label: PG.t('timing.st.so') }, { value: 'vi', label: PG.t('timing.st.vi') }], state.st, v => { state.st = v; update(); })),
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('timing.sign'))), signSeg),
            dtS.root, dkS.root),
          PG.h('div', { class: 'row' },
            PG.h('button', { type: 'button', onclick: () => setMag(0) }, '0'),
            PRESETS.map(m => PG.h('button', { type: 'button', onclick: () => setMag(m) }, fmtDt(m))),
            PG.h('button', { type: 'button', onclick: () => { state.dk = 0; dkS.set(0); update(); } }, 'Δk = 0'))),
        cards.root,
        PG.h('div', { class: 'panel' }, capP, PG.legend([['dash', 'border-color:var(--faint)', PG.t('timing.l.exp')], ['dot', 'background:var(--accent)', PG.t('timing.l.act')]]), sp),
        PG.h('div', { class: 'panel' }, capW, sw),
        verdictNote.root,
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('timing.cap.dec')), sd),
        PG.h('p', { class: 'lede', style: 'font-size:14px;margin-bottom:8px' }, PG.t('timing.tbl')),
        PG.h('div', { class: 'tablewrap' }, PG.h('table', null,
          PG.h('thead', null, PG.h('tr', null, ['err', 'beat', 'loss', 'where'].map(k => PG.h('th', null, PG.t('timing.th.' + k))))), tbody)),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px' }, PG.t('timing.model')));
      update();
    },
  });
})();
