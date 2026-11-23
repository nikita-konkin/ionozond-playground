(function () {
  'use strict';
  const V = PG.vi;

  PG.i18n({
    ru: {
      'vi.nav': 'Вертикальное зондирование', 'vi.part': 'Дополнение · Вертикальное зондирование',
      'vi.title': 'Вертикальное зондирование и наклонная проекция',
      'vi.short': 'Ионограмма h′(f) по профилю слоёв E и F2 и её пересчёт на трассу Кипр — Йошкар-Ола по закону секанса.',
      'vi.lede': "При вертикальном зондировании волна отражается на высоте, где плазменная частота равна частоте зондирования. Ионограмма рассчитана для двух параболических слоёв E и F2: действующая высота h′(f) определяется интегралом группового показателя преломления до точки отражения, задержка равна 2h′/c. Диапазон частот 1–14 МГц соответствует станции yoshkar-ola в расписании ionozond.",
      'vi.pre': 'Ионосфера', 'vi.pre.day': 'День', 'vi.pre.dusk': 'Сумерки', 'vi.pre.night': 'Ночь',
      'vi.foF2': 'foF2', 'vi.hmF2': 'hmF2', 'vi.ymF2': 'Полутолщина F2', 'vi.foE': 'foE', 'vi.none': 'слоя нет',
      'vi.xm': 'Показать след необыкновенной волны (приближённо, f_H = 1,4 МГц)',
      'vi.cap.iono': 'Ионограмма вертикального зондирования. Сплошная линия — след обыкновенной волны h′(f), серый пунктир — профиль плазменной частоты f_N(h). След необыкновенной волны показан цветным пунктиром, если он включён.',
      'vi.aria.iono': 'Модельная ионограмма вертикального зондирования для слоёв E и F2 с профилем плазменной частоты.',
      'vi.x.f': 'частота, МГц', 'vi.y.h': 'высота, км',
      'vi.lbl.prof': 'f_N(h)', 'vi.lbl.foE': 'foE {v}', 'vi.lbl.foF2': 'foF2 {v}',
      'vi.h2.obl': 'Та же ионосфера на наклонной трассе',
      'vi.obl.p': "Закон секанса позволяет пересчитать вертикальную ионограмму в наклонную. Волна частоты f, падающая под углом φ, отражается на той же высоте, что и вертикальная волна частоты f·cos φ. Её групповой путь рассчитывается с помощью эквивалентного зеркального отражения на действующей высоте h′ (теоремы Брейта — Тьюва и Мартина). Ниже приведён расчёт для трассы длиной 2634 км с учётом кривизны Земли.",
      'vi.cap.obl': 'Ионограмма наклонного зондирования по этому профилю, 2634 км. Нижний и верхний лучи 1F смыкаются в точке МНЧ.',
      'vi.aria.obl': 'Ионограмма наклонного зондирования, рассчитанная по вертикальному профилю по закону секанса.',
      'vi.y.tau': 'задержка, мс', 'vi.l.low': 'нижний луч', 'vi.l.up': 'верхний луч',
      'vi.k.muf': 'МНЧ 1F по профилю', 'vi.k.mf': 'M = МНЧ / foF2',
      'vi.k.d': 'Задержка 1F при 0,6 МНЧ', 'vi.k.ds': 'на ионограммах: 9,0–9,2 мс',
      'vi.obl.none': 'При таком профиле ни один луч 1F не приходит в Йошкар-Олу над горизонтом.',
      'vi.model': 'Модель. Слои E и F2 — параболы: foE на высоте 110 км с полутолщиной 20 км и foF2 на высоте hmF2. Долины между слоями нет: выше максимума E плазменная частота остаётся равной foE. Магнитное поле и соударения не учитываются, так что сплошной след относится к обыкновенной волне. След необыкновенной волны построен приближённо: она отражается там, где f_N² = f(f − f_H), а её h′ взята равной h′ обыкновенной волны на частоте √(f(f − f_H)). Действующая высота h′(f) интегрируется точно по кусочно-линейному профилю с шагом 0,25 км; для одиночного параболического слоя результат совпадает с формулой h′ = h₀ + (y_m/2)·x·ln((1 + x)/(1 − x)) с точностью 0,02 км вплоть до 0,99 foF2. Наклонная проекция строится по закону секанса и теоремам Брейта — Тьюва и Мартина с зеркалом на высоте h′ над сферической Землёй, без поправки на кривизну самого слоя; лучи ниже горизонта отброшены.',
    },
    en: {
      'vi.nav': 'Vertical sounding', 'vi.part': 'Variant · Vertical sounding',
      'vi.title': 'Vertical sounding and oblique projection',
      'vi.short': 'An h′(f) ionogram from an E and F2 profile, projected onto the Cyprus → Yoshkar-Ola path by the secant law.',
      'vi.lede': 'In vertical sounding, a wave reflects where the plasma frequency equals the sounding frequency. This ionogram uses two parabolic layers, E and F2. The virtual height h′(f) is the integral of the group refractive index up to the reflection point, and the delay is 2h′/c. The frequency range is 1–14 MHz, as for the Yoshkar-Ola sounder in the ionozond schedule.',
      'vi.pre': 'Ionosphere', 'vi.pre.day': 'Day', 'vi.pre.dusk': 'Dusk', 'vi.pre.night': 'Night',
      'vi.foF2': 'foF2', 'vi.hmF2': 'hmF2', 'vi.ymF2': 'F2 half-thickness', 'vi.foE': 'foE', 'vi.none': 'no layer',
      'vi.xm': 'Show the X trace (rough, f_H = 1.4 MHz)',
      'vi.cap.iono': 'The vertical ionogram. Solid: the O trace h′(f). Grey dashes: the plasma-frequency profile f_N(h). Coloured dashes: the X trace, when enabled.',
      'vi.aria.iono': 'Model vertical ionogram for the E and F2 layers, with the plasma-frequency profile.',
      'vi.x.f': 'frequency, MHz', 'vi.y.h': 'height, km',
      'vi.lbl.prof': 'f_N(h)', 'vi.lbl.foE': 'foE {v}', 'vi.lbl.foF2': 'foF2 {v}',
      'vi.h2.obl': 'The same ionosphere over the oblique path',
      'vi.obl.p': 'The secant law turns a vertical ionogram into an oblique one. A wave of frequency f meeting the layer at incidence φ reflects where a vertical wave of frequency f·cos φ does, and its group path equals the straight-line path to a mirror at height h′ (the Breit–Tuve and Martyn theorems). Here that is computed for 2634 km on a curved Earth.',
      'vi.cap.obl': 'The oblique ionogram for this profile over 2634 km. The lower and upper 1F rays meet at the nose.',
      'vi.aria.obl': 'Oblique ionogram computed from the vertical profile by the secant law.',
      'vi.y.tau': 'delay, ms', 'vi.l.low': 'lower ray', 'vi.l.up': 'upper ray',
      'vi.k.muf': '1F MUF from the profile', 'vi.k.mf': 'M = MUF / foF2',
      'vi.k.d': '1F delay at 0.6 MUF', 'vi.k.ds': 'on the ionograms: 9.0–9.2 ms',
      'vi.obl.none': 'With this profile no 1F ray reaches Yoshkar-Ola above the horizon.',
      'vi.model': 'The model. E and F2 are parabolic layers: foE at 110 km with a 20 km half-thickness, and foF2 at hmF2. There is no valley between them; above the E peak the profile stays at foE. The magnetic field and collisions are left out, so the solid trace is the ordinary wave. The X trace is rough: the X wave reflects where f_N² = f(f − f_H), and its h′ is read off the O trace at that frequency. h′(f) is integrated exactly over a piecewise-linear profile in 0.25 km steps; for a single parabolic layer that matches h′ = h₀ + (y_m/2)·x·ln((1 + x)/(1 − x)) to 0.02 km up to 0.99 foF2. The oblique projection is the secant law and the Breit–Tuve and Martyn theorems with a mirror at h′ over a spherical Earth, without correcting for the layer’s own curvature; rays below the horizon are dropped.',
    },
  });

  const F0 = 1, F1 = 14, FH = 1.4;
  const state = Object.assign({ pre: 'day', xm: false }, V.PRESETS.day);

  function drawIono(svg, P) {
    svg.replaceChildren();
    const S = state;
    const Pl = PG.plot(svg, { x0: 56, x1: 744, y0: 14, y1: 290, xd: [F0, F1], yd: [0, 800], xt: [1, 2, 4, 6, 8, 10, 12, 14], yt: [0, 100, 200, 300, 400, 500, 600, 700, 800],
      xl: PG.t('vi.x.f'), yl: PG.t('vi.y.h'), ylx: 12 });
    const { fx, fy, g } = Pl;
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
    mark(S.foF2, 'vi.lbl.foF2');
    PG.text(g, fx(Math.sqrt(P.f2[Math.floor(P.h.length * 0.55)])) + 6, fy(P.h[Math.floor(P.h.length * 0.55)]) + 14, PG.t('vi.lbl.prof'), { opacity: .6 });
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
    const f60 = 0.6 * O.muf;
    const i = low.findIndex(([f]) => f >= f60);
    let d60 = NaN;
    if (i === 0 && low[0][0] === f60) d60 = low[0][1];
    if (i > 0) {
      const [f0, t0] = low[i - 1], [f1, t1] = low[i];
      d60 = t0 + (t1 - t0) * (f60 - f0) / (f1 - f0);
    }
    return { muf: O.muf, low, up, d60 };
  }

  function drawObl(svg, R) {
    svg.replaceChildren();
    if (!R) { PG.text(svg, 380, 130, PG.t('vi.obl.none'), { 'text-anchor': 'middle', style: 'fill:var(--warn)', 'font-size': 13 }); return; }
    const all = R.low.concat(R.up).filter(p => p[1] < Math.max(10.5, R.up[0][1] + 0.1));
    const fmin = Math.floor(Math.min(...all.map(p => p[0]))), fmax = Math.ceil(R.muf + 1);
    const tmin = Math.min(...all.map(p => p[1])), tmax = Math.max(...all.map(p => p[1]));
    const pad = 0.08 * (tmax - tmin + 0.05);
    const Pl = PG.plot(svg, { x0: 64, x1: 744, y0: 14, y1: 230, xd: [fmin, fmax], yd: [tmin - pad, tmax + pad], xl: PG.t('vi.x.f'), yl: PG.t('vi.y.tau'), ylx: 14,
      yf: v => PG.num(v, 2), nx: 8 });
    const { fx, fy, g } = Pl;
    PG.el(g, 'path', { d: PG.path(R.up.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.5, opacity: .5 });
    PG.el(g, 'path', { d: PG.path(R.low.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6 });
  }

  PG.register({
    id: 'vi',
    mount(root) {
      const si = PG.svg(760, 330, PG.t('vi.aria.iono')), so = PG.svg(760, 270, PG.t('vi.aria.obl'));
      const oc = PG.cards([{ key: 'm', label: PG.t('vi.k.muf') }, { key: 'f', label: PG.t('vi.k.mf') }, { key: 'd', label: PG.t('vi.k.d'), sub: PG.t('vi.k.ds') }]);
      const sl = {};

      function update() {
        const P = V.profile(state), R = obliqueRays(P);
        drawIono(si, P); drawObl(so, R);
        if (R) {
          oc.set('m', PG.num(R.muf, 1) + ' ' + PG.U('MHz'));
          oc.set('f', PG.num(R.muf / state.foF2, 2));
          oc.set('d', isFinite(R.d60) ? PG.num(R.d60, 2) + ' ' + PG.U('ms') : '–');
        } else ['m', 'f', 'd'].forEach(k => oc.set(k, '–'));
      }

      const mk = (key, min, max, step, d, unit) => (sl[key] = PG.slider({ label: PG.t('vi.' + key), min, max, step, value: state[key],
        fmt: v => key === 'foE' && v < 0.3 ? PG.t('vi.none') : PG.num(v, d) + ' ' + PG.U(unit), onInput: v => { state[key] = v; presetSeg.select(null); update(); } }));
      const presetSeg = PG.seg(['day', 'dusk', 'night'].map(p => ({ value: p, label: PG.t('vi.pre.' + p) })), state.pre, p => {
        Object.assign(state, V.PRESETS[p], { pre: p });
        ['foF2', 'hmF2', 'ymF2', 'foE'].forEach(k => sl[k].set(state[k]));
        update();
      });
      mk('foF2', 2, 13.5, 0.1, 1, 'MHz'); mk('hmF2', 200, 420, 5, 0, 'km'); mk('ymF2', 40, 160, 5, 0, 'km'); mk('foE', 0, 4, 0.1, 1, 'MHz');
      const xm = PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.xm, onchange: e => { state.xm = e.target.checked; update(); } }), PG.t('vi.xm'));

      root.append(
        PG.h('div', { class: 'panel' },
          PG.h('div', { class: 'field', style: 'margin-bottom:12px' }, PG.h('label', null, PG.h('span', null, PG.t('vi.pre'))), presetSeg),
          PG.h('div', { class: 'ctl' }, sl.foF2.root, sl.hmF2.root, sl.ymF2.root, sl.foE.root),
          PG.h('div', { class: 'row' }, xm)),
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.iono')), si),
        PG.h('h2', null, PG.t('vi.h2.obl')),
        PG.h('p', { class: 'lede', style: 'font-size:14.5px;margin-bottom:12px' }, PG.t('vi.obl.p')),
        oc.root,
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('vi.cap.obl')),
          PG.legend([['line', 'border-color:var(--accent)', PG.t('vi.l.low')], ['line', 'border-color:var(--accent);opacity:.5', PG.t('vi.l.up')]]), so),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px;margin-top:18px' }, PG.t('vi.model')));
      update();
    },
  });
})();
