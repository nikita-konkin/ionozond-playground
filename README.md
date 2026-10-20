# Ionozond · практикум

Интерактивные модели к документу «Oblique Chirp Ionograms»
(`ionozond/docs/ionogram-physics.html`): наклонное ЛЧМ-зондирование на трассе
Кипр — Йошкар-Ола, вертикальное зондирование той же ионосферы и программа
ionozond. Интерфейс на русском, переключатель EN — в шапке. *English below.*

## Как открыть

Онлайн: http://konkin-nikita.ru/ionozond-playground/ (публикуется из ветки `main` через GitHub Actions,
`.github/workflows/pages.yml`).

Локально достаточно дважды щёлкнуть по `index.html`. Ни сборка, ни сервер не нужны:
обычные скрипты без модулей, графики рисуются вручную в SVG, внешних библиотек
нет. Из сети загружаются только шрифты (Google Fonts), без неё браузер возьмёт
системные.

Если браузер не доверяет `file://`, запустите локальный сервер:

```bash
python3 -m http.server 8000
```

и откройте http://localhost:8000. Язык можно задать в адресе: `?lang=en`.

## Разделы

| Раздел | Что показывает | Часть документа |
|---|---|---|
| Дисперсия на ионограмме | ДЧХ мод 1F и 2F по медианному закону GDD, полоса сигнала, B_max, импульс после трассы, тот же предел через фазу на краях полосы и B_max вдоль всей ДЧХ | 11 |
| Как измерять GDD | наклон задержки и кривизна фазы в окне 1 МГц, 300 реализаций, усреднение по сеансам | 11 |
| Ошибка chirptime | куда уходит эхо при ошибках Δt и Δk: окно ионограммы, перескок через край интервала однозначности, нули дециматора | 9 |
| Длина БПФ и ячейка | форма ячейки k·N/f_ПЧ × f_ПЧ/(k·N), перенос следа на сетку, фильтр мелких объектов 9 × 3, спектр одного столбца у «носа» ДЧХ: когда нижний и верхний лучи разделяются | 5–6 |
| Расписание станций | планировщик ionozond, пропуски станций, пересчёт rep:offset в chirptime, чем dur отличается от chirptime | 7–9 |
| Сутки | суточный ход МНЧ, карта B_max по частоте и времени для наклонной трассы и для вертикального зондирования, загрузка суток из архива | 11 |
| Вертикальное зондирование | ионограмма h′(f) по профилю E + F2, GDD и B_max вблизи критических частот, та же ионосфера на трассе Кипр — Йошкар-Ола по закону секанса | дополнение |
| Имитатор канала | реальный сеанс, состояние канала по нему, синтетические копии и проверки muf.sim.check: ионограммы рядом, срезы, профиль следа, C/N₀ вдоль моды, вердикты уровня 2, корреляция с потолком и со следующим сеансом, \|H(f, t)\| на одной несущей | дополнение |
| Имитатор: описание | две схемы — как получается ионограмма и что из неё читается (импульсная характеристика, АЧХ, ФЧХ), что делает с сигналом дисперсия внутри моды; текущая версия muf.sim, модель состояния, синтез, проверки, путеводитель по странице имитатора и итоги сеансов 17 октября; ссылки на части имеют вид `#simdoc/version` | дополнение |
| Глоссарий | сокращения практикума с пояснениями; в тексте всех страниц они подчёркнуты пунктиром и открывают пояснение по наведению или нажатию | — |
| Вики: ЛЧМ-ионограммы | полный текст документа на английском и в русском переводе; ссылки на части имеют вид `#wiki/gdd`, под частями — ссылки на соответствующие модели | 0–15 |

## Откуда взяты числа и где модель

- Закон GDD = 7,5·(1/√(1 − f/МНЧ) − 1) мкс/МГц — медиана 19 033 оценок наклона
  по 583 сеансам за 4–9 февраля 2026 г. (`lfs_tools/dispersion_stats.py` в проекте
  моделирования канала). Коэффициент b подогнан функцией `curve_fit` к медианам
  19 интервалов f/МНЧ от 0,5 до 0,975 с весами по числу оценок: b = 7,52, R² = 0,975;
  без весов или с началом подгонки на 0,6–0,8 МНЧ получается 7,4–7,6. Это параметр
  модели трассы Кипр — Йошкар-Ола, а не универсальная постоянная. Межквартильный разброс — около ±50 %.
- Ошибки методов измерения откалиброваны по полной БПФ-обработке синтетических
  записей (доплеровское расширение 0,37 Гц, ОСШ 18 дБ на 0,1 с).
- Дециматор, окно ионограммы, планировщик и пересчёт rep:offset взяты из
  документа и исходных текстов ionozond (`python/lfp_products.py`,
  `docs/reverse-engineering.md`).
- Модельные сутки, форма следов и порог 8 дБ в разделе о ячейках — схемы, а не
  измерения. На каждой странице это оговорено.
