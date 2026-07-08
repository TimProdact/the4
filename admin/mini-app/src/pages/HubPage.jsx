import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { Icon24QR } from '@telegram-apps/telegram-ui/dist/icons/24/qr';
import { MenuGroup, MenuRow } from '../components/MenuRow.jsx';
import {
  phaseLabel,
  pendingOrders,
  vitrinaShortUrl,
  vitrinaUrl,
} from '../utils.js';
import { copyText, haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

export function HubPage({ snapshot, push }) {
  const tg = window.Telegram?.WebApp;
  const pending = pendingOrders(snapshot.orders);
  const product = snapshot.product || {};
  const brand = snapshot.brand || {};
  const waitlist = snapshot.waitlist || [];
  const url = vitrinaUrl();

  const openVitrina = () => {
    haptic('light');
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  return (
    <main className="fm-twa fm-home fm-hub">
      <header className="fm-hub-hero">
        <div className="fm-hub-hero-bar">
          <button
            type="button"
            className="fm-hub-hero-round-btn"
            aria-label="QR-код витрины"
            onClick={() => { haptic('light'); push(SCREENS.STORE_QR); }}
          >
            <Icon24QR />
          </button>
          <button
            type="button"
            className="fm-hub-hero-edit-btn"
            onClick={() => { haptic('selection'); push(SCREENS.STORE_EDIT); }}
          >
            Edit
          </button>
        </div>

        <div className="fm-hub-hero-center">
          <div className="fm-hub-avatar" aria-hidden>
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="fm-hub-avatar-img" />
            ) : (
              <span className="fm-hub-avatar-emoji">{brand.logoEmoji || '🐱'}</span>
            )}
          </div>
          <h1 className="fm-hub-title">{product.name || brand.name || 'THE4'}</h1>
          <div className="fm-hub-vitrina-url">
            <button type="button" className="fm-hub-vitrina-url-link" onClick={openVitrina}>
              {vitrinaShortUrl()}
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
          {brand.bio ? <p className="fm-hub-bio">{brand.bio}</p> : null}
          <p className="fm-hub-overview-status">
            <span className="fm-hub-status-pill">{phaseLabel(snapshot.phase, snapshot.paused)}</span>
          </p>
        </div>
      </header>

      <div className="fm-hub-stack">
        <MenuGroup>
          <MenuRow label="Товар" glyph="📦" tone="#007aff" onClick={() => push(SCREENS.PRODUCT)} />
          <MenuRow label="Дроп" glyph="⏱" tone="#ff9500" onClick={() => push(SCREENS.DROP)} />
          <MenuRow
            label="Заказы"
            glyph="🧾"
            tone="#34c759"
            value={pending.length ? String(pending.length) : ''}
            onClick={() => push(SCREENS.ORDERS)}
          />
          {waitlist.length > 0 ? (
            <MenuRow
              label="Waitlist"
              glyph="📋"
              tone="#8e8e93"
              value={String(waitlist.length)}
              onClick={() => push(SCREENS.WAITLIST)}
              last
            />
          ) : (
            <MenuRow label="Waitlist" glyph="📋" tone="#8e8e93" value="0" onClick={() => push(SCREENS.WAITLIST)} last />
          )}
        </MenuGroup>

        <div className="fm-hub-cta">
          <button type="button" className="fm-hub-cta-btn" onClick={openVitrina}>
            Открыть витрину
          </button>
        </div>
      </div>

      <footer className="fm-hub-footer">
        <span>@pocketpals_bot</span>
      </footer>
    </main>
  );
}
