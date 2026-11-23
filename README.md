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
системные. Опубликованный сайт считает посещения через GoatCounter одним запросом
картинки, без cookies; копия, открытая с диска или с localhost, не считается.

Если браузер не доверяет `file://`, запустите локальный сервер:

```bash
python3 -m http.server 8000
```

и откройте http://localhost:8000. Язык можно задать в адресе: `?lang=en`.

## Разделы

| Раздел | Что показывает | Часть документа |
|---|---|---|
| Ошибка chirptime | куда уходит эхо при ошибках Δt и Δk: окно ионограммы, перескок через край интервала однозначности, нули дециматора | 9 |
| Длина БПФ и ячейка | форма ячейки k·N/f_ПЧ × f_ПЧ/(k·N), перенос следа на сетку, фильтр мелких объектов 9 × 3, спектр одного столбца у «носа» ДЧХ: когда нижний и верхний лучи разделяются | 5–6 |
| Расписание станций | планировщик ionozond, пропуски станций, пересчёт rep:offset в chirptime, чем dur отличается от chirptime | 7–9 |
| Сутки | суточный ход МНЧ на трассе Кипр — Йошкар-Ола, загрузка суток из архива | 13 |
| Вертикальное зондирование | ионограмма h′(f) по профилю E + F2, та же ионосфера на трассе Кипр — Йошкар-Ола по закону секанса | дополнение |
| Имитатор канала | реальный сеанс, состояние канала по нему, синтезированные по нему сеансы и проверки muf.sim.check: ионограммы рядом с окном и подканалом, мгновенные ПЗМ, профиль следа, C/N₀ вдоль моды, вердикты уровня 2, корреляция с потолком и со следующим сеансом, \|H(f, t)\| на одной несущей | дополнение |
| Имитатор: описание | пять учебных схем; актуальный алгоритм muf.sim (`develope`, 89fbd25 от 4 ноября): сопровождение следов, 1F по подобранному слою (`#simdoc/layer`), распределение мощности, прогноз и проверка часов (`#simdoc/forecast`), фиксированный стенд (`#simdoc/bench`), обновлённая блок-схема (`#simdoc/blocks`) и скриншоты интерфейса; результаты 17 октября выделены как архивный пример | дополнение |
| Глоссарий | сокращения практикума с пояснениями; в тексте всех страниц они подчёркнуты пунктиром и открывают пояснение по наведению или нажатию | — |
| Вики: ЛЧМ-ионограммы | разделы документа на английском и в русском переводе; ссылки на части имеют вид `#wiki/edges`, под частями — ссылки на соответствующие модели | 0–10, 13–14 |
| Публикации | 17 работ научной школы ПГТУ / МарГТУ; компактные ссылки в моделях и вики ведут к записям в разделе `#references` | — |

## Откуда взяты числа и где модель

- Дециматор, окно ионограммы, планировщик и пересчёт rep:offset взяты из
  документа и исходных текстов ionozond (`python/lfp_products.py`,
  `docs/reverse-engineering.md`).
- Модельные сутки, форма следов и порог 8 дБ в разделе о ячейках — схемы, а не
  измерения. На каждой странице это оговорено.
- Вертикальный ионозонд повторяет станцию `yoshkar-ola` из `res/ini/schedule.ini`
  (50 кГц/с, гетеродин 13,5 МГц, 260 с, 1–14 МГц). Профиль слоёв модельный.

## Проверка моделей

`tools/validate/` — независимые проверки на Python. Для расчётов нужен NumPy, для проверки сайта — Playwright с Chromium. Если ionozond расположен в другом каталоге, передайте путь к его папке python скрипту check_cells.py.

