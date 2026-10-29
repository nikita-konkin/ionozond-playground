/* Glossary: a page of the abbreviations the playground uses, and the same explanations in place.
   In the page text the first mention of a term in each paragraph, cell or card is underlined; hover,
   focus or a tap opens a short explanation with links to the wiki part and the glossary entry. */
(function () {
  'use strict';

  // k: id; ru/en: the forms that appear in each language's text; wiki: the document part it belongs to.
  const TERMS = [
    { k: 'gdd', ru: ['GDD'], en: ['GDD'], wiki: 'gdd' },
    { k: 'muf', ru: ['МНЧ', 'MUF'], en: ['MUF'], wiki: 'edges' },
    { k: 'luf', ru: ['ННЧ', 'LUF'], en: ['LUF'], wiki: 'edges' },
    { k: 'trace', ru: ['ДЧХ'], en: [], wiki: 'anatomy' },
    { k: 'hops', ru: ['1F', '2F', '3F'], en: ['1F', '2F', '3F'], wiki: 'hops' },
    { k: 'ox', ru: ['O/X'], en: ['O/X'], wiki: 'edges' },
    { k: 'fof2', ru: ['foF2'], en: ['foF2'], wiki: 'geometry' },
    { k: 'chirp', ru: ['ЛЧМ'], en: ['chirp', 'Chirp'], wiki: 'dechirp' },
    { k: 'fft', ru: ['БПФ'], en: ['FFT'], wiki: 'axes' },
    { k: 'if', ru: ['ПЧ'], en: ['IF'], wiki: 'axes' },
    { k: 'lo', ru: ['LO'], en: ['LO'], wiki: 'window' },
    { k: 'snr', ru: ['ОСШ', 'SNR'], en: ['SNR'], wiki: 'stripes' },
    { k: 'chirptime', ru: ['chirptime'], en: ['chirptime'], wiki: 'window' },
    { k: 'repoffset', ru: ['rep:offset'], en: ['rep:offset'], wiki: 'timing' },
    { k: 'gpsdo', ru: ['GPSDO'], en: ['GPSDO'], wiki: 'budget' },
    { k: 'ntp', ru: ['NTP'], en: ['NTP'], wiki: 'budget' },
  ];
  const PARTS = { chain: 0, reflection: 1, geometry: 2, hops: 3, edges: 4, dechirp: 5, axes: 6, window: 7, parallel: 8, timing: 9,
    anatomy: 10, gdd: 11, causes: 12, stripes: 13, budget: 14, limits: 15 };
  const N = ' ';

  PG.i18n({
    ru: {
      'glossary.nav': 'Глоссарий', 'glossary.part': 'Справочник', 'glossary.title': 'Глоссарий',
      'glossary.lede': 'Сокращения и термины, которые встречаются на страницах практикума. В тексте они подчёркнуты пунктиром: наведите на них курсор или нажмите, чтобы увидеть пояснение.',
      'glossary.short': 'Сокращения практикума с краткими пояснениями: GDD, МНЧ, БПФ, ЛЧМ и другие. Те же пояснения открываются прямо в тексте.',
      'gl.wiki': 'Вики, часть {n}', 'gl.all': 'Глоссарий',
      'gl.gdd.t': 'GDD — дисперсия групповой задержки',
      'gl.gdd.d': `Скорость роста задержки с частотой, dτ/df, т.${N}е. наклон ДЧХ в мкс/МГц. Ограничивает неискажённую полосу трассы величиной около 1/√GDD.`,
      'gl.muf.t': 'МНЧ — максимальная наблюдаемая частота',
      'gl.muf.d': 'Наибольшая частота, которую ионосфера возвращает на этой трассе. Вблизи неё задержка круто растёт и нижний луч смыкается с верхним, а выше неё след обрывается.',
      'gl.luf.t': 'ННЧ — наименьшая наблюдаемая частота',
      'gl.luf.d': 'Нижний край следа. Его задаёт поглощение в области D, а не отражение; днём ННЧ растёт, ночью падает.',
      'gl.trace.t': 'ДЧХ — дистанционно-частотная характеристика',
      'gl.trace.d': 'Зависимость задержки (группового пути) от частоты для одной моды распространения; на ионограмме это след.',
      'gl.hops.t': '1F, 2F, 3F — одно-, двух- и трёхскачковые моды',
      'gl.hops.d': 'Сигнал, отразившийся от слоя F один, два или три раза. На этой трассе 2F приходит примерно на 0,65 мс позже 1F, и чем больше скачков, тем ниже частота, на которой мода обрывается.',
      'gl.ox.t': 'O/X — обыкновенная и необыкновенная волны',
      'gl.ox.d': 'Магнитное поле Земли расщепляет каждый луч на две волны с немного разными показателями преломления; на ионограмме они видны как два близких следа.',
      'gl.fof2.t': 'foF2 — критическая частота слоя F2',
      'gl.fof2.d': 'Наибольшая частота, которую слой F2 отражает при вертикальном падении. МНЧ наклонной трассы примерно равна foF2, умноженной на секанс угла падения; на этой трассе множитель около 3.',
      'gl.chirp.t': 'ЛЧМ — линейная частотная модуляция',
      'gl.chirp.d': 'Сигнал, частота которого меняется во времени линейно. Зонд перестраивается от 7,5 до 32,5 МГц со скоростью 100 или 500 кГц/с, а приёмник умножает эхо на опорный ЛЧМ-сигнал (сжатие ЛЧМ-сигнала) и получает разностную частоту, пропорциональную задержке.',
      'gl.fft.t': 'БПФ — быстрое преобразование Фурье',
      'gl.fft.d': 'Превращает каждый отрезок сигнала разностной частоты длительностью 0,41 с в спектр, где разностная частота соответствует задержке. Длина БПФ задаёт ячейку ионограммы: шаг по частоте и шаг по задержке.',
      'gl.if.t': 'ПЧ — промежуточная частота',
      'gl.if.d': 'Полоса 40 кГц, которая остаётся после сжатия и децимации потока 25 Мвыб/с. Её ширина задаёт интервал однозначности по задержке: ±0,2 с при 100 кГц/с.',
      'gl.lo.t': 'LO — гетеродин',
      'gl.lo.d': 'Частота настройки приёмника. Окно приёмника — LO ± 12,5 МГц; гетеродин перестраивается перед каждой записью.',
      'gl.snr.t': 'ОСШ — отношение сигнал/шум',
      'gl.snr.d': 'Отношение мощности сигнала к мощности шума в децибелах. На нём основаны порог обнаружения и суточная панель ОСШ.',
      'gl.chirptime.t': 'chirptime — момент входа развёртки в окно',
      'gl.chirptime.d': 'Время в секундах от полуночи UTC по модулю rep, когда развёртка проходит нижний край окна приёмника. При неверном значении след сдвигается или пропадает.',
      'gl.repoffset.t': 'rep:offset — расписание передатчика',
      'gl.repoffset.d': 'Запись в обозначениях G3PLX: период и секунда после начала каждого часа, в которую развёртка проходит 0 МГц. Пересчитывается в chirptime.',
      'gl.gpsdo.t': 'GPSDO — генератор с подстройкой по GPS',
      'gl.gpsdo.d': 'Опорные часы приёмника, синхронизированные с GPS. При синхронизации ошибка времени меньше 1 мкс; без неё шкала задержек привязана к NTP.',
      'gl.ntp.t': 'NTP — протокол сетевого времени',
      'gl.ntp.d': 'Резервный источник времени. Его ошибка 1–10 мс сдвигает след на 300–3000 км, и абсолютная дальность теряется.',
    },
    en: {
      'glossary.nav': 'Glossary', 'glossary.part': 'Reference', 'glossary.title': 'Glossary',
      'glossary.lede': 'The abbreviations and terms the playground uses. In the text they are underlined with dots: hover over one, or tap it, to see what it means.',
      'glossary.short': 'The playground’s abbreviations, briefly explained: GDD, MUF, FFT, chirp and more. The same notes open in place in the text.',
      'gl.wiki': 'Wiki, part {n}', 'gl.all': 'Glossary',
      'gl.gdd.t': 'GDD — group-delay dispersion',
      'gl.gdd.d': 'How fast the delay grows with frequency, dτ/df: the slope of the trace, in µs/MHz. It limits the bandwidth a path carries undistorted to about 1/√GDD.',
      'gl.muf.t': 'MUF — maximum usable frequency',
      'gl.muf.d': 'The highest frequency the ionosphere returns over this path. Near it the delay rises steeply into the nose, and above it the trace ends.',
      'gl.luf.t': 'LUF — lowest usable frequency',
      'gl.luf.d': 'The low end of the trace, set by absorption in the D region rather than by reflection. It rises by day and falls at night.',
      'gl.trace.t': 'Trace (ДЧХ)',
      'gl.trace.d': 'Delay, or group path, against frequency for one propagation mode: the curve an ionogram shows.',
      'gl.hops.t': '1F, 2F, 3F — hop modes',
      'gl.hops.d': 'The signal reflected from the F layer once, twice or three times. On this path 2F arrives about 0.65 ms after 1F, and each higher order ends at a lower frequency.',
      'gl.ox.t': 'O/X — ordinary and extraordinary modes',
      'gl.ox.d': 'The Earth’s magnetic field splits each ray into two modes with slightly different refractive indices; they show as two close traces.',
      'gl.fof2.t': 'foF2 — critical frequency of the F2 layer',
      'gl.fof2.d': 'The highest frequency the F2 layer reflects at vertical incidence. An oblique path’s MUF is about foF2 times the secant of the incidence angle, a factor near 3 on this path.',
      'gl.chirp.t': 'Chirp — linear frequency modulation',
      'gl.chirp.d': 'A signal whose frequency changes linearly with time. The sounder sweeps 7.5 → 32.5 MHz at 100 or 500 kHz/s, and the receiver multiplies the echo by a copy of the sweep (the dechirp) to get a beat frequency proportional to delay.',
      'gl.fft.t': 'FFT — fast Fourier transform',
      'gl.fft.d': 'Turns each 0.41 s piece of the dechirped signal into a spectrum in which beat frequency stands for delay. Its length sets the ionogram cell: frequency step against delay bin.',
      'gl.if.t': 'IF — intermediate frequency',
      'gl.if.d': 'The 40 kHz band left after the 25 MS/s stream is dechirped and decimated. Its width sets the unambiguous delay, ±0.2 s at 100 kHz/s.',
      'gl.lo.t': 'LO — local oscillator',
      'gl.lo.d': 'The receiver’s tuning frequency. The receiver window is LO ± 12.5 MHz, retuned before every capture.',
      'gl.snr.t': 'SNR — signal-to-noise ratio',
      'gl.snr.d': 'Signal power over noise power, in decibels. The detection threshold and the daily SNR panel are built on it.',
      'gl.chirptime.t': 'chirptime — when the sweep enters the window',
      'gl.chirptime.d': 'Seconds after UTC midnight, modulo rep, at which the sweep crosses the bottom of the receiver window. A wrong value shifts the trace or loses it.',
      'gl.repoffset.t': 'rep:offset — a transmitter’s timing',
      'gl.repoffset.d': 'The G3PLX notation: the period, and the second after each full hour at which the sweep passes 0 MHz. It converts to chirptime.',
      'gl.gpsdo.t': 'GPSDO — GPS-disciplined oscillator',
      'gl.gpsdo.d': 'The receiver clock, locked to GPS. While locked, timing is better than 1 µs; without it the delay axis falls back to NTP.',
      'gl.ntp.t': 'NTP — Network Time Protocol',
      'gl.ntp.d': 'The fallback clock source. Its 1–10 ms error moves the trace by 300–3000 km, so absolute range is lost.',
    },
  });

  /* --------------------------------------------------------- marking text */

  // Not inside links, controls, math, figures or headings; nor in labels and summaries, where a tap
  // would also toggle the control.
  const SKIP = 'svg, a, button, select, option, input, textarea, label, summary, code, sub, sup, var, h1, h2, h3, ' +
    '.gl, .gl-pop, .gloss, .wiki-toc, .part-no, .eyebrow, .legend, .seg';
  const BLOCK = 'p, li, td, th, dd, figcaption, caption, .card, .note, .eq, .cap, div';
  const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const RX = {}, FORM = {};
  for (const l of ['ru', 'en']) {
    FORM[l] = {};
    TERMS.forEach(t => t[l].forEach(f => { FORM[l][f] = t.k; }));
    const forms = Object.keys(FORM[l]).sort((a, b) => b.length - a.length).map(esc);
    RX[l] = new RegExp('(?<![\\p{L}\\p{N}_])(' + forms.join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
  }

  // Wraps the first mention of each term per block. Marks already in the block count, so running it
  // again over the same text changes nothing.
  function wrap(node) {
    const re = RX[PG.lang], s = node.data, block = node.parentElement.closest(BLOCK) || node.parentElement;
    const out = [], seen = new Set();
    let last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(s))) {
      const k = FORM[PG.lang][m[1]];
      if (seen.has(k) || block.querySelector(`.gl[data-g="${k}"]`)) continue;
      seen.add(k);
      out.push(s.slice(last, m.index), PG.h('abbr', { class: 'gl', 'data-g': k, tabindex: 0 }, m[1]));
      last = m.index + m[1].length;
    }
    if (!out.length) return;
    out.push(s.slice(last));
    node.replaceWith(...out.filter(x => x !== ''));
  }

  function mark(root) {
    if (root.nodeType === 3) root = root.parentElement ? root : null;
    if (!root || (root.nodeType === 1 && root.closest(SKIP))) return;
    const found = [];
    if (root.nodeType === 3) found.push(root);
    else {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) found.push(n);
    }
    const re = RX[PG.lang];
    for (const n of found) {
      if (!n.isConnected || !n.parentElement || n.parentElement.closest(SKIP)) continue;
      re.lastIndex = 0;
      if (re.test(n.data)) wrap(n);
    }
  }

  // Pages redraw parts of themselves on every slider move, so new text is marked as it arrives. The
  // wrapping is itself a mutation, but marking marked text again changes nothing, so it settles.
  new MutationObserver(recs => {
    const q = new Set();
    for (const r of recs) {
      if (r.type === 'characterData') q.add(r.target);
      else r.addedNodes.forEach(n => q.add(n));
    }
    q.forEach(mark);
  }).observe(document.getElementById('main'), { childList: true, subtree: true, characterData: true });

  /* ---------------------------------------------------------------- popup */

  const pop = PG.h('div', { class: 'gl-pop', id: 'gl-pop', role: 'tooltip', hidden: true });
  document.body.append(pop);
  let cur = null, pinned = false, timer = 0;

  function place() {
    const r = cur.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = PG.clamp(r.left, 8, innerWidth - w - 8) + 'px';
    pop.style.top = (r.bottom + 6 + h > innerHeight - 8 && r.top - 6 - h > 8 ? r.top - 6 - h : r.bottom + 6) + 'px';
  }
  function show(el, pin) {
    clearTimeout(timer);
    const t = TERMS.find(x => x.k === el.dataset.g);
    if (cur && cur !== el) cur.removeAttribute('aria-describedby');
    cur = el; pinned = !!pin;
    pop.replaceChildren(PG.h('b', null, PG.t('gl.' + t.k + '.t')), PG.h('p', null, PG.t('gl.' + t.k + '.d')),
      PG.h('div', { class: 'links' }, PG.h('a', { href: '#wiki/' + t.wiki }, PG.t('gl.wiki', { n: PARTS[t.wiki] })),
        PG.h('a', { href: '#glossary/' + t.k }, PG.t('gl.all'))));
    pop.hidden = false;
    el.setAttribute('aria-describedby', 'gl-pop');
    place();
  }
  function hide() {
    clearTimeout(timer);
    if (cur) cur.removeAttribute('aria-describedby');
    cur = null; pinned = false; pop.hidden = true;
  }
  const later = () => { if (!pinned) { clearTimeout(timer); timer = setTimeout(hide, 200); } };
  const gl = e => e.target.closest && e.target.closest('.gl');
  const inPop = e => e.target.closest && e.target.closest('.gl-pop');

  document.addEventListener('mouseover', e => {
    const g = gl(e);
    if (g) { if (g !== cur) show(g); else clearTimeout(timer); } else if (inPop(e)) clearTimeout(timer);
  });
  document.addEventListener('mouseout', e => { if (gl(e) || inPop(e)) later(); });
  document.addEventListener('focusin', e => { const g = gl(e); if (g) show(g, pinned && g === cur); });
  document.addEventListener('focusout', e => { if (gl(e) && !(e.relatedTarget && pop.contains(e.relatedTarget))) later(); });
  document.addEventListener('click', e => {
    const g = gl(e);
    if (g) { if (pinned && g === cur) hide(); else show(g, true); }
    else if (!inPop(e) || e.target.closest('a')) hide();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cur) { const g = cur; hide(); g.focus(); }
    else if ((e.key === 'Enter' || e.key === ' ') && gl(e)) { e.preventDefault(); show(gl(e), true); }
  });
  addEventListener('scroll', () => { if (cur) { if (pinned) place(); else hide(); } }, { passive: true });
  addEventListener('resize', () => { if (cur) place(); });
  addEventListener('hashchange', hide);

  /* ----------------------------------------------------------------- page */

  PG.register({
    id: 'glossary',
    mount(root) {
      root.append(PG.h('dl', { class: 'gloss' }, TERMS.map(t => PG.h('div', { id: 'glossary-' + t.k },
        PG.h('dt', null, PG.t('gl.' + t.k + '.t')),
        PG.h('dd', null, PG.t('gl.' + t.k + '.d'), ' ', PG.h('a', { href: '#wiki/' + t.wiki }, PG.t('gl.wiki', { n: PARTS[t.wiki] })))))));
    },
  });
})();
