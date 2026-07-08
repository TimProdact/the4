import { useState } from 'react';
import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { BottomSheet } from '../components/BottomSheet.jsx';
import { MenuGroup, MenuRow } from '../components/MenuRow.jsx';
import { formatPrice, phaseLabel, pendingOrders, todayMetrics, vitrinaUrl } from '../utils.js';
import { copyText, haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

function HubAction({ label, glyph, badge, onClick }) {
  return (
    <button type="button" className="fm-hub-action" onClick={onClick}>
      <span className="fm-hub-action-icon" aria-hidden>
        <span className="fm-hub-action-glyph">{glyph}</span>
        {badge ? <span className="fm-hub-action-badge">{badge}</span> : null}
      </span>
      <span className="fm-hub-action-label">{label}</span>
    </button>
  );
}

function formatDropDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function HubPage({ snapshot, push }) {
  const tg = window.Telegram?.WebApp;
  const pending = pendingOrders(snapshot.orders);
  const metrics = todayMetrics(snapshot.orders);
  const product = snapshot.product || {};
  const url = vitrinaUrl();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const waitlist = snapshot.waitlist || [];

  const openVitrina = () => {
    haptic('light');
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  const openSupport = () => {
    haptic('selection');
    if (tg?.openTelegramLink) tg.openTelegramLink('https://t.me/mundesign');
    else window.open('https://t.me/mundesign', '_blank', 'noopener');
  };

  return (
    <main className="fm-twa fm-home fm-hub">
      <header className="fm-hub-hero">
        <div className="fm-hub-hero-center">
          <div className="fm-hub-avatar" aria-hidden>
            <span className="fm-hub-avatar-emoji">🐱</span>
          </div>
          <h1 className="fm-hub-title">{product.name || 'THE4'}</h1>
          <p className="fm-hub-subtitle">{product.edition || 'Drop'}</p>
          <div className="fm-hub-status-strip">
            <span className="fm-hub-status-pill">{phaseLabel(snapshot.phase, snapshot.paused)}</span>
            <span>{snapshot.available} / {snapshot.stock}</span>
            <span>{formatDropDate(snapshot.startsAt)}</span>
          </div>
          <p className="fm-hub-metric-line">Сегодня: {formatPrice(metrics.todayRevenue)}</p>
        </div>
      </header>

      <div className="fm-hub-actions fm-hub-actions--2" role="toolbar">
        <HubAction
          label="Товар"
          glyph="📦"
          onClick={() => { haptic('selection'); push(SCREENS.PRODUCT); }}
        />
        <HubAction
          label="Заказы"
          glyph="🧾"
          badge={pending.length || null}
          onClick={() => { haptic('selection'); push(SCREENS.ORDERS); }}
        />
      </div>

      <div className="fm-hub-stack">
        {waitlist.length > 0 && (
          <MenuGroup>
            <MenuRow
              label="Waitlist"
              glyph="📋"
              tone="#8e8e93"
              value={`${waitlist.length}`}
              onClick={() => setWaitlistOpen(true)}
              last
            />
          </MenuGroup>
        )}

        <MenuGroup>
          <MenuRow label="Открыть витрину" glyph="🌐" tone="#34c759" onClick={openVitrina} />
          <MenuRow label="Поддержка" glyph="💬" tone="#007aff" onClick={openSupport} last />
        </MenuGroup>
      </div>

      <footer className="fm-hub-footer">
        <span>@pocketpals_bot</span>
      </footer>

      <BottomSheet open={waitlistOpen} onClose={() => setWaitlistOpen(false)} title={`Waitlist · ${waitlist.length}`}>
        <ul className="fm-waitlist-list">
          {waitlist.map((w) => (
            <li key={w.id}>{w.contact}</li>
          ))}
        </ul>
        <button type="button" className="fm-waitlist-copy" onClick={() => copyText(waitlist.map(w => w.contact).join('\n'))}>
          <Icon20Copy /> Скопировать все
        </button>
      </BottomSheet>
    </main>
  );
}
