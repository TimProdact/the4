import { useState } from 'react';
import { List, Section, Cell, Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { formatPrice, phaseLabel } from '../utils.js';
import { haptic, runActionSafe } from '../api.js';

export function DropPage({ snapshot, onSnapshotChange }) {
  const [stockInput, setStockInput] = useState(String(snapshot.stock));
  const [busy, setBusy] = useState(false);

  const act = async (adminAction, payload = {}) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await runActionSafe(adminAction, payload);
      onSnapshotChange(next);
      if (adminAction === 'set_stock') setStockInput(String(next.stock));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SubpageLayout>
      <PageHeader
        title="Дроп"
        subtitle={phaseLabel(snapshot.phase, snapshot.paused)}
      />
      <InsetSection>
        <List>
          <Section header="СТОК">
            <Cell
              subtitle="Доступно сейчас"
              after={`${snapshot.available} / ${snapshot.stock}`}
            >
              {formatPrice(320_000)} · SILK REPAIR
            </Cell>
            <Cell>
              <div className="fm-drop-stock-row">
                <input
                  type="number"
                  min={0}
                  max={snapshot.totalStock}
                  value={stockInput}
                  onChange={e => setStockInput(e.target.value)}
                  className="fm-drop-input"
                />
                <Button
                  mode="filled"
                  size="s"
                  disabled={busy}
                  onClick={() => act('set_stock', { stock: Number(stockInput) })}
                >
                  Set
                </Button>
              </div>
            </Cell>
          </Section>

          <Section header="УПРАВЛЕНИЕ">
            <Cell>
              <Button
                mode="filled"
                size="l"
                stretched
                disabled={busy}
                onClick={() => act('set_paused', { paused: !snapshot.paused })}
              >
                {snapshot.paused ? '▶️ Resume' : '⏸ Пауза'}
              </Button>
            </Cell>
            <Cell>
              <Button
                mode="outline"
                size="l"
                stretched
                disabled={busy}
                onClick={() => act('clear_holds')}
              >
                Сбросить holds ({snapshot.holds.length})
              </Button>
            </Cell>
            <Cell>
              <Button
                mode="outline"
                size="l"
                stretched
                disabled={busy}
                onClick={() => act('set_starts_at', {
                  startsAt: new Date(Date.now() + 3_600_000).toISOString(),
                })}
              >
                Pre-drop +1ч
              </Button>
            </Cell>
            <Cell>
              <Button
                mode="outline"
                size="l"
                stretched
                disabled={busy}
                onClick={() => act('set_starts_at', { startsAt: '2020-01-01T00:00:00.000Z' })}
              >
                Active now
              </Button>
            </Cell>
            <Cell>
              <Button
                mode="plain"
                size="l"
                stretched
                disabled={busy}
                onClick={() => {
                  const tg = window.Telegram?.WebApp;
                  const run = () => act('reset_demo');
                  if (tg?.showPopup) {
                    tg.showPopup({
                      title: 'Reset demo',
                      message: 'Сбросить все демо-данные?',
                      buttons: [{ type: 'destructive', text: 'Сбросить', id: 'yes' }, { type: 'cancel' }],
                    }, id => { if (id === 'yes') run(); });
                  } else if (confirm('Сбросить демо?')) run();
                }}
                style={{ color: 'var(--tg-theme-destructive-text-color, #ff3b30)' }}
              >
                Reset demo
              </Button>
            </Cell>
          </Section>

          {snapshot.holds.length > 0 && (
            <Section header="HOLDS">
              {snapshot.holds.map(h => (
                <Cell
                  key={h.id}
                  subtitle={new Date(h.expiresAt).toLocaleTimeString('ru-RU')}
                >
                  {h.id.slice(0, 8)}…
                </Cell>
              ))}
            </Section>
          )}
        </List>
      </InsetSection>
    </SubpageLayout>
  );
}