- Вертикальный ионозонд повторяет станцию `yoshkar-ola` из `res/ini/schedule.ini`
  (50 кГц/с, гетеродин 13,5 МГц, 260 с, 1–14 МГц). Профиль слоёв модельный.

## Проверка моделей

`tools/validate/` — независимые проверки на Python (нужен numpy):

| Скрипт | Что проверяет | Результат |
|---|---|---|
| `check_basics.py` | закон GDD против измеренных медиан; мода 2F; наклонная дальность и окно ионограммы ionozond; дециматор, смоделированный на частоте дискретизации 25 МГц | от 0,61 до 0,96 МНЧ закон лежит внутри межквартильного размаха; при 0,99 МНЧ он вдвое круче медианы, поэтому вблизи МНЧ страницы используют медиану 36,5 мкс/МГц; дециматор совпадает с формулой с точностью 0,2 дБ |
| `check_pulse.py` | что делает с импульсом произведение GDD·B² | при 1 импульс почти не меняется (−0,06 дБ), при 5 теряет 1,5 дБ и расширяется в 1,6 раза; отсюда пороги 1 и 5 и оценка B_max как осторожной границы |
| `check_cells.py` | раздел о ячейках против полной обработки: синтетическая запись, БПФ и функция `delete_small_objects` из ionozond | картина та же: при 500 кГц/с БПФ на 16 384 точки стирает след, на 4096 — сохраняет |
| `check_vertical.py` | h′(f) против аналитической формулы для одного слоя; наклонная проекция профиля против закона | h′ с точностью 0,02 км; дневной слой F2 со слабым слоем E воспроизводит медианы от 0,6 до 0,96 МНЧ с точностью 2–3 мкс/МГц |

Модель раздела «Как измерять GDD» сверена с полной обработкой синтетики
(`lfs_tools`) во всех четырёх вариантах — 0,01 и 0,37 Гц, столбцы 0,1 и 0,41 с —
с расхождением не более 15 %. Закон GDD измерен при МНЧ 18–32 МГц; ночью страницы
продолжают его пропорционально 1/МНЧ и предупреждают об этом.

## Настоящие сутки из архива

Раздел «Сутки» принимает JSON с суточным ходом МНЧ. Его готовит
`tools/export_daily.py` из пакетного файла `lfs_tools/lfs_batch.py`:

```bash
python3 tools/export_daily.py lfs_feb2026.npz out --date 2026-02-04
```

Получится `out/muf_2026-02-04.json`; загрузите его кнопкой «Загрузить сутки
(JSON)». Нужны Python 3 и numpy.

## Данные имитатора

Раздел «Имитатор канала» ничего не считает сам: он рисует то, что вычисляет
`muf.sim.check` в ionograms-handler. Данные собираются там:

```bash
python docs/ui/console.py СЕАНС ... --json sim.json
```

где `СЕАНС` — запись `.lfs` или продукт `.h5` с окном эха. Файл можно загрузить
кнопкой «Загрузить данные (JSON)» (подходит и собранный там же `console.html`) или
встроить в практикум:

```bash
python3 tools/sim_data.py sim.json
```

Скрипт проверяет данные и пишет `js/data/sim.js`; `index.html` подключает его
строкой `<script>` после модуля. Это ионограммы реальных сеансов: перед публикацией
решите, можно ли их выкладывать. Без `js/data/sim.js` страница просит файл.

Описание имитатора (раздел «Имитатор: описание») написано вручную и лежит в
`js/wiki/simdoc.js`, по тексту на язык. Рисунки к нему — в `img/`: схемы
`board-*-{ru,en}.png` строятся скриптами `figures/doska_ionogramma.py` и
`figures/doska_gdd.py` проекта моделирования канала (`--lang en` для английской
версии), снимки страницы имитатора `sim-*-{ru,en}.jpg` сделаны в светлой теме при
ширине 1100 пикселей.

## Вики

Раздел «Вики» собирается из `ionozond/docs/ionogram-physics.html` (соседний
репозиторий) скриптом `tools/wiki/build_wiki.py` в `js/wiki/physics.js`. Скрипт делит
документ на текстовые блоки по позициям в исходнике, поэтому разметка и рисунки
переносятся без изменений, а в русскую версию подставляется перевод каждого блока из
`tools/wiki/physics.ru.json` (ключ — английский текст блока).

```bash
python3 tools/wiki/build_wiki.py
```

Если документ изменился, изменённые блоки остаются на английском, и скрипт сообщает
их число; ключ `--missing` выводит их в JSON. Переведите их, добавьте в
`physics.ru.json` и соберите раздел заново.

Исправления документа и заметки практикума лежат в `tools/wiki/physics.fix.json`:
это точные пары «найти — заменить» с указанием причины, которые применяются к документу
до разбиения. Сам документ не меняется; если искомый текст встречается не ровно один
раз, сборка останавливается.

## Устройство

