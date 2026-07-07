# The4 — Single Screen Drop (6 фаз)

## Запуск

```bash
npm install
npm run dev
```

## Фазы

| Фаза | URL | Как тестировать |
|------|-----|-----------------|
| 1 Pre-Drop | `/` | `DROP_STARTS_AT` в будущем |
| 1 VIP | долгий тап на логотип | пароль `THE4` |
| 2 Active | `/` | по умолчанию (drop в прошлом) |
| 2 Sold Out | `/` | купить 14 раз или `stock=0` |
| 3 Checkout | BUY NOW | шторка 60% снизу |
| 5 Success | после оплаты | оверлей на медиа-зоне |
| 6 Realtime | SSE | `/api/stock/stream` |

## Taneesh deep link

```
/?name=Алишер&phone=998901234567
```

Поля автозаполняются в checkout.

## Pre-Drop

```bash
DROP_STARTS_AT=2026-12-31T12:00:00.000Z npm run dev
```

## API

- `GET /api/drop` — статус
- `POST /api/vip` — ранний доступ
- `POST /api/hold` — резерв 5 мин
- `POST /api/checkout` — оплата (mock Paylov)
- `GET /api/stock/stream` — SSE stock/phase

## Paylov

Кнопка «ОПЛАТИТЬ ЧЕРЕЗ PAYLOV» — UI готов, подключить API в `api/checkout/route.ts`.
