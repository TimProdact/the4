import { useState } from 'react';
import { SegmentedControl } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { formatPrice, orderStatusLabel } from '../utils.js';
import { haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

export function OrdersPage({ snapshot, push }) {
  const [filter, setFilter] = useState('new');
  const orders = snapshot.orders || [];

  const filtered = orders.filter((o) => {
    if (filter === 'new') return o.status === 'pending';
    return true;
  }).slice().reverse();

  return (
    <SubpageLayout>
      <PageHeader title="Заказы" subtitle={`${orders.length} всего`} />
      <div className="fm-page-body">
        <div className="fm-segment-wrap fm-segment-wrap--media">
          <SegmentedControl>
            <SegmentedControl.Item
              selected={filter === 'new'}
              onClick={() => { setFilter('new'); haptic('selection'); }}
            >
              Новые
            </SegmentedControl.Item>
            <SegmentedControl.Item
              selected={filter === 'all'}
              onClick={() => { setFilter('all'); haptic('selection'); }}
            >
              Все
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        {filtered.length > 0 ? (
          <div className="fm-inset-card fm-value-group">
            {filtered.map((order, index) => (
              <button
                key={order.id}
                type="button"
                className={`fm-value-row fm-value-row--chevron fm-tap${index === filtered.length - 1 ? ' fm-value-row--last' : ''}`}
                onClick={() => { haptic('selection'); push(SCREENS.ORDER_DETAIL, { orderId: order.id }); }}
              >
                <span className="fm-value-row-label">{order.receipt}</span>
                <span className="fm-value-row-value">
                  {formatPrice(order.amount)} · {orderStatusLabel(order.status)}
                </span>
                <Icon24ChevronRight className="fm-value-row-chevron" />
              </button>
            ))}
          </div>
        ) : (
          <p className="fm-empty-hint">
            {filter === 'new' ? 'Новых заказов нет' : 'Заказов пока нет'}
          </p>
        )}
      </div>
    </SubpageLayout>
  );
}
