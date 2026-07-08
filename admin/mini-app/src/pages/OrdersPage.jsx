import { useState } from 'react';
import { List, Section, Cell, SegmentedControl } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { formatPrice, orderStatusLabel } from '../utils.js';
import { haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

const FILTERS = ['all', 'paid', 'pending', 'failed', 'refunded'];

export function OrdersPage({ snapshot, push }) {
  const [filter, setFilter] = useState('all');
  const orders = snapshot.orders || [];

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  }).slice().reverse();

  return (
    <SubpageLayout>
      <PageHeader title="Заказы" subtitle={`${orders.length} всего`} />
      <InsetSection>
        <div className="fm-segment-wrap">
          <SegmentedControl>
            {FILTERS.map(f => (
              <SegmentedControl.Item
                key={f}
                selected={filter === f}
                onClick={() => { setFilter(f); haptic('selection'); }}
              >
                {f}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        </div>
        <List>
          <Section>
            {filtered.map(o => (
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
