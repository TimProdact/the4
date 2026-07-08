export function formatPrice(n, currency = 'UZS') {
  return `${Number(n).toLocaleString('ru-RU')} ${currency}`;
}

const STATUS_LABELS = {
  paid: 'Оплачен',
  pending: 'Ожидает',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

export function orderStatusLabel(status) {
  return STATUS_LABELS[status] || status || '—';
}

export function phaseLabel(phase, paused) {
  if (paused) return 'Пауза';
  const map = {
    active: 'Активен',
    pre_drop: 'Pre-drop',
    sold_out: 'Sold out',
  };
  return map[phase] || phase;
}

export function vitrinaUrl() {
  return 'https://timprodact.github.io/the4/';
}

export function pendingOrders(orders = []) {
  return orders.filter(o => o.status === 'pending');
}

export function todayMetrics(orders = []) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = orders.filter(o => new Date(o.createdAt) >= start);
  const paid = today.filter(o => o.status === 'paid');
  return {
    todayOrders: today.length,
    todayRevenue: paid.reduce((a, o) => a + Number(o.amount || 0), 0),
  };
}
