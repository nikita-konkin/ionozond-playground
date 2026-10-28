/* The frequency response read subchannel by subchannel off a real sounding. Each FFT window of the
   dechirped echo is an instantaneous delay power profile; the complex value at its peak is one sample
   of the mode's response in a subchannel kT wide. Windows one after another give one step per
   subchannel; overlapping windows give a sample at almost every signal sample, with a phase that
   unwraps. The page computes all of it here, from complex echo-window samples in js/data/fr.js
   (tools/fr_data.py), loaded on the first visit. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'fr.nav': 'ЧХ по подканалам', 'fr.part': 'Дополнение · Имитатор КВ-канала',
      'fr.title': 'Частотная характеристика по подканалам: окна с перекрытием',
      'fr.short': 'АЧХ и ФЧХ моды по пику ПЗМ в каждом окне реальной записи: ступенчато, по отсчёту на подканал, или скользящим окном — почти на каждом отсчёте сигнала, с развёрткой фазы.',
      'fr.lede': 'Сигнал разностной частоты режется на окна; спектр окна — мгновенный ПЗМ, а комплексное значение в его максимуме — отсчёт частотной характеристики моды в подканале шириной kT. Без перекрытия на подканал приходится один общий отсчёт, и ЧХ выходит ступенчатой. Скользящее окно даёт отсчёт почти на каждом отсчёте сигнала, а фаза соседних окон различается мало, поэтому её можно развернуть однозначно. Всё считается здесь же, по комплексным отсчётам окна эха реальных сеансов 17 октября.',
      'fr.loading': 'Загружаются данные…',
      'fr.none.lbl': 'Данных нет',
      'fr.none.1': 'Файл js/data/fr.js не найден. Его собирает tools/fr_data.py из сеансов с окном эха, продуктов .h5 с полем z или записей .lfs; ионограммы мощности для этой страницы не годятся — нужна фаза.',
      'fr.src': 'данные: {c}, {d}; окно эха, {sr} Гц, в данных {a}–{b} МГц',
      'fr.session': 'Сеанс', 'fr.mode': 'Мода: строб поиска пика вокруг её ДЧХ', 'fr.sub': 'Подканал kT, кГц',
      'fr.ov': 'Перекрытие окон', 'fr.ov.every': 'на каждом отсчёте', 'fr.lo': 'Участок 1 МГц',
      'fr.c.sub': 'Подканал', 'fr.c.sub.s': 'окно {t} с, {l} отсчётов окна эха',
      'fr.c.bin': 'Отсчёт задержки', 'fr.c.bin.s': '1/(kT), {km} км',
      'fr.c.step': 'Шаг ЧХ', 'fr.c.step.s': '{n} отсчётов на 1 МГц; без перекрытия — {m}',
      'fr.c.snr': 'ОСШ в пике', 'fr.c.snr.s': 'медиана по окнам, над шумом бина',
      'fr.c.amb': 'Шагов фазы > π/2', 'fr.c.amb.s': 'с перекрытием; без него — {m} из {k}',
      'fr.c.gdd': 'GDD по ФЧХ', 'fr.c.gdd.s': 'по кривизне фазы; по наклону следа {v}',
      'fr.map.cap': 'Мгновенные ПЗМ вдоль участка: столбцы — окна, по вертикали задержка, цвет — мощность над шумом бина, 0–40 дБ. Пунктир — ДЧХ моды из состояния, точки — пики ПЗМ в стробе. Щелчок выбирает окно для ПЗМ ниже.',
      'fr.pdp.cap': 'Мгновенный ПЗМ окна на {f} МГц: линия — спектр окна на тонкой сетке, точки — бины БПФ через 1/(kT), заливка — строб вокруг ДЧХ, кружок — пик, из которого берётся отсчёт ЧХ.',
      'fr.amp.cap': 'АЧХ: |H| в пике ПЗМ, дБ над шумом бина. Серые ступени — окна без перекрытия, по отсчёту на подканал; линия — окна с выбранным перекрытием.',
      'fr.ph.cap': 'ФЧХ: фаза отсчёта в пике, развёрнутая вдоль частоты, за вычетом линейного набега 2πfτ₀, τ₀ = {t} мкс. Изгиб — дисперсия внутри моды, наклон — отличие групповой задержки от τ₀. Оранжевые точки — ступени, которые развёртка без перекрытия увела на целый оборот и больше.',
      'fr.ax.f': 'частота, МГц', 'fr.ax.us': 'задержка, мкс', 'fr.ax.db': 'дБ над шумом', 'fr.ax.rad': 'фаза, рад',
      'fr.l.step': 'без перекрытия', 'fr.l.slide': 'с перекрытием', 'fr.l.curve': 'ДЧХ моды', 'fr.l.peak': 'пики ПЗМ',
      'fr.l.gate': 'строб', 'fr.l.bins': 'бины БПФ', 'fr.l.fine': 'спектр окна', 'fr.l.lost': 'потерян оборот', 'fr.l.pick': 'выбранное окно',
      'fr.aria.map': 'Мгновенные ПЗМ вдоль участка: частота по горизонтали, задержка по вертикали, мощность цветом.',
      'fr.n.lbl': 'Как это считается',
      'fr.n.1': 'Окно Ханна длиной T = B/k (k = 100 кГц/с) идёт по сигналу разностной частоты с шагом (1 − перекрытие)·T. В каждом окне спектр считается на бинах через 1/T в стробе вокруг ДЧХ моды; берётся бин с наибольшей мощностью и его комплексное значение. Это способ «пик ПЗМ → отсчёт ЧХ»; с перекрытием отсчёты идут чаще, но каждый по-прежнему усреднён по своему подканалу шириной B.',
      'fr.n.2': 'Чтобы фазу можно было развернуть, у всех окон должна быть общая опора. Фаза БПФ отсчитывается от начала окна: при окнах подряд это не мешает, а при перекрытии добавляет набег 2π·m·s/N, где m — номер бина, s — сдвиг начала окна в отсчётах. Поэтому спектр здесь считается в абсолютном времени развёртки, а отсчёт переводится к одной опорной задержке τ₀ для всех окон: H = X·exp(j2π(bₘ − b₀)t), где bₘ — разностная частота бина пика, b₀ — частота τ₀, t — середина окна. Тогда смена бина пика не даёт скачка, а соседние окна различаются по фазе на 2π(τ − τ₀)·k·Δt.',
      'fr.n.3': 'Развёртка однозначна, пока этот шаг меньше π, то есть пока |τ − τ₀| < 1/(2k·Δt). Без перекрытия Δt = T, и предел — половина отсчёта задержки: у моды с заметной дисперсией задержка за 1 МГц уходит дальше, и ступенчатая ФЧХ теряет обороты. С перекрытием 50 % запас вдвое больше, а окно на каждом отсчёте (в окне эха это 1,125 мс, 112,5 Гц развёртки) отодвигает предел до 4,4 мс.',
      'fr.n.4': 'Перекрытие не улучшает разрешение: каждый отсчёт ЧХ — среднее по подканалу B, отсчёт задержки остаётся 1/(kT), соседние отсчёты сильно коррелированы. Окно на каждом отсчёте — то же, что второе сжатие вдоль ДЧХ с фильтром Ханна длиной T (схема 2 в описании имитатора).',
      'fr.n.5': 'На восходящей развёртке 1 МГц — это 10 с, поэтому вдоль частоты здесь смешаны частотная избирательность и замирания за эти 10 с (время когерентности около 0,5 с — 50 кГц развёртки). Это H(f, t) вдоль диагонали f = f₀ + kt, а не мгновенная ЧХ; поэтому она и не похожа на |H(f, t)| имитатора на одной несущей, где частота и время разделены.',
    },
    en: {
      'fr.nav': 'Subchannel response', 'fr.part': 'Supplement · HF channel simulator',
      'fr.title': 'The frequency response by subchannel: overlapping windows',
      'fr.short': 'A mode’s magnitude and phase response from the delay power profile’s peak in each window of a real recording: one step per subchannel, or a sliding window at almost every signal sample, with the phase unwrapped.',
      'fr.lede': 'The beat is cut into windows; a window’s spectrum is an instantaneous delay power profile, and the complex value at its peak is one sample of the mode’s frequency response in a subchannel kT wide. Without overlap a subchannel gets one common sample, and the response comes out in steps. A sliding window gives a sample at almost every signal sample, and neighbouring windows differ little in phase, so the phase unwraps without ambiguity. Everything is computed here, from the complex echo-window samples of the real soundings of 17 October.',
      'fr.loading': 'Loading the data…',
      'fr.none.lbl': 'No data',
      'fr.none.1': 'js/data/fr.js was not found. tools/fr_data.py builds it from soundings with an echo window, .h5 products with z, or .lfs recordings; power ionograms will not do here, the phase is needed.',
      'fr.src': 'data: {c}, {d}; echo window, {sr} Hz, {a}–{b} MHz in the data',
      'fr.session': 'Sounding', 'fr.mode': 'Mode: the peak is sought around its curve', 'fr.sub': 'Subchannel kT, kHz',
      'fr.ov': 'Window overlap', 'fr.ov.every': 'at every sample', 'fr.lo': '1 MHz stretch',
      'fr.c.sub': 'Subchannel', 'fr.c.sub.s': 'a {t} s window, {l} echo-window samples',
      'fr.c.bin': 'Delay bin', 'fr.c.bin.s': '1/(kT), {km} km',
      'fr.c.step': 'Response step', 'fr.c.step.s': '{n} samples per MHz; {m} without overlap',
      'fr.c.snr': 'Peak SNR', 'fr.c.snr.s': 'median over windows, above a bin’s noise',
      'fr.c.amb': 'Phase steps > π/2', 'fr.c.amb.s': 'with overlap; {m} of {k} without',
      'fr.c.gdd': 'GDD from phase', 'fr.c.gdd.s': 'from its curvature; {v} from the trace’s slope',
      'fr.map.cap': 'Instantaneous delay power profiles along the stretch: columns are windows, delay runs up, colour is power above a bin’s noise, 0–40 dB. Dashes, the mode’s curve from the state; dots, the profiles’ peaks within the gate. A click picks the window for the profile below.',
      'fr.pdp.cap': 'Instantaneous delay power profile of the window at {f} MHz: the line is the window’s spectrum on a fine grid, the dots its FFT bins 1/(kT) apart, the shading the gate around the curve, the ring the peak that gives the response sample.',
      'fr.amp.cap': 'Magnitude: |H| at the profile’s peak, dB above a bin’s noise. Grey steps, windows without overlap, one sample per subchannel; the line, windows with the chosen overlap.',
      'fr.ph.cap': 'Phase: the peak sample’s phase unwrapped along frequency, less the linear term 2πfτ₀, τ₀ = {t} µs. Curvature is dispersion within the mode, slope the group delay’s offset from τ₀. Orange dots are steps the unwrapping without overlap has carried off by a turn or more.',
      'fr.ax.f': 'frequency, MHz', 'fr.ax.us': 'delay, µs', 'fr.ax.db': 'dB above noise', 'fr.ax.rad': 'phase, rad',
      'fr.l.step': 'without overlap', 'fr.l.slide': 'with overlap', 'fr.l.curve': 'mode curve', 'fr.l.peak': 'profile peaks',
      'fr.l.gate': 'gate', 'fr.l.bins': 'FFT bins', 'fr.l.fine': 'window spectrum', 'fr.l.lost': 'turn lost', 'fr.l.pick': 'chosen window',
      'fr.aria.map': 'Instantaneous delay power profiles along the stretch: frequency across, delay up, power as colour.',
      'fr.n.lbl': 'How it is computed',
      'fr.n.1': 'A Hann window T = B/k long (k = 100 kHz/s) steps along the beat by (1 − overlap)·T. In each window the spectrum is computed on bins 1/T apart within a gate around the mode’s curve; the strongest bin and its complex value are kept. That is the “profile peak → response sample” method; with overlap the samples come more often, but each is still an average over its own subchannel B wide.',
      'fr.n.2': 'For the phase to unwrap, all windows need one reference. An FFT counts phase from the window’s start: windows one after another do not mind, but overlapping ones get an extra 2π·m·s/N, m the bin and s the window’s offset in samples. So the spectrum here is taken in the sweep’s absolute time, and every sample is brought to one reference delay τ₀: H = X·exp(j2π(bₘ − b₀)t), bₘ the peak bin’s beat, b₀ that of τ₀, t the window’s middle. A change of peak bin then makes no jump, and neighbouring windows differ in phase by 2π(τ − τ₀)·k·Δt.',
      'fr.n.3': 'Unwrapping is unambiguous while that step is below π, that is while |τ − τ₀| < 1/(2k·Δt). Without overlap Δt = T, and the limit is half a delay bin: a mode with noticeable dispersion moves further than that over 1 MHz, and the stepped phase loses turns. A 50 % overlap doubles the margin, and a window at every sample (1.125 ms, 112.5 Hz of sweep, in the echo window) moves the limit to 4.4 ms.',
      'fr.n.4': 'Overlap does not improve resolution: each response sample is an average over its subchannel B, the delay bin stays 1/(kT), and neighbouring samples are strongly correlated. A window at every sample is the second dechirp along the curve with a Hann filter T long (board 2 of the simulator notes).',
      'fr.n.5': 'On an up-sweep 1 MHz is 10 s, so along frequency this mixes frequency selectivity with the fading of those 10 s (a coherence time of about 0.5 s, 50 kHz of sweep). It is H(f, t) along the diagonal f = f₀ + kt, not an instantaneous response, which is why it does not look like the simulator’s |H(f, t)| at one carrier, where frequency and time are apart.',
    },
  });

  /* ------------------------------------------------------------ constants */

  const SUBS_KHZ = [5.12, 8, 10.24, 20.48, 40.96];
  const OVERLAPS = [0, 0.5, 0.75, 0.9, 1];     // 1: a window starting at every sample
  const SPAN_MHZ = 1;
  const NOISE_US = [12400, 12600, 12800, 13000];  // inside the echo window, clear of every mode on this path
  const GATE_US = 60, GATE_BINS = 1.5;         // half-width of the peak search around the mode's curve
  const MAP_COLS = 240, MAP_PAD_US = 250, MAP_DB = [0, 40];
  const MIN_SNR_DB = 6;                        // samples weaker than this stay out of the GDD fits
  const PAD = { l: 58, r: 8, t: 6, b: 32 };
  const FONT = '11px "IBM Plex Mono", ui-monospace, monospace';
  const TWO_PI = 2 * Math.PI;

  const st = { s: 0, mode: 0, sub: 20.48, ov: 0.5, lo: null, pick: null };
  let DATA = null, ui = null, rec = null, res = null, pending = null;

  const T = (k, v) => PG.t('fr.' + k, v);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const wrap = a => a - TWO_PI * Math.round(a / TWO_PI);
  const median = a => { const s = Float64Array.from(a).sort(); return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : NaN; };
  const hhmm = d => d.utc.slice(11, 16);

  /* ------------------------------------------------------------ the record */

  // One sounding's stretch: complex samples, their times, and the sweep's and the delay's axes.
  function record(d) {
    const bin = atob(d.iq), re = new Float64Array(d.n), im = new Float64Array(d.n);
    for (let i = 0; i < d.n; i++) {
      const a = bin.charCodeAt(2 * i), b = bin.charCodeAt(2 * i + 1);
      re[i] = (a > 127 ? a - 256 : a) * d.scale;
      im[i] = (b > 127 ? b - 256 : b) * d.scale;
    }
    return {
      d, re, im, n: d.n, sr: d.sr_hz, k: d.rate_hz_s,
      t: i => d.t0_s + i / d.sr_hz,
      f: t => (d.sweep_hz_at_0 + d.rate_hz_s * t) / 1e6,
      at: f => ((f * 1e6 - d.sweep_hz_at_0) / d.rate_hz_s - d.t0_s) * d.sr_hz,
      beat: us => (us * d.km_per_us - d.range_zero_km) / d.km_per_hz,
      delay: hz => (hz * d.km_per_hz + d.range_zero_km) / d.km_per_us,
    };
  }

  // The mode's delay at f, µs, from the state's curve; null outside its band.
  function curveAt(m, f) {
    if (!m || f < m.f[0] || f > m.f[m.f.length - 1]) return null;
    const F = m.f;
    let a = 0, b = F.length - 1;
    while (b - a > 1) { const c = (a + b) >> 1; if (F[c] <= f) a = c; else b = c; }
    return m.us[a] + (f - F[a]) / (F[b] - F[a] || 1) * (m.us[b] - m.us[a]);
  }

  const hann = L => Float64Array.from({ length: L }, (_, l) => 0.5 - 0.5 * Math.cos(TWO_PI * (l + 1) / (L + 1)));

  // The window's spectrum at an absolute beat, in the sweep's absolute time, over samples [s, s + L).
  function spectrum(r, w, s, hz) {
    const L = w.length, f = hz - r.d.shift_hz;
    let x = 0, y = 0;
    for (let l = 0; l < L; l++) {
      const i = s + l, ph = -TWO_PI * f * r.t(i), c = Math.cos(ph), q = Math.sin(ph);
      x += w[l] * (r.re[i] * c - r.im[i] * q);
      y += w[l] * (r.re[i] * q + r.im[i] * c);
    }
    return [x, y];
  }

  /* ------------------------------------------------------------ analysis */

  // Everything the page draws for the current session, mode, subchannel, overlap and stretch.
  function analyse() {
    const r = rec, d = r.d, md = d.modes[st.mode];
    const L = Math.max(8, Math.round(st.sub * 1e3 / r.k * r.sr)), Tw = L / r.sr, w = hann(L);
    const hop = st.ov >= 1 ? 1 : Math.max(1, Math.round(L * (1 - st.ov)));
    const nA = r.at(st.lo), nB = r.at(st.lo + SPAN_MHZ);
    const s0 = Math.max(0, Math.ceil(nA - (L - 1) / 2)), s1 = Math.min(r.n - L, Math.floor(nB - (L - 1) / 2));
    const binUs = Math.abs(r.delay(1 / Tw) - r.delay(0)), gate = Math.max(GATE_US, GATE_BINS * binUs);
    // Each bin's samples turned by its beat once, over the stretch, so that a window is a weighted sum.
    const rot = new Map(), len = s1 + L - s0;
    const turned = m => {
      if (rot.has(m)) return rot.get(m);
      const f = m / Tw - d.shift_hz, x = new Float64Array(len), y = new Float64Array(len);
      for (let j = 0; j < len; j++) {
        const i = s0 + j, ph = -TWO_PI * f * r.t(i), c = Math.cos(ph), q = Math.sin(ph);
        x[j] = r.re[i] * c - r.im[i] * q; y[j] = r.re[i] * q + r.im[i] * c;
      }
      rot.set(m, [x, y]);
      return [x, y];
    };
    const at = (m, s) => {
      const [x, y] = turned(m), o = s - s0;
      let a = 0, b = 0;
      for (let l = 0; l < L; l++) { a += w[l] * x[o + l]; b += w[l] * y[o + l]; }
      return [a, b];
    };
    const binOf = us => Math.round(r.beat(us) * Tw);
    const noiseBins = NOISE_US.map(binOf);

    function series(step) {
      const out = [];
      for (let s = s0; s <= s1; s += step) {
        const tc = r.t(s + (L - 1) / 2), f = r.f(tc), tau = curveAt(md, f);
        if (tau === null) { out.push({ f, ok: false }); continue; }
        const b1 = r.beat(tau - gate) * Tw, b2 = r.beat(tau + gate) * Tw;
        let lo = Math.ceil(Math.min(b1, b2)), hi = Math.floor(Math.max(b1, b2));
        if (hi < lo) lo = hi = binOf(tau);
        let best = lo, bp = -1, bx = null;
        for (let m = lo; m <= hi; m++) {
          const x = at(m, s), p = x[0] * x[0] + x[1] * x[1];
          if (p > bp) { bp = p; best = m; bx = x; }
        }
        // Where the peak lies between bins: a parabola through the log power of its neighbours.
        const pm = at(best - 1, s), pp = at(best + 1, s);
        const l0 = Math.log(pm[0] * pm[0] + pm[1] * pm[1] + 1e-300), l1 = Math.log(bp + 1e-300), l2 = Math.log(pp[0] * pp[0] + pp[1] * pp[1] + 1e-300);
        const den = l0 - 2 * l1 + l2, frac = den < 0 ? PG.clamp(0.5 * (l0 - l2) / den, -0.5, 0.5) : 0;
        out.push({ f, tc, s, ok: true, m: best, x: bx[0], y: bx[1], p: bp, us: r.delay((best + frac) / Tw) });
      }
      return out;
    }

    const step = series(L), slide = hop === L ? step : series(hop);
    const noise = median(step.filter(v => v.ok).map(v => noiseBins.reduce((a, m) => { const x = at(m, v.s); return a + (x[0] * x[0] + x[1] * x[1]) / noiseBins.length; }, 0)));
    const tau0 = Math.round(median(step.filter(v => v.ok).map(v => v.us)));
    const b0 = r.beat(tau0);
    const finish = list => {
      let prev = null, run = 0, jumps = 0, n = 0;
      for (const v of list) {
        if (!v.ok) { prev = null; continue; }
        const turn = TWO_PI * (v.m / Tw - b0) * v.tc, c = Math.cos(turn), q = Math.sin(turn);
        const hx = v.x * c - v.y * q, hy = v.x * q + v.y * c, ph = Math.atan2(hy, hx);
        v.db = 10 * Math.log10(v.p / noise);
        if (prev === null) run = ph;
        else { const dph = wrap(ph - prev); run += dph; n++; if (Math.abs(dph) > Math.PI / 2) jumps++; }
        v.ph = run; prev = ph;
      }
      return { jumps, steps: n };
    };
    const ambStep = finish(step), ambSlide = slide === step ? ambStep : finish(slide);
    // The stepped phase is unwrapped on its own; it is then put on the sliding one's turn at its
    // first sample, so that every turn it loses afterwards shows.
    const okS = slide.filter(v => v.ok), near = f => {
      let a = 0, b = okS.length - 1;
      while (b - a > 1) { const c = (a + b) >> 1; if (okS[c].f <= f) a = c; else b = c; }
      return Math.abs(okS[a].f - f) < Math.abs(okS[b].f - f) ? okS[a] : okS[b];
    };
    if (slide !== step && okS.length) {
      const first = step.find(v => v.ok);
      if (first) {
        const k = Math.round((near(first.f).ph - first.ph) / TWO_PI) * TWO_PI;
        step.forEach(v => { if (v.ok) { v.ph += k; v.lost = Math.abs(near(v.f).ph - v.ph) > Math.PI; } });
      }
    }
    // GDD two ways: the phase's curvature, and the slope of the peaks' delays.
    const fm = st.lo + SPAN_MHZ / 2, good = okS.filter(v => v.db >= MIN_SNR_DB);
    const cph = fit(good.map(v => v.f - fm), good.map(v => v.ph), 2);
    const cus = fit(good.map(v => v.f - fm), good.map(v => v.us), 1);
    return {
      L, Tw, B: r.k * Tw / 1e3, hop, w, binUs, gate, s0, s1, step, slide, noise, tau0, md,
      snr: median(okS.map(v => v.db)), amb: { step: ambStep, slide: ambSlide },
      gddPhase: cph ? -cph[2] / Math.PI : NaN, gddTrace: cus ? cus[1] : NaN,
      perMHz: n => Math.round(n / SPAN_MHZ),
    };
  }

  // Least squares polynomial of the given degree; null with too few points.
  function fit(x, y, deg) {
    const n = deg + 1;
    if (x.length <= n) return null;
    const A = Array.from({ length: n }, () => new Float64Array(n + 1));
    for (let i = 0; i < x.length; i++) {
      const p = Array.from({ length: n }, (_, j) => Math.pow(x[i], j));
      for (let a = 0; a < n; a++) { for (let b = 0; b < n; b++) A[a][b] += p[a] * p[b]; A[a][n] += p[a] * y[i]; }
    }
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]];
      if (!A[c][c]) return null;
      for (let r = 0; r < n; r++) if (r !== c) { const k = A[r][c] / A[c][c]; for (let j = c; j <= n; j++) A[r][j] -= k * A[c][j]; }
    }
    return Array.from({ length: n }, (_, j) => A[j][n] / A[j][j]);
  }

  // The power map: MAP_COLS windows across the stretch, delays around the mode on a grid of a
  // quarter bin, in dB above a bin's noise.
  function powerMap() {
    const r = rec, a = res, us = a.slide.filter(v => v.ok).map(v => v.us).concat(a.md.us);
    const top = Math.max(...us.filter(v => v !== null)), bot = Math.min(...us.filter(v => v !== null));
    const lo = Math.max(bot, a.tau0 - 600) - MAP_PAD_US, hi = Math.min(top, a.tau0 + 600) + MAP_PAD_US;
    const dy = Math.max(2, a.binUs / 4), rows = Math.max(2, Math.round((hi - lo) / dy) + 1);
    const cols = Math.min(MAP_COLS, a.s1 - a.s0 + 1), starts = Array.from({ length: cols }, (_, j) => a.s0 + Math.round(j * (a.s1 - a.s0) / Math.max(1, cols - 1)));
    const db = new Float32Array(cols * rows), len = a.s1 + a.L - a.s0, x = new Float64Array(len), y = new Float64Array(len);
    for (let k = 0; k < rows; k++) {
      const f = r.beat(lo + k * dy) - r.d.shift_hz;
      for (let j = 0; j < len; j++) {
        const i = a.s0 + j, ph = -TWO_PI * f * r.t(i), c = Math.cos(ph), q = Math.sin(ph);
        x[j] = r.re[i] * c - r.im[i] * q; y[j] = r.re[i] * q + r.im[i] * c;
      }
      for (let c = 0; c < cols; c++) {
        const o = starts[c] - a.s0;
        let p = 0, q = 0;
        for (let l = 0; l < a.L; l++) { p += a.w[l] * x[o + l]; q += a.w[l] * y[o + l]; }
        db[c * rows + k] = 10 * Math.log10((p * p + q * q) / a.noise + 1e-12);
      }
    }
    return { db, cols, rows, lo, dy, hi: lo + (rows - 1) * dy, f: starts.map(s => r.f(r.t(s + (a.L - 1) / 2))) };
  }

  // The picked window's profile: fine grid, FFT bins, gate and peak.
  function profile(v) {
    const r = rec, a = res, map = ui.map, fine = [], bins = [];
    const dy = Math.max(1, a.binUs / 10);
    for (let us = map.lo; us <= map.hi; us += dy) {
      const x = spectrum(r, a.w, v.s, r.beat(us));
      fine.push([us, 10 * Math.log10((x[0] * x[0] + x[1] * x[1]) / a.noise + 1e-12)]);
    }
    const m1 = Math.round(r.beat(map.lo) * a.Tw), m2 = Math.round(r.beat(map.hi) * a.Tw);
    for (let m = Math.min(m1, m2); m <= Math.max(m1, m2); m++) {
      const x = spectrum(r, a.w, v.s, m / a.Tw), us = r.delay(m / a.Tw);
      if (us >= map.lo && us <= map.hi) bins.push([us, 10 * Math.log10((x[0] * x[0] + x[1] * x[1]) / a.noise + 1e-12), m === v.m]);
    }
    return { fine, bins, gate: curveAt(a.md, v.f) };
  }

  /* ------------------------------------------------------------ drawing */

  function sizeCanvas(c) {
    const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [g, w, h];
  }

  function mapGeometry(w, h) {
    const m = ui.map, pw = w - PAD.l - PAD.r, ph = h - PAD.t - PAD.b, f0 = st.lo, f1 = st.lo + SPAN_MHZ;
    return { x: f => PAD.l + (f - f0) / (f1 - f0) * pw, y: us => PAD.t + (m.hi - us) / (m.hi - m.lo) * ph, f: x => f0 + (x - PAD.l) / pw * (f1 - f0), pw, ph, f0, f1 };
  }

  function drawMap(canvas) {
    const [g, w, h] = sizeCanvas(canvas), m = ui.map, G = mapGeometry(w, h);
    g.clearRect(0, 0, w, h);
    const img = g.createImageData(m.cols, m.rows);
    for (let c = 0; c < m.cols; c++) for (let k = 0; k < m.rows; k++) {
      const v = PG.clamp((m.db[c * m.rows + k] - MAP_DB[0]) / (MAP_DB[1] - MAP_DB[0]), 0, 1), o = ((m.rows - 1 - k) * m.cols + c) * 4, q = Math.round(v * 255) * 3;
      img.data[o] = PG.VIRIDIS[q]; img.data[o + 1] = PG.VIRIDIS[q + 1]; img.data[o + 2] = PG.VIRIDIS[q + 2]; img.data[o + 3] = 255;
    }
    const off = document.createElement('canvas');
    off.width = m.cols; off.height = m.rows; off.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, PAD.l, PAD.t, G.pw, G.ph);
    g.save(); g.beginPath(); g.rect(PAD.l, PAD.t, G.pw, G.ph); g.clip();
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.setLineDash([5, 4]); g.beginPath();
    let on = false;
    for (let i = 0; i <= 200; i++) {
      const f = G.f0 + i / 200 * SPAN_MHZ, us = curveAt(res.md, f);
      if (us === null) { on = false; continue; }
      if (on) g.lineTo(G.x(f), G.y(us)); else g.moveTo(G.x(f), G.y(us));
      on = true;
    }
    g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ffd166';
    const pts = res.slide.filter(v => v.ok), every = Math.max(1, Math.floor(pts.length / 900));
    for (let i = 0; i < pts.length; i += every) g.fillRect(G.x(pts[i].f) - 1, G.y(pts[i].us) - 1, 2, 2);
    if (st.pick !== null) { g.strokeStyle = css('--warn'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(G.x(st.pick), PAD.t); g.lineTo(G.x(st.pick), PAD.t + G.ph); g.stroke(); }
    g.restore();
    g.fillStyle = css('--muted'); g.strokeStyle = css('--rule'); g.font = FONT; g.textAlign = 'center';
    PG.ticks(G.f0, G.f1, 6).forEach(f => g.fillText(PG.num(f, 1), G.x(f), h - PAD.b + 14));
    g.fillText(T('ax.f'), PAD.l + G.pw / 2, h - 4);
    g.textAlign = 'right';
    PG.ticks(m.lo, m.hi, 5).forEach(us => g.fillText(PG.num(us, 0), PAD.l - 6, G.y(us) + 4));
    g.save(); g.translate(12, PAD.t + G.ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(T('ax.us'), 0, 0); g.restore();
    g.strokeStyle = css('--muted'); g.globalAlpha = .55; g.strokeRect(PAD.l, PAD.t, G.pw, G.ph); g.globalAlpha = 1;
  }

  // A polyline that breaks where a sample is missing.
  function line(pts) {
    let d = '', on = false;
    for (const p of pts) {
      if (!p) { on = false; continue; }
      d += (on ? ' L' : (d ? ' M' : 'M')) + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      on = true;
    }
    return d;
  }

  // One flat step per window across its own subchannel, joined where windows are neighbours.
  function stairs(list, val, fx, fy, width) {
    let d = '', last = null;
    for (const v of list) {
      if (!v.ok) { last = null; continue; }
      const a = fx(v.f - width / 2), b = fx(v.f + width / 2), y = fy(val(v));
      d += (last === null ? ' M' + a.toFixed(1) + ',' + y.toFixed(1) : ' L' + a.toFixed(1) + ',' + y.toFixed(1)) + ' L' + b.toFixed(1) + ',' + y.toFixed(1);
      last = v;
    }
    return d.trim();
  }

  function range(vals, pad, lo, hi) {
    let a = Math.min(...vals), b = Math.max(...vals);
    if (!isFinite(a) || !isFinite(b)) { a = 0; b = 1; }
    const p = (b - a) * pad || 1;
    return [Math.max(lo ?? -Infinity, a - p), Math.min(hi ?? Infinity, b + p)];
  }

  function freqPlot(svg, val, yl, yd, extra) {
    svg.replaceChildren();
    const a = res, P = PG.plot(svg, { x0: 58, x1: 892, y0: 8, y1: 200, xd: [st.lo, st.lo + SPAN_MHZ], yd, xl: T('ax.f'), yl, xf: v => PG.num(v, 1), yf: v => PG.num(v, 0) });
    PG.el(P.g, 'path', { d: stairs(a.step, val, P.fx, P.fy, a.B / 1e3), fill: 'none', stroke: 'var(--faint)', 'stroke-width': 2.2, opacity: .85 });
    if (a.slide !== a.step) PG.el(P.g, 'path', { d: line(a.slide.map(v => v.ok ? [P.fx(v.f), P.fy(val(v))] : null)), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1.3 });
    if (extra) extra(P);
    if (st.pick !== null) PG.el(P.g, 'line', { x1: P.fx(st.pick), x2: P.fx(st.pick), y1: 8, y2: 200, stroke: 'var(--warn)', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' });
    pickable(svg, 58, 892);
  }

  function drawAmp(svg) {
    const ok = res.slide.filter(v => v.ok).concat(res.step.filter(v => v.ok));
    freqPlot(svg, v => v.db, T('ax.db'), range(ok.map(v => v.db), 0.08, -10, 70));
  }

  function drawPhase(svg) {
    const ok = res.slide.filter(v => v.ok).concat(res.step.filter(v => v.ok));
    freqPlot(svg, v => v.ph, T('ax.rad'), range(ok.map(v => v.ph), 0.08), P => {
      res.step.filter(v => v.ok && v.lost).forEach(v => PG.el(P.g, 'circle', { cx: P.fx(v.f), cy: P.fy(v.ph), r: 3.2, fill: 'var(--warn)' }));
    });
  }

  function drawProfile(svg) {
    svg.replaceChildren();
    const v = picked();
    if (!v) return;
    const pr = profile(v), vals = pr.fine.map(p => p[1]);
    const P = PG.plot(svg, { x0: 58, x1: 892, y0: 8, y1: 200, xd: [ui.map.lo, ui.map.hi], yd: range(vals, 0.06, -12, 70), xl: T('ax.us'), yl: T('ax.db'), yf: v => PG.num(v, 0) });
    if (pr.gate !== null) PG.el(P.g, 'rect', { x: P.fx(pr.gate - res.gate), width: P.fx(pr.gate + res.gate) - P.fx(pr.gate - res.gate), y: 8, height: 192, style: 'fill:var(--accent-soft)' });
    PG.el(P.g, 'line', { x1: 58, x2: 892, y1: P.fy(0), y2: P.fy(0), stroke: 'var(--warn)', 'stroke-dasharray': '4 3', 'stroke-width': 1 });
    PG.el(P.g, 'path', { d: PG.path(pr.fine.map(p => [P.fx(p[0]), P.fy(p[1])])), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.3 });
    pr.bins.forEach(([us, db, peak]) => {
      PG.el(P.g, 'circle', { cx: P.fx(us), cy: P.fy(db), r: 2.6, fill: 'var(--accent)' });
      if (peak) PG.el(P.g, 'circle', { cx: P.fx(us), cy: P.fy(db), r: 6.5, fill: 'none', stroke: 'var(--warn)', 'stroke-width': 1.6 });
    });
  }

  const picked = () => {
    const ok = res.slide.filter(v => v.ok);
    if (!ok.length || st.pick === null) return null;
    return ok.reduce((a, v) => (Math.abs(v.f - st.pick) < Math.abs(a.f - st.pick) ? v : a));
  };

  // A click anywhere on a frequency axis picks the window there.
  function pickable(svg, x0, x1) {
    svg.onclick = e => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      if (p.x < x0 || p.x > x1) return;
      st.pick = st.lo + (p.x - x0) / (x1 - x0) * SPAN_MHZ;
      ui.cursor();
    };
  }

  /* ------------------------------------------------------------ page */

  function injectStyle() {
    if (document.getElementById('fr-style')) return;
    document.head.append(PG.h('style', { id: 'fr-style' }, [
      'canvas.fr-map { display: block; width: 100%; height: 280px; cursor: crosshair; }',
      '.fr svg.fig { cursor: crosshair; }',
      '.fr .ctl { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px 22px; align-items: end; }',
    ].join('\n')));
  }

  function load(root) {
    pending = root;
    root.append(PG.h('p', { class: 'cap' }, T('loading')));
    if (document.getElementById('fr-data')) return;
    document.head.append(PG.h('script', {
      id: 'fr-data', src: 'js/data/fr.js',
      onload: () => { if (pending && pending.isConnected) { pending.replaceChildren(); mount(pending); } },
      onerror: () => {
        if (!pending || !pending.isConnected) return;
        const none = PG.note();
        none.set('caution', T('none.lbl'), T('none.1'));
        pending.replaceChildren(none.root);
      },
    }));
  }

  function mount(root) {
    injectStyle();
    if (!DATA && Array.isArray(PG.frData) && PG.frData.length) DATA = PG.frData;
    if (!DATA) { load(root); return; }

    const src = PG.h('span', { class: 'eyebrow', style: 'display:block;margin-bottom:10px' });
    const sessions = PG.h('div'), modes = PG.h('div');
    const lo = PG.slider({ label: T('lo'), min: 0, max: 1, step: 0.05, value: 0, fmt: v => PG.num(v, 2) + '–' + PG.num(v + SPAN_MHZ, 2) + ' ' + PG.U('MHz'), onChange: v => { st.lo = v; st.pick = v + SPAN_MHZ / 2; compute(); } });
    const field = (label, ctl) => PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, label)), ctl);
    const subSeg = PG.seg(SUBS_KHZ.map(v => ({ value: v, label: PG.num(v, v % 1 ? 2 : 0) })), st.sub, v => { st.sub = v; compute(); });
    const ovSeg = PG.seg(OVERLAPS.map(v => ({ value: v, label: v >= 1 ? T('ov.every') : PG.num(v * 100, 0) + ' %' })), st.ov, v => { st.ov = v; compute(); });
    const cards = PG.cards([
      { key: 'sub', label: T('c.sub') }, { key: 'bin', label: T('c.bin') }, { key: 'step', label: T('c.step') },
      { key: 'snr', label: T('c.snr') }, { key: 'amb', label: T('c.amb') }, { key: 'gdd', label: T('c.gdd') },
    ]);
    const map = PG.h('canvas', { class: 'fr-map', role: 'img', 'aria-label': T('aria.map') });
    const pdpSvg = PG.svg(900, 236, T('pdp.cap')), ampSvg = PG.svg(900, 236, T('amp.cap')), phSvg = PG.svg(900, 236, T('ph.cap'));
    const pdpCap = PG.h('p', { class: 'cap' }), phCap = PG.h('p', { class: 'cap' });
    const note = PG.note();
    note.set('', T('n.lbl'), T('n.1'), T('n.2'), T('n.3'), T('n.4'), T('n.5'));

    map.addEventListener('click', e => {
      const b = map.getBoundingClientRect(), G = mapGeometry(b.width, b.height), f = G.f(e.clientX - b.left);
      if (f < G.f0 || f > G.f1) return;
      st.pick = f; cursor();
    });

    function cursor() {
      const v = picked();
      pdpCap.textContent = T('pdp.cap', { f: v ? PG.num(v.f, 3) : '–' });
      drawMap(map); drawProfile(pdpSvg); drawAmp(ampSvg); drawPhase(phSvg);
    }
    function compute() {
      res = analyse();
      ui.map = powerMap();
      const a = res, n = a.slide.length, m = a.step.length;
      cards.set('sub', PG.num(a.B, 2) + ' ' + PG.U('kHz'), T('c.sub.s', { t: PG.num(a.Tw, 3), l: a.L }));
      cards.set('bin', PG.num(a.binUs, 1) + ' ' + PG.U('us'), T('c.bin.s', { km: PG.num(a.binUs * rec.d.km_per_us, 2) }));
      cards.set('step', PG.num(a.hop / rec.sr * rec.k / 1e3, a.hop === 1 ? 3 : 2) + ' ' + PG.U('kHz'), T('c.step.s', { n: a.perMHz(n), m: a.perMHz(m) }));
      cards.set('snr', PG.num(a.snr, 1) + ' ' + PG.U('dB'), T('c.snr.s'));
      cards.set('amb', a.amb.slide.jumps + ' / ' + a.amb.slide.steps, T('c.amb.s', { m: a.amb.step.jumps, k: a.amb.step.steps }));
      cards.set('gdd', PG.num(a.gddPhase, 1) + ' ' + PG.U('usMHz'), T('c.gdd.s', { v: PG.num(a.gddTrace, 1) + ' ' + PG.U('usMHz') }));
      phCap.textContent = T('ph.cap', { t: PG.num(a.tau0, 0) });
      cursor();
    }
    function session() {
      const d = DATA[st.s];
      rec = record(d);
      if (st.mode >= d.modes.length) st.mode = 0;
      const lo0 = Math.ceil(d.f_lo * 20) / 20 + 0.05, hi0 = Math.floor((d.f_hi - SPAN_MHZ) * 20) / 20 - 0.05;
      if (st.lo === null || st.lo < lo0 || st.lo > hi0) st.lo = Math.round((lo0 + hi0) / 2 * 20) / 20;
      lo.input.min = lo0; lo.input.max = hi0; lo.set(st.lo);
      st.pick = st.lo + SPAN_MHZ / 2;
      src.textContent = T('src', { c: d.circuit, d: d.utc, sr: PG.num(d.sr_hz, 1), a: PG.num(d.f_lo, 2), b: PG.num(d.f_hi, 2) });
      modes.replaceChildren(field(T('mode'), PG.seg(d.modes.map((m, k) => ({ value: k, label: m.name })), st.mode, v => { st.mode = v; compute(); })));
      compute();
    }

    sessions.replaceChildren(PG.seg(DATA.map((d, k) => ({ value: k, label: hhmm(d), title: d.source })), st.s, v => { st.s = v; st.lo = null; session(); }));
    const panel = (...kids) => PG.h('div', { class: 'panel' }, ...kids);
    root.append(PG.h('div', { class: 'fr' },
      panel(src, PG.h('div', { class: 'ctl' }, field(T('session'), sessions), modes, field(T('sub'), subSeg), field(T('ov'), ovSeg), lo.root)),
      cards.root,
      panel(PG.h('p', { class: 'cap' }, T('map.cap')), map,
        PG.legend([['dash', 'border-color:#9aa', T('l.curve')], ['dot', 'background:#ffd166', T('l.peak')], ['line', 'border-color:var(--warn)', T('l.pick')]])),
      panel(pdpCap, pdpSvg, PG.legend([['line', 'border-color:var(--ink)', T('l.fine')], ['dot', 'background:var(--accent)', T('l.bins')], ['ring', 'border-color:var(--warn)', T('l.peak')], ['box', 'background:var(--accent-soft)', T('l.gate')]])),
      panel(PG.h('p', { class: 'cap' }, T('amp.cap')), ampSvg, PG.legend([['line', 'border-color:var(--faint)', T('l.step')], ['line', 'border-color:var(--accent)', T('l.slide')]])),
      panel(phCap, phSvg, PG.legend([['line', 'border-color:var(--faint)', T('l.step')], ['line', 'border-color:var(--accent)', T('l.slide')], ['dot', 'background:var(--warn)', T('l.lost')]])),
      note.root));
    ui = { root, cursor, map: null };
    session();
  }

  // The map is a canvas: it takes its colours when drawn, so a theme switch or a new width redraws it.
  const redraw = () => { if (ui && ui.root.isConnected && res) ui.cursor(); };
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw); } catch (e) { /* old browsers */ }
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(redraw, 120); });

  PG.register({ id: 'fr', mount });
})();
