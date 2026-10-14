/* Wiki: the document the playground is built on, ionozond/docs/ionogram-physics.html, in English
   and Russian. The text is generated into js/wiki/physics.js by tools/wiki/build_wiki.py. */
(function () {
  'use strict';
  const W = PG.wiki;

  PG.i18n({
    ru: {
      'wiki.nav': 'Вики: ЛЧМ-ионограммы', 'wiki.part': W.ru.part, 'wiki.title': W.ru.title, 'wiki.lede': W.ru.lede,
      'wiki.short': 'Полный текст справочника, на котором построены модели: как возникает след, как он ложится на оси, как приёмник делит время между передатчиками и где всё это может ввести в заблуждение.',
      'wiki.try': 'В практикуме',
    },
    en: {
      'wiki.nav': 'Wiki: chirp ionograms', 'wiki.part': W.en.part, 'wiki.title': W.en.title, 'wiki.lede': W.en.lede,
      'wiki.short': 'The reference the models are built on, in full: where the trace comes from, how it lands on the axes, how the receiver shares its time between transmitters, and where all of it can mislead.',
      'wiki.try': 'In the playground',
    },
  });

  // The playground pages that model each part, by section id. They are listed under the part's lede.
  const PAGES = {
    reflection: ['vi'], geometry: ['vi'], edges: ['gdd', 'daily'], dechirp: ['timing'], axes: ['cells'], window: ['schedule'],
    parallel: ['schedule'], timing: ['timing', 'schedule'], gdd: ['gdd', 'measure', 'daily'], budget: ['timing', 'cells'],
  };

  // Section links are #wiki/<id>; the router scrolls to the element wiki-<id>.
  PG.register({
    id: 'wiki',
    mount(root) {
      const box = PG.h('div', { class: 'wiki', html: W[PG.lang].body });
      for (const [id, pages] of Object.entries(PAGES)) {
        const sec = box.querySelector('#wiki-' + id), at = sec && (sec.querySelector('.part-lede') || sec.querySelector('h2'));
        if (!at) continue;
        at.after(PG.h('p', { class: 'wiki-try' }, PG.h('span', null, PG.t('wiki.try')),
          pages.filter(p => PG.modules.some(m => m.id === p)).map(p => PG.h('a', { href: '#' + p }, PG.t(p + '.nav')))));
      }
      root.append(box);
    },
  });
})();
