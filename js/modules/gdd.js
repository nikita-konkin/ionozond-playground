/* GDD on the ionogram: slope of the model 1F trace, delay spread across a band, a pulse through it. */
(function () {
  'use strict';
  const M_ = PG.model;

  PG.i18n({
    ru: {
      'gdd.nav': 'Дисперсия на ионограмме', 'gdd.part': 'Часть 11 · Дисперсия', 'gdd.title': 'Дисперсия групповой задержки на ионограмме',
      'gdd.short': 'Крутизна ДЧХ в выбранной точке, разброс задержки в полосе сигнала и то, во что этот разброс превращает импульс.',
      'gdd.lede': 'Модельная дистанционно-частотная характеристика (ДЧХ) моды 1F для трассы Кипр — Йошкар-Ола, построенная по дисперсии, измеренной в 583 сеансах. Задайте МНЧ и поместите сигнал нужной полосы в любую точку характеристики. Вы увидите крутизну ДЧХ в этой точке — дисперсию групповой задержки (GDD), — разброс задержки в пределах полосы, искажение импульса и то, насколько всё это заметно на экране ionozond.',
      'gdd.muf': 'МНЧ 1F', 'gdd.fc': 'Средняя частота сигнала', 'gdd.bw': 'Полоса сигнала', 'gdd.ow': '0,85 МНЧ',
      'gdd.more': 'Показать моду 2F и верхний луч 1F',
      'gdd.cap.iono': 'Ионограмма. Заливка — полоса сигнала, штриховая линия — касательная к ДЧХ; её наклон и есть GDD.',
      'gdd.aria.iono': 'Модельная ионограмма наклонного зондирования трассы Кипр — Йошкар-Ола: зависимость задержки от частоты для нижнего луча 1F вплоть до МНЧ, полоса сигнала и касательная в её центре.',
      'gdd.x.f': 'частота, МГц', 'gdd.y.d': 'задержка, мс', 'gdd.lbl.1f': '1F, нижний луч', 'gdd.lbl.up': 'верхний луч', 'gdd.lbl.muf': 'МНЧ {v}',
      'gdd.lbl.band': '{b} на {f} МГц', 'gdd.k.x': 'f / МНЧ', 'gdd.k.g': 'GDD в этой точке', 'gdd.k.gs': 'крутизна ДЧХ',
      'gdd.k.s': 'Разброс в полосе', 'gdd.k.ss': 'при 1/B = {v}', 'gdd.k.b': 'B<sub>max</sub> в этой точке',
      'gdd.k.bs': '1/√GDD: разброс равен 1/B', 'gdd.k.c': 'Заметно на экране', 'gdd.k.cs': '{v} мкс на столбец 41 кГц',
      'gdd.x.nose': 'вплотную к МНЧ', 'gdd.x.low': 'далеко от МНЧ', 'gdd.x.work': 'рабочий диапазон',
      'gdd.v.flat': 'Для такой полосы ДЧХ практически плоская',
      'gdd.v.flatT': 'Разброс задержки в полосе меньше собственного временного разрешения сигнала 1/B. Импульс почти не меняется: пик проседает меньше чем на 0,1 дБ.',
      'gdd.v.mild': 'Искажения заметны',
      'gdd.v.mildT': 'Разброс в 1–5 раз больше 1/B. Импульс расширяется до 1,6 раза и теряет в пике до 1,5 дБ; адаптивный корректор с этим справляется.',
      'gdd.v.bad': 'Сильные дисперсионные искажения',
      'gdd.v.badT': 'Разброс больше 5/B, полоса более чем вдвое шире B_max. Если не компенсировать наклон ДЧХ, импульс расплывается: при GDD·B² = 10 он становится в 2,6 раза шире и на 4 дБ ниже.',
      'gdd.v.num': 'GDD·B² = {v}.', 'gdd.v.cut': 'Часть полосы лежит выше МНЧ и не проходит вовсе.',
      'gdd.v.ext': 'МНЧ ниже 18 МГц — в этой области закон не измерялся. Он продолжен пропорционально 1/МНЧ, как у параболического слоя, и крутизна здесь в {v} раза больше, чем по дневной формуле.',
      'gdd.v.nose': 'Выше 0,96 МНЧ аппроксимация круче измеренной медианы: при 0,99 МНЧ медиана составляет 36,5 мкс/МГц, а формула даёт 67.',
      'gdd.v.bin': 'На ионограмме вся полоса умещается в один отсчёт задержки, поэтому наклон проявляется лишь как медленный дрейф следа на протяжении многих столбцов.',
      'gdd.cap.zoom': 'В пределах полосы: задержка относительно центральной',
      'gdd.aria.zoom': 'ДЧХ в пределах полосы сигнала: задержка относительно центральной в сравнении с одним отсчётом задержки на экране ionozond.',
      'gdd.bin': 'один отсчёт задержки на экране, 24,4 мкс', 'gdd.above': 'выше МНЧ', 'gdd.x.off': 'отстройка от центра, кГц',
      'gdd.y.rel': 'задержка − центральная, мкс',
      'gdd.cap.pulse': 'Импульс после прохождения трассы: огибающая с дисперсией и без неё',
      'gdd.aria.pulse': 'Огибающая импульса заданной полосы после прохождения трассы в сравнении с тем же импульсом без дисперсии.',
      'gdd.x.t': 'время относительно центральной задержки, мкс', 'gdd.p.ref': 'без дисперсии', 'gdd.p.peak': 'после трассы: пик {v} дБ',
      'gdd.p.w': 'ширина ×{v}',
      'gdd.model': 'Модель. Нижний луч 1F: τ(f) = 8,95 мс + b·МНЧ·(2(1 − √(1 − x)) − x), где x = f/МНЧ. Это интеграл медианного закона GDD = b·(1/√(1 − x) − 1) с b = 7,5 мкс/МГц, подобранного по 583 сеансам на трассе Кипр — Йошкар-Ола в феврале 2026 г. Реальные ДЧХ разбросаны вокруг него в пределах межквартильного размаха из таблицы части 11, а оценка по одному сеансу добавляет ещё ±4 мкс/МГц. Закон измерен при МНЧ 18–32 МГц; ниже он продолжен пропорционально 1/МНЧ. Тот же закон независимо следует из параболического профиля через закон секанса (см. раздел о вертикальном зондировании): днём расхождение не превышает 20 % в интервале от 0,8 до 0,96 МНЧ. Верхний луч и мода 2F нарисованы для ориентира и в расчётах не участвуют; 2F начинается на 9,40 мс и обрывается на 0,70 МНЧ — так получается при зеркальном отражении с h′ = 250–300 км. Импульс — участок спектра шириной B с окном Ханна вокруг курсора, прошедший через фазовую характеристику φ(f) = −2π∫(τ − τc) df, которую задаёт ДЧХ. Замирания, магнитоионное расщепление и поглощение не учитываются. Столбец ионограммы ionozond — 41 кГц, отсчёт задержки — 24,4 мкс (БПФ на 16 384 точки, 100 кГц/с).',
    },
    en: {
      'gdd.nav': 'GDD on the ionogram',
      'gdd.part': 'Part 11 · Dispersion',
      'gdd.title': 'Group-delay dispersion on the ionogram',
      'gdd.short': 'The trace’s slope at a chosen point, the delay spread across a signal’s band, and what it does to a pulse.',
      'gdd.lede': 'A model 1F trace for the Cyprus path, built on the dispersion measured over 583 sweeps. Set the MUF, then put a signal of some bandwidth anywhere on the trace. The page shows the trace’s slope there (GDD, the group-delay dispersion), how far it spreads the band in delay, what that does to a pulse, and how much of it the console can resolve.',
      'gdd.muf': '1F MUF', 'gdd.fc': 'Signal centre', 'gdd.bw': 'Signal bandwidth', 'gdd.ow': '0.85 MUF',
      'gdd.more': 'Show 2F and the 1F upper ray',
      'gdd.cap.iono': 'The ionogram. Shaded: the signal’s band. Dashed: the trace’s tangent, whose slope is the GDD.',
      'gdd.aria.iono': 'Model oblique ionogram of the Cyprus path: delay against frequency for the 1F lower ray up to the MUF, with the signal’s band shaded and the tangent at its centre.',
      'gdd.x.f': 'frequency, MHz', 'gdd.y.d': 'delay, ms',
      'gdd.lbl.1f': '1F, lower ray', 'gdd.lbl.up': 'upper ray', 'gdd.lbl.muf': 'MUF {v}', 'gdd.lbl.band': '{b} at {f} MHz',
      'gdd.k.x': 'f / MUF', 'gdd.k.g': 'GDD here', 'gdd.k.gs': 'slope of the trace', 'gdd.k.s': 'Spread over the band', 'gdd.k.ss': 'against 1/B = {v}',
      'gdd.k.b': 'B<sub>max</sub> here', 'gdd.k.bs': '1 / √GDD: spread = 1/B', 'gdd.k.c': 'Console sees', 'gdd.k.cs': '{v} µs per 41 kHz column',
      'gdd.x.nose': 'close to the nose', 'gdd.x.low': 'far below the MUF', 'gdd.x.work': 'working range',
      'gdd.v.flat': 'Flat for this band', 'gdd.v.flatT': 'The delay spread across the band is less than the band’s own time resolution, 1/B. The pulse is practically unchanged: its peak drops by less than 0.1 dB.',
      'gdd.v.mild': 'Noticeable', 'gdd.v.mildT': 'The spread is 1–5 times 1/B. The pulse widens by up to 1.6× and loses up to 1.5 dB of peak; an equaliser removes it.',
      'gdd.v.bad': 'Dispersive', 'gdd.v.badT': 'The spread exceeds 5/B, so the band is more than twice B_max. Without compensating the trace’s slope the pulse smears: at GDD·B² = 10 it is 2.6× wider and 4 dB lower.',
      'gdd.v.num': 'GDD·B² = {v}.', 'gdd.v.cut': 'Part of the band lies above the MUF and is not propagated at all.',
      'gdd.v.ext': 'The MUF is below 18 MHz, where the law was not measured. It is continued as ∝ 1/MUF, which is how a parabolic layer behaves, so the slope here is {v}× the daytime formula.',
      'gdd.v.nose': 'Above 0.96 MUF the fit is steeper than the measured median: 36.5 µs/MHz at 0.99 MUF against the fit’s 67.',
      'gdd.v.bin': 'On the ionogram the whole band sits inside one delay bin, so the slope shows only as a drift across many columns.',
      'gdd.cap.zoom': 'Inside the band: delay against offset from the centre',
      'gdd.aria.zoom': 'The trace across the signal’s band, delay relative to the centre, against one console delay bin.',
      'gdd.bin': 'one console delay bin, 24.4 µs', 'gdd.above': 'above the MUF',
      'gdd.x.off': 'offset from centre, kHz', 'gdd.y.rel': 'delay − centre, µs',
      'gdd.cap.pulse': 'A pulse through it: envelope, path against no dispersion',
      'gdd.aria.pulse': 'Envelope of a pulse occupying the band after the path, compared with the same pulse without dispersion.',
      'gdd.x.t': 'time from the centre delay, µs', 'gdd.p.ref': 'no dispersion', 'gdd.p.peak': 'path: peak {v} dB', 'gdd.p.w': 'width ×{v}',
      'gdd.model': 'The model. The lower 1F ray is τ(f) = 8.95 ms + b·MUF·(2(1 − √(1 − x)) − x), with x = f/MUF: the integral of the median law GDD = b·(1/√(1 − x) − 1), b = 7.5 µs/MHz, fitted to 583 Cyprus sweeps of February 2026. Real traces scatter about it by the interquartile range in Part 11’s table, and a single sweep’s measurement by about ±4 µs/MHz more. The law was measured with MUF 18–32 MHz; below that it is continued as ∝ 1/MUF. The same law follows independently from a parabolic profile through the secant law (see the vertical-sounding section): by day the two agree within 20 % from 0.8 to 0.96 MUF. The upper ray and 2F are drawn for orientation and enter no number; 2F starts at 9.40 ms and ends at 0.70 MUF, as mirror geometry gives for h′ = 250–300 km. The pulse is a Hann-shaped band of width B centred on the cursor, sent through the phase φ(f) = −2π∫(τ − τc) df that the trace implies. Fading, O/X splitting and absorption are left out. The console column is 41 kHz and its delay bin 24.4 µs (FFT 16 384, 100 kHz/s).',
    },
  });

  const state = { M: 26, fc: 22, B: 250, more: true };
  const BWMIN = 3, BWMAX = 1000;
  const bwFrom = v => BWMIN * Math.pow(BWMAX / BWMIN, v / 1000);
  const sliderOf = b => Math.round(1000 * Math.log(b / BWMIN) / Math.log(BWMAX / BWMIN));

  function drawIono(svg) {
    svg.replaceChildren();
    const S = state, F0 = 7.5;
    const P = PG.plot(svg, { x0: 64, x1: 744, y0: 18, y1: 262, xd: [7.5, 32.5], yd: [8850, 9650],
      xt: [7.5, 10, 15, 20, 25, 30], yt: [8900, 9100, 9300, 9500], xf: v => PG.num(v, v % 1 ? 1 : 0), yf: v => PG.num(v / 1000, 1),
      xl: PG.t('gdd.x.f'), yl: PG.t('gdd.y.d'), ylx: 18 });
    const { fx, fy, g } = P;
    const flo = S.fc - S.B / 2000, fhi = S.fc + S.B / 2000;
    PG.el(g, 'rect', { x: fx(flo), y: 18, width: Math.max(fx(fhi) - fx(flo), 2), height: 244, style: 'fill:var(--accent-soft)' });
    if (S.more) {
      const M2 = M_.r2F * S.M;
      if (M2 > F0) {
        const p2 = [];
        for (let f = F0; f < M2; f += 0.05) p2.push([fx(f), fy(M_.tauL(f, M2, M_.tau2F))]);
        p2.push([fx(M2), fy(M_.tauL(M2, M2, M_.tau2F))]);
        PG.el(g, 'path', { d: PG.path(p2), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, opacity: .45 });
        PG.text(g, fx(F0) + 6, fy(M_.tauL(F0, M2, M_.tau2F)) - 8, '2F', { opacity: .6 });
      }
      const pu = [], fu0 = Math.max(F0, 0.9 * S.M);
      for (let f = fu0; f <= S.M; f += 0.01) pu.push([fx(f), fy(M_.tauU(f, S.M))]);
      PG.el(g, 'path', { d: PG.path(pu), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.4, opacity: .5 });
      PG.text(g, fx(fu0) - 6, fy(M_.tauU(fu0, S.M)) + 4, PG.t('gdd.lbl.up'), { 'text-anchor': 'end', style: 'fill:var(--accent)', opacity: .75 });
    }
    const pl = [];
    for (let f = F0; f < S.M; f += 0.02) pl.push([fx(f), fy(M_.tauL(f, S.M))]);
    pl.push([fx(S.M), fy(M_.tauL(S.M, S.M))]);
    PG.el(g, 'path', { d: PG.path(pl), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6, 'stroke-linejoin': 'round' });
    PG.text(g, fx(F0) + 6, fy(M_.tauL(F0, S.M)) - 9, PG.t('gdd.lbl.1f'), { style: 'fill:var(--accent)' });
    PG.el(g, 'line', { x1: fx(S.M), y1: 18, x2: fx(S.M), y2: 262, stroke: 'currentColor', 'stroke-dasharray': '4 4', opacity: .5 });
    const right = fx(S.M) > 674;
    PG.text(g, fx(S.M) + (right ? -5 : 5), 254, PG.t('gdd.lbl.muf', { v: PG.num(S.M, 1) }), { 'text-anchor': right ? 'end' : 'start', opacity: .75 });
    const g0 = M_.gdd(S.fc, S.M), t0 = M_.tauL(S.fc, S.M), a = Math.max(F0, S.fc - 1.5), b = Math.min(S.M, S.fc + 1.5);
    PG.el(g, 'line', { x1: fx(a), y1: fy(t0 + g0 * (a - S.fc)), x2: fx(b), y2: fy(t0 + g0 * (b - S.fc)), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .85 });
    PG.el(g, 'circle', { cx: fx(S.fc), cy: fy(t0), r: 5, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 2 });
    const lr = fx(S.fc) > 514;
    PG.text(g, fx(S.fc) + (lr ? -9 : 9), 32, PG.t('gdd.lbl.band', { b: PG.fmtBW(S.B), f: PG.num(S.fc, 2) }), { 'text-anchor': lr ? 'end' : 'start', style: 'fill:var(--accent)' });
  }

  function drawZoom(svg) {
    svg.replaceChildren();
    const S = state, half = S.B / 2, t0 = M_.tauL(S.fc, S.M), g0 = M_.gdd(S.fc, S.M), pts = [];
    for (let i = 0; i <= 200; i++) {
      const d = -half + i * S.B / 200, f = S.fc + d / 1000;
      if (f <= S.M) pts.push([d, M_.tauL(f, S.M) - t0]);
    }
    const ymax = Math.max(15, 1.25 * Math.max(...pts.map(p => Math.abs(p[1]))), 1.25 * Math.abs(g0 * half / 1000));
    const step = ymax > 60 ? 20 : ymax > 30 ? 10 : 5, yt = [];
    for (let v = -Math.floor(ymax / step) * step; v <= ymax; v += step) yt.push(v);
    const kf = v => (v < 0 ? '−' : v > 0 ? '+' : '') + (Math.abs(v) < 10 ? PG.num(Math.abs(v), 1) : PG.num(Math.abs(v), 0));
    const P = PG.plot(svg, { x0: 54, x1: 344, y0: 14, y1: 212, xd: [-half, half], yd: [-ymax, ymax], xt: [-half, 0, half], yt,
      xf: kf, xl: PG.t('gdd.x.off'), yl: PG.t('gdd.y.rel'), ylx: 12 });
    const { fx, fy, g } = P, yb = Math.min(M_.BIN_US / 2, ymax);
    PG.el(g, 'rect', { x: 54, y: fy(yb), width: 290, height: fy(-yb) - fy(yb), style: 'fill:var(--warn-soft)' });
    PG.text(g, 60, fy(yb) + 13, PG.t('gdd.bin'), { style: 'fill:var(--warn)' });
    PG.el(g, 'line', { x1: fx(-half), y1: fy(-g0 * half / 1000), x2: fx(half), y2: fy(g0 * half / 1000), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .85 });
    if (pts.length > 1) PG.el(g, 'path', { d: PG.path(pts.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6 });
    const mo = (S.M - S.fc) * 1000;
    if (mo < half) {
      PG.el(g, 'rect', { x: fx(mo), y: 14, width: 344 - fx(mo), height: 198, fill: 'currentColor', opacity: .07 });
      PG.text(g, 339, 28, PG.t('gdd.above'), { 'text-anchor': 'end', opacity: .75 });
    }
  }

  function drawPulse(svg) {
    const S = state;
    PG.drawPulse(svg, PG.pulse(f => M_.tauL(f, S.M), S.fc, S.B, S.M));
  }

  PG.register({
    id: 'gdd',
    mount(root) {
      const iono = PG.svg(760, 312, PG.t('gdd.aria.iono'));
      const zoom = PG.svg(360, 260, PG.t('gdd.aria.zoom'));
      const pul = PG.svg(360, 260, PG.t('gdd.aria.pulse'));
      const cards = PG.cards([
        { key: 'x', label: PG.t('gdd.k.x') }, { key: 'g', label: PG.t('gdd.k.g'), sub: PG.t('gdd.k.gs') },
        { key: 's', label: PG.t('gdd.k.s') }, { key: 'b', label: PG.t('gdd.k.b'), sub: PG.t('gdd.k.bs') },
        { key: 'c', label: PG.t('gdd.k.c') }]);
      const note = PG.note();

      const update = () => {
        const S = state;
        const fmax = Math.floor(0.995 * S.M * 100) / 100;
        fc.input.max = fmax;
        if (S.fc > fmax) { S.fc = fmax; fc.set(fmax); }
        const g0 = M_.gdd(S.fc, S.M), half = S.B / 2000, cut = S.fc + half > S.M;
        const spread = M_.tauL(Math.min(S.fc + half, S.M), S.M) - M_.tauL(S.fc - half, S.M), Pn = g0 * (S.B / 1000) ** 2;
        const x = S.fc / S.M;
        cards.set('x', PG.num(x, 3), PG.t(x > 0.95 ? 'gdd.x.nose' : x < 0.65 ? 'gdd.x.low' : 'gdd.x.work'));
        cards.set('g', PG.num(g0, 1) + ' ' + PG.U('usMHz'));
        cards.set('s', PG.fmtUs(spread), PG.t('gdd.k.ss', { v: PG.fmtUs(1000 / S.B) }));
        cards.set('b', PG.fmtBW(M_.bmax(g0)));
        cards.set('c', PG.num(spread / M_.BIN_US, spread / M_.BIN_US < 0.1 ? 3 : 2) + ' ' + PG.U('bin'), PG.t('gdd.k.cs', { v: PG.num(g0 * M_.COL_MHZ, 2) }));
        const kind = PG.dispKind(Pn), sc = M_.scale(S.M);
        note.set(kind === 'bad' || cut ? 'caution' : '', PG.t('gdd.v.' + kind),
          [PG.t('gdd.v.' + kind + 'T'), PG.t('gdd.v.num', { v: PG.num(Pn, Pn < 0.01 ? 4 : 2) }), cut ? PG.t('gdd.v.cut') : '', spread < M_.BIN_US ? PG.t('gdd.v.bin') : ''].filter(Boolean).join(' '),
          sc > 1 ? PG.t('gdd.v.ext', { v: PG.num(sc, 2) }) : null, x > 0.96 ? PG.t('gdd.v.nose') : null);
        drawIono(iono); drawZoom(zoom); drawPulse(pul);
      };

      const muf = PG.slider({ label: PG.t('gdd.muf'), min: 12, max: 32.5, step: 0.1, value: state.M, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.M = v; update(); } });
      const fc = PG.slider({ label: PG.t('gdd.fc'), min: 7.5, max: 32.3, step: 0.01, value: state.fc, fmt: v => PG.num(v, 2) + ' ' + PG.U('MHz'), onInput: v => { state.fc = v; update(); } });
      const presets = PG.h('div', { class: 'seg' },
        [3, 48, 250, 1000].map(b => PG.h('button', { type: 'button', onclick: () => { state.B = b; bw.set(sliderOf(b)); bw.refresh(); update(); } }, PG.fmtBW(b))),
        PG.h('button', { type: 'button', onclick: () => { state.fc = +(0.85 * state.M).toFixed(2); fc.set(state.fc); update(); } }, PG.t('gdd.ow')));
      const bw = PG.slider({ label: PG.t('gdd.bw'), min: 0, max: 1000, step: 1, value: sliderOf(state.B), fmt: () => PG.fmtBW(state.B), onInput: v => { state.B = bwFrom(v); bw.refresh(); update(); }, extra: presets });
      const more = PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.more, onchange: e => { state.more = e.target.checked; update(); } }), PG.t('gdd.more'));

      root.append(
        PG.h('div', { class: 'panel' }, PG.h('div', { class: 'ctl' }, muf.root, fc.root, bw.root), PG.h('div', { class: 'row' }, more)),
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.iono')), iono),
        cards.root, note.root,
        PG.h('div', { class: 'two' },
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.zoom')), zoom),
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.pulse')), pul)),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px;margin-top:18px' }, PG.t('gdd.model')));
      update();
    },
  });
})();
