/* The HF channel simulator at work: a real sounding, the channel state read off it, synthetic
   soundings made from that state, and the checks that compare them (muf.sim.check, in
   ionograms-handler). The page computes nothing of its own: every number comes with the data, from
   js/data/sim.js (tools/sim_data.py) or from a file loaded here. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'sim.nav': 'Имитатор канала', 'sim.part': 'Дополнение · Имитатор КВ-канала',
      'sim.title': 'Имитатор КВ-канала: реальный сеанс и его копии',
      'sim.short': 'Состояние канала, прочитанное с реального сеанса, синтетические сеансы по нему и проверки, которые сравнивают одно с другим: МНЧ, уровень, ширина следа, корреляция ионограмм.',
      'sim.lede': 'Имитатор читает с ионограммы состояние канала — моды с их ДЧХ, уровнем C/N₀, доплеровским рассеянием и разбросом задержки — и по нему синтезирует новые сеансы. Синтетика проходит через тот же тракт обработки muf, что и настоящие записи, поэтому её можно сравнивать с оригиналом напрямую. Если состояние полное, реальный сеанс должен выглядеть как ещё одна копия; насколько он от этого отстоит, показывают вердикты уровня 2.',
      'sim.session': 'Сеанс', 'sim.load': 'Загрузить данные (JSON)', 'sim.back': 'Вернуться к встроенным данным',
      'sim.src': 'данные: {c}, {d}, сеансов: {n}', 'sim.src.file': ' · файл {f}',
      'sim.err': 'Не удалось прочитать файл: {e}', 'sim.err.shape': 'это не данные пульта имитатора',
      'sim.none.lbl': 'Данных нет',
      'sim.none.1': 'Данные имитатора в практикум не встроены: это ионограммы реальных сеансов и результаты проверок, материал диссертации. Их можно собрать из доступных вам сеансов и загрузить кнопкой выше.',
      'sim.none.2': 'Сборка — в ionograms-handler: python docs/ui/console.py СЕАНС … --json sim.json, где СЕАНС — запись .lfs или продукт .h5 с окном эха. Файл console.html, собранный там же, тоже подойдёт.',
      'sim.s1': 'Реальный сеанс', 'sim.s2': 'Состояние', 'sim.s3': 'Синтетика', 'sim.s4': 'Восстановление · уровень 1', 'sim.s5': 'Реализм · уровень 2',
      'sim.s1.s': '{c} · МНЧ {m} МГц', 'sim.s2.v': '{n} {w}', 'sim.s2.s': 'измерено {a}, априори {b}',
      'sim.s3.v': '{n} {w}', 'sim.s3.s': 'зёрна 0–{k}; тот же свип, окно и тракт muf',
      'sim.s4.s': '{m}: СКО задержки, найдена в {f} из {n}; смещение C/N₀ {b} дБ',
      'sim.s5.v': '{k} из {n}', 'sim.s5.s': 'вне разброса; r по ±0,2 МГц {r} при потолке {c}',
      'sim.w.mode': ['мода', 'моды', 'мод'], 'sim.w.snd': ['сеанс', 'сеанса', 'сеансов'],
      'sim.cap.ion': 'Слева реальный сеанс, справа — копия состояния, следующий реальный сеанс или их разность. Щелчок по ионограмме выбирает частоту для срезов ниже; стрелки ← → сдвигают её на строку, с Shift — на десять.',
      'sim.l.mode': 'Мода', 'sim.l.left': 'Слева', 'sim.l.right': 'Справа', 'sim.l.map': 'Карта',
      'sim.real': 'реальный', 'sim.copy': 'копия {k}', 'sim.next': 'следующий, +{m} мин', 'sim.diff': 'разность',
      'sim.m.rows': 'построчно', 'sim.m.smooth': '±0,2 МГц',
      'sim.ov.trace': 'кривые состояния', 'sim.ov.mask': 'ячейки корреляции, ±5 отсчётов',
      'sim.note.real': '{f} · {t}', 'sim.note.copy': 'одна из {n} копий: они отличаются только замираниями и шумом',
      'sim.note.next': 'тот же канал через {m} мин · {f}', 'sim.note.diff': 'реальный минус копия 1, дБ, шкала ±15; где оба ниже 3 дБ, не закрашено',
      'sim.ax.f': 'частота, МГц', 'sim.ax.r': 'дальность, км', 'sim.ax.df': 'смещение, кГц', 'sim.ax.t': 'время, с',
      'sim.cut.cap': 'Срез на {f} МГц: мощность поперёк дальности. Полоса — ±2 отсчёта, по которым считается C/N₀ моды {m}.',
      'sim.cut.noise': 'шум, −2,8 дБ', 'sim.cut.band': '±2 отсчёта',
      'sim.prof.cap': 'Средний профиль следа {m} по чистым сильным строкам, от раннего края к позднему, пик — 1. Профиль шире точечного эха означает, что у моды есть разброс задержки.',
      'sim.prof.x': 'отсчёты от следа, 1 отсчёт ≈ {u} мкс', 'sim.prof.few': 'мало чистых строк',
      'sim.prof.w': 'ширина над точечным эхом', 'sim.prof.in': 'внутри строки', 'sim.prof.c': 'разброс центров строк',
      'sim.prof.r1': 'связь соседних строк', 'sim.prof.yes': 'рассеяние: центры независимы', 'sim.prof.no': 'когерентная структура, не рассеяние',
      'sim.prof.ds': 'разброс задержки в состоянии', 'sim.prof.copies': 'копии {v} ± {s}',
      'sim.cn0.cap': 'C/N₀ моды {m} вдоль её полосы. Отдельные строки дрожат от замираний; в состояние идёт среднее по ±0,2 МГц. Щелчок выбирает частоту.',
      'sim.cn0.rows': 'строки', 'sim.cn0.real': 'реальный, среднее', 'sim.cn0.copy': 'копия 1, среднее', 'sim.cn0.y': 'C/N₀, дБ·Гц',
      'sim.verd.cap': 'Где реальное значение лежит среди копий, в единицах их σ. Внутри ±3σ реальный сеанс неотличим от ещё одной копии; для корреляции дефект — только отклонение вниз.',
      'sim.v.muf': 'МНЧ', 'sim.v.level': 'разброс уровня', 'sim.v.width': 'ширина следа', 'sim.v.rows': 'r построчно', 'sim.v.smooth': 'r по ±0,2 МГц',
      'sim.v.all': 'все моды', 'sim.v.nodata': 'не измерено', 'sim.v.few': 'копий: {n}, нужно 12',
      'sim.corr.cap': 'Коэффициент Пирсона по дБ в ±5 отсчётах вокруг следов. Потолок — копии между собой; мера естественной изменчивости — следующий реальный сеанс.',
      'sim.corr.ceil': 'потолок: копии между собой', 'sim.corr.real': 'реальный ↔ копии', 'sim.corr.next': 'реальный ↔ следующий',
      'sim.state.cap': 'Каждое значение помечено происхождением: измерено по сеансу, взято априори или задано моделью.',
      'sim.th.mode': 'мода', 'sim.th.band': 'полоса, МГц', 'sim.th.delay': 'задержка, мкс', 'sim.th.cn0': 'C/N₀ макс.',
      'sim.th.dopp': 'доплер', 'sim.th.ds': 'разброс задержки', 'sim.th.ox': 'o/x',
      'sim.o.measured': 'измерено', 'sim.o.prior': 'априори', 'sim.o.model': 'модель',
      'sim.rec': 'восстановлена с СКО {v} мкс', 'sim.tw': 'ширина следа {v} мкс', 'sim.nil': 'нет',
      'sim.chan.cap': '|H(f, t)| на {fc} МГц: что увидит сигнал в полосе {b} кГц за {s} с. Ниже — пути канала, задержка отсчитана от первого.',
      'sim.taps.x': 'задержка от первого пути, мкс',
      'sim.aria.ion': 'Ионограмма: частота по горизонтали, дальность по вертикали, мощность цветом.',
      'sim.aria.chan': 'Передаточная функция канала: смещение частоты по горизонтали, время по вертикали.',
      'sim.n.lbl': 'Что важно помнить',
      'sim.n.1': 'Страница ничего не считает сама: все числа взяты из muf.sim.check, а ионограммы переданы в данных с шагом 0,14 дБ.',
      'sim.n.2': 'По ионограмме мощности не измерить доплеровский сдвиг, закон замираний и расщепление o/x. В состоянии это априорные значения (ITU-R F.1487), и в таблице они так и помечены.',
      'sim.n.3': 'Все копии синтезированы из одного и того же гладкого состояния, поэтому друг на друга они похожи сильнее, чем на оригинал с его тонкой структурой следа. Корреляцию стоит читать рядом со столбцом «реальный ↔ следующий»: он показывает, насколько меняется сам канал за одно повторение.',
      'sim.n.4': 'Если трассировщик разбил один след на две моды с одной полосой и почти одной задержкой, в состоянии оказываются два равных пути вместо одного, и C/N₀ копии выходит примерно на 3 дБ выше.',
    },
    en: {
      'sim.nav': 'Channel simulator', 'sim.part': 'Supplement · HF channel simulator',
      'sim.title': 'HF channel simulator: a real sounding and its copies',
      'sim.short': 'The channel state read off a real sounding, synthetic soundings made from it, and the checks that compare the two: MUF, level, trace width, ionogram correlation.',
      'sim.lede': 'The simulator reads a channel state off an ionogram — modes with their delay curves, C/N₀, Doppler spread and delay spread — and makes new soundings from it. They go through the same muf processing as real recordings, so they compare with the original directly. If the state is complete, the real sounding should pass for one more copy; the level-2 verdicts show how far it is from that.',
      'sim.session': 'Sounding', 'sim.load': 'Load data (JSON)', 'sim.back': 'Back to the bundled data',
      'sim.src': 'data: {c}, {d}, {n} soundings', 'sim.src.file': ' · file {f}',
      'sim.err': 'Could not read the file: {e}', 'sim.err.shape': 'not simulator console data',
      'sim.none.lbl': 'No data',
      'sim.none.1': 'The simulator’s data is not built into the playground: it is ionograms of real soundings and the checks’ results, dissertation material. Build it from soundings you have and load it with the button above.',
      'sim.none.2': 'It is built in ionograms-handler: python docs/ui/console.py SOUNDING … --json sim.json, where SOUNDING is an .lfs recording or an .h5 product with an echo window. A console.html built there loads too.',
      'sim.s1': 'Real sounding', 'sim.s2': 'State', 'sim.s3': 'Synthetic', 'sim.s4': 'Recovery · level 1', 'sim.s5': 'Realism · level 2',
      'sim.s1.s': '{c} · MUF {m} MHz', 'sim.s2.v': '{n} {w}', 'sim.s2.s': '{a} measured, {b} prior',
      'sim.s3.v': '{n} {w}', 'sim.s3.s': 'seeds 0–{k}; same sweep, window and muf processing',
      'sim.s4.s': '{m}: delay RMS, found in {f} of {n}; C/N₀ bias {b} dB',
      'sim.s5.v': '{k} of {n}', 'sim.s5.s': 'outside; r over ±0.2 MHz {r} against a ceiling of {c}',
      'sim.w.mode': ['mode', 'modes'], 'sim.w.snd': ['sounding', 'soundings'],
      'sim.cap.ion': 'Left, the real sounding; right, a copy of the state, the next real sounding, or the difference. Click an ionogram to pick the frequency for the cuts below; ← → move it a row, ten with Shift.',
      'sim.l.mode': 'Mode', 'sim.l.left': 'Left', 'sim.l.right': 'Right', 'sim.l.map': 'Map',
      'sim.real': 'real', 'sim.copy': 'copy {k}', 'sim.next': 'next, +{m} min', 'sim.diff': 'difference',
      'sim.m.rows': 'row by row', 'sim.m.smooth': '±0.2 MHz',
      'sim.ov.trace': 'the state’s curves', 'sim.ov.mask': 'correlation cells, ±5 bins',
      'sim.note.real': '{f} · {t}', 'sim.note.copy': 'one of {n} copies; they differ only by fading and noise',
      'sim.note.next': 'the same channel {m} min on · {f}', 'sim.note.diff': 'real minus copy 1, dB, ±15; blank where both are below 3 dB',
      'sim.ax.f': 'frequency, MHz', 'sim.ax.r': 'range, km', 'sim.ax.df': 'offset, kHz', 'sim.ax.t': 'time, s',
      'sim.cut.cap': 'Cut at {f} MHz: power across range. The band is the ±2 bins {m}’s C/N₀ is summed over.',
      'sim.cut.noise': 'noise, −2.8 dB', 'sim.cut.band': '±2 bins',
      'sim.prof.cap': 'Mean profile across {m}’s trace over clean strong rows, early edge to late, peak 1. A profile wider than a point echo means the mode has a delay spread.',
      'sim.prof.x': 'bins from the trace, 1 bin ≈ {u} µs', 'sim.prof.few': 'too few clean rows',
      'sim.prof.w': 'width over a point echo', 'sim.prof.in': 'within a row', 'sim.prof.c': 'scatter of row centres',
      'sim.prof.r1': 'next-row correlation', 'sim.prof.yes': 'scatter: centres independent', 'sim.prof.no': 'coherent structure, not scatter',
      'sim.prof.ds': 'delay spread in the state', 'sim.prof.copies': 'copies {v} ± {s}',
      'sim.cn0.cap': 'C/N₀ of {m} along its band. Single rows fade; the state keeps the ±0.2 MHz mean. Click to pick a frequency.',
      'sim.cn0.rows': 'rows', 'sim.cn0.real': 'real, mean', 'sim.cn0.copy': 'copy 1, mean', 'sim.cn0.y': 'C/N₀, dB·Hz',
      'sim.verd.cap': 'Where the real value lies among the copies, in their σ. Within ±3σ the real sounding passes for one more copy; for a correlation only a shortfall is a defect.',
      'sim.v.muf': 'MUF', 'sim.v.level': 'level scatter', 'sim.v.width': 'trace width', 'sim.v.rows': 'r row by row', 'sim.v.smooth': 'r over ±0.2 MHz',
      'sim.v.all': 'all modes', 'sim.v.nodata': 'not measured', 'sim.v.few': 'copies: {n}, 12 needed',
      'sim.corr.cap': 'Pearson’s r of dB within ±5 bins of the traces. The ceiling is the copies among themselves; the yardstick of natural change, the next real sounding.',
      'sim.corr.ceil': 'ceiling: copies among themselves', 'sim.corr.real': 'real ↔ copies', 'sim.corr.next': 'real ↔ next',
      'sim.state.cap': 'Every value carries where it came from: measured off the sounding, a prior, or set by a model.',
      'sim.th.mode': 'mode', 'sim.th.band': 'band, MHz', 'sim.th.delay': 'delay, µs', 'sim.th.cn0': 'C/N₀ max',
      'sim.th.dopp': 'Doppler', 'sim.th.ds': 'delay spread', 'sim.th.ox': 'o/x',
      'sim.o.measured': 'measured', 'sim.o.prior': 'prior', 'sim.o.model': 'model',
      'sim.rec': 'recovered to {v} µs RMS', 'sim.tw': 'trace width {v} µs', 'sim.nil': 'none',
      'sim.chan.cap': '|H(f, t)| at {fc} MHz: what a signal sees over {b} kHz and {s} s. Below, the channel’s paths, delay counted from the first.',
      'sim.taps.x': 'delay after the first path, µs',
      'sim.aria.ion': 'Ionogram: frequency across, range up, power as colour.',
      'sim.aria.chan': 'Channel transfer function: frequency offset across, time up.',
      'sim.n.lbl': 'Keep in mind',
      'sim.n.1': 'The page computes nothing itself: every number comes from muf.sim.check, and the ionograms come in the data in steps of 0.14 dB.',
      'sim.n.2': 'A power ionogram cannot measure the Doppler shift, the fading law or the o/x split. In the state these are priors (ITU-R F.1487), and the table marks them so.',
      'sim.n.3': 'Every copy is made from the same smooth state, so the copies are more alike than any is like the original with its fine trace structure. Read the correlation beside “real ↔ next”: that is how much the channel itself changes over one repetition.',
      'sim.n.4': 'Where the tracker splits one trace into two modes over one band at nearly one delay, the state holds two equal paths for one, and the copy’s C/N₀ comes out about 3 dB high.',
    },
  });

  /* ------------------------------------------------------------ constants */

  // Trace colours, chosen to show on viridis; the first is drawn in ink on the light panels.
  const MODE_COLORS = ['#ffffff', '#f6a5c0', '#ffd166', '#9ad1ff'];
  const DIFF_FLOOR_DB = 3;     // the difference map leaves blank where both maps are below this
  const NOISE_DB = -2.8;       // a noise bin on muf's scale
  const CUT_HALF = 2.5;        // bins each side summed into C/N0
  const MASK_HALF = 5.5;       // bins each side the correlation reads
  const Z_MAX = 9, Z_IN = 3;   // the verdict axis, and its "inside" band
  const PAD = { l: 58, r: 8, t: 6, b: 32 };
  const FONT = '11px "IBM Plex Mono", ui-monospace, monospace';

  const st = { s: 0, right: 'synthetic1', smooth: false, trace: true, mask: false, mode: 0, row: null, corr: 'smoothed' };
  let DATA = null, FROM = null, cache = {}, ui = null;

  /* --------------------------------------------------------------- helpers */

  const T = (k, v) => PG.t('sim.' + k, v);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const words = k => PG.dict[PG.lang]['sim.w.' + k] || PG.dict.en['sim.w.' + k];
  const plural = (n, k) => {
    const f = words(k);
    if (f.length < 3) return f[n === 1 ? 0 : 1];
    const a = n % 10, b = n % 100;
    return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 1 : 2];
  };
  const S = () => DATA[st.s];
  const freqAt = i => S().freq.lo + i * S().freq.step;
  const rowOf = f => PG.clamp(Math.round((f - S().freq.lo) / S().freq.step), 0, S().freq.n - 1);
  const gapMin = s => (s.natural && s.natural.dt_s ? Math.round(s.natural.dt_s / 60) : '?');
  const modeInk = k => (k % 4 ? MODE_COLORS[k % 4] : 'var(--ink)');
  const hhmm = s => s.utc.slice(11, 16);
  const nice = v => (v === null || v === undefined) ? null : v;

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function lut(stops) {
    const out = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const x = i / 255;
      let k = 0;
      while (k < stops.length - 2 && x > stops[k + 1][0]) k++;
      const [x0, c0] = stops[k], [x1, c1] = stops[k + 1], u = PG.clamp((x - x0) / (x1 - x0), 0, 1);
      for (let j = 0; j < 3; j++) out[i * 3 + j] = c0[j] + u * (c1[j] - c0[j]);
    }
    return out;
  }
  const VIRIDIS = lut(['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#fde725']
    .map((c, i, a) => [i / (a.length - 1), hex(c)]));
  const DIVERGE = lut([[0, hex('#2166ac')], [0.25, hex('#67a9cf')], [0.5, hex('#f2f0eb')], [0.75, hex('#ef8a62')], [1, hex('#b2182b')]]);

  function decode(b64) {
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // A map in dB; with st.smooth, each range bin averaged in power over ±0.2 MHz, as the correlation does.
  function dbMap(key) {
    const id = st.s + ':' + key + ':' + st.smooth;
    if (cache[id]) return cache[id];
    const s = S(), q = decode(s.maps[key]), [lo, hi] = s.db, n = s.freq.n, m = s.range.km.length;
    let db = new Float32Array(n * m);
    for (let i = 0; i < q.length; i++) db[i] = lo + q[i] / 255 * (hi - lo);
    if (st.smooth) {
      const h = Math.round(0.2 / s.freq.step), lin = db.map(v => Math.pow(10, v / 10)), out = new Float32Array(n * m);
      for (let j = 0; j < m; j++) {
        let acc = 0, cnt = 0;
        for (let i = 0; i <= Math.min(n - 1, h); i++) { acc += lin[i * m + j]; cnt++; }
        for (let i = 0; i < n; i++) {
          out[i * m + j] = 10 * Math.log10(acc / cnt);
          const add = i + h + 1, drop = i - h;
          if (add < n) { acc += lin[add * m + j]; cnt++; }
          if (drop >= 0) { acc -= lin[drop * m + j]; cnt--; }
        }
      }
      db = out;
    }
    return (cache[id] = db);
  }

  // The console's data: a JSON array, or the console.html page that carries one.
  function parse(txt) {
    let s = txt.trim();
    if (s[0] === '<') {
      const m = /const DATA = ([\s\S]*?);\r?\n/.exec(s);
      if (!m) throw new Error(T('err.shape'));
      s = m[1];
    }
    const d = JSON.parse(s);
    const ok = x => x && x.maps && x.maps.real && x.freq && x.range && Array.isArray(x.modes) && x.modes.length && x.correlation;
    if (!Array.isArray(d) || !d.length || !d.every(ok)) throw new Error(T('err.shape'));
    return d;
  }

  function badge(kind, text) { return PG.h('span', { class: 'sim-badge ' + kind }, text); }
  function origin(o) {
    if (!o) return null;
    return badge(o === 'measured' ? 'ok' : o === 'prior' ? 'prior' : 'model', T('o.' + o) === 'sim.o.' + o ? o : T('o.' + o));
  }
  function verdict(e) {
    if (!e || e.real_inside === null || e.real_inside === undefined) return null;
    return badge(e.real_inside ? 'ok' : 'out', PG.num(e.real_z, 1) + 'σ');
  }
  function dot(k) { return PG.h('i', { class: 'sim-dot', style: 'background:' + MODE_COLORS[k % 4] }); }

  /* -------------------------------------------------------------- canvas */

  function sizeCanvas(c) {
    const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [g, w, h];
  }

  function geometry(w, h) {
    const s = S(), km = s.range.km, half = s.bin_km / 2;
    const top = Math.max(km[0], km[km.length - 1]) + half, bot = Math.min(km[0], km[km.length - 1]) - half;
    const f0 = s.freq.lo - s.freq.step / 2, f1 = s.freq.lo + (s.freq.n - 0.5) * s.freq.step;
    const pw = w - PAD.l - PAD.r, ph = h - PAD.t - PAD.b;
    return {
      x: f => PAD.l + (f - f0) / (f1 - f0) * pw, y: k => PAD.t + (top - k) / (top - bot) * ph,
      f: x => f0 + (x - PAD.l) / pw * (f1 - f0), k: y => top - (y - PAD.t) / ph * (top - bot), f0, f1, top, bot, pw, ph,
    };
  }

  function axes(g, w, h, G) {
    g.fillStyle = css('--muted'); g.strokeStyle = css('--rule'); g.font = FONT; g.textAlign = 'center';
    PG.ticks(G.f0, G.f1, 7).forEach(f => {
      const x = G.x(f);
      g.fillText(PG.num(f, f % 1 ? 1 : 0), x, h - PAD.b + 14);
      g.beginPath(); g.moveTo(x, PAD.t + G.ph); g.lineTo(x, PAD.t + G.ph + 4); g.stroke();
    });
    g.fillText(T('ax.f'), PAD.l + G.pw / 2, h - 2);
    g.textAlign = 'right';
    PG.ticks(G.bot, G.top, 5).forEach(k => g.fillText(PG.num(k, 0), PAD.l - 6, G.y(k) + 4));
    g.save(); g.translate(12, PAD.t + G.ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(T('ax.r'), 0, 0); g.restore();
  }

  function drawIon(canvas, key) {
    const [g, w, h] = sizeCanvas(canvas), s = S(), G = geometry(w, h), n = s.freq.n, m = s.range.km.length;
    g.clearRect(0, 0, w, h);
    let vals, map = VIRIDIS, lo = s.db[0], hi = s.db[1];
    if (key === 'diff') {
      const a = dbMap('real'), b = dbMap('synthetic1');
      vals = new Float32Array(n * m);
      for (let i = 0; i < vals.length; i++) vals[i] = Math.max(a[i], b[i]) < DIFF_FLOOR_DB ? 0 : a[i] - b[i];
      map = DIVERGE; lo = -15; hi = 15;
    } else vals = dbMap(key);
    const img = new ImageData(n, m);
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const v = PG.clamp(Math.round((vals[i * m + j] - lo) / (hi - lo) * 255), 0, 255), p = (j * n + i) * 4;
      img.data[p] = map[v * 3]; img.data[p + 1] = map[v * 3 + 1]; img.data[p + 2] = map[v * 3 + 2]; img.data[p + 3] = 255;
    }
    const off = document.createElement('canvas');
    off.width = n; off.height = m;
    off.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false;
    // Range falls with the column index, as in the data: column 0 is the top of the map.
    if (s.range.km[0] < s.range.km[m - 1]) { g.save(); g.translate(0, 2 * PAD.t + G.ph); g.scale(1, -1); g.drawImage(off, PAD.l, PAD.t, G.pw, G.ph); g.restore(); }
    else g.drawImage(off, PAD.l, PAD.t, G.pw, G.ph);
    const curve = (md, shift) => {
      g.beginPath();
      let on = false;
      md.km.forEach((km, i) => {
        if (km === null) { on = false; return; }
        const x = G.x(freqAt(i)), y = G.y(km + shift);
        if (on) g.lineTo(x, y); else g.moveTo(x, y);
        on = true;
      });
      g.stroke();
    };
    s.modes.forEach((md, k) => {
      const sel = k === st.mode;
      if (st.mask && sel) {
        g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1; g.setLineDash([3, 3]);
        curve(md, MASK_HALF * s.bin_km); curve(md, -MASK_HALF * s.bin_km);
        g.setLineDash([]);
      }
      if (st.trace) {
        g.strokeStyle = MODE_COLORS[k % 4]; g.lineWidth = sel ? 1.9 : 1.3; g.globalAlpha = sel ? 1 : 0.85;
        curve(md, 0);
        g.globalAlpha = 1;
      }
    });
    if (st.row !== null) {
      const x = G.x(freqAt(st.row));
      g.strokeStyle = '#ff8a65'; g.lineWidth = 1.2; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(x, PAD.t); g.lineTo(x, PAD.t + G.ph); g.stroke(); g.setLineDash([]);
    }
    axes(g, w, h, G);
  }

  function hookIon(canvas, tip, key) {
    const at = e => {
      const r = canvas.getBoundingClientRect(), G = geometry(r.width, r.height), x = e.clientX - r.left, y = e.clientY - r.top;
      return { r, G, x, y, inside: x >= PAD.l && x <= PAD.l + G.pw && y >= PAD.t && y <= PAD.t + G.ph };
    };
    canvas.addEventListener('mousemove', e => {
      const p = at(e);
      if (!p.inside) { tip.style.display = 'none'; return; }
      const s = S(), i = rowOf(p.G.f(p.x)), km = s.range.km, k = p.G.k(p.y), m = km.length;
      let j = 0;
      for (let q = 1; q < m; q++) if (Math.abs(km[q] - k) < Math.abs(km[j] - k)) j = q;
      const kk = key(), a = dbMap('real')[i * m + j], b = kk === 'diff' || kk === 'real' ? null : dbMap(kk)[i * m + j];
      tip.replaceChildren(PG.num(freqAt(i), 3) + ' ' + PG.U('MHz') + ' · ' + PG.num(km[j], 0) + ' ' + PG.U('km'), PG.h('br'),
        T('real') + ' ' + PG.num(a, 1) + ' ' + PG.U('dB') + (b === null ? '' : ' · ' + PG.num(b, 1) + ' ' + PG.U('dB')));
      tip.style.display = 'block';
      tip.style.left = Math.min(p.r.width - 170, p.x + 12) + 'px'; tip.style.top = (p.y + 12) + 'px';
    });
    canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    canvas.addEventListener('click', e => {
      const p = at(e);
      if (!p.inside) return;
      st.row = rowOf(p.G.f(p.x)); ui.cursor();
    });
  }

  function drawChannel(canvas) {
    const s = S(), ch = s.channel, [g, w, h] = sizeCanvas(canvas), q = decode(ch.h), nf = ch.n_f, nt = ch.n_t;
    const img = new ImageData(nf, nt);
    for (let i = 0; i < nt; i++) for (let j = 0; j < nf; j++) {
      const v = q[i * nf + j], p = ((nt - 1 - i) * nf + j) * 4;
      img.data[p] = VIRIDIS[v * 3]; img.data[p + 1] = VIRIDIS[v * 3 + 1]; img.data[p + 2] = VIRIDIS[v * 3 + 2]; img.data[p + 3] = 255;
    }
    const off = document.createElement('canvas');
    off.width = nf; off.height = nt;
    off.getContext('2d').putImageData(img, 0, 0);
    const P = { l: 44, r: 8, t: 4, b: 30 }, pw = w - P.l - P.r, ph = h - P.t - P.b, half = ch.fs_hz / 2000;
    g.clearRect(0, 0, w, h); g.imageSmoothingEnabled = true; g.drawImage(off, P.l, P.t, pw, ph);
    g.fillStyle = css('--muted'); g.font = FONT; g.textAlign = 'center';
    PG.ticks(-half, half, 5).forEach(k => g.fillText(PG.num(k, 0), P.l + (k + half) / (2 * half) * pw, h - P.b + 14));
    g.fillText(T('ax.df'), P.l + pw / 2, h - 2);
    g.textAlign = 'right';
    PG.ticks(0, ch.seconds, 4).forEach(t => g.fillText(PG.num(t, 0), P.l - 6, P.t + ph - t / ch.seconds * ph + 4));
    g.save(); g.translate(11, P.t + ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(T('ax.t'), 0, 0); g.restore();
  }

  function colourBar(c) {
    const g = c.getContext('2d'), img = g.createImageData(140, 9);
    for (let x = 0; x < 140; x++) {
      const v = Math.round(x / 139 * 255);
      for (let y = 0; y < 9; y++) {
        const p = (y * 140 + x) * 4;
        img.data[p] = VIRIDIS[v * 3]; img.data[p + 1] = VIRIDIS[v * 3 + 1]; img.data[p + 2] = VIRIDIS[v * 3 + 2]; img.data[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }

  /* ----------------------------------------------------------------- SVG */

  const rightMap = () => (st.right === 'diff' ? 'synthetic1' : st.right);
  const rightLabel = k => (k.startsWith('synthetic') ? T('copy', { k: k.slice(-1) }) : k === 'next' ? T('next', { m: gapMin(S()) }) : T('diff'));
  const svgX = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x; };

  function drawCut(svg) {
    svg.replaceChildren();
    const s = S(), i = st.row, km = s.range.km, m = km.length, a = dbMap('real'), b = dbMap(rightMap());
    const lo = Math.min(km[0], km[m - 1]), hi = Math.max(km[0], km[m - 1]), Y0 = -10, Y1 = 35;
    const { fx, fy, g } = PG.plot(svg, { x0: 46, x1: 432, y0: 10, y1: 206, xd: [lo, hi], yd: [Y0, Y1], yt: [-10, 0, 10, 20, 30], nx: 6, xl: T('ax.r'), yl: PG.U('dB'), ylx: 12 });
    const md = s.modes[st.mode];
    if (md && md.km[i] !== null) {
      PG.el(g, 'rect', { x: fx(md.km[i] - CUT_HALF * s.bin_km), width: fx(md.km[i] + CUT_HALF * s.bin_km) - fx(md.km[i] - CUT_HALF * s.bin_km), y: 10, height: 196, style: 'fill:var(--accent-soft)' });
    }
    PG.el(g, 'line', { x1: 46, x2: 432, y1: fy(NOISE_DB), y2: fy(NOISE_DB), style: 'stroke:var(--warn)', 'stroke-dasharray': '5 3', opacity: 0.8 });
    const line = (v, style, dash) => PG.el(g, 'path', { d: PG.path(km.map((k, j) => [fx(k), fy(PG.clamp(v[i * m + j], Y0, Y1))])), fill: 'none', style, 'stroke-width': 1.5, 'stroke-dasharray': dash });
    line(b, 'stroke:var(--accent)', '5 3');
    line(a, 'stroke:var(--ink)');
    let lane = 0;
    s.modes.forEach((mo, k) => {
      if (mo.km[i] === null) return;
      const y = 24 + 13 * (lane++ % 3);
      PG.el(g, 'line', { x1: fx(mo.km[i]), x2: fx(mo.km[i]), y1: y - 10, y2: y + 2, style: 'stroke:' + modeInk(k), 'stroke-width': 2 });
      PG.text(g, fx(mo.km[i]) + 4, y, mo.name);
    });
  }

  function drawProfile(svg, kv) {
    svg.replaceChildren();
    const s = S(), md = s.modes[st.mode], pr = md.profile || {}, ks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    const bu = Math.round(s.bin_km / (s.km_per_us || 0.3));
    const { fx, fy, g } = PG.plot(svg, { x0: 40, x1: 432, y0: 10, y1: 186, xd: [-4.6, 4.6], yd: [0, 1.08], xt: ks, yt: [0, 0.5, 1],
      xf: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), yf: v => PG.num(v, v % 1 ? 1 : 0), xl: T('prof.x', { u: bu }), grid: false });
    const bw = (fx(1) - fx(0)) * 0.38;
    const bars = (vals, dx, style) => (vals || []).forEach((v, q) => {
      const y = fy(Math.max(0, v));
      PG.el(g, 'rect', { x: fx(ks[q]) + dx, width: bw, y, height: fy(0) - y, style });
    });
    bars(pr.real, -bw - 1, 'fill:var(--ink);opacity:.72');
    bars(pr.synthetic, 1, 'fill:var(--accent);opacity:.85');
    if (!pr.real) PG.text(svg, 236, 100, T('prof.few'), { 'text-anchor': 'middle', style: 'fill:var(--muted)' });
    const w = md.width, sw = md.summary.width || {}, syn = sw.synthetic_us || {}, us = ' ' + PG.U('us');
    const rows = [];
    if (w) {
      rows.push([T('prof.w'), [PG.h('b', null, PG.num(w.spread_us, 1) + us), ' · ', T('prof.copies', { v: PG.num(syn.mean, 1), s: PG.num(syn.std, 1) }), ' ', verdict(sw)]]);
      rows.push([T('prof.in'), PG.num(w.within_us, 1) + us + ' · ' + T('prof.c') + ' ' + PG.num(w.centre_rms_us, 1) + us]);
      rows.push([T('prof.r1'), PG.num(w.centre_r1, 2) + ' → ' + (w.centre_r1 <= 0.4 ? T('prof.yes') : T('prof.no'))]);
    }
    rows.push([T('prof.ds'), [PG.num(md.delay_spread_us, 1) + us, ' ', origin(md.origin.delay_spread)]]);
    kv.replaceChildren(...rows.flatMap(([a, b]) => [PG.h('dt', null, a), PG.h('dd', null, b)]));
  }

  function drawCn0(svg) {
    svg.replaceChildren();
    const s = S(), md = s.modes[st.mode], c = md.cn0, ok = v => v !== null && isFinite(v);
    const all = c.real.concat(c.real_smooth, c.synthetic_smooth).filter(ok), sm = c.real_smooth.filter(ok);
    if (!all.length) return;
    const lo = Math.max(Math.min(...(sm.length ? sm : all)) - 14, Math.min(...all)), hi = Math.max(...all) + 3;
    const yd = [Math.floor(lo / 5) * 5, Math.ceil(hi / 5) * 5], xd = [md.f_lo, md.f_hi];
    const { fx, fy, g } = PG.plot(svg, { x0: 46, x1: 432, y0: 10, y1: 206, xd, yd, nx: 5, ny: 4, xf: v => PG.num(v, v % 1 ? 1 : 0), xl: T('ax.f'), yl: T('cn0.y'), ylx: 12 });
    c.f.forEach((f, q) => { if (ok(c.real[q]) && c.real[q] >= yd[0]) PG.el(g, 'circle', { cx: fx(f), cy: fy(c.real[q]), r: 1.5, style: 'fill:var(--faint)', opacity: 0.75 }); });
    const path = (v, style, dash, wd) => PG.el(g, 'path', { d: PG.path(c.f.map((f, q) => [f, v[q]]).filter(p => ok(p[1])).map(([f, y]) => [fx(f), fy(Math.max(yd[0], y))])), fill: 'none', style, 'stroke-width': wd, 'stroke-dasharray': dash });
    path(c.synthetic_smooth, 'stroke:var(--accent)', '5 3', 1.7);
    path(c.real_smooth, 'stroke:var(--ink)', null, 2);
    const f = freqAt(st.row);
    if (f >= xd[0] && f <= xd[1]) PG.el(g, 'line', { x1: fx(f), x2: fx(f), y1: 10, y2: 206, style: 'stroke:#ff8a65', 'stroke-dasharray': '4 3' });
    svg.onclick = e => {
      const x = svgX(svg, e);
      if (x < 46 || x > 432) return;
      st.row = rowOf(xd[0] + (x - 46) / 386 * (xd[1] - xd[0])); ui.cursor();
    };
    svg.style.cursor = 'crosshair';
  }

  function verdictRows() {
    const s = S(), rows = [{ label: T('v.muf'), z: s.muf.z, inside: s.muf.inside, note: PG.num(s.muf.real, 2) + ' ' + PG.U('MHz') }];
    const why = (e, key) => {
      if (e[key] === null || e[key] === undefined) return T('v.nodata');
      const st0 = Object.values(e).find(v => v && typeof v === 'object' && v.n !== undefined);
      return T('v.few', { n: st0 ? st0.n : 0 });
    };
    const r = e => (e && e.real ? PG.num(e.real.mean, 3) : '');
    s.modes.forEach(md => {
      const sm = md.summary, cm = s.correlation.modes[md.name] || {}, lv = sm.level || {}, wd = sm.width || {};
      rows.push({ head: md.name });
      rows.push({ label: T('v.level'), z: lv.real_z, inside: lv.real_inside, why: why(lv, 'real_std_db'), note: lv.real_std_db !== undefined ? PG.num(lv.real_std_db, 1) + ' ' + PG.U('dB') : '' });
      rows.push({ label: T('v.width'), z: wd.real_z, inside: wd.real_inside, why: why(wd, 'real_us'), note: wd.real_us !== undefined && wd.real_us !== null ? PG.num(wd.real_us, 1) + ' ' + PG.U('us') : '' });
      rows.push({ label: T('v.rows'), z: (cm.rows || {}).real_z, inside: (cm.rows || {}).real_inside, one: true, note: r(cm.rows) });
      rows.push({ label: T('v.smooth'), z: (cm.smoothed || {}).real_z, inside: (cm.smoothed || {}).real_inside, one: true, note: r(cm.smoothed) });
    });
    rows.push({ head: T('v.all') });
    for (const key of ['rows', 'smoothed']) {
      const e = s.correlation[key] || {};
      rows.push({ label: T(key === 'rows' ? 'v.rows' : 'v.smooth'), z: e.real_z, inside: e.real_inside, one: true, note: r(e) });
    }
    return rows.map(x => Object.assign(x, { z: nice(x.z) }));
  }

  function drawVerdicts(box) {
    const rows = verdictRows(), W = 900, rh = 19, H = 34 + rows.length * rh, L = 170, R = W - 160;
    const svg = PG.svg(W, H, T('verd.cap'));
    const X = z => L + (PG.clamp(z, -Z_MAX, Z_MAX) + Z_MAX) / (2 * Z_MAX) * (R - L);
    PG.el(svg, 'rect', { x: X(-Z_IN), width: X(Z_IN) - X(-Z_IN), y: 20, height: H - 26, style: 'fill:var(--accent-soft)' });
    for (const z of [-9, -6, -3, 0, 3, 6, 9]) {
      PG.el(svg, 'line', { x1: X(z), x2: X(z), y1: 20, y2: H - 6, stroke: 'currentColor', opacity: z ? 0.12 : 0.4 });
      PG.text(svg, X(z), 13, (z > 0 ? '+' : z < 0 ? '−' : '') + Math.abs(z) + 'σ', { 'text-anchor': 'middle', style: 'fill:var(--muted)' });
    }
    rows.forEach((r, q) => {
      const y = 34 + q * rh;
      if (r.head) { PG.text(svg, 8, y + 4, r.head, { 'font-weight': 600 }); return; }
      PG.text(svg, 22, y + 4, r.label, { style: 'fill:var(--muted)' });
      if (r.z === null || r.z === undefined) {
        PG.text(svg, R + 10, y + 4, '–', { style: 'fill:var(--muted)' });
        PG.text(svg, R + 58, y + 4, r.why || '', { style: 'fill:var(--faint)' });
        return;
      }
      const col = r.inside ? 'var(--accent)' : 'var(--warn)';
      PG.el(svg, 'line', { x1: X(0), x2: X(r.z), y1: y, y2: y, style: 'stroke:' + col, 'stroke-width': 2, opacity: 0.4 });
      PG.el(svg, 'circle', { cx: X(r.z), cy: y, r: 5, style: 'fill:' + col });
      if (Math.abs(r.z) > Z_MAX) PG.text(svg, X(r.z) + (r.z > 0 ? 8 : -8), y + 4, r.z > 0 ? '›' : '‹', { 'text-anchor': r.z > 0 ? 'start' : 'end', style: 'fill:' + col });
      PG.text(svg, R + 10, y + 4, PG.num(r.z, 1) + 'σ');
      PG.text(svg, R + 58, y + 4, r.note || '', { style: 'fill:var(--muted)' });
    });
    box.replaceChildren(svg);
  }

  function drawCorr(svg) {
    svg.replaceChildren();
    const s = S(), key = st.corr, nx = s.correlation.next || {};
    const groups = [{ name: T('v.all'), e: s.correlation[key], n: nx[key] }].concat(s.modes.map(md => ({
      name: md.name, e: (s.correlation.modes[md.name] || {})[key], n: ((nx.modes || {})[md.name] || {})[key] })));
    const vals = groups.flatMap(g => [g.e && g.e.synthetic && g.e.synthetic.mean, g.e && g.e.real && g.e.real.mean, g.n]).filter(v => v !== null && v !== undefined);
    const y0 = Math.max(0, Math.min(key === 'rows' ? 0.3 : 0.6, Math.floor(Math.min(...vals) * 10) / 10));
    const { fx, fy, g } = PG.plot(svg, { x0: 40, x1: 432, y0: 18, y1: 214, xd: [0, groups.length], yd: [y0, 1], xt: [], yt: PG.ticks(y0, 1, 5), yf: v => PG.num(v, 1), yl: 'r', ylx: 12 });
    const gw = fx(1) - fx(0), bw = gw * 0.22;
    groups.forEach((gr, q) => {
      const x0 = fx(q) + gw * 0.14;
      [[gr.e && gr.e.synthetic && gr.e.synthetic.mean, 'var(--faint)', gr.e && gr.e.synthetic && gr.e.synthetic.std],
        [gr.e && gr.e.real && gr.e.real.mean, 'var(--accent)'], [gr.n, 'var(--comp)']].forEach(([v, col, sd], b) => {
        if (v === null || v === undefined) return;
        const x = x0 + b * (bw + 3), y = fy(Math.max(y0, v));
        PG.el(g, 'rect', { x, width: bw, y, height: fy(y0) - y, rx: 1.5, style: 'fill:' + col, opacity: b ? 0.9 : 0.6 });
        if (sd) PG.el(g, 'line', { x1: x + bw / 2, x2: x + bw / 2, y1: fy(v - sd), y2: fy(v + sd), style: 'stroke:var(--ink)', 'stroke-width': 1 });
        PG.text(svg, x + bw / 2, y - 3, PG.num(v, 2), { 'text-anchor': 'middle', 'font-size': 9.5 });   // over the clip, near r = 1
      });
      PG.text(svg, fx(q) + gw / 2, 230, gr.name, { 'text-anchor': 'middle' });
      if (gr.e && gr.e.real_inside !== null && gr.e.real_inside !== undefined) {
        PG.text(svg, fx(q) + gw / 2, 245, PG.num(gr.e.real_z, 1) + 'σ', { 'text-anchor': 'middle', 'font-size': 10, style: 'fill:' + (gr.e.real_inside ? 'var(--accent)' : 'var(--warn)') });
      }
    });
  }

  function drawTaps(svg) {
    svg.replaceChildren();
    const ps = S().channel.paths;
    if (!ps.length) return;
    const dmax = Math.max(50, ...ps.map(p => p.delay_us)) * 1.08, top = Math.max(...ps.map(p => p.db));
    const { fx, fy, g } = PG.plot(svg, { x0: 44, x1: 892, y0: 8, y1: 92, xd: [0, dmax], nx: 10, yd: [top - 30, top + 3], yt: [top - 30, top - 15, top],
      yf: v => PG.num(v, 0), xl: T('taps.x'), yl: PG.U('dB'), ylx: 12 });
    ps.forEach(p => {
      const y = fy(Math.max(top - 30, p.db));
      PG.el(g, 'line', { x1: fx(p.delay_us), x2: fx(p.delay_us), y1: fy(top - 30), y2: y, style: 'stroke:var(--accent)', 'stroke-width': 2 });
      PG.el(g, 'circle', { cx: fx(p.delay_us), cy: y, r: 3, style: 'fill:var(--accent)' });
    });
    const best = {};
    ps.forEach(p => { const name = p.label.split(/[+-]\d/)[0]; if (!(name in best) || p.db > best[name].db) best[name] = p; });
    Object.entries(best).forEach(([name, p]) => PG.text(g, fx(p.delay_us) + 4, fy(p.db) - 4, name));
  }

  /* --------------------------------------------------------------- panels */

  function chain(box) {
    const s = S(), counts = { measured: 0, prior: 0 };
    s.modes.forEach(md => Object.values(md.origin).forEach(o => { if (o in counts) counts[o]++; }));
    const v = verdictRows().filter(r => r.z !== null && r.z !== undefined), out = v.filter(r => !r.inside).length;
    const main = s.modes.reduce((a, b) => (b.cn0_max > a.cn0_max ? b : a));   // the strongest mode
    const sm = s.correlation.smoothed || {};
    const card = (n, key, val, sub) => PG.h('div', { class: 'card' }, PG.h('div', { class: 'l' }, n + ' · ' + T(key)), PG.h('div', { class: 'v' }, val), PG.h('div', { class: 's' }, sub));
    box.replaceChildren(
      card(1, 's1', hhmm(s) + ' UTC', T('s1.s', { c: s.circuit, m: PG.num(s.muf.real, 2) })),
      card(2, 's2', T('s2.v', { n: s.modes.length, w: plural(s.modes.length, 'mode') }), T('s2.s', { a: counts.measured, b: counts.prior })),
      card(3, 's3', T('s3.v', { n: s.realisations, w: plural(s.realisations, 'snd') }), T('s3.s', { k: s.realisations - 1 })),
      card(4, 's4', PG.num(main.summary.delay_rms_us.mean, 1) + ' ' + PG.U('us'),
        T('s4.s', { m: main.name, f: main.summary.found, n: s.realisations, b: PG.num(main.summary.cn0_bias_db.mean, 1) })),
      card(5, 's5', T('s5.v', { k: out, n: v.length }), T('s5.s', { r: PG.num((sm.real || {}).mean, 3), c: PG.num((sm.synthetic || {}).mean, 3) })));
  }

  function stateTable(table) {
    const s = S(), us = ' ' + PG.U('us');
    const head = PG.h('thead', null, PG.h('tr', null, ['mode', 'band', 'delay', 'cn0', 'dopp', 'ds', 'ox'].map(k => PG.h('th', null, T('th.' + k)))));
    const body = PG.h('tbody', null, s.modes.map((md, k) => {
      const sw = md.summary.width || {};
      return PG.h('tr', { class: k === st.mode ? 'sim-on' : null },
        PG.h('td', { style: 'white-space:nowrap' }, dot(k), md.name),
        PG.h('td', { class: 'num' }, PG.num(md.f_lo, 2) + '–' + PG.num(md.f_hi, 2), ' ', origin(md.origin.delay)),
        PG.h('td', { class: 'num' }, PG.num(md.delay_lo, 0) + '–' + PG.num(md.delay_hi, 0), PG.h('span', { class: 'sub' }, T('rec', { v: PG.num(md.summary.delay_rms_us.mean, 1) }))),
        PG.h('td', { class: 'num' }, PG.num(md.cn0_max, 1) + ' ' + PG.U('dB') + '·' + PG.U('Hz'), ' ', origin(md.origin.cn0)),
        PG.h('td', { class: 'num' }, PG.num(md.doppler_hz, 2) + ' ' + PG.U('Hz') + ' ' + (md.doppler_shape === 'lorentzian' ? 'Lorentz' : 'Gauss'), ' ', origin(md.origin.doppler_spread)),
        PG.h('td', { class: 'num' }, PG.num(md.delay_spread_us, 1) + us, ' ', origin(md.origin.delay_spread),
          sw.real_us !== undefined && sw.real_us !== null ? PG.h('span', { class: 'sub' }, T('tw', { v: PG.num(sw.real_us, 1) })) : null),
        PG.h('td', { class: 'num' }, md.ox_us === null || md.ox_us === undefined ? T('nil') : PG.num(md.ox_us, 1) + us, ' ', origin(md.origin.magnetoionic)));
    }));
    table.replaceChildren(head, body);
  }

  function injectStyle() {
    if (document.getElementById('sim-style')) return;
    document.head.append(PG.h('style', { id: 'sim-style' }, [
      '.sim-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 14px; }',
      '.sim-pair > .hl { grid-area: 1 / 1; } .sim-pair > .hr { grid-area: 1 / 2; } .sim-pair > .cl { grid-area: 2 / 1; } .sim-pair > .cr { grid-area: 2 / 2; }',
      '.sim-pair > .nl { grid-area: 3 / 1; } .sim-pair > .nr { grid-area: 3 / 2; } .sim-pair > .hl, .sim-pair > .hr { align-self: end; margin-bottom: 6px; }',
      '@media (max-width: 720px) { .sim-pair { grid-template-columns: 1fr; } .sim-pair > .hr { grid-area: 4 / 1; margin-top: 14px; } .sim-pair > .cr { grid-area: 5 / 1; } .sim-pair > .nr { grid-area: 6 / 1; } }',
      '.sim-wrap { position: relative; }',
      'canvas.sim-ion { display: block; width: 100%; height: 300px; cursor: crosshair; }',
      'canvas.sim-chan { display: block; width: 100%; height: 200px; }',
      '.sim-tip { position: absolute; pointer-events: none; display: none; z-index: 2; background: var(--surface); border: 1px solid var(--rule); border-radius: 4px; padding: 4px 8px; font: 12px "IBM Plex Mono", monospace; white-space: nowrap; box-shadow: 0 6px 18px -8px rgba(0, 0, 0, .45); }',
      '.sim-badge { display: inline-block; font: 10px "IBM Plex Mono", monospace; letter-spacing: .06em; text-transform: uppercase; padding: 1px 6px; border-radius: 3px; border: 1px solid; white-space: nowrap; vertical-align: 1px; }',
      '.sim-badge.ok { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }',
      '.sim-badge.out { color: var(--warn); border-color: var(--warn); background: var(--warn-soft); }',
      '.sim-badge.prior { color: var(--muted); border-color: var(--rule); background: var(--raised); }',
      '.sim-badge.model { color: var(--comp); border-color: var(--comp); }',
      '.sim-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--faint); margin-right: 6px; vertical-align: -1px; }',
      '.sim-kv { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: 13px; margin: 10px 0 0; }',
      '.sim-kv dt { color: var(--muted); } .sim-kv dd { margin: 0; }',
      '.sim-bar { display: flex; flex-wrap: wrap; gap: 10px 22px; align-items: end; justify-content: space-between; }',
      '.sim-cbar { display: inline-flex; align-items: center; gap: 6px; font: 11.5px "IBM Plex Mono", monospace; color: var(--muted); }',
      '.sim-cbar canvas { width: 140px; height: 9px; border-radius: 2px; }',
      '.sim td .sub { display: block; font: 12px "IBM Plex Sans", sans-serif; color: var(--muted); text-align: left; }',
      '.sim td.num { text-align: left; }',
      '.sim tr.sim-on td { background: var(--accent-soft); }',
      '.sim .panel > .cap + .cap { margin-top: -4px; }',
    ].join('\n')));
  }

  /* ---------------------------------------------------------------- mount */

  function mount(root) {
    injectStyle();
    if (!DATA && Array.isArray(PG.simData) && PG.simData.length) { DATA = PG.simData; FROM = null; }
    const remount = () => { cache = {}; st.s = 0; st.mode = 0; st.row = null; root.replaceChildren(); mount(root); };
    const err = PG.h('p', { class: 'err' });
    const file = PG.h('input', { type: 'file', accept: '.json,.html,application/json,text/html', style: 'display:none', onchange: e => {
      const fl = e.target.files[0];
      if (!fl) return;
      fl.text().then(txt => { DATA = parse(txt); FROM = fl.name; remount(); }).catch(x => { err.textContent = T('err', { e: x.message }); });
    } });
    const loader = PG.h('div', { class: 'row' }, PG.h('button', { type: 'button', onclick: () => file.click() }, T('load')),
      FROM && Array.isArray(PG.simData) ? PG.h('button', { type: 'button', onclick: () => { DATA = PG.simData; FROM = null; remount(); } }, T('back')) : null, file);

    if (!DATA) {
      const none = PG.note();
      none.set('caution', T('none.lbl'), T('none.1'), T('none.2'));
      root.append(PG.h('div', { class: 'sim' }, PG.h('div', { class: 'panel' }, loader, err), none.root));
      return;
    }
    if (st.s >= DATA.length) st.s = 0;

    const src = PG.h('span', { class: 'eyebrow', style: 'display:block;margin-bottom:10px' });
    const sessions = PG.h('div'), modes = PG.h('div'), right = PG.h('div'), chainBox = PG.h('div', { class: 'cards' });
    const ion = () => {
      const c = PG.h('canvas', { class: 'sim-ion', role: 'img', 'aria-label': T('aria.ion') }), tip = PG.h('div', { class: 'sim-tip' });
      return { c, tip, wrap: PG.h('div', { class: 'sim-wrap' }, c, tip), note: PG.h('p', { class: 'cap', style: 'margin:6px 0 0' }) };
    };
    const L = ion(), Rt = ion();
    const cbar = PG.h('canvas', { width: 140, height: 9 });
    const cutSvg = PG.svg(440, 248, T('cut.cap')), profSvg = PG.svg(440, 226, T('prof.cap')), cn0Svg = PG.svg(440, 248, T('cn0.cap'));
    const corrSvg = PG.svg(440, 252, T('corr.cap')), tapsSvg = PG.svg(900, 126, T('taps.x'));
    const cutCap = PG.h('p', { class: 'cap' }), profCap = PG.h('p', { class: 'cap' }), cn0Cap = PG.h('p', { class: 'cap' }), chanCap = PG.h('p', { class: 'cap' });
    const profKv = PG.h('dl', { class: 'sim-kv' }), verdBox = PG.h('div'), table = PG.h('table');
    const chan = PG.h('canvas', { class: 'sim-chan', role: 'img', 'aria-label': T('aria.chan') });
    const cutLegend = PG.h('div');
    const note = PG.note();
    note.set('', T('n.lbl'), T('n.1'), T('n.2'), T('n.3'), T('n.4'));

    const field = (label, ctl) => PG.h('div', { class: 'field' }, PG.h('label', null, PG.h('span', null, label)), ctl);
    const check = (key, label) => PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: st[key], onchange: e => { st[key] = e.target.checked; cursor(); } }), label);
    const smooth = PG.seg([{ value: false, label: T('m.rows') }, { value: true, label: T('m.smooth') }], st.smooth, v => { st.smooth = v; cursor(); });
    const corrSeg = PG.seg([{ value: 'rows', label: T('m.rows') }, { value: 'smoothed', label: T('m.smooth') }], st.corr, v => { st.corr = v; drawCorr(corrSvg); });

    function canvases() { drawIon(L.c, 'real'); drawIon(Rt.c, st.right); drawChannel(chan); }
    function cursor() {
      const s = S(), md = s.modes[st.mode], f = PG.num(freqAt(st.row), 2);
      drawIon(L.c, 'real'); drawIon(Rt.c, st.right);
      cutCap.textContent = T('cut.cap', { f, m: md.name });
      drawCut(cutSvg); drawCn0(cn0Svg);
      cutLegend.replaceChildren(PG.legend([['line', 'border-color:var(--ink)', T('real')], ['dash', 'border-color:var(--accent)', rightLabel(rightMap())],
        ['dash', 'border-color:var(--warn)', T('cut.noise')], ['box', 'background:var(--accent-soft)', T('cut.band')]]));
    }
    function rightSide() {
      const s = S(), keys = ['synthetic1', 'synthetic2', 'synthetic3'].filter(k => s.maps[k]).concat(s.maps.next ? ['next'] : [], ['diff']);
      if (!keys.includes(st.right)) st.right = keys[0];
      right.replaceChildren(field(T('l.right'), PG.seg(keys.map(k => ({ value: k, label: rightLabel(k) })), st.right, v => { st.right = v; rightSide(); cursor(); })));
      Rt.note.textContent = st.right === 'diff' ? T('note.diff') : st.right === 'next' ? T('note.next', { m: gapMin(s), f: s.next }) : T('note.copy', { n: s.realisations });
    }
    function modePanels() {
      const s = S(), md = s.modes[st.mode];
      profCap.textContent = T('prof.cap', { m: md.name });
      cn0Cap.textContent = T('cn0.cap', { m: md.name });
      drawProfile(profSvg, profKv);
      stateTable(table);
      cursor();
    }
    function session() {
      const s = S();
      if (st.mode >= s.modes.length) st.mode = 0;
      if (st.row === null) { const md = s.modes[st.mode]; st.row = rowOf(md.f_lo + 0.6 * (md.f_hi - md.f_lo)); }
      L.note.textContent = T('note.real', { f: s.source, t: s.utc });
      modes.replaceChildren(field(T('l.mode'), PG.seg(s.modes.map((m, k) => ({ value: k, label: [dot(k), m.name] })), st.mode, v => {
        st.mode = v; const m = S().modes[v]; if (freqAt(st.row) < m.f_lo || freqAt(st.row) > m.f_hi) st.row = rowOf(m.f_lo + 0.6 * (m.f_hi - m.f_lo)); modePanels();
      })));
      const ch = s.channel;
      chanCap.textContent = T('chan.cap', { fc: PG.num(ch.fc_mhz, 2), b: PG.num(ch.fs_hz / 1000, 0), s: PG.num(ch.seconds, 0) });
      chain(chainBox);
      rightSide();
      drawVerdicts(verdBox); drawCorr(corrSvg); drawTaps(tapsSvg); drawChannel(chan);
      modePanels();
    }

    // The data's own description: its circuits and days, and the file it came from.
    const uniq = a => [...new Set(a)];
    const days = uniq(DATA.map(d => d.utc.slice(0, 10)));
    const dayText = days.map(d => new Date(d + 'T00:00:00Z').toLocaleDateString(PG.lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })).join(', ');
    src.textContent = T('src', { c: uniq(DATA.map(d => d.circuit)).join(', '), d: dayText, n: DATA.length }) + (FROM ? T('src.file', { f: FROM }) : '');
    sessions.replaceChildren(PG.seg(DATA.map((d, k) => ({ value: k, label: days.length > 1 ? d.utc.slice(8, 10) + '.' + d.utc.slice(5, 7) + ' ' + hhmm(d) : hhmm(d), title: d.source })),
      st.s, v => { st.s = v; st.row = null; session(); }));

    hookIon(L.c, L.tip, () => 'real');
    hookIon(Rt.c, Rt.tip, () => st.right);
    colourBar(cbar);

    const panel = (...kids) => PG.h('div', { class: 'panel' }, ...kids);
    root.append(PG.h('div', { class: 'sim' },
      panel(src, field(T('session'), sessions), loader, err),
      chainBox,
      panel(PG.h('p', { class: 'cap' }, T('cap.ion')),
        PG.h('div', { class: 'sim-bar' }, modes,
          PG.h('div', { class: 'row', style: 'margin-top:0' }, field(T('l.map'), smooth), check('trace', T('ov.trace')), check('mask', T('ov.mask'))),
          PG.h('span', { class: 'sim-cbar' }, PG.num(DATA[0].db[0], 0), cbar, PG.num(DATA[0].db[1], 0) + ' ' + PG.U('dB'))),
        PG.h('div', { class: 'sim-pair' },
          PG.h('div', { class: 'hl' }, field(T('l.left'), PG.seg([{ value: 'real', label: T('real') }], 'real', () => {}))),
          PG.h('div', { class: 'hr' }, right),
          PG.h('div', { class: 'cl' }, L.wrap), PG.h('div', { class: 'cr' }, Rt.wrap),
          PG.h('div', { class: 'nl' }, L.note), PG.h('div', { class: 'nr' }, Rt.note))),
      PG.h('div', { class: 'two', style: 'margin-bottom:16px' },
        panel(cutCap, cutSvg, cutLegend),
        panel(cn0Cap, cn0Svg, PG.legend([['dot', 'background:var(--faint)', T('cn0.rows')], ['line', 'border-color:var(--ink)', T('cn0.real')], ['dash', 'border-color:var(--accent)', T('cn0.copy')]]))),
      PG.h('div', { class: 'two', style: 'margin-bottom:16px' },
        panel(profCap, profSvg, PG.legend([['box', 'background:var(--ink);opacity:.72', T('real')], ['box', 'background:var(--accent)', T('copy', { k: 1 })]]), profKv),
        panel(PG.h('p', { class: 'cap' }, T('corr.cap')), PG.h('div', { style: 'margin-bottom:8px' }, corrSeg), corrSvg,
          PG.legend([['box', 'background:var(--faint)', T('corr.ceil')], ['box', 'background:var(--accent)', T('corr.real')], ['box', 'background:var(--comp)', T('corr.next')]]))),
      panel(PG.h('p', { class: 'cap' }, T('verd.cap')), verdBox),
      panel(PG.h('p', { class: 'cap' }, T('state.cap')), PG.h('div', { style: 'overflow-x:auto' }, table)),
      panel(chanCap, chan, tapsSvg),
      note.root));

    ui = { root, cursor, canvases };
    session();
  }

  // Canvases take their colours when drawn, so a theme switch or a new width redraws them.
  const redraw = () => { if (ui && ui.root.isConnected && DATA) ui.canvases(); };
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw); } catch (e) { /* old browsers */ }
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(redraw, 120); });
  addEventListener('keydown', e => {
    if (!ui || !ui.root.isConnected || !DATA || st.row === null) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    st.row = PG.clamp(st.row + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 10 : 1), 0, S().freq.n - 1);
    ui.cursor();
    e.preventDefault();
  });

  PG.register({ id: 'sim', mount });
})();