| Скрипт | Что проверяет | Результат |
|---|---|---|
| `check_basics.py` | геометрия многоскачковых мод, наклонная дальность и окно ионограммы ionozond; дециматор, смоделированный на частоте дискретизации 25 МГц | дециматор совпадает с формулой с точностью 0,2 дБ |
| `check_cells.py` | раздел о ячейках против полной обработки: синтетическая запись, БПФ и функция `delete_small_objects` из ionozond | картина та же: при 500 кГц/с БПФ на 16 384 точки стирает след, на 4096 — сохраняет |
| `check_vertical.py` | h′(f) по аналитической формуле для одного слоя и наклонная проекция по закону секанса | h′ с точностью 0,02 км до 0,99 foF2; вывод МНЧ, M и задержек проекции |
| `check_site.py` | все страницы на русском и английском | страницы отображаются без ошибок скриптов и пропущенных переводов, все внутренние ссылки работают |

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
`board-*-{ru,en}.png` строятся скриптами `figures/doska_ionogramma.py`,
`figures/doska_dechirp.py` и другими скриптами `figures/doska_*.py` проекта моделирования канала
(`--lang en` для английской версии) и уменьшаются до 1800 пикселей по ширине;
снимки текущей страницы имитатора `sim-*-{ru,en}.jpg` переснимаются командой
`python tools/capture_simdoc.py` (нужны Playwright, Chromium и Pillow): светлая тема,
окно 1365 пикселей, масштаб устройства 1,5, начальный сеанс 06:00.
Алгоритм описания сверен с `ionograms-handler/develope`, коммит `89fbd25`;
встроенные данные 17 октября остаются архивным примером ранней версии. Блок-схема `muf.sim` рисуется в SVG модулем `js/modules/simdoc.js`: её
блоки и подписи на двух языках задаёт массив `LANES`, а цвета берутся из палитры темы.

## Вики

Раздел «Вики» собирается из `ionozond/docs/ionogram-physics.html` (соседний
репозиторий) скриптом `tools/wiki/build_wiki.py` в `js/wiki/physics.js`. Скрипт делит
оставленные части документа на текстовые блоки по позициям в исходнике, сохраняя
разметку и рисунки. В русскую версию подставляется перевод каждого блока из
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

Библиография и привязка ссылок к материалам находятся в `js/modules/references.js`.
Ссылки вида `#references/dispersion-paths` ведут к конкретной работе. Вики получает
ссылки при отображении, поэтому пересборка `js/wiki/physics.js` их сохраняет.

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
the network, and system fonts stand in offline. The published site counts visits
through GoatCounter with one image request and no cookies; a copy opened from
disk or localhost is not counted. If a browser is strict about
`file://`, run `python3 -m http.server 8000` and open http://localhost:8000.
`?lang=en` picks the language.

**Sections:** chirptime error, FFT length and cell shape (with the spectrum of one
column at the nose), the station schedule (with a rep:offset → chirptime converter
and an explanation of dur), the daily MUF course for a model day or a day from the
archive, and vertical sounding. The vertical page shows the h′(f) ionogram from an
E + F2 profile and projects it onto the Cyprus path by the secant law.

The HF channel simulator shows a real sounding, the channel state read from it,
the soundings synthesised from it, and muf.sim.check's verdicts. Its notes (`#simdoc`)
include five boards on the ionogram, the second dechirp, the slow and fast parts
of the state, and the channel at one carrier. They describe muf.sim at `develope`
commit `89fbd25` (4 November 2026), including forecasting and clock checks
(`#simdoc/forecast`), the frozen benchmark (`#simdoc/bench`), and the block diagram
(`#simdoc/blocks`, drawn in SVG by `js/modules/simdoc.js` from its `LANES`).
The text is in `js/wiki/simdoc.js`, the figures in `img/`, and the boards are built
by `figures/doska_*.py` in the channel-modelling project.

The wiki presents the selected parts of the document in English and Russian.
Parts link as `#wiki/edges` and link to the relevant models. The glossary explains
abbreviations in place on hover or tap.

**Publications:** `#references` lists 17 works from the VSUT / MarSTU scientific school.
Compact numbered citations in the models, wiki and glossary link to individual entries.
The bibliography and citation mappings live in `js/modules/references.js`; generated
wiki content stays unchanged when references are added.

**Sources.** The decimator, panel window, scheduler and timing conversion follow
the document and the ionozond sources. The model day, trace shapes and the 8 dB
threshold in the cell section are schematic.

**The wiki** is built from `ionozond/docs/ionogram-physics.html` by
`python3 tools/wiki/build_wiki.py`, which writes `js/wiki/physics.js`. It cuts the
retained parts into text blocks by source position, preserving markup and figures,
and fills the Russian page from `tools/wiki/physics.ru.json`, keyed
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

**Validation.** `tools/validate/` holds independent Python checks. The model checks
use NumPy, and the site check uses Playwright with Chromium. Pass the path to
ionozond’s python directory to check_cells.py if the checkout is elsewhere.

| Script | What it checks |
|---|---|
| `check_basics.py` | Multi-hop geometry, slant range, the ionozond panel window and the decimator at 25 MS/s. |
| `check_cells.py` | The cell model against full FFT processing with the console's speckle filter. |
| `check_vertical.py` | h′(f) against the analytic formula and the oblique projection by the secant law. |
| `check_site.py` | Every page renders in both languages without script errors or missing translations. Every internal link resolves. |
