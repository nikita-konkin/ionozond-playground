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
      'fr.short': "Оценка АЧХ и ФЧХ моды по максимуму ПЗМ в каждом окне записи. Сравниваются окна без перекрытия и скользящие окна, позволяющие чаще оценивать характеристику и последовательно разворачивать фазу.",
      'fr.lede': "Запись сигнала разностной частоты разбивается на временные окна. Спектр каждого окна соответствует мгновенному профилю мощности по задержке (ПЗМ); комплексное значение в его максимуме используется как отсчёт частотной характеристики моды в подканале шириной kT. Без перекрытия на подканал приходится один отсчёт ЧХ, поэтому график имеет ступенчатый вид. При скользящем окне значения можно получать почти для каждого отсчёта записи. Малое изменение фазы между соседними окнами позволяет последовательно устранить её неоднозначность по модулю 2π. Расчёт выполняется на странице по комплексным отсчётам записей реальных сеансов за 17 октября.",
      'fr.loading': 'Загружаются данные…',
      'fr.none.lbl': 'Данных нет',
      'fr.none.1': 'Файл js/data/fr.js не найден. Его собирает tools/fr_data.py из сеансов с окном эха, продуктов .h5 с полем z или записей .lfs; ионограммы мощности для этой страницы не годятся — нужна фаза.',
      'fr.src': 'данные: {c}, {d}; окно эха, {sr} Гц, в данных {a}–{b} МГц',
      'fr.session': 'Сеанс', 'fr.mode': 'Мода: строб поиска пика вокруг её ДЧХ', 'fr.sub': 'Подканал kT, кГц',
      'fr.ov': 'Перекрытие окон', 'fr.ov.every': 'на каждом отсчёте', 'fr.lo': 'Участок 1 МГц',
      'fr.c.sub': 'Подканал', 'fr.c.sub.s': 'окно {t} с, {l} отсчётов окна эха',
      'fr.c.bin': 'Отсчёт задержки', 'fr.c.bin.s': '1/(kT), {km} км',
      'fr.c.step': 'Шаг ЧХ', 'fr.c.step.s': '{n} отсчётов на 1 МГц; без перекрытия — {m}',
      'fr.c.snr': 'ОСШ в пике', 'fr.c.snr.s': 'медиана по окнам, относительно шума в отсчёте',
      'fr.c.amb': 'Шагов фазы > π/2', 'fr.c.amb.s': 'с перекрытием; без него — {m} из {k}',
      'fr.c.gdd': 'GDD по ФЧХ', 'fr.c.gdd.s': 'по кривизне фазы; по наклону следа {v}',
      'fr.map.cap': 'Мгновенные ПЗМ вдоль участка: столбцы — окна, по вертикали задержка, цвет — превышение мощности над шумом, 0–40 дБ. Пунктир — ДЧХ моды из состояния, тонкие линии — границы строба, точки — пики ПЗМ в нём. Щелчок выбирает окно для ПЗМ ниже.',
      'fr.pdp.cap': 'Мгновенный ПЗМ окна на {f}: линия — спектр окна на тонкой сетке, точки — отсчёты БПФ с шагом 1/(kT), заливка — строб, кружок — пик, из которого берётся отсчёт ЧХ.',
      'fr.amp.cap': 'АЧХ: |H| в пике ПЗМ, дБ над шумом. Серые ступени — окна без перекрытия, по отсчёту на подканал; линия — окна с выбранным перекрытием.',
      'fr.ph.cap': 'ФЧХ: фаза отсчёта в пике, развёрнутая вдоль частоты, за вычетом линейного набега 2πfτ₀, τ₀ = {t} мкс. Изгиб — дисперсия внутри моды, наклон — отличие групповой задержки от τ₀. Оранжевые точки — ступени, которые при развёртывании фазы без перекрытия ушли на целый оборот и больше.',
      'fr.ax.f': 'частота, МГц', 'fr.ax.us': 'задержка, мкс', 'fr.ax.db': 'дБ над шумом', 'fr.ax.rad': 'фаза, рад',
      'fr.l.step': 'без перекрытия', 'fr.l.slide': 'с перекрытием', 'fr.l.curve': 'ДЧХ моды', 'fr.l.peak': 'пики ПЗМ',
      'fr.l.gate': 'строб', 'fr.l.bins': 'отсчёты БПФ', 'fr.l.fine': 'спектр окна', 'fr.l.lost': "ошибка на целое число оборотов фазы", 'fr.l.pick': 'выбранное окно',
      'fr.aria.map': 'Мгновенные ПЗМ вдоль участка: частота по горизонтали, задержка по вертикали, мощность цветом.',
      'fr.n.lbl': "Метод расчёта",
      'fr.n.1': 'Окно Ханна длиной T = B/k (k = 100 кГц/с) сдвигается по сигналу разностной частоты с шагом (1 − перекрытие)·T. В каждом окне спектр вычисляется в отсчётах с шагом 1/T внутри строба — по умолчанию ±max(60 мкс; 1,5 отсчёта) вокруг ДЧХ моды; строб можно сдвинуть, сузить или расширить, а его центр закрепить на одной задержке для всего участка; из них берётся отсчёт с наибольшей мощностью и его комплексное значение. Это и есть способ «пик ПЗМ → отсчёт ЧХ»; с перекрытием отсчёты идут чаще, но каждый по-прежнему усреднён по своему подканалу шириной B.',
      'fr.n.2': 'Чтобы фазу можно было развернуть, у всех окон должна быть общая точка отсчёта фазы. Фаза БПФ отсчитывается от начала окна: при окнах подряд это не мешает, а при перекрытии добавляет набег 2π·m·s/N, где m — номер отсчёта спектра, s — сдвиг начала окна в отсчётах сигнала. Поэтому спектр здесь считается в абсолютном времени развёртки, а значение в пике приводится к одной опорной задержке τ₀ для всех окон: H = X·exp(j2π(bₘ − b₀)t), где bₘ — разностная частота отсчёта с пиком, b₀ — частота, соответствующая τ₀, t — середина окна. Тогда переход пика в соседний отсчёт не даёт скачка, а соседние окна различаются по фазе на 2π(τ − τ₀)·k·Δt.',
      'fr.n.3': 'Фаза разворачивается однозначно, пока этот шаг меньше π, то есть пока |τ − τ₀| < 1/(2k·Δt). Без перекрытия Δt = T, и предел — половина шага по задержке: у моды с заметной дисперсией задержка за 1 МГц уходит дальше, и ступенчатая ФЧХ теряет обороты. С перекрытием 50 % запас вдвое больше, а окно на каждом отсчёте (в окне эха это 1,125 мс, 112,5 Гц развёртки) отодвигает предел до 4,4 мс.',
      'fr.n.4': 'Перекрытие не улучшает разрешение: каждый отсчёт ЧХ — среднее по подканалу B, шаг по задержке остаётся 1/(kT), соседние отсчёты сильно коррелированы. Окно на каждом отсчёте — то же, что второе сжатие вдоль ДЧХ с фильтром Ханна длиной T (схема 2 в описании имитатора). Зато перекрытие показывает биения двух лучей, попавших в один отсчёт задержки, например о- и x-компонент: их сумма меняется вдоль частоты с периодом 1/Δτ, где Δτ — разность их задержек. При Δτ = 30 мкс период — 33 кГц; окна подряд по 20 кГц дают отсчёт через 20 кГц и этот период не разрешают, а перекрытие 90 % даёт отсчёт через 2 кГц. По периоду биений можно оценить Δτ. Когда подканал шире 1/Δτ, лучи попадают в разные отсчёты задержки и вместо биений видны два пика; чтобы следить за одним из них, строб сужают и сдвигают на него.',
      'fr.n.5': 'На восходящей развёртке 1 МГц — это 10 с, поэтому вдоль частоты здесь смешаны частотная избирательность и замирания за эти 10 с (время когерентности около 0,5 с — 50 кГц развёртки). Это H(f, t) вдоль диагонали f = f₀ + kt, а не мгновенная ЧХ; поэтому она и не похожа на |H(f, t)| имитатора на одной несущей, где частота и время разделены.',
      'fr.n.6': 'Широкий подканал сужает отсчёт задержки: при 102,4 кГц он около 10 мкс (3 км), и о- и x-компоненты расходятся по разным отсчётам, как только разность их задержек больше этого. Но окно тогда длится T = B/k ≈ 1 с, дольше времени когерентности, и пик размывается: доплеровское расширение νD сдвигает отсчёт по задержке на νD/k (1 Гц — 10 мкс), а дисперсия моды — на |dτ/df|·B. У 1F вдали от МПЧ второе слагаемое — единицы микросекунд, вблизи МПЧ оно быстро растёт. Расширять подканал имеет смысл, пока оба слагаемых меньше 1/B.',
      'fr.gate.c': 'Центр строба', 'fr.gate.curve': 'по ДЧХ', 'fr.gate.fixed': 'одна задержка',
      'fr.gate.shift': 'Сдвиг строба', 'fr.gate.half': 'Полуширина строба', 'fr.gate.auto': 'авто, {v} мкс',
      'fr.rel': 'f/МПЧ {a}–{b}', 'fr.ax.rel': 'f/МПЧ', 'fr.at': '{f} МГц', 'fr.at.rel': '{f} МГц, f/МПЧ {r}',
      'fr.c.muf': 'МПЧ сеанса', 'fr.c.muf.s': 'участок: {r}; верх моды {m} — {t} МГц', 'fr.c.muf.none': 'ионограммы этого сеанса нет в данных',
      'fr.ion.cap': 'Ионограмма сеанса (реальная, из данных страницы имитатора): по горизонтали частота, по вертикали задержка, сверху — частота в долях МПЧ. Светлая полоса — 4 МГц, записанные для этой страницы, рамка — выбранный участок 1 МГц и диапазон задержек карты ниже, линии — ДЧХ мод (выбранная ярче), штрих — МПЧ сеанса, {m} МГц. Щелчок переносит участок.',
      'fr.aria.ion': 'Ионограмма сеанса с выбранным участком, ДЧХ мод и МПЧ.',
      'fr.l.stretch': 'участок', 'fr.l.muf': 'МПЧ', 'fr.l.edge': 'границы строба',
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
      'fr.map.cap': 'Instantaneous delay power profiles along the stretch: columns are windows, delay runs up, colour is power above a bin’s noise, 0–40 dB. Dashes, the mode’s curve from the state; thin lines, the gate’s edges; dots, the profiles’ peaks within it. A click picks the window for the profile below.',
      'fr.pdp.cap': 'Instantaneous delay power profile of the window at {f}: the line is the window’s spectrum on a fine grid, the dots its FFT bins 1/(kT) apart, the shading the gate, the ring the peak that gives the response sample.',
      'fr.amp.cap': 'Magnitude: |H| at the profile’s peak, dB above a bin’s noise. Grey steps, windows without overlap, one sample per subchannel; the line, windows with the chosen overlap.',
      'fr.ph.cap': 'Phase: the peak sample’s phase unwrapped along frequency, less the linear term 2πfτ₀, τ₀ = {t} µs. Curvature is dispersion within the mode, slope the group delay’s offset from τ₀. Orange dots are steps the unwrapping without overlap has carried off by a turn or more.',
      'fr.ax.f': 'frequency, MHz', 'fr.ax.us': 'delay, µs', 'fr.ax.db': 'dB above noise', 'fr.ax.rad': 'phase, rad',
      'fr.l.step': 'without overlap', 'fr.l.slide': 'with overlap', 'fr.l.curve': 'mode curve', 'fr.l.peak': 'profile peaks',
      'fr.l.gate': 'gate', 'fr.l.bins': 'FFT bins', 'fr.l.fine': 'window spectrum', 'fr.l.lost': 'turn lost', 'fr.l.pick': 'chosen window',
      'fr.aria.map': 'Instantaneous delay power profiles along the stretch: frequency across, delay up, power as colour.',
      'fr.n.lbl': 'How it is computed',
      'fr.n.1': 'A Hann window T = B/k long (k = 100 kHz/s) steps along the beat by (1 − overlap)·T. In each window the spectrum is computed on bins 1/T apart within a gate, by default ±max(60 µs, 1.5 bins) around the mode’s curve; the gate can be shifted, narrowed or widened, and its centre held at one delay for the whole stretch; the strongest bin and its complex value are kept. That is the “profile peak → response sample” method; with overlap the samples come more often, but each is still an average over its own subchannel B wide.',
      'fr.n.2': 'For the phase to unwrap, all windows need one reference. An FFT counts phase from the window’s start: windows one after another do not mind, but overlapping ones get an extra 2π·m·s/N, m the bin and s the window’s offset in samples. So the spectrum here is taken in the sweep’s absolute time, and every sample is brought to one reference delay τ₀: H = X·exp(j2π(bₘ − b₀)t), bₘ the peak bin’s beat, b₀ that of τ₀, t the window’s middle. A change of peak bin then makes no jump, and neighbouring windows differ in phase by 2π(τ − τ₀)·k·Δt.',
      'fr.n.3': 'Unwrapping is unambiguous while that step is below π, that is while |τ − τ₀| < 1/(2k·Δt). Without overlap Δt = T, and the limit is half a delay bin: a mode with noticeable dispersion moves further than that over 1 MHz, and the stepped phase loses turns. A 50 % overlap doubles the margin, and a window at every sample (1.125 ms, 112.5 Hz of sweep, in the echo window) moves the limit to 4.4 ms.',
      'fr.n.4': 'Overlap does not improve resolution: each response sample is an average over its subchannel B, the delay bin stays 1/(kT), and neighbouring samples are strongly correlated. A window at every sample is the second dechirp along the curve with a Hann filter T long (board 2 of the simulator notes). What overlap does show is the beating of two rays in one delay bin, such as the o and x components: their sum changes along frequency with a period of 1/Δτ, Δτ the difference of their delays. With Δτ = 30 µs the period is 33 kHz; windows one after another, 20 kHz each, sample it every 20 kHz and cannot resolve it, while a 90 % overlap samples it every 2 kHz. The period gives Δτ. Once the subchannel is wider than 1/Δτ, the rays fall into different delay bins and two peaks replace the beating; to follow one of them, narrow the gate and shift it onto that peak.',
      'fr.n.5': 'On an up-sweep 1 MHz is 10 s, so along frequency this mixes frequency selectivity with the fading of those 10 s (a coherence time of about 0.5 s, 50 kHz of sweep). It is H(f, t) along the diagonal f = f₀ + kt, not an instantaneous response, which is why it does not look like the simulator’s |H(f, t)| at one carrier, where frequency and time are apart.',
      'fr.n.6': 'A wide subchannel narrows the delay bin: at 102.4 kHz it is about 10 µs (3 km), and the o and x components fall into different bins once their delays differ by more than that. But the window then lasts T = B/k ≈ 1 s, longer than the coherence time, and the peak smears: a Doppler spread νD moves it in delay by νD/k (1 Hz is 10 µs), and the mode’s dispersion by |dτ/df|·B. For 1F away from the MUF the second term is a few microseconds; near the MUF it grows fast. Widening the subchannel pays while both terms stay below 1/B.',
      'fr.gate.c': 'Gate centre', 'fr.gate.curve': 'on the curve', 'fr.gate.fixed': 'one delay',
      'fr.gate.shift': 'Gate shift', 'fr.gate.half': 'Gate half-width', 'fr.gate.auto': 'auto, {v} µs',
      'fr.rel': 'f/MUF {a}–{b}', 'fr.ax.rel': 'f/MUF', 'fr.at': '{f} MHz', 'fr.at.rel': '{f} MHz, f/MUF {r}',
      'fr.c.muf': 'Sounding MUF', 'fr.c.muf.s': 'stretch: {r}; mode {m} tops out at {t} MHz', 'fr.c.muf.none': 'no ionogram of this sounding in the data',
      'fr.ion.cap': 'The sounding’s ionogram (real, from the simulator page’s data): frequency across, delay up, and frequency as a share of the MUF along the top. The bright band is the 4 MHz kept for this page, the frame the chosen 1 MHz stretch and the delays of the map below, the lines the modes’ curves (the chosen one brighter), the dashes the sounding’s MUF, {m} MHz. A click moves the stretch.',
      'fr.aria.ion': 'The sounding’s ionogram with the chosen stretch, the modes’ curves and the MUF.',
      'fr.l.stretch': 'stretch', 'fr.l.muf': 'MUF', 'fr.l.edge': 'gate edges',
    },
  });

  /* ------------------------------------------------------------ constants */

  const SUBS_KHZ = [5.12, 8, 10.24, 20.48, 40.96, 61.44, 81.92, 102.4];
  const OVERLAPS = [0, 0.5, 0.75, 0.9, 1];     // 1: a window starting at every sample
  const SPAN_MHZ = 1;
  const NOISE_US = [12400, 12600, 12800, 13000];  // inside the echo window, clear of every mode on this path
  const GATE_US = 60, GATE_BINS = 1.5;         // the automatic half-width of the peak search around the mode's curve
  const GATE_SHIFT_US = 300, GATE_HALF_US = 300, GATE_STEP_US = 5;
  const MAP_COLS = 240, MAP_PAD_US = 250, MAP_DB = [0, 40];
  const MIN_SNR_DB = 6;                        // samples weaker than this stay out of the GDD fits
  const PAD = { l: 58, r: 8, t: 20, b: 32 };
  const FONT = '11px "IBM Plex Mono", ui-monospace, monospace';
  const TWO_PI = 2 * Math.PI;

  const st = { s: 0, mode: 0, sub: 20.48, ov: 0.5, lo: null, pick: null, fixed: false, shift: 0, half: 0 };
  let DATA = null, ui = null, rec = null, res = null, pending = null, sim = null;

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

  // The curve's delay at f, or at its nearer end when f lies outside its band.
  const curveNear = (m, f) => (m ? curveAt(m, PG.clamp(f, m.f[0], m.f[m.f.length - 1])) : null);

  // The sounding's MUF, from the simulator page's ionogram of it; null when that page does not carry it.
  const muf = () => (sim && sim.muf && sim.muf.real) || null;
  const rel = (a, b) => (muf() ? T('rel', { a: PG.num(a / muf(), 2), b: PG.num(b / muf(), 2) }) : '');
  const at = f => (muf() ? T('at.rel', { f: PG.num(f, 3), r: PG.num(f / muf(), 3) }) : T('at', { f: PG.num(f, 3) }));

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
    const binUs = Math.abs(r.delay(1 / Tw) - r.delay(0)), auto = Math.max(GATE_US, GATE_BINS * binUs), gate = st.half > 0 ? st.half : auto;
    const held = curveNear(md, st.lo + SPAN_MHZ / 2);
    const centre = f => { const c = st.fixed ? held : curveAt(md, f); return c === null ? null : c + st.shift; };
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
        const tc = r.t(s + (L - 1) / 2), f = r.f(tc), tau = centre(f);
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
      L, Tw, B: r.k * Tw / 1e3, hop, w, binUs, gate, auto, centre, s0, s1, step, slide, noise, tau0, md,
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
    const edge = [0, 0.25, 0.5, 0.75, 1].map(x => a.centre(st.lo + x * SPAN_MHZ)).filter(v => v !== null);
    const lo = Math.min(Math.max(bot, a.tau0 - 600) - MAP_PAD_US, ...edge.map(v => v - a.gate - 2 * a.binUs));
    const hi = Math.max(Math.min(top, a.tau0 + 600) + MAP_PAD_US, ...edge.map(v => v + a.gate + 2 * a.binUs));
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
    return { fine, bins, gate: a.centre(v.f) };
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
    const trace = of => {
      g.beginPath();
      let on = false;
      for (let i = 0; i <= 200; i++) {
        const f = G.f0 + i / 200 * SPAN_MHZ, us = of(f);
        if (us === null) { on = false; continue; }
        if (on) g.lineTo(G.x(f), G.y(us)); else g.moveTo(G.x(f), G.y(us));
        on = true;
      }
      g.stroke();
    };
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1;
    [-1, 1].forEach(k => trace(f => { const c = res.centre(f); return c === null ? null : c + k * res.gate; }));
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.setLineDash([5, 4]);
    trace(f => curveAt(res.md, f));
    g.setLineDash([]);
    g.fillStyle = '#ffd166';
    const pts = res.slide.filter(v => v.ok), every = Math.max(1, Math.floor(pts.length / 900));
    for (let i = 0; i < pts.length; i += every) g.fillRect(G.x(pts[i].f) - 1, G.y(pts[i].us) - 1, 2, 2);
    if (st.pick !== null) { g.strokeStyle = css('--warn'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(G.x(st.pick), PAD.t); g.lineTo(G.x(st.pick), PAD.t + G.ph); g.stroke(); }
    g.restore();
    g.fillStyle = css('--muted'); g.strokeStyle = css('--rule'); g.font = FONT; g.textAlign = 'center';
    PG.ticks(G.f0, G.f1, 6).forEach(f => g.fillText(PG.num(f, 1), G.x(f), h - PAD.b + 14));
    g.fillText(T('ax.f'), PAD.l + G.pw / 2, h - 4);
    relAxis(g, G.x, G.f0, G.f1);
    g.fillStyle = css('--muted'); g.textAlign = 'right';
    PG.ticks(m.lo, m.hi, 5).forEach(us => g.fillText(PG.num(us, 0), PAD.l - 6, G.y(us) + 4));
    g.save(); g.translate(12, PAD.t + G.ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(T('ax.us'), 0, 0); g.restore();
    g.strokeStyle = css('--muted'); g.globalAlpha = .55; g.strokeRect(PAD.l, PAD.t, G.pw, G.ph); g.globalAlpha = 1;
  }

  // Frequency as a share of the sounding's MUF, along the top edge of a canvas plot.
  function relAxis(g, x, f0, f1) {
    if (!muf()) return;
    g.fillStyle = css('--muted'); g.font = FONT; g.textAlign = 'center';
    const t = PG.ticks(f0 / muf(), f1 / muf(), 5), dec = t.length > 1 ? Math.max(1, Math.ceil(-Math.log10(t[1] - t[0]) - 1e-9)) : 2;
    t.filter(v => x(v * muf()) > PAD.l + 20).forEach(v => g.fillText(PG.num(v, dec), x(v * muf()), PAD.t - 7));
    g.textAlign = 'right';
    g.fillText(T('ax.rel'), PAD.l - 6, PAD.t - 7);
  }

  function ionGeometry(w, h) {
    const s = sim, per = s.km_per_us || 0.3, km = s.range.km, half = s.bin_km / 2, pw = w - PAD.l - PAD.r, ph = h - PAD.t - PAD.b;
    const top = (Math.max(km[0], km[km.length - 1]) + half) / per, bot = (Math.min(km[0], km[km.length - 1]) - half) / per;
    const f0 = s.freq.lo - s.freq.step / 2, f1 = s.freq.lo + (s.freq.n - 0.5) * s.freq.step;
    return { x: f => PAD.l + (f - f0) / (f1 - f0) * pw, y: us => PAD.t + (top - us) / (top - bot) * ph, f: x => f0 + (x - PAD.l) / pw * (f1 - f0), f0, f1, top, bot, pw, ph, per };
  }

  // The real ionogram as an image, a pixel per cell, the longest delay in the top row; kept per sounding.
  function ionImage() {
    if (ui.ion && ui.ion.src === sim.source) return ui.ion.img;
    const n = sim.freq.n, km = sim.range.km, m = km.length, bin = atob(sim.maps.real), img = new ImageData(n, m), down = km[0] > km[m - 1];
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const q = bin.charCodeAt(i * m + j) * 3, p = ((down ? j : m - 1 - j) * n + i) * 4;
      img.data[p] = PG.VIRIDIS[q]; img.data[p + 1] = PG.VIRIDIS[q + 1]; img.data[p + 2] = PG.VIRIDIS[q + 2]; img.data[p + 3] = 255;
    }
    const off = document.createElement('canvas');
    off.width = n; off.height = m; off.getContext('2d').putImageData(img, 0, 0);
    ui.ion = { src: sim.source, img: off };
    return off;
  }

  // The sounding's ionogram with the page's band, the stretch and the map's delays, the modes and the MUF on it.
  function drawIon(canvas) {
    const [g, w, h] = sizeCanvas(canvas), s = sim, d = rec.d, G = ionGeometry(w, h), M = muf();
    g.clearRect(0, 0, w, h);
    g.imageSmoothingEnabled = false;
    g.drawImage(ionImage(), PAD.l, PAD.t, G.pw, G.ph);
    g.save(); g.beginPath(); g.rect(PAD.l, PAD.t, G.pw, G.ph); g.clip();
    g.fillStyle = 'rgba(0,0,0,0.5)';
    g.fillRect(PAD.l, PAD.t, G.x(d.f_lo) - PAD.l, G.ph);
    g.fillRect(G.x(d.f_hi), PAD.t, PAD.l + G.pw - G.x(d.f_hi), G.ph);
    s.modes.forEach(md => {
      const sel = md.name === res.md.name;
      g.strokeStyle = sel ? '#ffffff' : 'rgba(255,255,255,0.45)'; g.lineWidth = sel ? 1.6 : 1;
      g.beginPath();
      let on = false;
      md.km.forEach((km, i) => {
        if (km === null) { on = false; return; }
        const x = G.x(s.freq.lo + i * s.freq.step), y = G.y(km / G.per);
        if (on) g.lineTo(x, y); else g.moveTo(x, y);
        on = true;
      });
      g.stroke();
    });
    g.strokeStyle = '#ff8a65'; g.lineWidth = 1.6;
    g.strokeRect(G.x(st.lo), G.y(ui.map.hi), G.x(st.lo + SPAN_MHZ) - G.x(st.lo), G.y(ui.map.lo) - G.y(ui.map.hi));
    if (M) {
      g.strokeStyle = '#ffd166'; g.lineWidth = 1.4; g.setLineDash([5, 4]);
      g.beginPath(); g.moveTo(G.x(M), PAD.t); g.lineTo(G.x(M), PAD.t + G.ph); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#ffd166'; g.font = FONT; g.textAlign = 'right';
      g.fillText(T('l.muf') + ' ' + PG.num(M, 2), G.x(M) - 5, PAD.t + 13);
    }
    g.restore();
    g.fillStyle = css('--muted'); g.font = FONT; g.textAlign = 'center';
    PG.ticks(G.f0, G.f1, 8).forEach(f => g.fillText(PG.num(f, f % 1 ? 1 : 0), G.x(f), h - PAD.b + 14));
    g.fillText(T('ax.f'), PAD.l + G.pw / 2, h - 4);
    relAxis(g, G.x, G.f0, G.f1);
    g.fillStyle = css('--muted'); g.textAlign = 'right';
    PG.ticks(G.bot, G.top, 4).forEach(us => g.fillText(PG.num(us, 0), PAD.l - 6, G.y(us) + 4));
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
      'canvas.fr-ion { display: block; width: 100%; height: 240px; cursor: pointer; }',
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
    const loRel = PG.h('span', { style: 'display:block;margin-top:4px;font:12px IBM Plex Mono,ui-monospace,monospace;color:var(--muted)' });
    const lo = PG.slider({ label: T('lo'), min: 0, max: 1, step: 0.05, value: 0, fmt: v => PG.num(v, 2) + '–' + PG.num(v + SPAN_MHZ, 2) + ' ' + PG.U('MHz'), onChange: v => move(v), extra: loRel });
    const field = (label, ctl) => PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, label)), ctl);
    const subSeg = PG.seg(SUBS_KHZ.map(v => ({ value: v, label: PG.num(v, v % 1 ? 2 : 0) })), st.sub, v => { st.sub = v; compute(); });
    const ovSeg = PG.seg(OVERLAPS.map(v => ({ value: v, label: v >= 1 ? T('ov.every') : PG.num(v * 100, 0) + ' %' })), st.ov, v => { st.ov = v; compute(); });
    const gateSeg = PG.seg([{ value: false, label: T('gate.curve') }, { value: true, label: T('gate.fixed') }], st.fixed, v => { st.fixed = v; compute(); });
    const shift = PG.slider({ label: T('gate.shift'), min: -GATE_SHIFT_US, max: GATE_SHIFT_US, step: GATE_STEP_US, value: st.shift, fmt: v => (v > 0 ? '+' : v < 0 ? '−' : '') + PG.num(Math.abs(v), 0) + ' ' + PG.U('us'), onChange: v => { st.shift = v; compute(); } });
    const half = PG.slider({ label: T('gate.half'), min: 0, max: GATE_HALF_US, step: GATE_STEP_US, value: st.half, fmt: v => (v > 0 ? PG.num(v, 0) + ' ' + PG.U('us') : T('gate.auto', { v: res ? PG.num(res.auto, 0) : '–' })), onChange: v => { st.half = v; compute(); } });
    const cards = PG.cards([
      { key: 'sub', label: T('c.sub') }, { key: 'bin', label: T('c.bin') }, { key: 'step', label: T('c.step') },
      { key: 'snr', label: T('c.snr') }, { key: 'amb', label: T('c.amb') }, { key: 'gdd', label: T('c.gdd') },
      { key: 'muf', label: T('c.muf') },
    ]);
    const map = PG.h('canvas', { class: 'fr-map', role: 'img', 'aria-label': T('aria.map') });
    const ion = PG.h('canvas', { class: 'fr-ion', role: 'img', 'aria-label': T('aria.ion') }), ionCap = PG.h('p', { class: 'cap' });
    const ionPanel = PG.h('div', { class: 'panel' }, ionCap, ion,
      PG.legend([['box', 'background:transparent;border:1.6px solid #ff8a65', T('l.stretch')], ['line', 'border-color:#9aa', T('l.curve')], ['dash', 'border-color:#ffd166', T('l.muf')]]));
    const pdpSvg = PG.svg(900, 236, T('pdp.cap')), ampSvg = PG.svg(900, 236, T('amp.cap')), phSvg = PG.svg(900, 236, T('ph.cap'));
    const pdpCap = PG.h('p', { class: 'cap' }), phCap = PG.h('p', { class: 'cap' });
    const note = PG.note();
    note.set('', T('n.lbl'), T('n.1'), T('n.2'), T('n.3'), T('n.4'), T('n.5'), T('n.6'));

    map.addEventListener('click', e => {
      const b = map.getBoundingClientRect(), G = mapGeometry(b.width, b.height), f = G.f(e.clientX - b.left);
      if (f < G.f0 || f > G.f1) return;
      st.pick = f; cursor();
    });
    ion.addEventListener('click', e => {
      const b = ion.getBoundingClientRect();
      move(ionGeometry(b.width, b.height).f(e.clientX - b.left) - SPAN_MHZ / 2);
    });

    function move(v) {
      st.lo = PG.clamp(Math.round(v * 20) / 20, +lo.input.min, +lo.input.max);
      st.pick = st.lo + SPAN_MHZ / 2;
      lo.set(st.lo);
      compute();
    }

    function cursor() {
      const v = picked();
      pdpCap.textContent = T('pdp.cap', { f: v ? at(v.f) : '–' });
      if (sim) drawIon(ion);
      drawMap(map); drawProfile(pdpSvg); drawAmp(ampSvg); drawPhase(phSvg);
    }
    function compute() {
      res = analyse();
      ui.map = powerMap();
      half.refresh();
      loRel.textContent = rel(st.lo, st.lo + SPAN_MHZ);
      const a = res, n = a.slide.length, m = a.step.length;
      cards.set('sub', PG.num(a.B, 2) + ' ' + PG.U('kHz'), T('c.sub.s', { t: PG.num(a.Tw, 3), l: a.L }));
      cards.set('bin', PG.num(a.binUs, 1) + ' ' + PG.U('us'), T('c.bin.s', { km: PG.num(a.binUs * rec.d.km_per_us, 2) }));
      cards.set('step', PG.num(a.hop / rec.sr * rec.k / 1e3, a.hop === 1 ? 3 : 2) + ' ' + PG.U('kHz'), T('c.step.s', { n: a.perMHz(n), m: a.perMHz(m) }));
      cards.set('snr', PG.num(a.snr, 1) + ' ' + PG.U('dB'), T('c.snr.s'));
      cards.set('amb', a.amb.slide.jumps + ' / ' + a.amb.slide.steps, T('c.amb.s', { m: a.amb.step.jumps, k: a.amb.step.steps }));
      cards.set('gdd', PG.num(a.gddPhase, 1) + ' ' + PG.U('usMHz'), T('c.gdd.s', { v: PG.num(a.gddTrace, 1) + ' ' + PG.U('usMHz') }));
      const mode = sim && sim.modes.find(md => md.name === a.md.name);
      cards.set('muf', muf() ? PG.num(muf(), 2) + ' ' + PG.U('MHz') : '–', muf() ? T('c.muf.s', { r: rel(st.lo, st.lo + SPAN_MHZ), m: a.md.name, t: mode ? PG.num(mode.f_hi, 2) : '–' }) : T('c.muf.none'));
      phCap.textContent = T('ph.cap', { t: PG.num(a.tau0, 0) });
      cursor();
    }
    function session() {
      const d = DATA[st.s];
      rec = record(d);
      sim = (Array.isArray(PG.simData) && PG.simData.find(x => x.source === d.source && x.maps && x.maps.real)) || null;
      ionPanel.style.display = sim ? '' : 'none';
      ionCap.textContent = T('ion.cap', { m: muf() ? PG.num(muf(), 2) : '–' });
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
      panel(src, PG.h('div', { class: 'ctl' }, field(T('session'), sessions), modes, field(T('sub'), subSeg), field(T('ov'), ovSeg), lo.root,
        field(T('gate.c'), gateSeg), shift.root, half.root)),
      ionPanel,
      cards.root,
      panel(PG.h('p', { class: 'cap' }, T('map.cap')), map,
        PG.legend([['dash', 'border-color:#9aa', T('l.curve')], ['line', 'border-color:#9aa;border-top-width:1px', T('l.edge')], ['dot', 'background:#ffd166', T('l.peak')], ['line', 'border-color:var(--warn)', T('l.pick')]])),
      panel(pdpCap, pdpSvg, PG.legend([['line', 'border-color:var(--ink)', T('l.fine')], ['dot', 'background:var(--accent)', T('l.bins')], ['ring', 'border-color:var(--warn)', T('l.peak')], ['box', 'background:var(--accent-soft)', T('l.gate')]])),
      panel(PG.h('p', { class: 'cap' }, T('amp.cap')), ampSvg, PG.legend([['line', 'border-color:var(--faint)', T('l.step')], ['line', 'border-color:var(--accent)', T('l.slide')]])),
      panel(phCap, phSvg, PG.legend([['line', 'border-color:var(--faint)', T('l.step')], ['line', 'border-color:var(--accent)', T('l.slide')], ['dot', 'background:var(--warn)', T('l.lost')]])),
      note.root));
    ui = { root, cursor, map: null, ion: null };
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
