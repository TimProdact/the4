import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { Icon24QR } from '@telegram-apps/telegram-ui/dist/icons/24/qr';
import { MenuGroup, MenuRow } from '../components/MenuRow.jsx';
import {
  pendingOrders,
  vitrinaShortUrl,
  vitrinaUrl,
} from '../utils.js';
import { copyText, haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

export function HubPage({ snapshot, push }) {
  const tg = window.Telegram?.WebApp;
  const pending = pendingOrders(snapshot.orders);
  const storefront = snapshot.storefront || {};
  const brand = snapshot.brand || {};
  const displayName = storefront.displayName || brand.name || 'THE4';
  const bio = storefront.bio || brand.bio || '';
  const avatarUrl = storefront.avatarUrl || brand.logoUrl || '';
  const logoEmoji = storefront.logoEmoji || brand.logoEmoji || '🐱';
  const waitlist = snapshot.waitlist || [];
  const products = snapshot.products || [];
  const drops = snapshot.drops || [];
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
            onClick={() => { haptic('selection'); push(SCREENS.STOREFRONT_EDIT); }}
          >
            Edit
          </button>
        </div>

        <div className="fm-hub-hero-center">
          <div className="fm-hub-avatar" aria-hidden>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="fm-hub-avatar-img" />
            ) : (
              <span className="fm-hub-avatar-emoji">{logoEmoji}</span>
            )}
          </div>
          <h1 className="fm-hub-title">{displayName}</h1>
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
          {bio ? <p className="fm-hub-bio">{bio}</p> : null}
        </div>
      </header>

      <div className="fm-hub-stack">
        <MenuGroup>
          <MenuRow
            label="Товары"
            glyph="📦"
            tone="#007aff"
            value={String(products.length)}
            onClick={() => push(SCREENS.CATALOG)}
          />
          <MenuRow
            label="Дропы"
            glyph="⏱"
            tone="#ff9500"
            value={String(drops.length)}
            onClick={() => push(SCREENS.DROPS)}
          />
          <MenuRow
            label="Заказы"
            glyph="🧾"
            tone="#34c759"
            value={pending.length ? String(pending.length) : ''}
            onClick={() => push(SCREENS.ORDERS)}
          />
          <MenuRow
            label="Waitlist"
            glyph="📋"
            tone="#8e8e93"
            value={String((snapshot.waitlist || []).length)}
            onClick={() => push(SCREENS.WAITLIST)}
            last
          />
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
