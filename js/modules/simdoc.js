/* The simulator's description (js/wiki/simdoc.js): the two boards it rests on, the current version
   of muf.sim, and how the page beside it reads. Written by hand, in Russian and English. */
(function () {
  'use strict';

  PG.i18n({
    ru: {
      'simdoc.nav': 'Имитатор: описание', 'simdoc.part': 'Дополнение · Имитатор КВ-канала',
      'simdoc.title': 'Имитатор КВ-канала: как он устроен и что показывает',
      'simdoc.lede': 'Как из ЛЧМ-сигнала получается ионограмма и что из неё читается, как по сеансу строится состояние канала, как по состоянию синтезируются копии и как они проверяются. Здесь же — текущая версия имитатора, путеводитель по странице «Имитатор канала» и итоги сеансов 17 октября.',
      'simdoc.short': 'Две схемы — ионограмма с функциями канала и дисперсия внутри моды, — текущая версия имитатора, его модель, проверки и путеводитель по странице с копиями.',
    },
    en: {
      'simdoc.nav': 'Simulator: notes', 'simdoc.part': 'Supplement · HF channel simulator',
      'simdoc.title': 'The HF channel simulator: how it works and what it shows',
      'simdoc.lede': 'How a chirp becomes an ionogram and what is read from it, how a channel state is built from a sounding, how copies are synthesised from the state and how they are checked. Also here: the simulator’s current version, a guide to the Channel simulator page, and what the soundings of 17 October showed.',
      'simdoc.short': 'Two boards (the ionogram with the channel’s functions, and dispersion within a mode), the simulator’s current version, its model, its checks, and a guide to the page with the copies.',
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

  // Section links are #simdoc/<id>; the router scrolls to the element simdoc-<id>.
  PG.register({
    id: 'simdoc',
    mount(root) {
      const box = PG.h('div', { class: 'wiki simdoc', html: PG.simDoc[PG.lang] });
      verdict(box);
      root.append(box);
    },
  });
})();
