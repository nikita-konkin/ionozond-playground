/* The agreed bibliography. Citation numbers are stable; titles retain their publication language.
   Keep annotations here, outside the generated wiki, so rebuilding it preserves the references. */
(function () {
  'use strict';

  const SOURCES = [
    { id: 'chirp-review', group: 'sounding', year: 2003,
      authors: 'Иванов В. А., Куркин В. И., Носов В. Е., Урядов В. П., Шумаев В. В.',
      title: 'ЛЧМ-ионозонд и его применение в ионосферных исследованиях',
      venue: 'Известия вузов. Радиофизика. Т. 46, № 11. С. 919–952.',
      url: 'https://radiophysics.unn.ru/sites/default/files/papers/2003_11.pdf' },
    { id: 'multidimensional', group: 'sounding', year: 2012,
      authors: 'Иванов В. А., Иванов Д. В., Рябова Н. В.',
      title: 'Зондирование ионосферы и многомерного КВ радиоканала сигналами с линейной частотной модуляцией',
      venue: 'Физические основы приборостроения. Т. 1, № 4(5). С. 66–77.',
      url: 'https://red.jfop.ru/jfop-1204-066077/' },
    { id: 'sdr-processing', group: 'sounding', year: 2016,
      authors: 'Ivanov D. V., Ivanov V. A., Ryabova N. V., Elsukov A. A., Ryabova M. I., Chernov A. A.',
      title: 'Software-defined radio technology in the problem concerning with the successive sounding of HF ionospheric communication channels',
      venue: 'Journal of Communications Technology and Electronics. Vol. 61, No. 7. P. 767–775.',
      url: 'https://doi.org/10.1134/S1064226916070068' },
    { id: 'usrp-ionosonde', group: 'sounding', year: 2019,
      authors: 'Belgibaev R. R., Ivanov V. A., Ivanov D. V., Laschevsky A. R.',
      title: 'Software-Defined Radio Ionosonde for Diagnostics of Wideband HF Channels with the Use of USRP Platform',
      venue: 'WECONF. P. 1–4.',
      url: 'https://doi.org/10.1109/WECONF.2019.8840637' },
    { id: 'multifrequency', group: 'sounding', year: 2021,
      authors: 'Иванов Д. В., Иванов В. А., Елсуков А. А., Конкин Н. А.',
      title: 'Метод одновременного многочастотного тестирования ионосферных КВ-радиоканалов при дистанционном управлении обработкой и анализом данных',
      venue: 'Вестник ПГТУ. Серия «Радиотехнические и инфокоммуникационные системы». № 4(52). С. 6–23.',
      url: 'https://vestnik-reis.ru/article/view/1404' },
    { id: 'ionogram-modes', group: 'sounding', year: 2025,
      authors: 'Иванов В. А., Конкин Н. А., Овчинников В. В., Рябова М. И.',
      title: 'Метод обнаружения принимаемых мод сигнала на изображении ионограммы радиозондирования ионосферы с использованием машинного обучения',
      venue: 'ГрафиКон-2025. Йошкар-Ола. С. 13–21.',
      url: 'https://www.graphicon.ru/html/2025/papers/paper_002.pdf' },
    { id: 'channel-sensor', group: 'sounding', year: 2026,
      authors: 'Иванов Д. В., Иванов В. А., Рябова М. И., Овчинников В. В., Конкин Н. А.',
      title: 'Комплексный метод и средства сенсорной диагностики каналов дальней радиосвязи для увеличения достоверности и скорости передачи данных',
      venue: 'Электромагнитные волны и электронные системы. Т. 31, № 1. С. 38–53.',
      url: 'https://radiotec.ru/ru/journal/Electromagnetic_Waves_and_Electronic_Systems/number/2026-1/article/25737' },
    { id: 'dispersion-chirp', group: 'dispersion', year: 2001,
      authors: 'Иванов В. А., Иванов Д. В., Колчев А. А.',
      title: 'Исследования особенностей дисперсионных характеристик радиоканалов с помощью ЛЧМ-ионозонда',
      venue: 'Известия вузов. Радиофизика. Т. 44, № 3. С. 241–253.',
      url: 'https://radiophysics.unn.ru/sites/default/files/papers/2001_3.pdf' },
    { id: 'dispersion-paths', group: 'dispersion', year: 2019,
      authors: 'Ivanov V. A., Ivanov D. V., Ryabova N. V., Ryabova M. I., Chernov A. A., Ovchinnikov V. V.',
      title: 'Studying the Parameters of Frequency Dispersion for Radio Links of Different Length Using Software-Defined Radio Based Sounding System',
      venue: 'Radio Science. Vol. 54, No. 1. P. 34–43.',
      url: 'https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2018RS006636' },
    { id: 'phase-response', group: 'dispersion', year: 2020,
      authors: 'Рябова М. И.',
      title: 'ФЧХ широкополосных ионосферных каналов КВ-связи в условиях частотной дисперсии среды',
      venue: 'Вестник ПГТУ. Серия «Радиотехнические и инфокоммуникационные системы». № 1(45). С. 6–17.',
      url: 'https://vestnik-reis.ru/article/view/1415' },
    { id: 'chirp-pulses', group: 'dispersion', year: 2020,
      authors: 'Рябова М. И.',
      title: 'Искажения широкополосных ЛЧМ-импульсов в случае нормальной и аномальной дисперсии КВ-канала',
      venue: 'Вестник ПГТУ. Серия «Радиотехнические и инфокоммуникационные системы». № 2(46). С. 6–17.',
      url: 'https://vestnik-reis.ru/article/view/1424' },
    { id: 'intramode', group: 'dispersion', year: 2022,
      authors: 'Иванов Д. В., Иванов В. А., Рябова Н. В., Овчинников В. В.',
      title: 'Новые возможности систем широкополосной когнитивной связи, работающих в ионосферных КВ-радиоканалах с внутримодовой дисперсией',
      venue: 'Радиотехника. Т. 86, № 11. С. 162–177.',
      url: 'https://radiotec.ru/ru/journal/Radioengineering/number/2022-11/article/23105' },
    { id: 'wave-packets', group: 'dispersion', year: 2024,
      authors: 'Иванов Д. В., Иванов В. А., Рябова М. И., Овчинников В. В.',
      title: 'Эффекты дисперсии в ионосферных радиоканалах. Часть 1. Модели распространения волновых пакетов в диспергирующих ионосферных каналах',
      venue: 'Радиотехника. Т. 88, № 8. С. 111–126.',
      url: 'https://radiotec.ru/ru/journal/Radioengineering/number/2024-8/article/24436' },
    { id: 'dispersion-types', group: 'dispersion', year: 2024,
      authors: 'Иванов Д. В., Иванов В. А., Рябова М. И., Овчинников В. В.',
      title: 'Эффекты дисперсии в ионосферных радиоканалах. Часть 2. Виды частотно-временной дисперсии',
      venue: 'Радиотехника. Т. 88, № 11. С. 63–77.',
      url: 'https://radiotec.ru/ru/journal/Radioengineering/number/2024-11/article/24617' },
    { id: 'coherent-bandwidth', group: 'dispersion', year: 2016,
      authors: 'Иванов В. А., Иванов Д. В., Рябова Н. В., Рябова М. И., Чернов А. А., Конкин Н. А.',
      title: 'Методики и алгоритмы исследования полос когерентности при наклонном и трансионосферном зондировании ионосферы Земли',
      venue: 'Материалы Армандовских чтений. Муром. С. 82–86.',
      url: 'https://www.mivlgu.ru/conf/armand2016/rmdzs-2016/pdf/S1_7.pdf' },
    { id: 'muf-forecast', group: 'channels', year: 2022,
      authors: 'Конкин Н. А.',
      title: 'Методика и алгоритм определения периодов оперативного прогнозирования динамики максимально применимых частот КВ-связи на основе алгоритма машинного обучения XGBoost',
      venue: 'Вестник ПГТУ. Серия «Радиотехнические и инфокоммуникационные системы». № 3(55). С. 6–16.',
      url: 'https://vestnik-reis.ru/article/view/1366' },
    { id: 'passive-sounding', group: 'channels', year: 2020,
      authors: 'Иванов Д. В., Бельгибаев Р. Р., Рябова Н. В.; под общей редакцией Д. В. Иванова',
      title: 'Мониторинг показателей качества модемов когнитивной КВ связи на основе пассивного зондирования радиоканалов с дискретной частотно-временной дисперсией',
      venue: 'Йошкар-Ола: ПГТУ. Монография. ISBN 978-5-8158-2216-0.',
      url: 'https://lib.dm-centre.ru/lib/gpntb/?e_kls=%D0%98%D0%9E%D0%9D%D0%9E%D0%A1%D0%A4%D0%95%D0%A0%D0%9D%D0%AB%D0%95+%D0%9A%D0%90%D0%9D%D0%90%D0%9B%D0%AB&e_viewdb=ESVODT' },
  ];
  const byId = new Map(SOURCES.map((s, i) => [s.id, { ...s, number: i + 1 }]));

  PG.i18n({
    ru: {
      'references.nav': 'Публикации', 'references.part': 'Научная основа',
      'references.title': 'Работы научной школы ПГТУ',
      'references.lede': "Публикации научной школы Поволжского государственного технологического университета (ПГТУ, ранее — МарГТУ, Йошкар-Ола) по ЛЧМ-зондированию, дисперсии ионосферного радиоканала и обработке ионограмм.",
      'references.short': "Работы В. А. и Д. В. Ивановых, Н. В. и М. И. Рябовых, В. В. Овчинникова, Р. Р. Бельгибаева и Н. А. Конкина по тематике пособия.",
      'references.scope': 'Публикации раскрывают научную основу методов. Измерения февраля 2026 года, параметры моделей и настройки программы описаны отдельно в материалах практикума. Названия работ приведены на языке публикации; ссылка в названии открывает источник.',
      'references.sounding': 'Зондирование и обработка ионограмм',
      'references.dispersion': 'Дисперсия и полоса когерентности',
      'references.channels': 'Прогнозирование и доступность каналов',
      'references.cite': 'Источник {n}: {title}',
      'references.home': 'Научная основа методов — работы школы ПГТУ в Йошкар-Оле.',
      'references.method': 'Метод ЛЧМ-зондирования',
      'references.gdd': 'Дисперсия и полоса когерентности',
      'references.measure': 'Измерение дисперсии',
      'references.cells': 'Сжатие сигнала и разрешение',
      'references.daily': 'По теме: прогнозирование рабочих частот',
      'references.vi': 'Вертикальное и наклонное зондирование',
      'references.sdr': 'Цифровые ионозонды',
      'references.modes': 'Обнаружение мод и обработка ионограмм',
      'references.dispersionLabel': 'Дисперсия канала',
      'references.noise': 'Диагностика каналов и помехи',
    },
    en: {
      'references.nav': 'Publications', 'references.part': 'Research',
      'references.title': 'Research from the VSUT scientific school',
      'references.lede': 'Chirp sounding, ionospheric channel dispersion and ionogram processing: research from Volga State University of Technology in Yoshkar-Ola, formerly Mari State Technical University.',
      'references.short': 'Publications by Ivanov, Ryabova, Ovchinnikov, Belgibaev and Konkin related to the playground.',
      'references.scope': 'These publications explain the methods behind the playground. The February 2026 measurements, model parameters and software settings are documented separately in the materials. Titles retain their publication language; each title links to its source.',
      'references.sounding': 'Sounding and ionogram processing',
      'references.dispersion': 'Dispersion and coherent bandwidth',
      'references.channels': 'Forecasting and channel availability',
      'references.cite': 'Reference {n}: {title}',
      'references.home': 'The methods draw on research from the VSUT scientific school in Yoshkar-Ola.',
      'references.method': 'Chirp sounding method',
      'references.gdd': 'Dispersion and coherent bandwidth',
      'references.measure': 'Measuring dispersion',
      'references.cells': 'Signal compression and resolution',
      'references.daily': 'Related research: working-frequency prediction',
      'references.vi': 'Vertical and oblique sounding',
      'references.sdr': 'Digital ionosondes',
      'references.modes': 'Mode detection and ionogram processing',
      'references.dispersionLabel': 'Channel dispersion',
      'references.noise': 'Channel diagnostics and interference',
    },
  });

  // Internal numeric citations keep the surrounding explanation short. Full titles are available
  // to keyboard and screen-reader users as well as in the native hover tooltip.
  function cite(ids) {
    return PG.h('sup', { class: 'citations' }, '[', ids.map((id, i) => {
      const s = byId.get(id);
      if (!s) throw new Error('Unknown publication: ' + id);
      const label = PG.t('references.cite', { n: s.number, title: s.title });
      return [i ? ', ' : '', PG.h('a', { href: '#references/' + id, title: s.authors + ' · ' + s.year + '. ' + s.title,
        'aria-label': label }, s.number)];
    }), ']');
  }

  function sourceLine(key, ids) {
    return PG.h('p', { class: 'source-line' }, PG.t('references.' + key), cite(ids));
  }

  const PAGES = {
    gdd: ['gdd', ['dispersion-chirp', 'dispersion-paths', 'coherent-bandwidth']],
    measure: ['measure', ['dispersion-paths', 'phase-response', 'coherent-bandwidth']],
    timing: ['method', ['chirp-review', 'sdr-processing']],
    cells: ['cells', ['chirp-review', 'sdr-processing']],
    schedule: ['sdr', ['usrp-ionosonde', 'multifrequency']],
    daily: ['daily', ['muf-forecast']],
    vi: ['vi', ['chirp-review', 'multidimensional', 'dispersion-paths']],
  };
  const WIKI = {
    chain: ['sdr', ['sdr-processing', 'usrp-ionosonde', 'multifrequency']],
    reflection: ['vi', ['chirp-review', 'multidimensional']],
    geometry: ['vi', ['chirp-review', 'multidimensional']],
    hops: ['method', ['chirp-review', 'multidimensional']],
    edges: ['noise', ['channel-sensor', 'passive-sounding']],
    dechirp: ['cells', ['chirp-review', 'sdr-processing']],
    axes: ['cells', ['chirp-review', 'sdr-processing']],
    anatomy: ['modes', ['ionogram-modes', 'channel-sensor']],
    gdd: ['gdd', ['dispersion-paths', 'phase-response', 'coherent-bandwidth']],
    causes: ['dispersionLabel', ['dispersion-chirp', 'wave-packets', 'dispersion-types']],
    stripes: ['modes', ['ionogram-modes', 'passive-sounding']],
    limits: ['dispersionLabel', ['intramode', 'wave-packets', 'dispersion-types']],
  };

  PG.references = {
    annotate(root, page) {
      if (page === 'home') {
        root.querySelector(':scope > .lede').after(PG.h('p', { class: 'source-line' },
          PG.t('references.home'), ' ', PG.h('a', { href: '#references' }, PG.t('references.nav'))));
      }
      if (PAGES[page]) root.querySelector(':scope > .lede').after(sourceLine(...PAGES[page]));
      if (page === 'gdd') {
        // Cite the concepts in headings, rather than attributing this playground's numerical
        // error estimates, fitted coefficient or pulse thresholds to a published experiment.
        const heading = [...root.querySelectorAll('h2')].find(h => h.textContent === PG.t('gdd.c.h'));
        if (heading) heading.append(cite(['intramode']));
        root.querySelector('#gdd-phase').append(cite(['phase-response', 'chirp-pulses']));
      }
      if (page === 'wiki') {
        for (const [id, refs] of Object.entries(WIKI)) {
          const section = root.querySelector('#wiki-' + id);
          const at = section && (section.querySelector('.part-lede') || section.querySelector('h2'));
          if (at) at.after(sourceLine(...refs));
        }
      }
      if (page === 'glossary') {
        for (const [term, ids] of Object.entries({ gdd: ['dispersion-paths', 'coherent-bandwidth'],
          chirp: ['chirp-review'], trace: ['multidimensional'], snr: ['channel-sensor'] })) {
          const definition = root.querySelector('#glossary-' + term + ' dd');
          if (definition) definition.append(cite(ids));
        }
      }
    },
  };

  PG.register({
    id: 'references',
    mount(root) {
      root.append(PG.h('p', { class: 'references-scope' }, PG.t('references.scope')));
      for (const group of ['sounding', 'dispersion', 'channels']) {
        root.append(PG.h('section', { class: 'reference-group', 'aria-labelledby': 'references-group-' + group },
          PG.h('h2', { id: 'references-group-' + group }, PG.t('references.' + group)),
          PG.h('ol', { class: 'reference-list', start: SOURCES.findIndex(s => s.group === group) + 1 },
            SOURCES.filter(s => s.group === group).map(s => {
              const n = byId.get(s.id).number;
              return PG.h('li', { id: 'references-' + s.id, class: 'reference', tabindex: -1, value: n },
                PG.h('span', { class: 'reference-number', 'aria-hidden': true }, '[' + n + ']'),
                PG.h('div', { class: 'reference-body' },
                  PG.h('p', { class: 'reference-authors' }, s.authors),
                  PG.h('a', { class: 'reference-title', href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title),
                  PG.h('p', { class: 'reference-venue' }, PG.h('span', { class: 'reference-year' }, s.year), ' · ', s.venue)));
            }))));
      }
    },
    onRoute(sub) {
      document.querySelectorAll('.reference-current').forEach(e => e.classList.remove('reference-current'));
      const target = sub && document.getElementById('references-' + sub);
      if (target) { target.classList.add('reference-current'); target.focus({ preventScroll: true }); }
    },
  });
})();
