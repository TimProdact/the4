import { Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { ValueGroup } from '../components/ValueGroup.jsx';
import { ValueRow } from '../components/ValueRow.jsx';
import { formatPrice, orderStatusLabel } from '../utils.js';
import { runActionSafe } from '../api.js';

export function OrderDetailPage({ order, onSnapshotChange }) {
  if (!order) return null;

  const date = new Date(order.createdAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const update = async (adminAction, payload) => {
    const next = await runActionSafe(adminAction, payload);
    onSnapshotChange(next);
  };

  const canConfirm = order.status === 'pending';
  const canRefund = order.status === 'paid';

  return (
    <SubpageLayout>
      <PageHeader title="Заказ" subtitle={date} />
      <div className="fm-page-body">
        <ValueGroup>
          <ValueRow label="Статус" value={orderStatusLabel(order.status)} muted />
          <ValueRow label="Чек" value={order.receipt} last />
        </ValueGroup>

        <ValueGroup className="fm-value-group--spaced">
          <ValueRow label="Имя" value={order.buyer?.name || '—'} />
          <ValueRow label="Телефон" value={order.buyer?.phone || '—'} />
          <ValueRow label="Доставка" value={order.buyer?.deliveryType || '—'} />
          <ValueRow label="Адрес" value={order.buyer?.address || '—'} last />
        </ValueGroup>

        <ValueGroup className="fm-value-group--spaced">
          <ValueRow label="Товар" value={order.productName || '—'} />
          <ValueRow label="Издание" value={order.edition || '—'} />
          <ValueRow label="Сумма" value={formatPrice(order.amount)} />
          <ValueRow label="Оплата" value={order.paymentMethod || '—'} last />
        </ValueGroup>

        {(canConfirm || canRefund) && (
          <div className="fm-page-cta fm-page-cta--separated fm-page-cta--stack">
            {canConfirm && (
              <Button
                mode="filled"
                size="l"
                stretched
                onClick={() => update('confirm_pending', { orderId: order.id })}
              >
                Подтвердить оплату
              </Button>
            )}
            {canRefund && (
              <Button
                mode="plain"
                size="l"
                stretched
                className="fm-btn-destructive"
                onClick={() => update('mark_order', { orderId: order.id, status: 'refunded' })}
              >
                Возврат
              </Button>
            )}
          </div>
        )}
      </div>
    </SubpageLayout>
  );
}
