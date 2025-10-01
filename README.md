# WCAG Contrast & Typography Checker

Проверка контраста текста по WCAG 2.2 (AA/AAA) + предпросмотр типографики.

**Демо:** https://dauletserikson.github.io/contrast-checker/  
**Репозиторий:** https://github.com/DauletSerikson/contrast-checker

![screenshot](assets/screenshot.png)

## Что умеет (v0)
- Поддержка ввода цвета через color picker и HEX.
- Мгновенный расчёт контраста (ratio) по формуле WCAG:
  - Линейная яркость: `L = 0.2126R + 0.7152G + 0.0722B` (после gamma-раскодирования sRGB).
  - Контраст: `(L1 + 0.05) / (L2 + 0.05)`.
- Бейджи на соответствие порогам:
  - **AA normal ≥ 4.5**, **AAA normal ≥ 7.0**;
  - **AA large ≥ 3.0**, **AAA large ≥ 4.5**.
- Настройка типографики: размер, жирность, межстрочный.
- История последних пресетов, клик по элементу — применяет цвета.
- Копирование ссылки на текущие настройки (`?bg=…&fg=…&fs=…&fw=…&lh=…`).

## Старт локально
VS Code + Live Server → ПКМ на `index.html` → Open with Live Server.

## Дорожная карта (v1+)
- Ввод RGB/HSL и именованных цветов.
- Автоподбор ближайшего доступного контраста при изменении одного цвета.
- Экспорт пресетов в JSON.
- Подсказки по размерам «large text» (24px normal / 18.67px bold).

## Автор
[**Daulet Serikson**](https://github.com/DauletSerikson) · © 2025  
Лицензия: MIT
