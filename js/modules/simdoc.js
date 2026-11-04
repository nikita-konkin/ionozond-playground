/* The simulator's description (js/wiki/simdoc.js): the six boards it rests on, the current version
   of muf.sim with its block diagram, and how the page beside it reads. Written by hand, in Russian and English. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'simdoc.nav': 'Имитатор: описание', 'simdoc.part': 'Дополнение · Имитатор КВ-канала',
      'simdoc.title': 'Имитатор КВ-канала: как он устроен и что показывает',
      'simdoc.lede': "Как из ЛЧМ-сигнала формируется ионограмма, какие параметры можно по ней определить и как по ним моделируются новые сеансы зондирования. В разделе описаны устройство и текущая версия имитатора, методы проверки новый режим 1F в полосе 1 МГц, прогноз во времени и воспроизводимый стенд проверки. Встроенные сеансы за 17 октября приведены как архивный пример.",
      'simdoc.short': "Шесть схем поясняют формирование ионограммы, второе сжатие, внутримодовую дисперсию, медленные и быстрые изменения канала. Далее приведены модель имитатора, измерение рабочей полосы, прогноз, стенд проверки и текущий интерфейс сравнения сеансов.",
    },
    en: {
      'simdoc.nav': 'Simulator: notes', 'simdoc.part': 'Supplement · HF channel simulator',
      'simdoc.title': 'The HF channel simulator: how it works and what it shows',
      'simdoc.lede': 'How a chirp becomes an ionogram and what is read from it, how a channel state is built from a sounding, how new soundings are synthesised from the state and how they are checked. Also here: the simulator’s current version, a guide to the Channel simulator page, the new 1F band measurement, forecasts over time and a frozen benchmark. Embedded 17 October results are retained as an archival example.',
      'simdoc.short': 'Six boards (the ionogram with the channel’s functions, the second dechirp, dispersion within a mode, the slow and fast parts of the state, and the channel at one carrier), the simulator’s current version, the band measurement, forecasting, benchmark and current comparison interface.',
    },
  });

  // The verdict schematic: a normal curve, its ticks and twelve copies, on one scale of z.
  function verdict(box) {
    const X = z => 320 + z * 560 / 12, Y = z => 150 - 100 * Math.exp(-z * z / 2);
    const bell = box.querySelector('[data-v="bell"]'), ticks = box.querySelector('[data-v="ticks"]'), copies = box.querySelector('[data-v="copies"]');
    if (!bell) return;
    let d = '';
    for (let z = -6; z <= 6.0001; z += 0.1) d += (d ? ' L' : 'M') + X(z).toFixed(1) + ',' + Y(z).toFixed(1);
    bell.setAttribute('d', d);
    for (const v of [-6, -3, 0, 3, 6]) {
      PG.el(ticks, 'line', { x1: X(v), x2: X(v), y1: 150, y2: 156, stroke: 'var(--muted)' });
      PG.el(ticks, 'text', { x: X(v), y: 172, 'font-size': 11, 'text-anchor': 'middle', fill: 'var(--muted)' })
        .textContent = v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v) + 'σ';
    }
    for (const v of [-1.6, -1.1, -0.75, -0.45, -0.2, 0.05, 0.2, 0.45, 0.7, 0.95, 1.25, 1.7])
      PG.el(copies, 'circle', { cx: X(v), cy: 150, r: 3.6, fill: 'var(--faint)' });
  }

  // The block diagram of muf.sim: lanes of rows of blocks. A label is one string or a [ru, en] pair, with _x and
  // _{..} for subscripts and ^{..} for superscripts. A block's side holds what enters it from above.
  const CONJ = '( )*';
  const RX = ['в приёмнике: цифровое сжатие', 'in the receiver: digital dechirp'];
  const PATH = ['для каждого пути p', 'for every path p'];
  const LANES = [
    { title: ['1 · Состояние канала по реальному сеансу', '1 · Observer: a real sounding becomes a channel state'],
      sub: ['<code>muf.sim.observe</code>: медленная часть по ионограмме мощности. Продукт <code>.h5</code> второй версии приходит готовой ионограммой: БПФ выполнено при записи.',
        '<code>muf.sim.observe</code>: the slow part, read off the power ionogram. A v2 <code>.h5</code> product arrives as the ionogram itself, its FFT done at acquisition.'],
      rows: [
        { nodes: [
          { k: 'd', t: ['принятая\nразвёртка r(t)', 'received\nsweep r(t)'], grp: RX },
          { k: 'b', t: ['АЦП', 'ADC'], grp: RX },
          { k: 'x', side: [['опорный ЛЧМ c[n]', 'local chirp c[n]'], CONJ], grp: RX },
          { k: 'b', t: ['ФНЧ,\nдецимация', 'low-pass,\ndecimate'], grp: RX },
          { k: 'd', t: ['x[n], разностная\nчастота (.lfs)', 'x[n] dechirped\nIQ (.lfs)'] }] },
        { nodes: [
          { k: 'b', t: ['окна по N = 8192;\nокно i ↔ частота f_i', 'windows of N = 8192;\nwindow i ↔ f_i'] },
          { k: 'x', side: [['окно Ханна w[n]', 'Hann w[n]']] },
          { k: 'f', t: ['БПФ\nN отсчётов', 'FFT\nN points'] },
          { k: 'b', t: 'fftshift' },
          { k: 'b', t: '|·|²' },
          { k: 'b', t: ['÷ (4 ln2 · медиана)\nнормировка', '÷ (4 ln2 · median)\nnormalise'] }] },
        { nodes: [
          { k: 'b', t: ['окно задержек\nτ = −f_b / k', 'range gate\nτ = −f_b / k'] },
          { k: 'b', t: '10·log10(P/10⁻³)' },
          { k: 'd', t: ['ионограмма\nP(f, τ)', 'ionogram\nP(f, τ)'] },
          { k: 'b', t: ['очистка\nот помех', 'interference\nrejection'] },
          { k: 'b', t: ['контур\nОСШ ≥ 13 дБ', 'contour\nSNR ≥ 13 dB'] }] },
        { nodes: [
          { k: 'b', t: ['центры отрезков\nс весом мощности', 'runs → power-\nweighted centres'] },
          { k: 'b', t: ['следы\nбез пересечений', 'tracks that\nnever cross'] },
          { k: 'b', t: ['число скачков;\nнижний и верхний луч', 'hop labels;\nlow and high rays'] },
          { k: 'b', t: ['сплайн τ_m(f), ≤ 1 экстр.;\nв live: 1F по слою', 'spline τ_m(f), ≤ 1 turn;\nlive: 1F from a layer'] }] },
        { par: ['для каждой моды m', 'for every mode m'], nodes: [
          { k: 'b', t: 'd/df → GDD\nd²/df² → TOD' },
          { k: 'b', t: ['P − шум по ±2 отсчётам,\nпоровну между модами\n→ C/N₀(f)', 'P − noise over ±2 bins,\nshared among modes\n→ C/N₀(f)'] },
          { k: 'b', t: ['ширина следа − Ханн\n→ рассеяние по задержке', 'trace width − Hann\n→ delay spread'] },
          { k: 'b', t: ['Доплер: априори F.1487\nили дорожка 1б', 'Doppler: F.1487\nprior, or lane 1b'] }] },
        { nodes: [
          { k: 'd', t: ['ChannelState: для каждой моды f, τ(f), C/N₀(f), GDD, TOD, рассеяние по задержке,\nдоплеровское расширение, K Райса; развёртка, трасса, время',
            'ChannelState: per mode f, τ(f), C/N₀(f), GDD, TOD,\ndelay and Doppler spread, Rice K; sweep, circuit, epoch'] }] },
      ] },
    { title: ['1б · Быстрая часть (по выбору): доплеровские параметры по фазе', '1b · Fast part (optional): Doppler off the voltage'],
      sub: ['<code>muf.sim.fast</code>: второе сжатие вдоль ДЧХ моды', '<code>muf.sim.fast</code>: a second dechirp along the mode’s own delay curve'],
      rows: [
        { nodes: [
          { k: 'd', t: 'x[n]' },
          { k: 'x', side: ['exp(j2π∫b_m dt),\nb_m = −k·τ_m(f(t))', CONJ] },
          { k: 'b', t: ['ФНЧ\nдесятки Гц', 'low-pass\ntens of Hz'] },
          { k: 'b', t: '|·|² → P(t)' },
          { k: 'b', t: ['D(L) / ⟨P²⟩\nструктурная функция', 'D(L) / ⟨P²⟩\nstructure function'] }] },
        { nodes: [
          { k: 'b', t: ['|R(L)| из\nC_P = |R|²', '|R(L)| from\nC_P = |R|²'] },
          { k: 'b', t: ['подгонка: σ,\nформа, K Райса', 'fit: spread σ,\nshape, Rice K'] },
          { k: 'b', t: ['пара o/x:\nрасщепление, x/o дБ', 'o/x pair fit:\nsplit, x/o dB'] },
          { k: 'd', t: ['доплеровские\nполя состояния', 'Doppler fields\nof the state'] }] },
      ] },
    {
  "title": [
    "1в · Одна мода в рабочей полосе",
    "1c · One mode in a working band"
  ],
  "sub": [
    "<code>muf.sim.band</code>: 1F, 1 МГц около 0,75 МНЧ; отдельный режим",
    "<code>muf.sim.band</code>: 1F, 1 MHz at 0.75 MUF; a separate mode"
  ],
  "rows": [
    {
      "nodes": [
        {
          "k": "d",
          "t": [
            "самый ранний нижний луч;\nполоса целиком",
            "earliest low ray;\nwhole band covered"
          ]
        },
        {
          "k": "x",
          "side": [
            "exp(j2π∫b₁ dt)",
            "( )*"
          ]
        },
        {
          "k": "b",
          "t": [
            "центр эха;\nФНЧ",
            "re-centre echo;\nlow-pass"
          ]
        },
        {
          "k": "d",
          "t": "a(t)"
        }
      ]
    },
    {
      "par": [
        "измерение по комплексному сигналу",
        "measure the complex signal"
      ],
      "nodes": [
        {
          "k": "b",
          "t": [
            "мощность / шум;\nмедианный отступ\n→ C/N₀",
            "power / noise;\nmedian offset\n→ C/N₀"
          ]
        },
        {
          "k": "b",
          "t": [
            "фаза, лаг 0,1 с;\nквадратичная подгонка\n→ τ, GDD, TOD",
            "phase, 0.1 s lag;\nquadratic fit\n→ τ, GDD, TOD"
          ]
        },
        {
          "k": "b",
          "t": [
            "структурная функция\n→ замирания",
            "structure function\n→ fading"
          ]
        }
      ]
    },
    {
      "nodes": [
        {
          "k": "d",
          "t": [
            "состояние полосы:\nτ, GDD по фазе;\nTOD по ДЧХ",
            "band state:\nphase τ, GDD;\ntrace TOD"
          ]
        },
        {
          "k": "b",
          "t": [
            "рассеяние по задержке = 0:\nуже входит в замирания",
            "delay spread = 0:\nalready in fading"
          ]
        },
        {
          "k": "b",
          "t": [
            "12 синтезов\nи повторных измерений",
            "12 copies\nread back"
          ]
        },
        {
          "k": "d",
          "t": [
            "сравнение с реальным\nпо правилу уровня 2",
            "real vs copies\nby level 2 rule"
          ]
        }
      ]
    }
  ]
},
    { title: ['2 · Замирания: множитель g<sub>p</sub>(t) одного пути', '2 · Fading gain g<sub>p</sub>(t) of one path'],
      sub: ['<code>muf.sim.fading</code>: гауссово рассеяние по Уоттерсону, ITU-R F.1487, или лоренцев спектр', '<code>muf.sim.fading</code>: Watterson Gaussian scatter, ITU-R F.1487, or a Lorentzian spectrum'],
      rows: [
        { nodes: [
          { k: 'd', t: ['белый шум\nCN(0, 1)', 'white noise\nCN(0, 1)'] },
          { k: 'f', t: ['БПФ', 'FFT'] },
          { k: 'x', side: [['√S(ν): гауссов\nили лоренцев', '√S(ν): Gaussian\nor Lorentzian']] },
          { k: 'f', t: ['ОБПФ', 'iFFT'] },
          { k: 'b', t: ['отброс краёв;\nсетка 32σ', 'drop wrap margins;\ngrid at 32σ'] }] },
        { nodes: [
          { k: 'b', t: ['линейная интерп.\nк моменту t', 'linear interp.\nto time t'] },
          { k: 'x', side: ['√(1/(K+1))'] },
          { k: 'p', side: [['√(K/(K+1))·e^{jφ}\nзеркальная часть', '√(K/(K+1))·e^{jφ}\nspecular part']] },
          { k: 'x', side: [['exp(j2πν_s t)\nдоплеровский сдвиг', 'exp(j2πν_s t)\nDoppler shift']] },
          { k: 'd', t: 'g_p(t)' }] },
      ] },
    { title: ['3 · Канал для сигнала модема на несущей f<sub>c</sub>', '3 · Channel for a modem signal at carrier f<sub>c</sub>'],
      sub: ['<code>muf.sim.channel</code>: y(t) = Σ<sub>p</sub> g<sub>p</sub>(t)·(h<sub>p</sub> ∗ x)(t) + шум; фильтрация — в частотной области', '<code>muf.sim.channel</code>: y(t) = Σ<sub>p</sub> g<sub>p</sub>(t)·(h<sub>p</sub> ∗ x)(t) + noise; the filtering is done in the frequency domain'],
      rows: [
        { nodes: [
          { k: 'd', t: ['сигнал модема\nx[n], f_s', 'modem signal\nx[n], f_s'] },
          { k: 'f', t: ['БПФ\nn_{fft}', 'FFT\nn_{fft}'] },
          { k: 'x', side: [['exp(−j2πf·L/f_s)\nзадержка на L отсчётов', 'exp(−j2πf·L/f_s)\ndelay by L samples']] },
          { k: 'x', side: ['H_p(f)'], grp: PATH },
          { k: 'f', t: ['ОБПФ', 'iFFT'], grp: PATH },
          { k: 'x', side: [['g_p(t)\nдорожка 2', 'g_p(t)\nlane 2']], grp: PATH },
          { k: 's', side: [['другие\nпути', 'other\npaths']] }] },
        { nodes: [
          { k: 'x', side: [['1/√(Σ_p P_p)\nнормировка мощности', '1/√(Σ_p P_p)\nnormalise power']] },
          { k: 'p', side: [['АБГШ\nпри заданном ОСШ', 'AWGN\nat the set SNR']] },
          { k: 'd', t: ['y[n]: принятый\nсигнал', 'y[n] received\nsignal'] }] },
        { cut: true, note: ['как H_p(f) строится по состоянию:', 'how H_p(f) is built from the state:'], nodes: [
          { k: 'd', t: ['ChannelState\nдорожка 1', 'ChannelState\nlane 1'] },
          { k: 'b', t: ['state.at(f_c):\nмоды, где есть f_c', 'state.at(f_c):\nmodes covering f_c'] },
          { k: 'b', t: ['волны o и x;\nпути рассеяния\nпо задержке', 'o and x waves;\ndelay-spread taps'] },
          { k: 'b', t: ['A_p(f) = √C/N₀(f),\nспад на краях', 'A_p(f) = √C/N₀(f),\nedge taper'] },
          { k: 'd', t: 'H_p(f) = A_p(f) ·\nexp(−j2π∫τ_p df)' }] },
      ] },
    { title: ['4 · Синтетический сеанс по состоянию', '4 · Synthetic sounding: the state sounded back'],
      sub: ['<code>muf.sim.sounding</code>: стенд обрабатывает синтезированные сеансы трактом дорожки 1 и сравнивает их с реальным', '<code>muf.sim.sounding</code>: the bench reads these copies with lane 1 and compares them with the real sounding'],
      rows: [
        { nodes: [
          { k: 'd', t: 't = n / f_s' },
          { k: 'b', t: 'f(t) =\nf₀ + k·t' },
          { k: 'b', t: ['τ_m(f(t)) на сетке\nчерез 64 отсчёта', 'τ_m(f(t)) on a\n64-sample grid'] },
          { k: 'x', side: ['−k'] },
          { k: 'b', t: ['∫ dt (cumsum / f_s)\nфаза биений φ_m', '∫ dt (cumsum / f_s)\nbeat phase φ_m'] }] },
        { nodes: [
          { k: 'b', t: 'exp(j2πφ_m)' },
          { k: 'x', side: [['a_m = √(C/N₀ / f_s)\nспад на краях полосы', 'a_m = √(C/N₀ / f_s)\nband-edge taper']] },
          { k: 'x', side: [['g_m(t)\nдорожка 2', 'g_m(t)\nlane 2']] },
          { k: 's', side: [['другие моды,\nволны, пути', 'other modes,\nwaves, taps']] },
          { k: 'p', side: [['шум\nCN(0, 1)', 'noise\nCN(0, 1)']] }] },
        { nodes: [
          { k: 'd', t: ['запись разностной\nчастоты (.lfs)', 'dechirped\nrecord (.lfs)'] },
          { k: 'b', t: ['тот же тракт\nдорожки 1', 'same observer\nlane 1'] },
          { k: 'd', t: ['сравнение с реальным\nсеансом (стенд)', 'copy vs real\nsounding (bench)'] }] },
      ] },
    { title: ['5 · Ряды состояний и показатели линии', '5 · Over time, and the link a modem sees'],
      sub: ['<code>muf.sim.series</code>, <code>forecast</code>, <code>link</code>', '<code>muf.sim.series</code>, <code>forecast</code>, <code>link</code>'],
      rows: [
        { nodes: [
          { k: 'd', t: ['состояние\nпо каждому сеансу', 'one state\nper sounding'] },
          { k: 'b', t: ['инерционный прогноз:\nсостояние t на t + L', 'persistence forecast:\nstate at t for t + L'] },
          { k: 'b', t: ['check.match: моды\nпрогноза и сеанса t + L\nпарами по задержке', 'check.match: forecast\nand sounding t + L\nmodes paired by delay'] },
          { k: 'd', t: ['ошибки прогноза;\nпропущенные\nи ложные моды', 'forecast errors;\nmissed and\nfalse modes'] }] },
        {
  "cut": true,
  "note": [
    "оперативный цикл live:",
    "the live loop:"
  ],
  "nodes": [
    {
      "k": "d",
      "t": [
        "инерционный\nпрогноз",
        "persisted\nforecast"
      ]
    },
    {
      "k": "b",
      "t": [
        "синтез сеанса;\nокно эха",
        "synthesise sounding;\necho window"
      ]
    },
    {
      "k": "b",
      "t": [
        "повторное\nизмерение",
        "observe\nagain"
      ]
    },
    {
      "k": "d",
      "t": [
        "оценка по контролю;\nпроверка часов",
        "score against truth;\nclock check"
      ]
    }
  ]
},
        { cut: true, note: ['что видит модем на несущей f₀:', 'what a modem sees at carrier f₀:'], nodes: [
          { k: 'd', t: ['ChannelState\nдорожка 1', 'ChannelState\nlane 1'] },
          { k: 'b', t: 'state.at(f₀)' },
          { k: 'b', t: ['link.present:\nC/N₀ ≥ 25 дБГц,\n≤ 20 дБ ниже сильнейшей', 'link.present:\nC/N₀ ≥ 25 dBHz,\n≤ 20 dB under strongest'] },
          { k: 'd', t: ['рассеяние по задержке,\nполоса и время когерентности,\nОСШ в 3 кГц', 'delay spread,\ncoherence band and time,\nSNR in 3 kHz'] }] },
      ] },
  ];

  // Draws LANES into host: a legend, then per lane its heading and one SVG, every block sized to its text
  // and every lane drawn to the same scale, so a label reads the same size throughout.
  function blocks(host) {
    const R = 14, X0 = 26, GAP = 22;
    const say = v => Array.isArray(v) ? v[PG.lang === 'ru' ? 0 : 1] : v;
    const runs = s => s.split(/([_^](?:\{[^}]*\}|.))/).filter(Boolean).map(p => /^[_^]/.test(p)
      ? { s: p.slice(1).replace(/^\{|\}$/g, ''), dy: p[0] === '_' ? 3 : -4 } : { s: p, dy: 0 });
    const ctx = document.createElement('canvas').getContext('2d');
    const span = (line, size, bold) => runs(line).reduce((a, r) => {
      ctx.font = `${bold ? 600 : 400} ${r.dy ? size * 0.75 : size}px "IBM Plex Sans", sans-serif`;
      return a + ctx.measureText(r.s).width;
    }, 0);
    const lines = t => say(t).split('\n');
    const across = (t, size, bold) => Math.max(...lines(t).map(l => span(l, size, bold)));
    const op = n => 'xps'.includes(n.k);
    const width = n => op(n) ? 2 * R : Math.max(46, across(n.t, 11, n.k === 'f') + 20);
    const tall = it => it === CONJ ? 22 : lines(it).length * 12 + 4;
    const rise = n => (n.side || []).reduce((a, it) => a + tall(it) + 10, 0);
    const foot = n => Math.max(width(n), ...(n.side || []).map(it => it === CONJ ? 44 : across(it, 10) + 10));
    const height = row => Math.max(40, ...row.nodes.filter(n => !op(n)).map(n => lines(n.t).length * 13 + 14));
    const lay = row => {
      const gap = row.par ? 12 : GAP;
      let x = X0 + (row.par ? 10 : 0);
      const placed = row.nodes.map(n => {
        const f = foot(n), cx = x + f / 2;
        x += f + gap;
        return { n, cx };
      });
      return { placed, end: x - gap + (row.par ? 10 : 0) };
    };
    const W = Math.ceil(Math.max(712, ...LANES.flatMap(l => l.rows.map(r => lay(r).end + 14))));
    const write = (svg, x, y, t, size, cls, anchor) => {
      const all = lines(t);
      all.forEach((line, i) => {
        const e = PG.el(svg, 'text', { x, y: y + (i - (all.length - 1) / 2) * (size + 2) + size * 0.36, 'text-anchor': anchor || 'middle', 'font-size': size, class: cls });
        let at = 0;
        for (const r of runs(line)) {
          PG.el(e, 'tspan', { dy: r.dy - at, 'font-size': r.dy ? size * 0.75 : null }).textContent = r.s;
          at = r.dy;
        }
      });
    };
    const lane = spec => {
      host.append(PG.h('p', { class: 'lane', html: `<b>${say(spec.title)}</b><span>${say(spec.sub)}</span>` }));
      const svg = PG.el(host, 'svg', { class: 'flow', role: 'img', 'aria-label': say(spec.title).replace(/<[^>]+>/g, '') });
      const id = PG.uid('arrow');
      const marker = PG.el(PG.el(svg, 'defs'), 'marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      PG.el(marker, 'path', { d: 'M0,0L10,5L0,10z', class: 'head' });
      const wire = d => PG.el(svg, 'path', { d, class: 'wire', 'marker-end': `url(#${id})` });
      const node = (n, cx, cy, H) => {
        if (op(n)) {
          PG.el(svg, 'circle', { cx, cy, r: R, class: 'op' });
          const a = R * (n.k === 'x' ? 0.48 : 0.58);
          if (n.k === 's') write(svg, cx, cy, 'Σ', 15, 'opsym');
          else PG.el(svg, 'path', { class: 'opmark', d: n.k === 'x'
            ? `M${cx - a},${cy - a}L${cx + a},${cy + a}M${cx + a},${cy - a}L${cx - a},${cy + a}`
            : `M${cx - a},${cy}L${cx + a},${cy}M${cx},${cy - a}L${cx},${cy + a}` });
        } else {
          const w = width(n);
          PG.el(svg, 'rect', { x: cx - w / 2, y: cy - H / 2, width: w, height: H, rx: n.k === 'd' ? 20 : 6, class: { b: 'box', f: 'fft', d: 'data' }[n.k] });
          write(svg, cx, cy, n.t, 11, n.k === 'f' ? 'bold' : null);
        }
        let bottom = cy - (op(n) ? R : H / 2);
        for (const it of (n.side || []).slice().reverse()) {
          const h = tall(it), top = bottom - 10 - h;
          wire(`M${cx},${top + h}L${cx},${bottom - 1}`);
          if (it === CONJ) {
            PG.el(svg, 'rect', { x: cx - 22, y: top, width: 44, height: h, rx: 5, class: 'conj' });
            write(svg, cx, top + h / 2, CONJ, 11, 'bold');
          } else write(svg, cx, top + h / 2, it, 10, 'small');
          bottom = top;
        }
      };
      let y = 6, prev = null;
      for (const row of spec.rows) {
        const { placed, end } = lay(row), H = height(row), side = Math.max(0, ...row.nodes.map(rise));
        if (row.note) {
          write(svg, X0 - 18, y + 7, row.note, 10, 'glabel', 'start');
          y += 16;
        }
        const cy = y + side + H / 2;
        placed.forEach(p => node(p.n, p.cx, cy, H));
        if (!row.par) placed.slice(1).forEach((b, i) => wire(`M${placed[i].cx + width(placed[i].n) / 2},${cy}L${b.cx - width(b.n) / 2 - 1},${cy}`));
        const grouped = placed.filter(p => p.n.grp);
        const label = row.par || (grouped.length ? grouped[0].n.grp : null);
        const gx0 = row.par ? X0 : Math.min(...grouped.map(p => p.cx - foot(p.n) / 2));
        const gx1 = row.par ? end : Math.max(...grouped.map(p => p.cx + foot(p.n) / 2));
        if (label) {
          const gy0 = cy - H / 2 - side - 4, gy1 = cy + H / 2 + 8;
          PG.el(svg, 'rect', { x: gx0 - 6, y: gy0, width: gx1 - gx0 + 12, height: gy1 - gy0, rx: 8, class: 'grp' });
          write(svg, gx1 + 4, gy1 + 10, label, 10, 'glabel', 'end');
        }
        const first = placed[0], last = placed[placed.length - 1];
        const entry = row.par ? X0 - 6 : first.cx - width(first.n) / 2 - 1;
        if (prev && !row.cut) wire(`M${prev.x},${prev.y}L${prev.x},${prev.y + prev.drop}L8,${prev.y + prev.drop}L8,${cy}L${entry},${cy}`);
        prev = row.par ? { x: (gx0 + gx1) / 2, y: cy + H / 2 + 8, drop: 12 }
          : { x: last.cx, y: cy + (op(last.n) ? R : H / 2), drop: label ? 30 : 12 };
        y = cy + H / 2 + 26 + (label ? 18 : 0);
      }
      svg.setAttribute('viewBox', `0 0 ${W} ${y - 14}`);
    };
    const icon = inner => `<svg viewBox="0 0 34 22" aria-hidden="true">${inner}</svg>`;
    host.replaceChildren(PG.h('div', { class: 'legend', html: [
      [icon('<rect x="2" y="3" width="30" height="16" rx="3" class="fft"/>'), ['БПФ / ОБПФ', 'FFT / iFFT']],
      [icon('<circle cx="17" cy="11" r="9" class="op"/><path d="M12.5,6.5L21.5,15.5M21.5,6.5L12.5,15.5" class="opmark"/>'), ['умножение', 'multiply']],
      [icon('<circle cx="17" cy="11" r="9" class="op"/><path d="M11.5,11L22.5,11M17,5.5L17,16.5" class="opmark"/>'), ['сложение', 'add']],
      [icon('<circle cx="17" cy="11" r="9" class="op"/><text x="17" y="15.5" text-anchor="middle" font-size="12" class="opsym">Σ</text>'), ['сумма по путям или модам', 'sum over paths or modes']],
      [icon('<rect x="5" y="4" width="24" height="14" rx="3" class="conj"/>'), ['комплексное сопряжение ( )*', 'complex conjugate ( )*']],
      [icon('<rect x="2" y="3" width="30" height="16" rx="8" class="data"/>'), ['сигнал или данные', 'signal or data']],
      [icon('<rect x="2" y="3" width="30" height="16" rx="3" class="box"/>'), ['операция', 'operation']],
      [icon('<rect x="2" y="3" width="30" height="16" rx="8" class="grp"/>'), ['группа блоков', 'group of blocks']],
    ].map(([s, t]) => `<span>${s}${say(t)}</span>`).join('') }));
    LANES.forEach(lane);
  }

  // Section links are #simdoc/<id>; the router scrolls to the element simdoc-<id>.
  PG.register({
    id: 'simdoc',
    mount(root) {
      const box = PG.h('div', { class: 'wiki simdoc', html: PG.simDoc[PG.lang] });
      const host = box.querySelector('[data-blocks]');
      verdict(box);
      if (host) blocks(host);
      root.append(box);
      if (host && document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (host.isConnected) blocks(host); });
    },
  });
})();
