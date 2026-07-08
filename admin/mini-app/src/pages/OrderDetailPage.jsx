import { List, Section, Cell, Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { formatPrice, orderStatusLabel } from '../utils.js';
import { runActionSafe } from '../api.js';

export function OrderDetailPage({ order, onSnapshotChange }) {
  if (!order) return null;
  const tg = window.Telegram?.WebApp;
  const date = new Date(order.createdAt).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  const update = async (adminAction, payload) => {
    const next = await runActionSafe(adminAction, payload);
    onSnapshotChange(next);
    tg?.showPopup?.({
      title: 'Готово',
      message: 'Статус заказа обновлён',
      buttons: [{ type: 'ok' }],
    });
  };

  const canConfirm = order.status === 'pending';
  const canRefund = order.status === 'paid';

  return (
    <SubpageLayout>
      <PageHeader title="Детали заказа" subtitle={date} />
      <InsetSection>
        <List>
          <Section header="СТАТУС">
            <Cell subtitle="Текущий">{orderStatusLabel(order.status)}</Cell>
            <Cell subtitle="Чек">{order.receipt}</Cell>
          </Section>
          <Section header="ПОКУПАТЕЛЬ">
            <Cell subtitle="Имя">{order.buyer?.name || '—'}</Cell>
            <Cell subtitle="Телефон">{order.buyer?.phone || '—'}</Cell>
            <Cell subtitle="Доставка">{order.buyer?.deliveryType || '—'}</Cell>
            {order.buyer?.address && (
              <Cell subtitle="Адрес">{order.buyer.address}</Cell>
            )}
          </Section>
          <Section header="ТОВАР">
            <Cell subtitle="Название">{order.productName}</Cell>
            <Cell subtitle="Издание">{order.edition}</Cell>
            <Cell subtitle="Сумма">{formatPrice(order.amount)}</Cell>
            <Cell subtitle="Оплата">{order.paymentMethod || '—'}</Cell>
          </Section>
          {(canConfirm || canRefund) && (
            <Section header="ДЕЙСТВИЯ">
              {canConfirm && (
                <Cell>
                  <Button
                    mode="filled"
                    size="l"
                    stretched
                    onClick={() => update('confirm_pending', { orderId: order.id })}
                  >
                    Подтвердить оплату
                  </Button>
                </Cell>
              )}
              {canRefund && (
                <Cell>
                  <Button
                    mode="plain"
                    size="l"
                    stretched
                    onClick={() => update('mark_order', { orderId: order.id, status: 'refunded' })}
                    style={{ color: 'var(--tg-theme-destructive-text-color, #ff3b30)' }}
                  >
                    Возврат
                  </Button>
                </Cell>
              )}
            </Section>
          )}
        </List>
      </InsetSection>
    </SubpageLayout>
  );
}
