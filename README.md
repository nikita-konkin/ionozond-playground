# Ionozond · практикум

Интерактивные модели к документу «Oblique Chirp Ionograms»
(`ionozond/docs/ionogram-physics.html`): наклонное ЛЧМ-зондирование на трассе
Кипр — Йошкар-Ола, вертикальное зондирование той же ионосферы и программа
ionozond. Интерфейс на русском, переключатель EN — в шапке. *English below.*

## Как открыть

Онлайн: https://nikita-konkin.github.io/ionozond-playground/ (публикуется из ветки `main` через GitHub Actions,
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
| Дисперсия на ионограмме | ДЧХ мод 1F и 2F по медианному закону GDD, полоса сигнала, B_max, импульс после трассы | 11 |
| Как измерять GDD | наклон задержки и кривизна фазы в окне 1 МГц, 300 реализаций, усреднение по сеансам | 11 |
| Ошибка chirptime | куда уходит эхо при ошибках Δt и Δk: окно ионограммы, перескок через край интервала однозначности, нули дециматора | 9 |
| Длина БПФ и ячейка | форма ячейки k·N/f_ПЧ × f_ПЧ/(k·N), перенос следа на сетку, фильтр мелких объектов 9 × 3 | 6 |
| Расписание станций | планировщик ionozond, пропуски станций, пересчёт rep:offset в chirptime | 7–9 |
| Сутки | суточный ход МНЧ, карта B_max по частоте и времени для наклонной трассы и для вертикального зондирования, загрузка суток из архива | 11 |
| Вертикальное зондирование | ионограмма h′(f) по профилю E + F2, GDD и B_max вблизи критических частот, та же ионосфера на трассе Кипр — Йошкар-Ола по закону секанса | дополнение |

## Откуда взяты числа и где модель

- Закон GDD = 7,5·(1/√(1 − f/МНЧ) − 1) мкс/МГц — медиана 19 033 оценок наклона
  по 583 сеансам за 4–9 февраля 2026 г. (`lfs_tools/dispersion_stats.py`).
  Межквартильный разброс — около ±50 %.
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

## Устройство

```
index.html          каркас: шапка, навигация, подвал
css/style.css       палитра и типографика документа, тёмная тема
js/core.js          переводы, элементы управления, SVG-графики, модель, переходы между разделами
js/modules/*.js     по файлу на раздел, у каждого свои строки RU/EN
tools/export_daily.py
tools/validate/     проверки моделей на Python
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

**Online:** https://nikita-konkin.github.io/ionozond-playground/ (deployed from `main` by GitHub Actions,
`.github/workflows/pages.yml`).

**Locally,** open `index.html` by double-clicking. There is no build step and no server:
classic scripts, hand-drawn SVG, no external libraries. Only the fonts come from
the network, and system fonts stand in offline. If a browser is strict about
`file://`, run `python3 -m http.server 8000` and open http://localhost:8000.
`?lang=en` picks the language.

**Sections:** dispersion on the ionogram; measuring GDD (delay slope against
phase fit); chirptime error; FFT length and cell shape; the station schedule
with a rep:offset → chirptime converter; the day, with a B_max map over
frequency and time for the oblique path or a vertical sounder; and vertical
sounding: an h′(f) ionogram from an E + F2 profile, its dispersion, and the
same ionosphere carried over to the Cyprus path by the secant law.

**Sources.** The GDD law is the median of 19 033 slopes from 583 sweeps,
4–9 February 2026. The measurement errors are calibrated against full FFT
processing of synthetic captures. The decimator, panel window, scheduler and
timing conversion follow the document and the ionozond sources. The model day,
trace shapes and the 8 dB threshold in the cell section are schematic, and each
page says where it is showing a model.

**A real day.** `tools/export_daily.py` turns an `lfs_tools/lfs_batch.py` file
into the JSON the day page loads (needs Python 3 and numpy).

**Validation.** `tools/validate/` holds independent Python checks: the GDD law
against the measured medians, the decimator simulated at 25 MS/s, what GDD·B²
does to a pulse, the cell page against full FFT processing through the console's
own speckle filter, and the vertical model against the closed form and, via the
secant law, against the measured oblique medians. A daytime F2 with a weak E
layer reproduces those medians from 0.6 to 0.96 MUF to within 2–3 µs/MHz.
