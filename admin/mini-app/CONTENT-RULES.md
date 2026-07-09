---
description: THE4 / Pocket Pals mini-app content, layout, and UX rules
globs: admin/mini-app/**
---

# Mini-app — правила контента и UX

## Принципы

- Админка = Telegram Settings. Не форма, не wizard при открытии.
- Редактирование: экран-обзор + строки + FieldSheet (одно поле) + автосохранение.
- Сложный выбор (картинка, логотип) → отдельный экран.
- Wizard только при создании дропа (LaunchDropSheet).
- Нет кнопки «Сохранить» на экранах редактирования.
- Список и primary CTA всегда визуально разделены (`fm-page-cta--separated`, 20px).

## Открытие

- Старт и возврат из фона → Hub.

## Layout экрана

```
PageHeader (title + subtitle-счётчик)
fm-page-body
  [контент: fm-inset-card / ValueGroup / empty hint]
  fm-page-cta fm-page-cta--separated (если есть действие)
```

## Компоненты

- `ValueGroup` — карточка со строками
- `ValueRow` — лейбл | значение | ›
- `StepperRow` — лейбл | stepper
- `SwitchRow` — лейбл | switch
- `FieldSheet` — одно поле + «Готово»
- `LaunchDropSheet` — создание дропа (3 шага)
- `ProductPreview` — превью товара

## Флоу

- Товар: каталог → + → ProductPage (sheet «Название») → строки + sheets; картинка → ProductMediaPage (тумблер 3D|Фото).
- Дроп: список → + → LaunchDropSheet; редактирование → DropPage (строки + sheets, stepper, switch).
- Витрина: Hub Edit → StorefrontEditPage (строки + sheets); логотип → StorefrontLogoPage; соцсети → SocialsPage (исключение: autosave inline).
- QR: full-screen TikTok-стиль.

## Отступы

- `--fm-space-page: 20px`
- Строка: padding `14px 16px`
- Между ValueGroup: `12px` (`.fm-value-group--spaced`)

## Тексты

- Кнопки: «+ Добавить товар», «+ Запустить дроп», «Готово», «Далее →», «Скопировать», «Поделиться».
- Статусы дропа: До старта / Идёт продажа / Распродано / Пауза — не обрезать.
