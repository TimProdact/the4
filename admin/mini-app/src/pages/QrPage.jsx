import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { copyText, haptic } from '../api.js';
import { vitrinaShortUrl, vitrinaUrl } from '../utils.js';

export function QrPage({ snapshot, onDone }) {
  const brand = snapshot.brand || {};
  const url = vitrinaUrl();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(url)}`;

  const handleCopy = () => {
    haptic('light');
    copyText(url);
  };

  return (
    <main className="fm-twa fm-qr-page">
      <div className="fm-qr-top">
        <h1 className="fm-qr-title">QR-код</h1>
        <button type="button" className="fm-qr-close" aria-label="Закрыть" onClick={onDone}>
          ✕
        </button>
      </div>

      <div className="fm-qr-stage">
        <div className="fm-qr-avatar-wrap">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt="" className="fm-qr-avatar" />
          ) : (
            <div className="fm-qr-avatar fm-qr-avatar--emoji">{brand.logoEmoji || '🐱'}</div>
          )}
        </div>
        <div className="fm-qr-card">
          <img src={qrSrc} alt="QR витрины" className="fm-qr-image" width={240} height={240} />
          <div className="fm-qr-handle">{vitrinaShortUrl()}</div>
        </div>
      </div>

      <button type="button" className="fm-qr-copy" onClick={handleCopy}>
        <Icon20Copy /> Скопировать ссылку
      </button>
    </main>
  );
}
