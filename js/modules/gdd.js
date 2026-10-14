/* GDD on the ionogram: slope of the model 1F trace, delay spread across a band, a pulse through it. */
(function () {
  'use strict';
  const M_ = PG.model;

  PG.i18n({
    ru: {
      'gdd.nav': 'Дисперсия на ионограмме', 'gdd.part': 'Часть 11 · Дисперсия', 'gdd.title': 'Дисперсия групповой задержки на ионограмме',
      'gdd.short': 'Крутизна ДЧХ в выбранной точке, разброс задержки в полосе сигнала и то, во что этот разброс превращает импульс.',
      'gdd.lede': 'Модельная дистанционно-частотная характеристика (ДЧХ) моды 1F для трассы Кипр — Йошкар-Ола, построенная по дисперсии, измеренной в 583 сеансах. Задайте МНЧ и поместите сигнал нужной полосы в любую точку характеристики. Вы увидите крутизну ДЧХ в этой точке — дисперсию групповой задержки (GDD), — разброс задержки в пределах полосы, искажение импульса и то, насколько всё это заметно на экране ionozond.',
      'gdd.muf': 'МНЧ 1F', 'gdd.fc': 'Средняя частота сигнала', 'gdd.bw': 'Полоса сигнала', 'gdd.ow': '0,85 МНЧ',
      'gdd.more': 'Показать моду 2F и верхний луч 1F',
      'gdd.cap.iono': 'Ионограмма. Заливка — полоса сигнала, штриховая линия — касательная к ДЧХ; её наклон и есть GDD.',
      'gdd.aria.iono': 'Модельная ионограмма наклонного зондирования трассы Кипр — Йошкар-Ола: зависимость задержки от частоты для нижнего луча 1F вплоть до МНЧ, полоса сигнала и касательная в её центре.',
      'gdd.x.f': 'частота, МГц', 'gdd.y.d': 'задержка, мс', 'gdd.lbl.1f': '1F, нижний луч', 'gdd.lbl.up': 'верхний луч', 'gdd.lbl.muf': 'МНЧ {v}',
      'gdd.lbl.band': '{b} на {f} МГц', 'gdd.k.x': 'f / МНЧ', 'gdd.k.g': 'GDD в этой точке', 'gdd.k.gs': 'крутизна ДЧХ',
      'gdd.k.s': 'Разброс в полосе', 'gdd.k.ss': 'при 1/B = {v}', 'gdd.k.b': 'B<sub>max</sub> в этой точке',
      'gdd.k.bs': '1/√GDD: разброс равен 1/B', 'gdd.k.c': 'Заметно на экране', 'gdd.k.cs': '{v} мкс на столбец 41 кГц',
      'gdd.x.nose': 'вплотную к МНЧ', 'gdd.x.low': 'далеко от МНЧ', 'gdd.x.work': 'рабочий диапазон',
      'gdd.v.flat': 'Для такой полосы ДЧХ практически плоская',
      'gdd.v.flatT': 'Разброс задержки в полосе меньше собственного временного разрешения сигнала 1/B. Импульс почти не меняется: пик проседает меньше чем на 0,1 дБ.',
      'gdd.v.mild': 'Искажения заметны',
      'gdd.v.mildT': 'Разброс в 1–5 раз больше 1/B. Импульс расширяется до 1,6 раза и теряет в пике до 1,5 дБ; адаптивный корректор с этим справляется.',
      'gdd.v.bad': 'Сильные дисперсионные искажения',
      'gdd.v.badT': 'Разброс больше 5/B, полоса более чем вдвое шире B_max. Если не компенсировать наклон ДЧХ, импульс расплывается: при GDD·B² = 10 он становится в 2,6 раза шире и на 4 дБ ниже.',
      'gdd.v.num': 'GDD·B² = {v}.', 'gdd.v.cut': 'Часть полосы лежит выше МНЧ и не проходит вовсе.',
      'gdd.v.ext': 'МНЧ ниже 18 МГц — в этой области закон не измерялся. Он продолжен пропорционально 1/МНЧ, как у параболического слоя, и крутизна здесь в {v} раза больше, чем по дневной формуле.',
      'gdd.v.nose': 'Выше 0,96 МНЧ аппроксимация круче измеренной медианы: при 0,99 МНЧ медиана составляет 36,5 мкс/МГц, а формула даёт 67.',
      'gdd.v.bin': 'На ионограмме вся полоса умещается в один отсчёт задержки, поэтому наклон проявляется лишь как медленный дрейф следа на протяжении многих столбцов.',
      'gdd.cap.zoom': 'В пределах полосы: задержка относительно центральной',
      'gdd.aria.zoom': 'ДЧХ в пределах полосы сигнала: задержка относительно центральной в сравнении с одним отсчётом задержки на экране ionozond.',
      'gdd.bin': 'один отсчёт задержки на экране, 24,4 мкс', 'gdd.above': 'выше МНЧ', 'gdd.x.off': 'отстройка от центра, кГц',
      'gdd.y.rel': 'задержка − центральная, мкс',
      'gdd.cap.pulse': 'Импульс после прохождения трассы: огибающая с дисперсией и без неё',
      'gdd.aria.pulse': 'Огибающая импульса заданной полосы после прохождения трассы в сравнении с тем же импульсом без дисперсии.',
      'gdd.x.t': 'время относительно центральной задержки, мкс', 'gdd.p.ref': 'без дисперсии', 'gdd.p.peak': 'после трассы: пик {v} дБ',
      'gdd.p.w': 'ширина ×{v}',
      'gdd.c.h': 'Компенсация дисперсии',
      'gdd.c.p': 'Корректор — это фильтр, задержка которого падает с частотой с той же крутизной, с какой на трассе она растёт: частоты, пришедшие раньше, он придерживает, и вся полоса выходит одновременно. Крутизну берут прямо с ионограммы — это наклон ДЧХ на рабочей частоте. По одному сеансу её удаётся оценить с точностью около ±5 мкс/МГц, по среднему нескольких сеансов — около ±2. Прямой корректор убирает только наклон; изгиб ДЧХ внутри полосы, заметный вблизи МНЧ, остаётся.',
      'gdd.c.on': 'Включить корректор в приёмнике', 'gdd.c.err': 'Ошибка оценки GDD',
      'gdd.c.p0': 'точно', 'gdd.c.p2': 'среднее сеансов, +2', 'gdd.c.p5': 'один сеанс, +5',
      'gdd.c.k.s': 'Наклон корректора', 'gdd.c.k.ss': 'оценка GDD с обратным знаком',
      'gdd.c.k.r': 'Остаточный разброс', 'gdd.c.k.b': 'B<sub>max</sub> с корректором',
      'gdd.c.k.was': 'без корректора — {v}', 'gdd.c.k.cap': 'упирается в МНЧ',
      'gdd.c.v': 'С корректором остаточный разброс задержки в полосе — {s}: пик импульса {p} дБ, ширина ×{w}.',
      'gdd.c.curv': 'Остаток определяется уже не ошибкой оценки, а изгибом ДЧХ внутри полосы: вблизи МНЧ наклон заметно меняется от одного края полосы к другому, и прямой корректор за ним не успевает.',
      'gdd.l.path': 'после трассы: пик {p} дБ, ширина ×{w}', 'gdd.l.comp': 'с корректором: пик {p} дБ, ширина ×{w}',
      'gdd.l.tr': 'ДЧХ в полосе', 'gdd.l.tan': 'касательная, наклон GDD', 'gdd.l.res': 'остаток после корректора',
      'gdd.bnote': 'Происхождение b = 7,5 мкс/МГц. Это параметр модели именно этой трассы, а не универсальная постоянная. Форма 1/√(1 − x) − 1 общая — её же даёт параболический слой через закон секанса, — а b задаёт масштаб: от пологой части до «носа» ДЧХ поднимается на b·МНЧ, т. е. на 195 мкс при МНЧ 26 МГц. Этот подъём зависит от геометрии скачка (2634 км, один скачок) и от толщины слоя, поэтому для другой трассы, сезона, времени суток или уровня солнечной активности нужно своё значение b. Подгонка (lfs_tools/dispersion_stats.py) устроена так. В каждом из 583 сеансов МНЧ определяется как верхний край обнаруженного следа; от неё нижний луч 1F прослеживается вниз до 0,5 МНЧ по нижней кромке следа (20-й процентиль задержки в ячейках по 0,25 МГц), а скачки вверх больше 60 мкс, означающие переход на 2F, отбрасываются. Наклон находится методом наименьших квадратов по ±0,5 МГц. 19 033 наклона разбиты по f/МНЧ на интервалы шириной 0,025, и к медианам 19 интервалов от 0,5 до 0,975 МНЧ с весами, пропорциональными числу наклонов, подогнана кривая b·(1/√(1 − x) − 1). Получается b = 7,52 при R² = 0,975; двухпараметрическая кривая a + b/√(1 − x) повышает R² лишь до 0,99. Без весов или при подгонке начиная с 0,6, 0,7 или 0,8 МНЧ значение b остаётся в пределах 7,4–7,6. Закон описывает медиану: отдельные сеансы отклоняются от неё примерно на ±50 %, а выше 0,96 МНЧ закон круче данных.',
      'gdd.calc.sum': 'Показать расчёт GDD по шагам',
      'gdd.calc.1': 'Где центр полосы лежит на ДЧХ',
      'gdd.calc.1p': 'Закон дисперсии зависит от частоты только через относительную частоту x = f/МНЧ.',
      'gdd.calc.1k': 'МНЧ ниже 18 МГц, где закон не измерялся, поэтому он умножается на k = 18/МНЧ.',
      'gdd.e.x': 'x = fc / МНЧ = {f} / {m} = <b>{x}</b>', 'gdd.e.k': 'k = 18 / МНЧ = 18 / {m} = <b>{k}</b>',
      'gdd.calc.2': 'GDD по медианному закону',
      'gdd.calc.2p': 'GDD — это крутизна ДЧХ, dτ/df. Закон, подобранный по 583 сеансам, даёт её в явном виде; b = 7,5 мкс/МГц — параметр модели трассы Кипр — Йошкар-Ола; его происхождение объяснено в конце страницы.',
      'gdd.e.sq': '√(1 − x) = √{a} = {s}', 'gdd.e.q': '1/√(1 − x) − 1 = {i} − 1 = {q}',
      'gdd.e.g': 'GDD = b·(1/√(1 − x) − 1) = 7,5 × {q} = <b>{g}</b>', 'gdd.e.gk': 'GDD = k·b·(1/√(1 − x) − 1) = {k} × 7,5 × {q} = <b>{g}</b>',
      'gdd.calc.3': 'Проверка: наклон самой ДЧХ',
      'gdd.calc.3p': 'Сама ДЧХ — это τ(f) = 8,95 мс + {k}b·МНЧ·(2(1 − √(1 − x)) − x), а закон выше — её производная. Разность задержек на ±50 кГц от центра даёт практически то же число: это наклон штриховой касательной на ионограмме.',
      'gdd.calc.3b': 'Здесь они расходятся на {p} %: так близко к МНЧ ДЧХ заметно изгибается даже в пределах ±50 кГц, и разностная оценка частично учитывает этот изгиб.',
      'gdd.e.t1': 'τ(fc − 50 кГц) = τ({f}) = {t}', 'gdd.e.t2': 'τ(fc + 50 кГц) = τ({f}) = {t}',
      'gdd.e.d': 'Δτ / Δf = ({b} − {a}) / {df} = {d} / {df} = <b>{g}</b>',
      'gdd.calc.4': 'Разброс задержки в полосе',
      'gdd.calc.4p': 'Задержку берут по той же ДЧХ на краях полосы. Пока ДЧХ внутри полосы почти не изгибается, разброс близок к линейной оценке GDD·B. Собственное временное разрешение сигнала равно 1/B.',
      'gdd.calc.4c': 'Полоса заходит за МНЧ. Распространяется только часть ниже неё, поэтому верхним краем служит МНЧ.',
      'gdd.e.lo': 'f<sub>н</sub> = fc − B/2 = {f} − {h} = {v}', 'gdd.e.hi': 'f<sub>в</sub> = fc + B/2 = {f} + {h} = {v}',
      'gdd.e.hic': 'f<sub>в</sub> = min(fc + B/2, МНЧ) = {v}',
      'gdd.e.s': 'Δτ = τ(f<sub>в</sub>) − τ(f<sub>н</sub>) = {b} − {a} = <b>{s}</b>',
      'gdd.e.lin': 'GDD·B = {g} × {B} = {s}', 'gdd.e.res': '1/B = 1 / {B} = {r}',
      'gdd.calc.5': 'Велик ли разброс: число GDD·B²',
      'gdd.calc.5p': 'Разброс в единицах разрешения 1/B: GDD·B / (1/B) = GDD·B². Меньше 1 — импульс практически не меняется, от 1 до 5 — искажения заметны, больше 5 — импульс расплывается.',
      'gdd.e.n': 'GDD·B² = {g} × {B}² = <b>{n}</b>',
      'gdd.e.flat': '{n} < 1 → {v}', 'gdd.e.mild': '1 ≤ {n} < 5 → {v}', 'gdd.e.bad': '{n} ≥ 5 → {v}',
      'gdd.calc.6': 'Предельная полоса B<sub>max</sub>',
      'gdd.calc.6p': 'Полагаем GDD·B² = 1, т. е. разброс равен 1/B, и решаем уравнение относительно B. Если GDD выражена в мкс/МГц, ответ получается в МГц.',
      'gdd.e.b': 'B<sub>max</sub> = 1/√GDD = 1 / √{g} = 1 / {s} = {m} = <b>{b}</b>',
      'gdd.calc.7': 'Что видно на экране ionozond',
      'gdd.calc.7p': 'Отсчёт задержки на ионограмме ionozond — 24,4 мкс, столбец — 41 кГц. От столбца к столбцу задержка вдоль ДЧХ меняется на GDD × 41 кГц, так что сдвиг на целый отсчёт набирается за много столбцов.',
      'gdd.e.bin': 'Δτ / 24,4 мкс = {s} / 24,4 = <b>{v}</b>', 'gdd.e.col': 'GDD × 41 кГц = {g} × 0,041 = <b>{v}</b> на столбец',
      'gdd.e.cols': 'столбцов на отсчёт ≈ 24,4 / {c} = <b>{n}</b>',
      'gdd.cc.sum': 'Показать расчёт с корректором',
      'gdd.cc.1': 'Наклон корректора',
      'gdd.cc.1p': 'Оценка GDD — это истинный наклон ДЧХ в центре полосы плюс ошибка оценки. Корректор задерживает каждую частоту на −GDD<sub>оц</sub>·(f − fc).',
      'gdd.e.est': 'GDD<sub>оц</sub> = GDD + ошибка = {g} {sg} {e} = <b>{v}</b>',
      'gdd.cc.2': 'Что остаётся: остаточная задержка',
      'gdd.cc.2p': 'τ<sub>ост</sub>(f) = τ(f) − τ(fc) − GDD<sub>оц</sub>·(f − fc) считается на 121 частоте в пределах полосы, но не выше МНЧ; её размах max − min и есть остаточный разброс. Он складывается из двух вкладов: перекоса |ошибка|·B, который даёт ошибка оценки, и изгиба ДЧХ, который не устраняет даже точная оценка.',
      'gdd.e.r1': 'τ<sub>ост</sub>(f<sub>н</sub>) = {v}', 'gdd.e.r2': 'τ<sub>ост</sub>(f<sub>в</sub>) = {v}',
      'gdd.e.rs': 'max − min = {hi} − {lo} = <b>{s}</b>',
      'gdd.e.er': 'перекос от ошибки: |ошибка|·B = {e} × {B} = {v}', 'gdd.e.cv': 'изгиб при точной оценке: {v}',
      'gdd.cc.3': 'B<sub>max</sub> с корректором',
      'gdd.cc.3p': 'Явной формулы здесь уже нет. Полосу находят методом деления отрезка пополам из условия, что остаточный разброс равен 1/B, т. е. B × разброс(B) = 1. Полоса не может заходить выше МНЧ, поэтому она не превышает 2·(МНЧ − fc).',
      'gdd.e.bc': 'B<sub>max</sub> = <b>{b}</b>', 'gdd.e.bcp': 'проверка: B × разброс(B) = {B} × {s} = {p}',
      'gdd.e.cap': '2·(МНЧ − fc) = 2 × ({m} − {f}) = <b>{c}</b>',
      'gdd.e.capp': 'даже там B × разброс(B) = {B} × {s} = {p} < 1, так что B<sub>max</sub> упирается в МНЧ',
      'gdd.model': 'Модель. Нижний луч 1F: τ(f) = 8,95 мс + b·МНЧ·(2(1 − √(1 − x)) − x), где x = f/МНЧ. Это интеграл медианного закона GDD = b·(1/√(1 − x) − 1) с b = 7,5 мкс/МГц, подобранного по 583 сеансам на трассе Кипр — Йошкар-Ола в феврале 2026 г. Реальные ДЧХ разбросаны вокруг него в пределах межквартильного размаха из таблицы части 11, а оценка по одному сеансу добавляет ещё ±4 мкс/МГц. Закон измерен при МНЧ 18–32 МГц; ниже он продолжен пропорционально 1/МНЧ. Тот же закон независимо следует из параболического профиля через закон секанса (см. раздел о вертикальном зондировании): днём расхождение не превышает 20 % в интервале от 0,8 до 0,96 МНЧ. Верхний луч и мода 2F нарисованы для ориентира и в расчётах не участвуют; 2F начинается на 9,40 мс и обрывается на 0,70 МНЧ — так получается при зеркальном отражении с h′ = 250–300 км. Импульс — участок спектра шириной B с окном Ханна вокруг курсора, прошедший через фазовую характеристику φ(f) = −2π∫(τ − τc) df, которую задаёт ДЧХ. Корректор — всепропускающий фильтр с групповой задержкой −GDD_оц·(f − fc), где GDD_оц — наклон ДЧХ в центре полосы плюс заданная ошибка оценки; B_max с корректором — полоса, в которой остаточный разброс задержки равен 1/B. Замирания, магнитоионное расщепление и поглощение не учитываются. Столбец ионограммы ionozond — 41 кГц, отсчёт задержки — 24,4 мкс (БПФ на 16 384 точки, 100 кГц/с).',
    },
    en: {
      'gdd.nav': 'GDD on the ionogram',
      'gdd.part': 'Part 11 · Dispersion',
      'gdd.title': 'Group-delay dispersion on the ionogram',
      'gdd.short': 'The trace’s slope at a chosen point, the delay spread across a signal’s band, and what it does to a pulse.',
      'gdd.lede': 'A model 1F trace for the Cyprus path, built on the dispersion measured over 583 sweeps. Set the MUF, then put a signal of some bandwidth anywhere on the trace. The page shows the trace’s slope there (GDD, the group-delay dispersion), how far it spreads the band in delay, what that does to a pulse, and how much of it the console can resolve.',
      'gdd.muf': '1F MUF', 'gdd.fc': 'Signal centre', 'gdd.bw': 'Signal bandwidth', 'gdd.ow': '0.85 MUF',
      'gdd.more': 'Show 2F and the 1F upper ray',
      'gdd.cap.iono': 'The ionogram. Shaded: the signal’s band. Dashed: the trace’s tangent, whose slope is the GDD.',
      'gdd.aria.iono': 'Model oblique ionogram of the Cyprus path: delay against frequency for the 1F lower ray up to the MUF, with the signal’s band shaded and the tangent at its centre.',
      'gdd.x.f': 'frequency, MHz', 'gdd.y.d': 'delay, ms',
      'gdd.lbl.1f': '1F, lower ray', 'gdd.lbl.up': 'upper ray', 'gdd.lbl.muf': 'MUF {v}', 'gdd.lbl.band': '{b} at {f} MHz',
      'gdd.k.x': 'f / MUF', 'gdd.k.g': 'GDD here', 'gdd.k.gs': 'slope of the trace', 'gdd.k.s': 'Spread over the band', 'gdd.k.ss': 'against 1/B = {v}',
      'gdd.k.b': 'B<sub>max</sub> here', 'gdd.k.bs': '1 / √GDD: spread = 1/B', 'gdd.k.c': 'Console sees', 'gdd.k.cs': '{v} µs per 41 kHz column',
      'gdd.x.nose': 'close to the nose', 'gdd.x.low': 'far below the MUF', 'gdd.x.work': 'working range',
      'gdd.v.flat': 'Flat for this band', 'gdd.v.flatT': 'The delay spread across the band is less than the band’s own time resolution, 1/B. The pulse is practically unchanged: its peak drops by less than 0.1 dB.',
      'gdd.v.mild': 'Noticeable', 'gdd.v.mildT': 'The spread is 1–5 times 1/B. The pulse widens by up to 1.6× and loses up to 1.5 dB of peak; an equaliser removes it.',
      'gdd.v.bad': 'Dispersive', 'gdd.v.badT': 'The spread exceeds 5/B, so the band is more than twice B_max. Without compensating the trace’s slope the pulse smears: at GDD·B² = 10 it is 2.6× wider and 4 dB lower.',
      'gdd.v.num': 'GDD·B² = {v}.', 'gdd.v.cut': 'Part of the band lies above the MUF and is not propagated at all.',
      'gdd.v.ext': 'The MUF is below 18 MHz, where the law was not measured. It is continued as ∝ 1/MUF, which is how a parabolic layer behaves, so the slope here is {v}× the daytime formula.',
      'gdd.v.nose': 'Above 0.96 MUF the fit is steeper than the measured median: 36.5 µs/MHz at 0.99 MUF against the fit’s 67.',
      'gdd.v.bin': 'On the ionogram the whole band sits inside one delay bin, so the slope shows only as a drift across many columns.',
      'gdd.cap.zoom': 'Inside the band: delay against offset from the centre',
      'gdd.aria.zoom': 'The trace across the signal’s band, delay relative to the centre, against one console delay bin.',
      'gdd.bin': 'one console delay bin, 24.4 µs', 'gdd.above': 'above the MUF',
      'gdd.x.off': 'offset from centre, kHz', 'gdd.y.rel': 'delay − centre, µs',
      'gdd.cap.pulse': 'A pulse through it: envelope, path against no dispersion',
      'gdd.aria.pulse': 'Envelope of a pulse occupying the band after the path, compared with the same pulse without dispersion.',
      'gdd.x.t': 'time from the centre delay, µs', 'gdd.p.ref': 'no dispersion', 'gdd.p.peak': 'path: peak {v} dB', 'gdd.p.w': 'width ×{v}',
      'gdd.c.h': 'Compensating the dispersion',
      'gdd.c.p': 'A compensator is a filter whose delay falls with frequency as steeply as the path’s delay rises: it holds back the frequencies that arrive early, so the whole band leaves at once. Its slope is read straight off the ionogram — it is the trace’s slope at the working frequency. One session gives it to about ±5 µs/MHz, an average of several to about ±2. A straight-line compensator removes only the slope; the bend of the trace within the band, noticeable near the MUF, remains.',
      'gdd.c.on': 'Turn on the receiver’s compensator', 'gdd.c.err': 'Error in the GDD estimate',
      'gdd.c.p0': 'exact', 'gdd.c.p2': 'session average, +2', 'gdd.c.p5': 'one session, +5',
      'gdd.c.k.s': 'Compensator slope', 'gdd.c.k.ss': 'the GDD estimate, sign flipped',
      'gdd.c.k.r': 'Residual spread', 'gdd.c.k.b': 'B<sub>max</sub> compensated',
      'gdd.c.k.was': 'without it: {v}', 'gdd.c.k.cap': 'reaches the MUF',
      'gdd.c.v': 'With the compensator the residual delay spread across the band is {s}: pulse peak {p} dB, width ×{w}.',
      'gdd.c.curv': 'The residue now comes from the trace’s bend inside the band, not from the estimate’s error: near the MUF the slope changes noticeably from one band edge to the other, and a straight-line compensator cannot follow it.',
      'gdd.l.path': 'after the path: peak {p} dB, width ×{w}', 'gdd.l.comp': 'compensated: peak {p} dB, width ×{w}',
      'gdd.l.tr': 'the trace across the band', 'gdd.l.tan': 'tangent, slope GDD', 'gdd.l.res': 'residual after the compensator',
      'gdd.bnote': 'Where b = 7.5 µs/MHz comes from. It is a parameter of this path’s model, not a constant of nature. The shape 1/√(1 − x) − 1 is general — a parabolic layer gives it too, through the secant law — while b sets the scale: from its flat part to the nose the trace rises by b·MUF, 195 µs at an MUF of 26 MHz. That rise depends on the hop geometry (2634 km in one hop) and on the thickness of the layer, so another path, season, time of day or level of solar activity needs its own b. The fit (lfs_tools/dispersion_stats.py) works like this. In each of the 583 sweeps the MUF is the top of the detected trace; from there the lower 1F ray is followed down to 0.5 MUF along the trace’s lower edge (the 20th percentile of delay in 0.25 MHz cells), and upward jumps of more than 60 µs, a switch to 2F, are dropped. The slope is a least-squares fit over ±0.5 MHz. The 19 033 slopes are binned by f/MUF in steps of 0.025, and b·(1/√(1 − x) − 1) is fitted to the medians of the 19 bins from 0.5 to 0.975 MUF, weighted by the number of slopes in each. That gives b = 7.52 with R² = 0.975; a two-parameter curve a + b/√(1 − x) only raises R² to 0.99. Without the weights, or fitting only from 0.6, 0.7 or 0.8 MUF, b stays between 7.4 and 7.6. The law describes the median: single sweeps scatter about ±50 % around it, and above 0.96 MUF it is steeper than the data.',
      'gdd.calc.sum': 'Show the GDD calculation, step by step',
      'gdd.calc.1': 'Where the band centre sits on the trace',
      'gdd.calc.1p': 'The dispersion law depends on frequency only through x = f/MUF.',
      'gdd.calc.1k': 'The MUF is below 18 MHz, where the law was not measured, so it is scaled by k = 18/MUF.',
      'gdd.e.x': 'x = fc / MUF = {f} / {m} = <b>{x}</b>', 'gdd.e.k': 'k = 18 / MUF = 18 / {m} = <b>{k}</b>',
      'gdd.calc.2': 'GDD from the median law',
      'gdd.calc.2p': 'GDD is the slope of the trace, dτ/df. The law fitted to the 583 sweeps gives it in closed form, with b = 7.5 µs/MHz: a parameter of the Cyprus path’s model, whose origin the note at the end of the page explains.',
      'gdd.e.sq': '√(1 − x) = √{a} = {s}', 'gdd.e.q': '1/√(1 − x) − 1 = {i} − 1 = {q}',
      'gdd.e.g': 'GDD = b·(1/√(1 − x) − 1) = 7.5 × {q} = <b>{g}</b>', 'gdd.e.gk': 'GDD = k·b·(1/√(1 − x) − 1) = {k} × 7.5 × {q} = <b>{g}</b>',
      'gdd.calc.3': 'Check: the slope of the trace itself',
      'gdd.calc.3p': 'The trace is τ(f) = 8.95 ms + {k}b·MUF·(2(1 − √(1 − x)) − x), and the law above is its derivative. The delay difference across ±50 kHz of the centre gives practically the same number: it is the slope of the dashed tangent on the ionogram.',
      'gdd.calc.3b': 'Here the two differ by {p} %: this close to the MUF the trace bends noticeably even within ±50 kHz, and the difference picks up some of that bend.',
      'gdd.e.t1': 'τ(fc − 50 kHz) = τ({f}) = {t}', 'gdd.e.t2': 'τ(fc + 50 kHz) = τ({f}) = {t}',
      'gdd.e.d': 'Δτ / Δf = ({b} − {a}) / {df} = {d} / {df} = <b>{g}</b>',
      'gdd.calc.4': 'Delay spread across the band',
      'gdd.calc.4p': 'The same trace, read at the band edges. While the trace hardly bends inside the band, the spread is close to the straight-line estimate GDD·B. The band’s own time resolution is 1/B.',
      'gdd.calc.4c': 'The band reaches past the MUF. Only the part below it propagates, so the MUF is the upper edge.',
      'gdd.e.lo': 'f<sub>lo</sub> = fc − B/2 = {f} − {h} = {v}', 'gdd.e.hi': 'f<sub>hi</sub> = fc + B/2 = {f} + {h} = {v}',
      'gdd.e.hic': 'f<sub>hi</sub> = min(fc + B/2, MUF) = {v}',
      'gdd.e.s': 'Δτ = τ(f<sub>hi</sub>) − τ(f<sub>lo</sub>) = {b} − {a} = <b>{s}</b>',
      'gdd.e.lin': 'GDD·B = {g} × {B} = {s}', 'gdd.e.res': '1/B = 1 / {B} = {r}',
      'gdd.calc.5': 'Is that a lot? The dispersion number GDD·B²',
      'gdd.calc.5p': 'The spread in units of the resolution 1/B: GDD·B / (1/B) = GDD·B². Below 1 the pulse is practically unchanged, from 1 to 5 it is visibly distorted, above 5 it smears.',
      'gdd.e.n': 'GDD·B² = {g} × {B}² = <b>{n}</b>',
      'gdd.e.flat': '{n} < 1 → {v}', 'gdd.e.mild': '1 ≤ {n} < 5 → {v}', 'gdd.e.bad': '{n} ≥ 5 → {v}',
      'gdd.calc.6': 'The widest band, B<sub>max</sub>',
      'gdd.calc.6p': 'Set GDD·B² = 1, so that the spread just equals 1/B, and solve for B. With GDD in µs/MHz the answer comes out in MHz.',
      'gdd.e.b': 'B<sub>max</sub> = 1/√GDD = 1 / √{g} = 1 / {s} = {m} = <b>{b}</b>',
      'gdd.calc.7': 'What the console resolves',
      'gdd.calc.7p': 'An ionozond ionogram has a 24.4 µs delay bin and a 41 kHz column. From one column to the next the trace’s delay changes by GDD × 41 kHz, so it takes many columns to move by one bin.',
      'gdd.e.bin': 'Δτ / 24.4 µs = {s} / 24.4 = <b>{v}</b>', 'gdd.e.col': 'GDD × 41 kHz = {g} × 0.041 = <b>{v}</b> per column',
      'gdd.e.cols': 'columns per bin ≈ 24.4 / {c} = <b>{n}</b>',
      'gdd.cc.sum': 'Show the compensator calculation',
      'gdd.cc.1': 'The compensator’s slope',
      'gdd.cc.1p': 'The GDD estimate is the trace’s true slope at the band centre plus the estimate’s error. The compensator delays each frequency by −GDD<sub>est</sub>·(f − fc).',
      'gdd.e.est': 'GDD<sub>est</sub> = GDD + error = {g} {sg} {e} = <b>{v}</b>',
      'gdd.cc.2': 'What is left: the residual delay',
      'gdd.cc.2p': 'τ<sub>r</sub>(f) = τ(f) − τ(fc) − GDD<sub>est</sub>·(f − fc), taken at 121 frequencies across the band up to the MUF. Its max − min is the residual spread. Two things leave it: the estimate’s error, a tilt of |error|·B, and the trace’s bend, which remains even with an exact estimate.',
      'gdd.e.r1': 'τ<sub>r</sub>(f<sub>lo</sub>) = {v}', 'gdd.e.r2': 'τ<sub>r</sub>(f<sub>hi</sub>) = {v}',
      'gdd.e.rs': 'max − min = {hi} − {lo} = <b>{s}</b>',
      'gdd.e.er': 'tilt from the error: |error|·B = {e} × {B} = {v}', 'gdd.e.cv': 'bend alone, exact estimate: {v}',
      'gdd.cc.3': 'B<sub>max</sub> with the compensator',
      'gdd.cc.3p': 'There is no closed form any more. The band is found by bisection so that the residual spread equals 1/B, that is B × spread(B) = 1. No band reaches past the MUF, so it cannot exceed 2·(MUF − fc).',
      'gdd.e.bc': 'B<sub>max</sub> = <b>{b}</b>', 'gdd.e.bcp': 'check: B × spread(B) = {B} × {s} = {p}',
      'gdd.e.cap': '2·(MUF − fc) = 2 × ({m} − {f}) = <b>{c}</b>',
      'gdd.e.capp': 'even there B × spread(B) = {B} × {s} = {p} < 1, so B<sub>max</sub> reaches the MUF',
      'gdd.model': 'The model. The lower 1F ray is τ(f) = 8.95 ms + b·MUF·(2(1 − √(1 − x)) − x), with x = f/MUF: the integral of the median law GDD = b·(1/√(1 − x) − 1), b = 7.5 µs/MHz, fitted to 583 Cyprus sweeps of February 2026. Real traces scatter about it by the interquartile range in Part 11’s table, and a single sweep’s measurement by about ±4 µs/MHz more. The law was measured with MUF 18–32 MHz; below that it is continued as ∝ 1/MUF. The same law follows independently from a parabolic profile through the secant law (see the vertical-sounding section): by day the two agree within 20 % from 0.8 to 0.96 MUF. The upper ray and 2F are drawn for orientation and enter no number; 2F starts at 9.40 ms and ends at 0.70 MUF, as mirror geometry gives for h′ = 250–300 km. The pulse is a Hann-shaped band of width B centred on the cursor, sent through the phase φ(f) = −2π∫(τ − τc) df that the trace implies. The compensator is an all-pass filter with group delay −GDD_est·(f − fc), where GDD_est is the trace’s slope at the band centre plus the chosen estimate error; B_max with it is the band whose residual delay spread equals 1/B. Fading, O/X splitting and absorption are left out. The console column is 41 kHz and its delay bin 24.4 µs (FFT 16 384, 100 kHz/s).',
    },
  });

  const state = { M: 26, fc: 22, B: 250, more: true, comp: false, err: 0, calc: false, calcC: false };
  const BWMIN = 3, BWMAX = 1000;
  const bwFrom = v => BWMIN * Math.pow(BWMAX / BWMIN, v / 1000);
  const sliderOf = b => Math.round(1000 * Math.log(b / BWMIN) / Math.log(BWMAX / BWMIN));

  // Delay across a band of B kHz after a straight-line compensator of slope est (µs/MHz), relative to
  // the centre, as [f, µs] pairs. Only frequencies up to the MUF count: nothing above it propagates.
  function resid(est, B) {
    const S = state, t0 = M_.tauL(S.fc, S.M), out = [];
    for (let i = 0; i <= 120; i++) {
      const f = S.fc + (i / 120 - 0.5) * B / 1000;
      if (f <= S.M) out.push([f, M_.tauL(f, S.M) - t0 - est * (f - S.fc)]);
    }
    return out;
  }
  const spreadOf = r => r.length ? Math.max(...r.map(p => p[1])) - Math.min(...r.map(p => p[1])) : 0;

  // The widest band whose spread after the compensator still equals 1/B: the same rule that gives
  // B_max = 1/√GDD without one. No band reaches past the MUF, so 2·(MUF − fc) caps it.
  function bmaxComp(est) {
    const cap = 2 * (state.M - state.fc) * 1000, n = B => B / 1000 * spreadOf(resid(est, B));
    if (n(cap) <= 1) return { b: cap, capped: true };
    let lo = 1, hi = cap;
    for (let i = 0; i < 40; i++) { const m = Math.sqrt(lo * hi); if (n(m) > 1) hi = m; else lo = m; }
    return { b: lo, capped: false };
  }

  // The working behind the cards, with the page's numbers put in. Each step is [title, text, formula
  // lines], all HTML from the table above. Where a line subtracts two printed values, the result is
  // the difference of those printed values, so the arithmetic on the page checks.
  const u = (v, d, k) => PG.num(v, d) + ' ' + PG.U(k);
  const sig = (v, s) => PG.num(v, PG.clamp(s - 1 - Math.floor(Math.log10(Math.abs(v) || 1)), 1, 7));
  const fix = (v, d) => +v.toFixed(d);

  function gddSteps() {
    const S = state, T = PG.t, n = PG.num, k = M_.scale(S.M), x = S.fc / S.M, g0 = M_.gdd(S.fc, S.M);
    const sq = Math.sqrt(1 - x), q = 1 / sq - 1, ks = n(k, 3), G = u(g0, 2, 'usMHz'), Bm = S.B / 1000, Bs = u(Bm, 4, 'MHz');
    const xd = 1 - x < 0.01 ? 6 : 4, ta = fix(M_.tauL(S.fc - 0.05, S.M), 3), tb = fix(M_.tauL(S.fc + 0.05, S.M), 3), df = u(0.1, 1, 'MHz');
    const gn = (tb - ta) / 0.1, dev = Math.abs(gn / g0 - 1);
    const half = S.B / 2000, cut = S.fc + half > S.M, flo = S.fc - half, fhi = Math.min(S.fc + half, S.M);
    const d = M_.tauL(fhi, S.M) - M_.tauL(flo, S.M) < 0.1 ? 4 : 3;
    const tl = fix(M_.tauL(flo, S.M), d), th = fix(M_.tauL(fhi, S.M), d), sp = th - tl;
    const Pn = g0 * Bm * Bm, kind = PG.dispKind(Pn), bm = M_.bmax(g0), col = g0 * M_.COL_MHZ, bins = sp / M_.BIN_US;
    return [
      [T('gdd.calc.1'), T('gdd.calc.1p') + (k > 1 ? ' ' + T('gdd.calc.1k') : ''), [
        T('gdd.e.x', { f: n(S.fc, 2), m: n(S.M, 1), x: n(x, xd) }),
        k > 1 ? T('gdd.e.k', { m: n(S.M, 1), k: ks }) : null]],
      [T('gdd.calc.2'), T('gdd.calc.2p'), [
        T('gdd.e.sq', { a: n(1 - x, xd), s: sig(sq, 4) }),
        T('gdd.e.q', { i: n(1 / sq, 4), q: n(q, 4) }),
        T(k > 1 ? 'gdd.e.gk' : 'gdd.e.g', { k: ks, q: n(q, 4), g: G })]],
      [T('gdd.calc.3'), T('gdd.calc.3p', { k: k > 1 ? 'k·' : '' }) + (dev > 0.02 ? ' ' + T('gdd.calc.3b', { p: n(100 * dev, 0) }) : ''), [
        T('gdd.e.t1', { f: u(S.fc - 0.05, 2, 'MHz'), t: u(ta, 3, 'us') }),
        T('gdd.e.t2', { f: u(S.fc + 0.05, 2, 'MHz'), t: u(tb, 3, 'us') }),
        T('gdd.e.d', { a: n(ta, 3), b: n(tb, 3), df, d: u(tb - ta, 3, 'us'), g: u(gn, 2, 'usMHz') })]],
      [T('gdd.calc.4'), T('gdd.calc.4p') + (cut ? ' ' + T('gdd.calc.4c') : ''), [
        T('gdd.e.lo', { f: n(S.fc, 2), h: n(half, 4), v: u(flo, 4, 'MHz') }),
        T(cut ? 'gdd.e.hic' : 'gdd.e.hi', { f: n(S.fc, 2), h: n(half, 4), v: u(fhi, 4, 'MHz') }),
        T('gdd.e.s', { a: n(tl, d), b: n(th, d), s: u(sp, d, 'us') }),
        T('gdd.e.lin', { g: n(g0, 2), B: Bs, s: u(g0 * Bm, d, 'us') }),
        T('gdd.e.res', { B: Bs, r: PG.fmtUs(1 / Bm) })]],
      [T('gdd.calc.5'), T('gdd.calc.5p'), [
        T('gdd.e.n', { g: n(g0, 2), B: n(Bm, 4), n: sig(Pn, 3) }),
        T('gdd.e.' + kind, { n: sig(Pn, 3), v: T('gdd.v.' + kind) })]],
      [T('gdd.calc.6'), T('gdd.calc.6p'), [
        T('gdd.e.b', { g: n(g0, 2), s: n(Math.sqrt(g0), 3), m: u(bm / 1000, 4, 'MHz'), b: PG.fmtBW(bm) })]],
      [T('gdd.calc.7'), T('gdd.calc.7p'), [
        T('gdd.e.bin', { s: n(sp, d), v: n(bins, bins < 0.1 ? 3 : 2) + ' ' + PG.U('bin') }),
        T('gdd.e.col', { g: n(g0, 2), v: u(col, 3, 'us') }),
        T('gdd.e.cols', { c: n(col, 3), n: n(M_.BIN_US / col, 0) })]],
    ];
  }

  // The same for the compensator: its slope, what it leaves across the band, and its B_max.
  function compSteps(est, rc, bc, curv) {
    const S = state, T = PG.t, n = PG.num, g0 = M_.gdd(S.fc, S.M), Bm = S.B / 1000, ys = rc.map(p => p[1]);
    const d = Math.max(...ys) - Math.min(...ys) < 0.1 ? 4 : 3, hi = fix(Math.max(...ys), d), lo = fix(Math.min(...ys), d);
    const sB = spreadOf(resid(est, bc.b)), Bb = bc.b / 1000, e = n(Math.abs(S.err), 1);
    const chk = { B: u(Bb, 4, 'MHz'), s: u(sB, 3, 'us'), p: n(Bb * sB, 2) };
    return [
      [T('gdd.cc.1'), T('gdd.cc.1p'), [
        T('gdd.e.est', { g: n(g0, 2), sg: S.err < 0 ? '−' : '+', e, v: u(est, 2, 'usMHz') })]],
      [T('gdd.cc.2'), T('gdd.cc.2p'), [
        T('gdd.e.r1', { v: u(ys[0], d, 'us') }), T('gdd.e.r2', { v: u(ys[ys.length - 1], d, 'us') }),
        T('gdd.e.rs', { hi: n(hi, d), lo: lo < 0 ? '(' + n(lo, d) + ')' : n(lo, d), s: u(hi - lo, d, 'us') }),
        T('gdd.e.er', { e, B: u(Bm, 4, 'MHz'), v: u(Math.abs(S.err) * Bm, d, 'us') }),
        T('gdd.e.cv', { v: u(curv, d, 'us') })]],
      [T('gdd.cc.3'), T('gdd.cc.3p'), bc.capped
        ? [T('gdd.e.cap', { m: n(S.M, 1), f: n(S.fc, 2), c: u(Bb, 4, 'MHz') }), T('gdd.e.capp', chk)]
        : [T('gdd.e.bc', { b: PG.fmtBW(bc.b) }), T('gdd.e.bcp', chk)]],
    ];
  }

  const calcList = steps => PG.h('ol', { class: 'calc' }, steps.map(([h, p, eq]) => PG.h('li', null,
    PG.h('b', { html: h }), PG.h('p', { html: p }), PG.h('div', { class: 'eq' }, eq.filter(Boolean).map(l => PG.h('div', { html: l }))))));

  function drawIono(svg) {
    svg.replaceChildren();
    const S = state, F0 = 7.5;
    const P = PG.plot(svg, { x0: 64, x1: 744, y0: 18, y1: 262, xd: [7.5, 32.5], yd: [8850, 9650],
      xt: [7.5, 10, 15, 20, 25, 30], yt: [8900, 9100, 9300, 9500], xf: v => PG.num(v, v % 1 ? 1 : 0), yf: v => PG.num(v / 1000, 1),
      xl: PG.t('gdd.x.f'), yl: PG.t('gdd.y.d'), ylx: 18 });
    const { fx, fy, g } = P;
    const flo = S.fc - S.B / 2000, fhi = S.fc + S.B / 2000;
    PG.el(g, 'rect', { x: fx(flo), y: 18, width: Math.max(fx(fhi) - fx(flo), 2), height: 244, style: 'fill:var(--accent-soft)' });
    if (S.more) {
      const M2 = M_.r2F * S.M;
      if (M2 > F0) {
        const p2 = [];
        for (let f = F0; f < M2; f += 0.05) p2.push([fx(f), fy(M_.tauL(f, M2, M_.tau2F))]);
        p2.push([fx(M2), fy(M_.tauL(M2, M2, M_.tau2F))]);
        PG.el(g, 'path', { d: PG.path(p2), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, opacity: .45 });
        PG.text(g, fx(F0) + 6, fy(M_.tauL(F0, M2, M_.tau2F)) - 8, '2F', { opacity: .6 });
      }
      const pu = [], fu0 = Math.max(F0, 0.9 * S.M);
      for (let f = fu0; f <= S.M; f += 0.01) pu.push([fx(f), fy(M_.tauU(f, S.M))]);
      PG.el(g, 'path', { d: PG.path(pu), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 1.4, opacity: .5 });
      PG.text(g, fx(fu0) - 6, fy(M_.tauU(fu0, S.M)) + 4, PG.t('gdd.lbl.up'), { 'text-anchor': 'end', style: 'fill:var(--accent)', opacity: .75 });
    }
    const pl = [];
    for (let f = F0; f < S.M; f += 0.02) pl.push([fx(f), fy(M_.tauL(f, S.M))]);
    pl.push([fx(S.M), fy(M_.tauL(S.M, S.M))]);
    PG.el(g, 'path', { d: PG.path(pl), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6, 'stroke-linejoin': 'round' });
    PG.text(g, fx(F0) + 6, fy(M_.tauL(F0, S.M)) - 9, PG.t('gdd.lbl.1f'), { style: 'fill:var(--accent)' });
    PG.el(g, 'line', { x1: fx(S.M), y1: 18, x2: fx(S.M), y2: 262, stroke: 'currentColor', 'stroke-dasharray': '4 4', opacity: .5 });
    const right = fx(S.M) > 674;
    PG.text(g, fx(S.M) + (right ? -5 : 5), 254, PG.t('gdd.lbl.muf', { v: PG.num(S.M, 1) }), { 'text-anchor': right ? 'end' : 'start', opacity: .75 });
    const g0 = M_.gdd(S.fc, S.M), t0 = M_.tauL(S.fc, S.M), a = Math.max(F0, S.fc - 1.5), b = Math.min(S.M, S.fc + 1.5);
    PG.el(g, 'line', { x1: fx(a), y1: fy(t0 + g0 * (a - S.fc)), x2: fx(b), y2: fy(t0 + g0 * (b - S.fc)), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .85 });
    PG.el(g, 'circle', { cx: fx(S.fc), cy: fy(t0), r: 5, style: 'fill:var(--accent);stroke:var(--surface)', 'stroke-width': 2 });
    const lr = fx(S.fc) > 514;
    PG.text(g, fx(S.fc) + (lr ? -9 : 9), 32, PG.t('gdd.lbl.band', { b: PG.fmtBW(S.B), f: PG.num(S.fc, 2) }), { 'text-anchor': lr ? 'end' : 'start', style: 'fill:var(--accent)' });
  }

  function drawZoom(svg, rc) {
    svg.replaceChildren();
    const S = state, half = S.B / 2, t0 = M_.tauL(S.fc, S.M), g0 = M_.gdd(S.fc, S.M), pts = [];
    for (let i = 0; i <= 200; i++) {
      const d = -half + i * S.B / 200, f = S.fc + d / 1000;
      if (f <= S.M) pts.push([d, M_.tauL(f, S.M) - t0]);
    }
    const ymax = Math.max(15, 1.25 * Math.max(...pts.map(p => Math.abs(p[1]))), 1.25 * Math.abs(g0 * half / 1000));
    const step = ymax > 60 ? 20 : ymax > 30 ? 10 : 5, yt = [];
    for (let v = -Math.floor(ymax / step) * step; v <= ymax; v += step) yt.push(v);
    const kf = v => (v < 0 ? '−' : v > 0 ? '+' : '') + (Math.abs(v) < 10 ? PG.num(Math.abs(v), 1) : PG.num(Math.abs(v), 0));
    const P = PG.plot(svg, { x0: 54, x1: 344, y0: 14, y1: 212, xd: [-half, half], yd: [-ymax, ymax], xt: [-half, 0, half], yt,
      xf: kf, xl: PG.t('gdd.x.off'), yl: PG.t('gdd.y.rel'), ylx: 12 });
    const { fx, fy, g } = P, yb = Math.min(M_.BIN_US / 2, ymax);
    PG.el(g, 'rect', { x: 54, y: fy(yb), width: 290, height: fy(-yb) - fy(yb), style: 'fill:var(--warn-soft)' });
    PG.text(g, 60, fy(yb) + 13, PG.t('gdd.bin'), { style: 'fill:var(--warn)' });
    PG.el(g, 'line', { x1: fx(-half), y1: fy(-g0 * half / 1000), x2: fx(half), y2: fy(g0 * half / 1000), stroke: 'currentColor', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', opacity: .85 });
    if (pts.length > 1) PG.el(g, 'path', { d: PG.path(pts.map(p => [fx(p[0]), fy(p[1])])), fill: 'none', style: 'stroke:var(--accent)', 'stroke-width': 2.6 });
    if (rc && rc.length > 1) PG.el(g, 'path', { d: PG.path(rc.map(p => [fx((p[0] - S.fc) * 1000), fy(p[1])])), fill: 'none', style: 'stroke:var(--comp)', 'stroke-width': 2.4 });
    const mo = (S.M - S.fc) * 1000;
    if (mo < half) {
      PG.el(g, 'rect', { x: fx(mo), y: 14, width: 344 - fx(mo), height: 198, fill: 'currentColor', opacity: .07 });
      PG.text(g, 339, 28, PG.t('gdd.above'), { 'text-anchor': 'end', opacity: .75 });
    }
  }


  PG.register({
    id: 'gdd',
    mount(root) {
      const iono = PG.svg(760, 312, PG.t('gdd.aria.iono'));
      const zoom = PG.svg(360, 260, PG.t('gdd.aria.zoom'));
      const pul = PG.svg(360, 260, PG.t('gdd.aria.pulse'));
      const cards = PG.cards([
        { key: 'x', label: PG.t('gdd.k.x') }, { key: 'g', label: PG.t('gdd.k.g'), sub: PG.t('gdd.k.gs') },
        { key: 's', label: PG.t('gdd.k.s') }, { key: 'b', label: PG.t('gdd.k.b'), sub: PG.t('gdd.k.bs') },
        { key: 'c', label: PG.t('gdd.k.c') }]);
      const note = PG.note();
      const cc = PG.cards([{ key: 's', label: PG.t('gdd.c.k.s'), sub: PG.t('gdd.c.k.ss') }, { key: 'r', label: PG.t('gdd.c.k.r') }, { key: 'b', label: PG.t('gdd.c.k.b') }]);
      const zoomLeg = PG.h('div'), pulLeg = PG.h('div');
      // Folded by default; stays open or shut across visits to the page.
      const fold = (key, sum) => {
        const body = PG.h('div'), root = PG.h('details', { class: 'calc', open: state[key] }, PG.h('summary', null, PG.t(sum)), body);
        root.addEventListener('toggle', () => { state[key] = root.open; });
        return { root, body };
      };
      const calc = fold('calc', 'gdd.calc.sum'), calcC = fold('calcC', 'gdd.cc.sum');

      const update = () => {
        const S = state;
        const fmax = Math.floor(0.995 * S.M * 100) / 100;
        fc.input.max = fmax;
        if (S.fc > fmax) { S.fc = fmax; fc.set(fmax); }
        const g0 = M_.gdd(S.fc, S.M), half = S.B / 2000, cut = S.fc + half > S.M;
        const spread = M_.tauL(Math.min(S.fc + half, S.M), S.M) - M_.tauL(S.fc - half, S.M), Pn = g0 * (S.B / 1000) ** 2;
        const x = S.fc / S.M;
        cards.set('x', PG.num(x, 3), PG.t(x > 0.95 ? 'gdd.x.nose' : x < 0.65 ? 'gdd.x.low' : 'gdd.x.work'));
        cards.set('g', PG.num(g0, 1) + ' ' + PG.U('usMHz'));
        cards.set('s', PG.fmtUs(spread), PG.t('gdd.k.ss', { v: PG.fmtUs(1000 / S.B) }));
        cards.set('b', PG.fmtBW(M_.bmax(g0)));
        cards.set('c', PG.num(spread / M_.BIN_US, spread / M_.BIN_US < 0.1 ? 3 : 2) + ' ' + PG.U('bin'), PG.t('gdd.k.cs', { v: PG.num(g0 * M_.COL_MHZ, 2) }));
        const kind = PG.dispKind(Pn), sc = M_.scale(S.M);
        note.set(kind === 'bad' || cut ? 'caution' : '', PG.t('gdd.v.' + kind),
          [PG.t('gdd.v.' + kind + 'T'), PG.t('gdd.v.num', { v: PG.num(Pn, Pn < 0.01 ? 4 : 2) }), cut ? PG.t('gdd.v.cut') : '', spread < M_.BIN_US ? PG.t('gdd.v.bin') : ''].filter(Boolean).join(' '),
          sc > 1 ? PG.t('gdd.v.ext', { v: PG.num(sc, 2) }) : null, x > 0.96 ? PG.t('gdd.v.nose') : null);
        drawIono(iono);
        calc.body.replaceChildren(calcList(gddSteps()));

        const est = g0 + S.err, rc = S.comp ? resid(est, S.B) : null;
        const Pp = PG.pulse(f => M_.tauL(f, S.M), S.fc, S.B, S.M);
        const Pc = S.comp ? PG.pulse(f => M_.tauL(f, S.M) - est * (f - S.fc), S.fc, S.B, S.M) : null;
        const dB = Q => PG.num(20 * Math.log10(Q.peak), 1), wd = Q => PG.num(Q.grow, 2);
        drawZoom(zoom, rc);
        PG.drawPulse(pul, Pp, { comp: Pc, labels: false });
        zoomLeg.replaceChildren(PG.legend([['line', 'border-color:var(--accent)', PG.t('gdd.l.tr')], ['dash', 'border-color:var(--ink)', PG.t('gdd.l.tan')],
          ...(S.comp ? [['line', 'border-color:var(--comp)', PG.t('gdd.l.res')]] : [])]));
        pulLeg.replaceChildren(PG.legend([['dash', 'border-color:var(--ink)', PG.t('gdd.p.ref')], ['line', 'border-color:var(--accent)', PG.t('gdd.l.path', { p: dB(Pp), w: wd(Pp) })],
          ...(S.comp ? [['line', 'border-color:var(--comp)', PG.t('gdd.l.comp', { p: dB(Pc), w: wd(Pc) })]] : [])]));

        cc.root.hidden = calcC.root.hidden = !S.comp;
        errBox.classList.toggle('off', !S.comp);
        if (S.comp) {
          const spC = spreadOf(rc), bc = bmaxComp(est), curv = spreadOf(resid(g0, S.B));
          cc.set('s', (est > 0 ? '−' : est < 0 ? '+' : '') + PG.num(Math.abs(est), 1) + ' ' + PG.U('usMHz'));
          cc.set('r', PG.fmtUs(spC), PG.t('gdd.c.k.was', { v: PG.fmtUs(spread) }));
          cc.set('b', PG.fmtBW(bc.b), bc.capped ? PG.t('gdd.c.k.cap') : PG.t('gdd.c.k.was', { v: PG.fmtBW(M_.bmax(g0)) }));
          compNote.replaceChildren(PG.h('p', null, PG.t('gdd.c.v', { s: PG.fmtUs(spC), p: dB(Pc), w: wd(Pc) }) +
            (curv > Math.abs(S.err) * S.B / 1000 && spC * S.B / 1000 > 0.5 ? ' ' + PG.t('gdd.c.curv') : '')));
          calcC.body.replaceChildren(calcList(compSteps(est, rc, bc, curv)));
        } else compNote.replaceChildren();
      };

      const muf = PG.slider({ label: PG.t('gdd.muf'), min: 12, max: 32.5, step: 0.1, value: state.M, fmt: v => PG.num(v, 1) + ' ' + PG.U('MHz'), onInput: v => { state.M = v; update(); } });
      const fc = PG.slider({ label: PG.t('gdd.fc'), min: 7.5, max: 32.3, step: 0.01, value: state.fc, fmt: v => PG.num(v, 2) + ' ' + PG.U('MHz'), onInput: v => { state.fc = v; update(); } });
      const presets = PG.h('div', { class: 'seg' },
        [3, 48, 250, 1000].map(b => PG.h('button', { type: 'button', onclick: () => { state.B = b; bw.set(sliderOf(b)); bw.refresh(); update(); } }, PG.fmtBW(b))),
        PG.h('button', { type: 'button', onclick: () => { state.fc = +(0.85 * state.M).toFixed(2); fc.set(state.fc); update(); } }, PG.t('gdd.ow')));
      const bw = PG.slider({ label: PG.t('gdd.bw'), min: 0, max: 1000, step: 1, value: sliderOf(state.B), fmt: () => PG.fmtBW(state.B), onInput: v => { state.B = bwFrom(v); bw.refresh(); update(); }, extra: presets });
      const errS = PG.slider({ label: PG.t('gdd.c.err'), min: -10, max: 10, step: 0.5, value: state.err,
        fmt: v => (v > 0 ? '+' : v < 0 ? '−' : '') + PG.num(Math.abs(v), 1) + ' ' + PG.U('usMHz'), onInput: v => { state.err = v; update(); },
        extra: PG.h('div', { class: 'seg' }, [[0, 'gdd.c.p0'], [2, 'gdd.c.p2'], [5, 'gdd.c.p5']].map(([v, k]) =>
          PG.h('button', { type: 'button', onclick: () => { state.err = v; errS.set(v); update(); } }, PG.t(k)))) });
      const errBox = PG.h('div', { class: 'ctl' }, errS.root);
      const compOn = PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.comp, onchange: e => { state.comp = e.target.checked; update(); } }), PG.t('gdd.c.on'));
      const compNote = PG.h('div', { class: 'lede', style: 'font-size:13.5px;margin:10px 0 0' });
      const more = PG.h('label', { class: 'check' }, PG.h('input', { type: 'checkbox', checked: state.more, onchange: e => { state.more = e.target.checked; update(); } }), PG.t('gdd.more'));

      root.append(
        PG.h('div', { class: 'panel' }, PG.h('div', { class: 'ctl' }, muf.root, fc.root, bw.root), PG.h('div', { class: 'row' }, more)),
        PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.iono')), iono),
        cards.root, note.root, calc.root,
        PG.h('h2', null, PG.t('gdd.c.h')),
        PG.h('p', { class: 'lede', style: 'font-size:14.5px;margin-bottom:12px' }, PG.t('gdd.c.p')),
        PG.h('div', { class: 'panel' }, PG.h('div', { class: 'row', style: 'margin-bottom:12px' }, compOn), errBox, compNote),
        cc.root, calcC.root,
        PG.h('div', { class: 'two' },
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.zoom')), zoom, zoomLeg),
          PG.h('div', { class: 'panel' }, PG.h('p', { class: 'cap' }, PG.t('gdd.cap.pulse')), pul, pulLeg)),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px;margin:18px 0 12px' }, PG.t('gdd.model')),
        PG.h('p', { class: 'lede', style: 'font-size:13.5px' }, PG.t('gdd.bnote')));
      update();
    },
  });
})();
