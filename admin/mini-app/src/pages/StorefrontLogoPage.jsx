import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { FieldSheet } from '../components/FieldSheet.jsx';
import { haptic, runActionSafe } from '../api.js';

const LOGO_EMOJIS = ['🐱', '💄', '✨', '🌸', '🧴', '💎', '🦋', '🌙'];

function storefrontOf(snapshot) {
  return snapshot.storefront || snapshot.brand || {};
}

export function StorefrontLogoPage({ snapshot, onSnapshotChange, onDone }) {
  const sf = storefrontOf(snapshot);
  const activeEmoji = sf.logoEmoji || '🐱';
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (patch) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await runActionSafe('update_storefront', { storefront: patch });
      onSnapshotChange(next);
      haptic('success');
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  const pickEmoji = (emoji) => {
    haptic('selection');
    save({ logoEmoji: emoji, avatarUrl: '' });
  };

  const saveUrl = async (raw) => {
    const avatarUrl = raw.trim();
    if (!avatarUrl) throw new Error('Введите ссылку');
    await save({ avatarUrl, logoEmoji: activeEmoji });
    setSheet(null);
  };

  return (
    <SubpageLayout>
      <PageHeader title="Логотип" subtitle="Эмодзи или фото" />
      <div className="fm-page-body">
        <p className="fm-media-hint">Выберите эмодзи для витрины</p>
        <div className="fm-inset-card fm-media-card">
          <div className="fm-media-grid">
            {LOGO_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`fm-media-tile${activeEmoji === emoji && !sf.avatarUrl ? ' fm-media-tile--active' : ''}`}
                disabled={busy}
                onClick={() => pickEmoji(emoji)}
              >
                <span className="fm-media-tile-emoji" aria-hidden>{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="fm-page-cta fm-page-cta--separated">
          <Button mode="filled" size="l" stretched disabled={busy} onClick={() => setSheet(true)}>
            Указать ссылку на фото
          </Button>
        </div>
      </div>

      <FieldSheet
        open={sheet}
        title="Ссылка на фото"
        value={sf.avatarUrl || ''}
        placeholder="https://..."
        onClose={() => setSheet(false)}
        onSave={saveUrl}
      />
    </SubpageLayout>
  );
}
