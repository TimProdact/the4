import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { MenuGroup, MenuRow } from '../components/MenuRow.jsx';
import {
  formatPrice,
  phaseLabel,
  pendingOrders,
  todayMetrics,
  vitrinaUrl,
} from '../utils.js';
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

function DropStatusCard({ snapshot, onPress }) {
  const metrics = todayMetrics(snapshot.orders);
  return (
    <button type="button" className="fm-hub-summary-card fm-tap" onClick={onPress}>
      <div className="fm-hub-summary-head">
        <span className="fm-hub-summary-title">Статус дропа</span>
        <span className="fm-hub-summary-chevron" aria-hidden>›</span>
      </div>
      <div className="fm-hub-summary-metrics fm-hub-summary-metrics--3">
        <div className="fm-hub-summary-metric">
          <span className="fm-hub-summary-label">Фаза</span>
          <span className="fm-hub-summary-value fm-hub-summary-value--accent">
            {phaseLabel(snapshot.phase, snapshot.paused)}
          </span>
        </div>
        <div className="fm-hub-summary-metric">
          <span className="fm-hub-summary-label">Остаток</span>
          <span className="fm-hub-summary-value">
            {snapshot.available} / {snapshot.stock}
          </span>
        </div>
        <div className="fm-hub-summary-metric">
          <span className="fm-hub-summary-label">Сегодня</span>
          <span className="fm-hub-summary-value">{formatPrice(metrics.todayRevenue)}</span>
        </div>
      </div>
    </button>
  );
}

export function HubPage({ snapshot, push }) {
  const tg = window.Telegram?.WebApp;
  const pending = pendingOrders(snapshot.orders);
  const url = vitrinaUrl();

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
        <div className="fm-hub-hero-bar">
          <button
            type="button"
            className="fm-hub-hero-round-btn"
            aria-label="Открыть витрину"
            onClick={openVitrina}
          >
            🐱
          </button>
        </div>
        <div className="fm-hub-hero-center">
          <div className="fm-hub-avatar" aria-hidden>
            <span className="fm-hub-avatar-emoji">🐱</span>
          </div>
          <h1 className="fm-hub-title">THE4</h1>
          <p className="fm-hub-subtitle">SILK REPAIR · 1st Drop</p>
          <div className="fm-hub-vitrina-url">
            <button type="button" className="fm-hub-vitrina-url-link" onClick={openVitrina}>
              timprodact.github.io/the4
            </button>
            <button
              type="button"
              className="fm-hub-vitrina-url-copy"
              aria-label="Скопировать ссылку"
              onClick={() => copyText(url)}
            >
              <Icon20Copy />
            </button>
          </div>
        </div>
      </header>

      <div className="fm-hub-actions fm-hub-actions--4" role="toolbar" aria-label="Быстрые разделы">
        <HubAction
          label="Дроп"
          glyph="📦"
          onClick={() => { haptic('selection'); push(SCREENS.DROP); }}
        />
        <HubAction
          label="Заказы"
          glyph="🧾"
          badge={pending.length || null}
          onClick={() => { haptic('selection'); push(SCREENS.ORDERS); }}
        />
        <HubAction
          label="Waitlist"
          glyph="📋"
          badge={snapshot.waitlist.length || null}
          onClick={() => { haptic('selection'); push(SCREENS.WAITLIST); }}
        />
        <HubAction
          label="Аналитика"
          glyph="📊"
          onClick={() => { haptic('selection'); push(SCREENS.ANALYTICS); }}
        />
      </div>

      <div className="fm-hub-stack">
        <DropStatusCard snapshot={snapshot} onPress={() => { haptic('selection'); push(SCREENS.DROP); }} />

        <MenuGroup>
          <MenuRow
            label="Настройки"
            glyph="⚙️"
            tone="#8e8e93"
            onClick={() => push(SCREENS.SETTINGS)}
          />
          <MenuRow
            label="Поддержка"
            glyph="💬"
            tone="#007aff"
            onClick={openSupport}
          />
          <MenuRow
            label="Витрина"
            glyph="🌐"
            tone="#34c759"
            value="Открыть"
            onClick={openVitrina}
            last
          />
        </MenuGroup>
      </div>

      <footer className="fm-hub-footer">
        <span>THE4 ADMIN</span>
      </footer>
    </main>
  );
}
