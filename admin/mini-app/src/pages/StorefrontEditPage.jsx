import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { SocialNetworksCard } from '../components/SocialNetworksCard.jsx';
import { haptic, runActionSafe } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

const LOGO_EMOJIS = ['🐱', '💄', '✨', '🌸', '🧴', '💎', '🦋', '🌙'];

export function StorefrontEditPage({ snapshot, onSnapshotChange, onDone, push }) {
  const storefront = snapshot.storefront || snapshot.brand || {};
  const socialLinks = snapshot.socialLinks || storefront.socialLinks || [];
  const [displayName, setDisplayName] = useState(storefront.displayName || storefront.name || '');
  const [bio, setBio] = useState(storefront.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(storefront.avatarUrl || storefront.logoUrl || '');
  const [logoEmoji, setLogoEmoji] = useState(storefront.logoEmoji || '🐱');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sf = snapshot.storefront || snapshot.brand || {};
    setDisplayName(sf.displayName || sf.name || '');
    setBio(sf.bio || '');
    setAvatarUrl(sf.avatarUrl || sf.logoUrl || '');
    setLogoEmoji(sf.logoEmoji || '🐱');
  }, [snapshot]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await runActionSafe('update_storefront', {
        storefront: {
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
          logoEmoji,
        },
      });
      onSnapshotChange(next);
      haptic('success');
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SubpageLayout>
      <PageHeader title="Настройки магазина" subtitle="Лого, описание, соцсети" />

      <InsetSection className="fm-settings-section--flush">
        <div className="fm-settings-card">
          <div className="fm-settings-avatar-block">
            <div className="fm-settings-avatar-ring">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="fm-settings-avatar-img" />
              ) : (
                <span className="fm-settings-avatar-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  {logoEmoji}
                </span>
              )}
            </div>
          </div>

          <label className="fm-brand-label">Логотип</label>
          <div className="fm-brand-emoji-grid">
            {LOGO_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`fm-brand-emoji${logoEmoji === emoji && !avatarUrl ? ' fm-brand-emoji--active' : ''}`}
                onClick={() => { setLogoEmoji(emoji); setAvatarUrl(''); haptic('selection'); }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <label className="fm-brand-label">Или ссылка на фото</label>
          <input
            className="fm-brand-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />

          <label className="fm-brand-label">Название</label>
          <input
            className="fm-brand-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="SILK REPAIR"
          />

          <label className="fm-brand-label">Описание</label>
          <textarea
            className="fm-brand-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Коротко о бренде и дропе"
            rows={3}
          />
        </div>
      </InsetSection>

      <InsetSection title="Бизнес" stacked>
        <SocialNetworksCard
          links={socialLinks}
          onOpen={() => push(SCREENS.SOCIALS)}
        />
      </InsetSection>

      <div className="fm-page-cta">
        <Button mode="filled" size="l" stretched disabled={busy} onClick={save}>
          Сохранить
        </Button>
      </div>
    </SubpageLayout>
  );
}
