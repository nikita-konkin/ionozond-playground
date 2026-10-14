/* Vertical sounding: h'(f) from an E + F2 profile, its dispersion, and the same ionosphere over the oblique path. */
(function () {
  'use strict';
  const V = PG.vi;

  PG.i18n({
    ru: {
      'vi.nav': 'Вертикальное зондирование', 'vi.part': 'Дополнение · Вертикальное зондирование',
      'vi.title': 'Вертикальное зондирование: та же дисперсия, только сильнее',
      'vi.short': 'Ионограмма h′(f) по профилю слоёв E и F2, GDD и B_max вблизи критических частот и та же ионосфера, пересчитанная на трассу Кипр — Йошкар-Ола по закону секанса.',
      'vi.lede': 'Вертикальный ионозонд излучает вверх, и волна отражается там, где плазменная частота равна частоте зондирования; у критической частоты слоя задержка неограниченно растёт. Здесь ионограмма рассчитывается по профилю из двух параболических слоёв, E и F2: действующая высота h′(f) — интеграл группового показателя преломления до точки отражения, а задержка равна 2h′/c. Параметры ионозонда — как у станции yoshkar-ola в res/ini/schedule.ini: 50 кГц/с, гетеродин 13,5 МГц, 260 с, диапазон 1–14 МГц.',
      'vi.pre': 'Ионосфера', 'vi.pre.day': 'День', 'vi.pre.dusk': 'Сумерки', 'vi.pre.night': 'Ночь', 'vi.foF2': 'foF2', 'vi.hmF2': 'hmF2',
      'vi.ymF2': 'Полутолщина F2', 'vi.foE': 'foE', 'vi.none': 'слоя нет', 'vi.fc': 'Средняя частота сигнала', 'vi.bw': 'Полоса сигнала',
      'vi.rate': 'Скорость перестройки', 'vi.rate.50': '50 кГц/с, как в schedule.ini', 'vi.rate.100': '100 кГц/с',
      'vi.xm': 'Показать след необыкновенной волны (приближённо, f_H = 1,4 МГц)',
      'vi.cap.iono': 'Ионограмма вертикального зондирования. Сплошная линия — след обыкновенной волны h′(f), штриховая — истинная высота, где f_N = f. Заливка — полоса сигнала, касательная — GDD. 150 км действующей высоты соответствуют 1 мс задержки.',
      'vi.aria.iono': 'Модельная ионограмма вертикального зондирования: зависимость действующей высоты от частоты для слоёв E и F2, профиль плазменной частоты, полоса сигнала и касательная.',
      'vi.x.f': 'частота, МГц', 'vi.y.h': 'высота, км', 'vi.lbl.prof': 'f_N(h)', 'vi.lbl.foE': 'foE {v}', 'vi.lbl.foF2': 'foF2 {v}',
      'vi.lbl.band': '{b} на {f} МГц', 'vi.k.h': 'h′ в этой точке', 'vi.k.tau': 'Задержка 2h′/c', 'vi.k.g': 'GDD в этой точке',
      'vi.k.gs': 'наклон следа', 'vi.k.b': 'B<sub>max</sub> в этой точке', 'vi.k.bs': '1/√|GDD|', 'vi.k.s': 'Разброс в полосе',
      'vi.k.ss': 'при 1/B = {v}', 'vi.k.c': 'Заметно на экране', 'vi.k.cs': 'отсчёт {b} мкс = {h} км высоты, столбец {w} кГц',
      'vi.cap.gdd': '|GDD| в зависимости от частоты; справа — B_max при той же дисперсии. Пунктир — участки, где задержка с ростом частоты убывает (GDD < 0).',
      'vi.aria.gdd': 'Модуль дисперсии групповой задержки в зависимости от частоты, логарифмическая шкала, со шкалой наибольшей неискажённой полосы.',
      'vi.y.g': '|GDD|, мкс/МГц', 'vi.y.b': 'B_max', 'vi.cap.zoom': 'В пределах полосы: задержка относительно центральной',
      'vi.bin': 'один отсчёт задержки, {v} мкс', 'vi.above': 'выше foF2',
      'vi.cap.pulse': 'Импульс после отражения от ионосферы: огибающая с дисперсией и без неё', 'vi.p.peak': 'после отражения: пик {v} дБ',
      'vi.aria.zoom': 'Задержка в пределах полосы сигнала относительно центральной в сравнении с одним отсчётом задержки.',
      'vi.aria.pulse': 'Огибающая импульса после отражения от ионосферы в сравнении с тем же импульсом без дисперсии.',
      'vi.v.neg': 'Здесь задержка убывает с ростом частоты: это участок сразу за foE, где след после резкого подъёма идёт вниз. GDD отрицательна, но искажения определяются её модулем.',
      'vi.v.through': 'Часть полосы лежит выше foF2 и уходит сквозь слой.',
      'vi.v.vis': 'Наклон виден на экране непосредственно: за один столбец ({w} кГц) задержка меняется на {d} мкс, то есть на {n} отсчёта.',
      'vi.v.pen': 'Средняя частота сигнала выше foF2: волна уходит сквозь слой, отражения нет.',
      'vi.h2.obl': 'Та же ионосфера на наклонной трассе',
      'vi.obl.p': 'Закон секанса переводит вертикальную ионограмму в наклонную: волна частоты f, падающая на слой под углом φ, отражается на той же высоте, что и вертикальная волна частоты f·cos φ, а её групповой путь равен пути по прямым до зеркала на высоте h′ (теоремы Брейта — Тьюва и Мартина). Здесь это пересчитано для трассы длиной 2634 км с учётом кривизны Земли. Получается независимая проверка медианного закона части 11: тот выведен из записей, а не из профиля.',
      'vi.cap.obl': 'Ионограмма наклонного зондирования по этому профилю, 2634 км: нижний и верхний лучи 1F смыкаются в точке МНЧ. Штриховая линия — модельная ДЧХ из разделов о наклонном зондировании при той же МНЧ.',
      'vi.aria.obl': 'Ионограмма наклонного зондирования, рассчитанная по вертикальному профилю через закон секанса, и модельная ДЧХ для сравнения.',
      'vi.cap.cmp': 'GDD нижнего луча в зависимости от f/МНЧ: расчёт по профилю (сплошная), медианный закон (штриховая), измеренные медианы с межквартильным размахом.',
      'vi.aria.cmp': 'Дисперсия нижнего луча в зависимости от f/МНЧ: расчёт по профилю, медианный закон и измеренные медианы.',
      'vi.y.tau': 'задержка, мс', 'vi.x.x': 'f / МНЧ', 'vi.y.gl': 'GDD, мкс/МГц', 'vi.l.low': 'нижний луч', 'vi.l.up': 'верхний луч',
      'vi.l.model': 'модельная ДЧХ', 'vi.l.phys': 'по профилю', 'vi.l.law': 'закон части 11', 'vi.l.med': 'измерено: медиана и квартили',
      'vi.k.muf': 'МНЧ 1F по профилю', 'vi.k.mf': 'M = МНЧ / foF2', 'vi.k.g85': 'GDD при 0,85 МНЧ', 'vi.k.g85s': 'по закону: {v}',
      'vi.k.d': 'Задержка 1F при 0,6 МНЧ', 'vi.k.ds': 'на ионограммах: 9,0–9,2 мс',
      'vi.obl.none': 'При таком профиле ни один луч 1F не приходит в Йошкар-Олу над горизонтом.',
      'vi.cmp.note': 'Что из этого следует. Дневной слой F2 со слабым слоем E (foE 1,5 МГц) ложится на измеренные медианы от 0,6 до 0,96 МНЧ с точностью 2–3 мкс/МГц: 3,0 / 5,8 / 9,8 / 13,2 / 19,3 / 35,8 против измеренных 2,9 / 6,3 / 9,2 / 13,5 / 17,2 / 32,7. Значит, медианный закон, выведенный из записей, — это обычная физика слоя F2, а не артефакт обработки. При foE 2,8 МГц модель загибает нижнюю часть ДЧХ сильнее, чем показывают измерения: в ней нет долины между слоями E и F, и слой E задерживает отражённую от F волну сильнее, чем настоящий.',
      'vi.model': 'Модель. Слои E и F2 — параболы: foE на высоте 110 км с полутолщиной 20 км и foF2 на высоте hmF2. Долины между слоями нет: выше максимума E плазменная частота остаётся равной foE. Магнитное поле и соударения не учитываются, так что сплошной след относится к обыкновенной волне. След необыкновенной волны построен приближённо: она отражается там, где f_N² = f(f − f_H), а её h′ взята равной h′ обыкновенной волны на частоте √(f(f − f_H)). Действующая высота h′(f) интегрируется точно по кусочно-линейному профилю с шагом 0,25 км; для одиночного параболического слоя результат совпадает с формулой h′ = h₀ + (y_m/2)·x·ln((1 + x)/(1 − x)) с точностью 0,02 км вплоть до 0,99 foF2. Наклонная проекция строится по закону секанса и теоремам Брейта — Тьюва и Мартина с зеркалом на высоте h′ над сферической Землёй, без поправки на кривизну самого слоя; лучи ниже горизонта отброшены. Отсчёт задержки на экране соответствует БПФ на 16 384 точки при ПЧ 40 кГц.',
    },
    en: {
      'vi.nav': 'Vertical sounding',
      'vi.part': 'Variant · Vertical sounding',
      'vi.title': 'Vertical sounding: the same dispersion, only stronger',
      'vi.short': 'An h′(f) ionogram from an E and F2 profile, GDD and B_max near the critical frequencies, and the same ionosphere carried over to the Cyprus path by the secant law.',
      'vi.lede': 'A vertical sounder looks straight up, so its wave reflects where the plasma frequency equals the sounding frequency, and at a layer’s critical frequency the delay runs off to infinity. Here the ionogram is computed from a profile of two parabolic layers, E and F2: the virtual height h′(f) is the integral of the group refractive index up to the reflection point, and the delay is 2h′/c. The sounder is set up like the yoshkar-ola station in res/ini/schedule.ini: 50 kHz/s, LO 13.5 MHz, 260 s, a 1–14 MHz band.',
      'vi.pre': 'Ionosphere', 'vi.pre.day': 'Day', 'vi.pre.dusk': 'Dusk', 'vi.pre.night': 'Night',
      'vi.foF2': 'foF2', 'vi.hmF2': 'hmF2', 'vi.ymF2': 'F2 half-thickness', 'vi.foE': 'foE', 'vi.none': 'no layer',
      'vi.fc': 'Signal centre', 'vi.bw': 'Signal bandwidth', 'vi.rate': 'Sweep rate', 'vi.rate.50': '50 kHz/s, as in schedule.ini', 'vi.rate.100': '100 kHz/s',
      'vi.xm': 'Show the X trace (rough, f_H = 1.4 MHz)',
      'vi.cap.iono': 'The vertical ionogram. Solid: the O trace, h′(f). Dashed: the true height where f_N = f. Shaded: the signal’s band; the tangent’s slope is the GDD. 150 km of virtual height is 1 ms of delay.',
      'vi.aria.iono': 'Model vertical ionogram: virtual height against frequency for the E and F2 layers, the plasma-frequency profile, the signal band and the tangent.',
      'vi.x.f': 'frequency, MHz', 'vi.y.h': 'height, km',
      'vi.lbl.prof': 'f_N(h)', 'vi.lbl.foE': 'foE {v}', 'vi.lbl.foF2': 'foF2 {v}', 'vi.lbl.band': '{b} at {f} MHz',
      'vi.k.h': 'h′ here', 'vi.k.tau': 'Delay 2h′/c', 'vi.k.g': 'GDD here', 'vi.k.gs': 'slope of the trace', 'vi.k.b': 'B<sub>max</sub> here', 'vi.k.bs': '1 / √|GDD|',
      'vi.k.s': 'Spread over the band', 'vi.k.ss': 'against 1/B = {v}', 'vi.k.c': 'Console sees', 'vi.k.cs': 'bin {b} µs = {h} km of height, column {w} kHz',
      'vi.cap.gdd': '|GDD| against frequency, with B_max for the same dispersion on the right. Dotted: stretches where the delay falls with frequency (GDD < 0).',
      'vi.aria.gdd': 'Magnitude of the group-delay dispersion against frequency, logarithmic, with a largest-undistorted-bandwidth axis.',
      'vi.y.g': '|GDD|, µs/MHz', 'vi.y.b': 'B_max',
      'vi.cap.zoom': 'Inside the band: delay against offset from the centre', 'vi.bin': 'one console bin, {v} µs', 'vi.above': 'above foF2',
      'vi.cap.pulse': 'A pulse through the ionosphere: envelope with and without dispersion', 'vi.p.peak': 'reflected: peak {v} dB',
      'vi.aria.zoom': 'Delay across the signal band relative to the centre, against one console bin.',
      'vi.aria.pulse': 'Envelope of a pulse after the ionosphere, compared with the same pulse without dispersion.',
      'vi.v.neg': 'Here the delay falls with frequency: this is the descent after the foE cusp. GDD is negative, but distortion depends on its size.',
      'vi.v.through': 'Part of the band is above foF2 and goes straight through the layer.',
      'vi.v.vis': 'The console sees the slope directly: across one column ({w} kHz) the delay changes by {d} µs, which is {n} bins.',
      'vi.v.pen': 'The signal centre is above foF2: the wave goes through the layer and nothing returns.',
      'vi.h2.obl': 'The same ionosphere over the oblique path',
      'vi.obl.p': 'The secant law turns a vertical ionogram into an oblique one. A wave of frequency f meeting the layer at incidence φ reflects where a vertical wave of frequency f·cos φ does, and its group path equals the straight-line path to a mirror at height h′ (the Breit–Tuve and Martyn theorems). Here that is computed for 2634 km on a curved Earth. It gives an independent check on Part 11’s median law, which was derived from recordings, not from a profile.',
      'vi.cap.obl': 'The oblique ionogram this profile gives over 2634 km: the lower and upper 1F rays meet at the nose. Dashed: the model trace of the oblique pages at the same MUF.',
      'vi.aria.obl': 'Oblique ionogram computed from the vertical profile by the secant law, with the model trace for comparison.',
      'vi.cap.cmp': 'Lower-ray GDD against f/MUF: from the profile (solid), the median law (dashed), and the measured medians with their interquartile range.',
      'vi.aria.cmp': 'Lower-ray dispersion against f/MUF: computed from the profile, the median law, and the measured medians.',
      'vi.y.tau': 'delay, ms', 'vi.x.x': 'f / MUF', 'vi.y.gl': 'GDD, µs/MHz',
      'vi.l.low': 'lower ray', 'vi.l.up': 'upper ray', 'vi.l.model': 'model trace', 'vi.l.phys': 'from the profile', 'vi.l.law': 'Part 11 law', 'vi.l.med': 'measured: median and IQR',
      'vi.k.muf': '1F MUF from the profile', 'vi.k.mf': 'M = MUF / foF2', 'vi.k.g85': 'GDD at 0.85 MUF', 'vi.k.g85s': 'law: {v}', 'vi.k.d': '1F delay at 0.6 MUF', 'vi.k.ds': 'on the ionograms: 9.0–9.2 ms',
      'vi.obl.none': 'With this profile no 1F ray reaches Yoshkar-Ola above the horizon.',
      'vi.cmp.note': 'What follows from it. With a daytime F2 and a weak E layer (foE 1.5 MHz) the profile lands on the measured medians from 0.6 to 0.96 MUF to within 2–3 µs/MHz: 3.0 / 5.8 / 9.8 / 13.2 / 19.3 / 35.8 against 2.9 / 6.3 / 9.2 / 13.5 / 17.2 / 32.7. The median law derived from the recordings is ordinary F2-layer physics, not an artefact of the processing. With foE 2.8 MHz the model bends the low part of the trace more than measured: it has no valley between E and F, so its E layer delays the F echo more than the real one does.',
      'vi.model': 'The model. E and F2 are parabolic layers: foE at 110 km with a 20 km half-thickness, and foF2 at hmF2. There is no valley between them; above the E peak the profile stays at foE. The magnetic field and collisions are left out, so the solid trace is the ordinary wave. The X trace is rough: the X wave reflects where f_N² = f(f − f_H), and its h′ is read off the O trace at that frequency. h′(f) is integrated exactly over a piecewise-linear profile in 0.25 km steps; for a single parabolic layer that matches h′ = h₀ + (y_m/2)·x·ln((1 + x)/(1 − x)) to 0.02 km up to 0.99 foF2. The oblique projection is the secant law and the Breit–Tuve and Martyn theorems with a mirror at h′ over a spherical Earth, without correcting for the layer’s own curvature; rays below the horizon are dropped. The console bin is for FFT 16 384 at the 40 kHz IF.',
    },
  });

  const FIF = 40e3, NFFT = 16384, F0 = 1, F1 = 14, FH = 1.4;
  const MEDIANS = [[0.61, 2.9, -0.7, 5.7], [0.71, 6.3, 3.2, 9.6], [0.81, 9.2, 5.0, 14.5], [0.86, 13.5, 8.6, 20.1], [0.91, 17.2, 10.2, 27.4], [0.96, 32.7, 16.4, 51.2], [0.99, 36.5, 15.3, 57.4]];
  const state = Object.assign({ pre: 'day', fc: 8, B: 50, k: 50e3, xm: false }, V.PRESETS.day);
  const BWMIN = 3, BWMAX = 1000;
  const bwFrom = v => BWMIN * Math.pow(BWMAX / BWMIN, v / 1000);
  const sliderOf = b => Math.round(1000 * Math.log(b / BWMIN) / Math.log(BWMAX / BWMIN));
  const prof = () => V.profile(state);
  const tauUs = P => f => 1000 * V.tau(f, P);
  const console_ = () => { const bin = FIF / NFFT / state.k * 1e6; return { bin, hkm: bin * V.C / 2000, col: state.k * NFFT / FIF / 1000 }; };

  function drawIono(svg, P) {
    svg.replaceChildren();
    const S = state;
    const Pl = PG.plot(svg, { x0: 56, x1: 744, y0: 14, y1: 290, xd: [F0, F1], yd: [0, 800], xt: [1, 2, 4, 6, 8, 10, 12, 14], yt: [0, 100, 200, 300, 400, 500, 600, 700, 800],
      xl: PG.t('vi.x.f'), yl: PG.t('vi.y.h'), ylx: 12 });
    const { fx, fy, g } = Pl;
    const flo = S.fc - S.B / 2000, fhi = S.fc + S.B / 2000;
    PG.el(g, 'rect', { x: fx(flo), y: 14, width: Math.max(fx(fhi) - fx(flo), 2), height: 276, style: 'fill:var(--accent-soft)' });
    // true height of reflection: the profile itself, f_N(h)
    const pp = [];
    for (let i = 0; i < P.h.length; i += 4) pp.push([fx(Math.sqrt(P.f2[i])), fy(P.h[i])]);
    PG.el(g, 'path', { d: PG.path(pp.filter(p => isFinite(p[0]))), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '4 4', opacity: .55 });
    const trace = (fn, style, w, dash) => {
      let seg = [];
      const out = () => { if (seg.length > 1) PG.el(g, 'path', { d: PG.path(seg), fill: 'none', style, 'stroke-width': w, 'stroke-dasharray': dash || null, 'stroke-linejoin': 'round' }); seg = []; };
      for (let f = F0; f <= F1; f += 0.005) { const h = fn(f); if (!isFinite(h) || h > 900) { out(); continue; } seg.push([fx(f), fy(h)]); }
      out();
    };
    if (S.xm) trace(f => V.hvX(f, P, FH), 'stroke:var(--accent)', 1.6, '6 3');
    trace(f => V.hv(f, P), 'stroke:var(--accent)', 2.6);
    const mark = (f, key) => {
      PG.el(g, 'line', { x1: fx(f), x2: fx(f), y1: 14, y2: 290, stroke: 'currentColor', 'stroke-dasharray': '2 4', opacity: .45 });
      PG.text(g, fx(f) + 4, 284, PG.t(key, { v: PG.num(f, 1) }), { opacity: .75 });
    };
    if (S.foE > 0.3) mark(S.foE, 'vi.lbl.foE');
    mark(P.fmax, 'vi.lbl.foF2');
    const hc = V.hv(S.fc, P);
    if (isFinite(hc)) {
      const g0 = V.gdd(S.fc, P, 0.005) * V.C / 2000;        // km of h' per MHz
      const a = Math.max(F0, S.fc - 0.6), b = Math.min(F1, S.fc + 0.6);
      PG.el(g, 'line', { x1: fx(a), y1: fy(hc + g0 * (a - S.fc)), x2: fx(b), y2: fy(hc + g0 * (b - S.fc)), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .85 });
      PG.el(g, 'circle', { cx: fx(S.fc), cy: fy(hc), r: 5, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 2 });
    }
    const lr = fx(S.fc) > 500;
    PG.text(g, fx(S.fc) + (lr ? -9 : 9), 30, PG.t('vi.lbl.band', { b: PG.fmtBW(S.B), f: PG.num(S.fc, 2) }), { 'text-anchor': lr ? 'end' : 'start', style: 'fill:var(--accent)' });
    PG.text(g, fx(Math.sqrt(P.f2[Math.floor(P.h.length * 0.55)])) + 6, fy(P.h[Math.floor(P.h.length * 0.55)]) + 14, PG.t('vi.lbl.prof'), { opacity: .6 });
  }

  function drawGdd(svg, P) {
    svg.replaceChildren();
    const L = Math.log10, Y0 = 0, Y1 = 5;
    const Pl = PG.plot(svg, { x0: 56, x1: 700, y0: 26, y1: 226, xd: [F0, F1], yd: [Y0, Y1], xt: [1, 2, 4, 6, 8, 10, 12, 14], yt: [0, 1, 2, 3, 4, 5],
      yf: v => PG.num(Math.pow(10, v), 0), xl: PG.t('vi.x.f'), yl: PG.t('vi.y.g'), ylx: 12 });
    const { fx, fy, g } = Pl;
    [0, 1, 2, 3, 4, 5].forEach(v => PG.text(svg, 706, fy(v) + 4, PG.fmtBW(1000 / Math.sqrt(Math.pow(10, v))), { opacity: .62 }));
    PG.text(svg, 746, 12, PG.t('vi.y.b'), { 'text-anchor': 'end', opacity: .78 });
    let seg = [], neg = null;
    const out = () => { if (seg.length > 1) PG.el(g, 'path', { d: PG.path(seg), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.8, 'stroke-dasharray': neg ? '2 3' : null }); seg = []; };
    for (let f = F0 + 0.02; f <= F1; f += 0.01) {
      const gg = V.gdd(f, P, 0.02);
      if (!isFinite(gg)) { out(); continue; }
      const n = gg < 0;
      if (neg !== null && n !== neg) { const last = seg[seg.length - 1]; out(); if (last) seg.push(last); }
      neg = n;
      seg.push([fx(f), fy(PG.clamp(L(Math.max(Math.abs(gg), 1e-3)), Y0, Y1))]);
    }
    out();
    const gc = V.gdd(state.fc, P, 0.005);
    if (isFinite(gc)) PG.el(g, 'circle', { cx: fx(state.fc), cy: fy(PG.clamp(L(Math.max(Math.abs(gc), 1e-3)), Y0, Y1)), r: 5, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 2 });
  }

  function drawZoom(svg, P, bin) {
    svg.replaceChildren();
    const S = state, half = S.B / 2, tc = 1000 * V.tau(S.fc, P), pts = [];
    if (!isFinite(tc)) return;
    for (let i = 0; i <= 200; i++) { const d = -half + i * S.B / 200, v = 1000 * V.tau(S.fc + d / 1000, P); if (isFinite(v)) pts.push([d, v - tc]); }
    const ymax = Math.max(1.25 * bin / 2, 1.25 * Math.max(...pts.map(p => Math.abs(p[1]))));
    const yt = PG.ticks(-ymax, ymax, 4);
    const kf = v => (v < 0 ? '−' : v > 0 ? '+' : '') + (Math.abs(v) < 10 ? PG.num(Math.abs(v), 1) : PG.num(Math.abs(v), 0));
    const Pl = PG.plot(svg, { x0: 54, x1: 344, y0: 14, y1: 212, xd: [-half, half], yd: [-ymax, ymax], xt: [-half, 0, half], yt, xf: kf, yf: kf, xl: PG.t('gdd.x.off'), yl: PG.t('gdd.y.rel'), ylx: 12 });
    const { fx, fy, g } = Pl, yb = Math.min(bin / 2, ymax);
    PG.el(g, 'rect', { x: 54, y: fy(yb), width: 290, height: fy(-yb) - fy(yb), style: 'fill:var(--warn-soft)' });
    PG.text(g, 60, fy(yb) + 13, PG.t('vi.bin', { v: PG.num(bin, 1) }), { style: 'fill:var(--warn)' });
    if (pts.length > 1) PG.el(g, 'path', { d: PG.path(pts.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6 });
    const mo = (P.fmax - S.fc) * 1000;
    if (mo < half) {
      PG.el(g, 'rect', { x: fx(mo), y: 14, width: 344 - fx(mo), height: 198, fill: 'currentColor', opacity: .07 });
      PG.text(g, 339, 28, PG.t('vi.above'), { 'text-anchor': 'end', opacity: .75 });
    }
  }

  function drawPulse(svg, P) {
    svg.replaceChildren();
    const S = state;
    if (!isFinite(V.hv(S.fc, P))) return;
    PG.drawPulse(svg, PG.pulse(tauUs(P), S.fc, S.B, P.fmax), { peakKey: 'vi.p.peak' });
  }

  // Oblique image: the main lower-ray branch below the nose, and the upper ray above it. Near the nose
  // the computed frequency is flat to 1e-4 MHz with jitter from the profile grid, so the walk down the
  // lower ray skips small reversals and stops only at a real fold (the E-layer retardation, if any).
  function obliqueRays(P) {
    const O = V.oblique(P);
    if (O.k < 0) return null;
    const low = [[O.f[O.k], O.tau[O.k]]], up = [];
    let cur = O.f[O.k];
    for (let i = O.k - 1; i >= 0; i--) {
      if (O.f[i] < cur) { low.unshift([O.f[i], O.tau[i]]); cur = O.f[i]; }
      else if (O.f[i] > cur + 0.3) break;
    }
    for (let i = O.k; i < O.f.length; i++) up.push([O.f[i], O.tau[i]]);
    // GDD on a uniform f/MUF grid: interpolate τ(f) along the branch, then central differences.
    const tauAt = f => { for (let i = 1; i < low.length; i++) if (low[i][0] >= f) { const [f0, t0] = low[i - 1], [f1, t1] = low[i]; return t0 + (t1 - t0) * (f - f0) / (f1 - f0); } return NaN; };
    const gl = [], h = 0.005 * O.muf;
    for (let x = 0.4; x <= 0.995 + 1e-9; x += 0.005) {
      const f = x * O.muf, a = tauAt(f - h), b = tauAt(Math.min(f + h, O.muf)), c = tauAt(f);
      if (f - h >= low[0][0] && isFinite(a) && isFinite(b)) gl.push([x, 1000 * (b - a) / (Math.min(f + h, O.muf) - (f - h)), c]);
    }
    return { muf: O.muf, low, up, gl };
  }
  const glAt = (R, x) => { let best = null; R.gl.forEach(p => { if (!best || Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; }); return best && Math.abs(best[0] - x) < 0.02 ? best : null; };

  function drawObl(svg, R) {
    svg.replaceChildren();
    if (!R) { PG.text(svg, 380, 130, PG.t('vi.obl.none'), { 'text-anchor': 'middle', style: 'fill:var(--warn)', 'font-size': 13 }); return; }
    const all = R.low.concat(R.up).filter(p => p[1] < 10.5);
    const fmin = Math.floor(Math.min(...all.map(p => p[0]))), fmax = Math.ceil(R.muf + 1);
    const tmin = Math.min(...all.map(p => p[1])), tmax = Math.max(...all.map(p => p[1]));
    const pad = 0.08 * (tmax - tmin + 0.05);
    const Pl = PG.plot(svg, { x0: 64, x1: 744, y0: 14, y1: 230, xd: [fmin, fmax], yd: [tmin - pad, tmax + pad], xl: PG.t('vi.x.f'), yl: PG.t('vi.y.tau'), ylx: 14,
      yf: v => PG.num(v, 2), nx: 8 });
    const { fx, fy, g } = Pl;
    const fl = [];
    for (let f = Math.max(fmin, 0.45 * R.muf); f <= R.muf; f += 0.02) fl.push([fx(f), fy(PG.model.tauL(f, R.muf) / 1000)]);
    PG.el(g, 'path', { d: PG.path(fl), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: .7 });
    PG.el(g, 'path', { d: PG.path(R.up.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.5, opacity: .5 });
    PG.el(g, 'path', { d: PG.path(R.low.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6 });
  }

  function drawCmp(svg, R) {
    svg.replaceChildren();
    const Pl = PG.plot(svg, { x0: 52, x1: 744, y0: 14, y1: 214, xd: [0.5, 1], yd: [-10, 80], xt: [0.5, 0.6, 0.7, 0.8, 0.9, 1], yt: [0, 20, 40, 60, 80],
      xf: v => PG.num(v, 1), xl: PG.t('vi.x.x'), yl: PG.t('vi.y.gl'), ylx: 12 });
    const { fx, fy, g } = Pl;
    PG.el(g, 'line', { x1: fx(0.5), x2: fx(1), y1: fy(0), y2: fy(0), stroke: 'currentColor', opacity: .3 });
    const law = [];
    for (let x = 0.5; x <= 0.995; x += 0.005) law.push([fx(x), fy(Math.min(PG.model.b * (1 / Math.sqrt(1 - x) - 1), 85))]);
    PG.el(g, 'path', { d: PG.path(law), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: .75 });
    MEDIANS.forEach(([x, m, lo, hi]) => {
      PG.el(g, 'line', { x1: fx(x), x2: fx(x), y1: fy(lo), y2: fy(hi), stroke: 'currentColor', 'stroke-width': 1.2, opacity: .55 });
      PG.el(g, 'circle', { cx: fx(x), cy: fy(m), r: 3.5, style: 'fill:var(--surface);stroke:var(--ink)', 'stroke-width': 1.4 });
    });
    if (R && R.gl.length > 1) {
      const pts = R.gl.filter(p => p[0] >= 0.5).map(p => [fx(p[0]), fy(PG.clamp(p[1], -12, 85))]);
      PG.el(g, 'path', { d: PG.path(pts), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.4 });
    }
  }

  PG.register({
    id: 'vi',
    mount(root) {
      const si = PG.svg(760, 330, PG.t('vi.aria.iono')), sgd = PG.svg(760, 266, PG.t('vi.aria.gdd'));
      const sz = PG.svg(360, 260, PG.t('vi.aria.zoom')), sp = PG.svg(360, 260, PG.t('vi.aria.pulse'));
      const so = PG.svg(760, 270, PG.t('vi.aria.obl')), sc = PG.svg(760, 254, PG.t('vi.aria.cmp'));
      const cards = PG.cards([{ key: 'h', label: PG.t('vi.k.h') }, { key: 't', label: PG.t('vi.k.tau') }, { key: 'g', label: PG.t('vi.k.g'), sub: PG.t('vi.k.gs') },
        { key: 'b', label: PG.t('vi.k.b'), sub: PG.t('vi.k.bs') }, { key: 's', label: PG.t('vi.k.s') }, { key: 'c', label: PG.t('vi.k.c') }]);
      const oc = PG.cards([{ key: 'm', label: PG.t('vi.k.muf') }, { key: 'f', label: PG.t('vi.k.mf') }, { key: 'g', label: PG.t('vi.k.g85') }, { key: 'd', label: PG.t('vi.k.d'), sub: PG.t('vi.k.ds') }]);
      const note = PG.note();
      const sl = {};

      function update() {
        const S = state, P = prof(), C = console_();
        sl.fc.input.max = Math.min(F1 - 0.01, Math.floor(P.fmax * 0.999 * 100) / 100 + 0.5);
        const hc = V.hv(S.fc, P), half = S.B / 2000;
        drawIono(si, P); drawGdd(sgd, P); drawZoom(sz, P, C.bin); drawPulse(sp, P);
        if (!isFinite(hc)) {
          ['h', 't', 'g', 'b', 's', 'c'].forEach(k => cards.set(k, '–'));
          note.set('caution', PG.t('gdd.v.bad'), PG.t('vi.v.pen'));
        } else {
          const g0 = V.gdd(S.fc, P, 0.005), cut = S.fc + half >= P.fmax;
          const ta = 1000 * V.tau(S.fc - half, P), tb = 1000 * V.tau(Math.min(S.fc + half, P.fmax * 0.99999), P);
          const spread = Math.abs(tb - ta), n = spread * S.B / 1000, kind = PG.dispKind(n);
          cards.set('h', PG.num(hc, 0) + ' ' + PG.U('km'));
          cards.set('t', PG.num(2 * hc / V.C, 3) + ' ' + PG.U('ms'));
          cards.set('g', PG.num(g0, Math.abs(g0) < 100 ? 1 : 0) + ' ' + PG.U('usMHz'));
          cards.set('b', PG.fmtBW(PG.model.bmax(g0)));
          cards.set('s', PG.fmtUs(spread), PG.t('vi.k.ss', { v: PG.fmtUs(1000 / S.B) }));
          cards.set('c', PG.num(spread / C.bin, spread / C.bin < 0.1 ? 3 : 2) + ' ' + PG.U('bin'), PG.t('vi.k.cs', { b: PG.num(C.bin, 1), h: PG.num(C.hkm, 1), w: PG.num(C.col, 1) }));
          const dcol = Math.abs(g0) * C.col / 1000;
          note.set(kind === 'bad' || cut ? 'caution' : '', PG.t('gdd.v.' + kind),
            PG.t('gdd.v.' + kind + 'T') + ' ' + PG.t('gdd.v.num', { v: PG.num(n, n < 0.01 ? 4 : 2) }),
            g0 < 0 ? PG.t('vi.v.neg') : null, cut ? PG.t('vi.v.through') : null,
            dcol >= 0.5 * C.bin ? PG.t('vi.v.vis', { w: PG.num(C.col, 1), d: PG.num(dcol, 1), n: PG.num(dcol / C.bin, 1) }) : null);
        }
        const R = obliqueRays(P);
        drawObl(so, R); drawCmp(sc, R);
        if (R) {
          const g85 = glAt(R, 0.85), d60 = glAt(R, 0.6);
          oc.set('m', PG.num(R.muf, 1) + ' ' + PG.U('MHz'));
          oc.set('f', PG.num(R.muf / P.fmax, 2));
          oc.set('g', g85 ? PG.num(g85[1], 1) + ' ' + PG.U('usMHz') : '–', PG.t('vi.k.g85s', { v: PG.num(PG.model.b * (1 / Math.sqrt(0.15) - 1), 1) }));
          oc.set('d', d60 ? PG.num(d60[2], 2) + ' ' + PG.U('ms') : '–');
        } else ['m', 'f', 'g', 'd'].forEach(k => oc.set(k, '–'));
      }

      const mk = (key, min, max, step, d, unit) => (sl[key] = PG.slider({ label: PG.t('vi.' + key), min, max, step, value: state[key],
        fmt: v => key === 'foE' && v < 0.3 ? PG.t('vi.none') : PG.num(v, d) + ' ' + PG.U(unit), onInput: v => { state[key] = v; presetSeg.select(null); update(); } }));
      const presetSeg = PG.seg(['day', 'dusk', 'night'].map(p => ({ value: p, label: PG.t('vi.pre.' + p) })), state.pre, p => {
        Object.assign(state, V.PRESETS[p], { pre: p });
        ['foF2', 'hmF2', 'ymF2', 'foE'].forEach(k => sl[k].set(state[k]));
        state.fc = Math.min(state.fc, +(0.85 * state.foF2).toFixed(2)); sl.fc.set(state.fc);
        update();
      });
      mk('foF2', 2, 13.5, 0.1, 1, 'MHz'); mk('hmF2', 200, 420, 5, 0, 'km'); mk('ymF2', 40, 160, 5, 0, 'km'); mk('foE', 0, 4, 0.1, 1, 'MHz');
      sl.fc = PG.slider({ label: PG.t('vi.fc'), min: F0 + 0.05, max: F1 - 0.01, step: 0.01, value: state.fc, fmt: v => PG.num(v, 2) + ' ' + PG.U('MHz'), onInput: v => { state.fc = v; update(); } });
      const presets = PG.h('div', { class: 'seg' }, [10, 20, 50, 100, 250].map(b => PG.h('button', { type: 'button', onclick: () => { state.B = b; bw.set(sliderOf(b)); bw.refresh(); update(); } }, PG.fmtBW(b))));
      const bw = PG.slider({ label: PG.t('vi.bw'), min: 0, max: 1000, step: 1, value: sliderOf(state.B), fmt: () => PG.fmtBW(state.B), onInput: v => { state.B = bwFrom(v); bw.refresh(); update(); }, extra: presets });
      const rateSeg = PG.seg([{ value: 50e3, label: PG.t('vi.rate.50') }, { value: 100e3, label: PG.t('vi.rate.100') }], state.k, v => { state.k = v; update(); });
      const xm = PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.xm, onchange: e => { state.xm = e.target.checked; update(); } }), PG.t('vi.xm'));

      root.append(
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'field', style: 'margin-bottom:12px' }, PG.h('label', null, PG.h('span', null, PG.t('vi.pre'))), presetSeg),
          PG.h('div', { class: 'ctl' }, sl.foF2.root, sl.hmF2.root, sl.ymF2.root, sl.foE.root),
          PG.h('div', { class: 'ctl', style: 'margin-top:12px' }, sl.fc.root, bw.root,
            PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, PG.t('vi.rate'))), rateSeg)),
          PG.h('div', { class: 'row' }, xm)),
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.iono')), si),
        cards.root, note.root,
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.gdd')), sgd),
        PG.h('div', { class: 'two', style: 'margin-bottom:16px' },
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.zoom')), sz),
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.pulse')), sp)),
        PG.h('h2', null, PG.t('vi.h2.obl')),
        PG.h('p', { class: 'lede', style: 'font-size:14.5px;margin-bottom:12px' }, PG.t('vi.obl.p')),
        oc.root,
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.obl')),
          PG.legend([['line', 'border-color:var(--accent)', PG.t('vi.l.low')], ['line', 'border-color:var(--accent);opacity:.5', PG.t('vi.l.up')], ['dash', 'border-color:var(--faint)', PG.t('vi.l.model')]]), so),
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.cmp')),
          PG.legend([['line', 'border-color:var(--accent)', PG.t('vi.l.phys')], ['dash', 'border-color:var(--faint)', PG.t('vi.l.law')], ['ring', '', PG.t('vi.l.med')]]), sc),
        PG.h('div', { class: 'note' }, PG.h('p', null, PG.t('vi.cmp.note'))),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px;margin-top:18px' }, PG.t('vi.model')));
      update();
    },
  });
})();
