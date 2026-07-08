import { useState } from 'react';
import { List, Section, Cell, SegmentedControl } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
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
      <InsetSection>
        <div className="fm-segment-wrap">
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
        <List>
          <Section>
            {filtered.map((o) => (
              <Cell
                key={o.id}
                onClick={() => push(SCREENS.ORDER_DETAIL, { orderId: o.id })}
                subtitle={`${orderStatusLabel(o.status)} · ${o.buyer?.phone || '—'}`}
                description={new Date(o.createdAt).toLocaleString('ru-RU')}
                after={<>{formatPrice(o.amount)} <Icon24ChevronRight /></>}
                multiline
              >
                {o.productName} · {o.receipt}
              </Cell>
            ))}
            {!filtered.length && <Cell subtitle="Нет заказов">Пусто</Cell>}
          </Section>
        </List>
      </InsetSection>
    </SubpageLayout>
  );
}
