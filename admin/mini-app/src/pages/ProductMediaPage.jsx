import { useRef, useState } from 'react';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { PRODUCT_MODELS } from '../config/productModels.js';
import { haptic, runActionSafe } from '../api.js';

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductMediaPage({ snapshot, onSnapshotChange, onDone }) {
  const product = snapshot.product || {};
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pickModel = async (model) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await runActionSafe('update_product', {
        product: {
          id: model.id,
          mediaType: '3d',
          modelUrl: model.url,
        },
      });
      onSnapshotChange(next);
      haptic('success');
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  const pickPhoto = async (file) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const dataUrl = await readImageFile(file);
      const next = await runActionSafe('update_product', {
        product: {
          mediaType: 'images',
          images: [dataUrl],
        },
      });
      onSnapshotChange(next);
      haptic('success');
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  const activeId = product.mediaType === '3d' ? product.id : null;
  const activePhoto = product.mediaType === 'images' && product.images?.[0];

  return (
    <SubpageLayout>
      <PageHeader title="Картинка" subtitle="3D или фото" />
      <InsetSection>
        <p className="fm-media-hint">Выберите 3D-модель или добавьте фото из галереи</p>
        <div className="fm-media-grid">
          {PRODUCT_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              className={`fm-media-tile${activeId === model.id ? ' fm-media-tile--active' : ''}`}
              disabled={busy}
              onClick={() => pickModel(model)}
            >
              <span className="fm-media-tile-emoji" aria-hidden>{model.emoji}</span>
              <span className="fm-media-tile-label">{model.label}</span>
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="fm-media-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            pickPhoto(file);
          }}
        />

        <button
          type="button"
          className={`fm-media-photo-btn${activePhoto ? ' fm-media-photo-btn--active' : ''}`}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <span aria-hidden>📷</span>
          {activePhoto ? 'Заменить фото' : 'Добавить фото'}
        </button>

        {activePhoto ? (
          <div className="fm-media-photo-preview">
            <img src={activePhoto} alt="Текущее фото" />
          </div>
        ) : null}
      </InsetSection>
    </SubpageLayout>
  );
}