```
index.html          каркас: шапка, навигация, подвал
css/style.css       палитра и типографика документа, тёмная тема
js/core.js          переводы, элементы управления, SVG-графики, модель, переходы между разделами
js/build.js         коммит и дата сборки для подвала; при публикации его записывает pages.yml
js/modules/*.js     по файлу на раздел, у каждого свои строки RU/EN
js/wiki/physics.js  текст вики, собирается из документа, вручную не правится
js/wiki/simdoc.js   описание имитатора, RU и EN, пишется вручную
img/                рисунки описания имитатора: схемы и снимки страницы
tools/export_daily.py
tools/sim_data.py   данные имитатора в js/data/sim.js
tools/validate/     проверки моделей на Python
tools/wiki/         сборка вики и русский перевод документа
```

Чтобы добавить раздел, создайте файл в `js/modules/`, который вызывает
`PG.i18n({...})` и `PG.register({ id, mount(root) })`, и подключите его строкой
`<script>` в `index.html`.

---

# Ionozond · playground

Interactive models for “Oblique Chirp Ionograms”
(`ionozond/docs/ionogram-physics.html`): oblique chirp sounding on the Cyprus →
Yoshkar-Ola path and the ionozond console. Russian by default, with an EN switch
in the header.

**Online:** http://konkin-nikita.ru/ionozond-playground/ (deployed from `main` by GitHub Actions,
`.github/workflows/pages.yml`).

**Locally,** open `index.html` by double-clicking. There is no build step and no server:
classic scripts, hand-drawn SVG, no external libraries. Only the fonts come from
the network, and system fonts stand in offline. If a browser is strict about
`file://`, run `python3 -m http.server 8000` and open http://localhost:8000.
`?lang=en` picks the language.

**Sections:** dispersion on the ionogram, with the same limit read as edge phase; measuring GDD (delay slope against
phase fit); chirptime error; FFT length and cell shape, with the spectrum of one column at the nose; the station schedule
with a rep:offset → chirptime converter and how dur differs from chirptime; the day, with a B_max map over
frequency and time for the oblique path or a vertical sounder; and vertical
sounding: an h′(f) ionogram from an E + F2 profile, its dispersion, and the
same ionosphere carried over to the Cyprus path by the secant law. A supplement shows
the HF channel simulator at work: a real sounding, the channel state read off it, its
synthetic copies, and muf.sim.check's verdicts on them. Its notes (`#simdoc`) start
from two boards, how an ionogram is made and read for the impulse response,
magnitude and phase, and what dispersion within a mode does to a signal, then
describe the current muf.sim version, its model and checks, and the page beside it;
the text is in `js/wiki/simdoc.js`, the figures in `img/`, the boards built by
`figures/doska_*.py` in the channel-modelling project. The wiki holds
the document itself, in English and in Russian; parts link as `#wiki/gdd` and so on,
and each part links to the pages that model it. A glossary explains the
abbreviations; in every page's text they are underlined and open the same note on
hover or tap.

**Sources.** The GDD law is the median of 19 033 slopes from 583 sweeps,
4–9 February 2026. Its b is a `curve_fit` to the medians of 19 f/MUF bins from 0.5
to 0.975, weighted by the number of slopes: 7.52, R² = 0.975, and 7.4–7.6 without
the weights or starting at 0.6–0.8 MUF. It is a parameter of this path, not a
universal constant. The measurement errors are calibrated against full FFT
processing of synthetic captures. The decimator, panel window, scheduler and
timing conversion follow the document and the ionozond sources. The model day,
trace shapes and the 8 dB threshold in the cell section are schematic, and each
page says where it is showing a model.

**The wiki** is built from `ionozond/docs/ionogram-physics.html` by
`python3 tools/wiki/build_wiki.py`, which writes `js/wiki/physics.js`. It cuts the
document into text blocks by source position, so markup and figures carry over
byte for byte, and fills the Russian page from `tools/wiki/physics.ru.json`, keyed
by each block's English. Blocks the document has changed stay in English and are
counted; `--missing` lists them as JSON to translate. Corrections and the playground's own
notes are exact find/replace pairs, each with its reason, in `tools/wiki/physics.fix.json`,
applied before the cut; the source stays untouched, and a pair that no longer matches
exactly once stops the build.

**A real day.** `tools/export_daily.py` turns an `lfs_tools/lfs_batch.py` file
into the JSON the day page loads (needs Python 3 and numpy).

**The simulator's data** is built in ionograms-handler,
`python docs/ui/console.py SOUNDING ... --json sim.json`, and either loaded on the page
or bundled with `python3 tools/sim_data.py sim.json`, which checks it and writes
`js/data/sim.js`. These are ionograms of real soundings: decide whether they may be
published before deploying them. Without `js/data/sim.js` the page asks for a file.

**Validation.** `tools/validate/` holds independent Python checks: the GDD law
against the measured medians, the decimator simulated at 25 MS/s, what GDD·B²
does to a pulse, the cell page against full FFT processing through the console's
own speckle filter, and the vertical model against the closed form and, via the
secant law, against the measured oblique medians. A daytime F2 with a weak E
layer reproduces those medians from 0.6 to 0.96 MUF to within 2–3 µs/MHz.
