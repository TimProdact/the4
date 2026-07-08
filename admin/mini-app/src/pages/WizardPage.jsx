import { useMemo, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { ProductPreview } from '../components/ProductPreview.jsx';
import { PRODUCT_MODELS } from '../config/productModels.js';
import { haptic, runActionSafe } from '../api.js';

function toDateValue(iso) {
  const d = iso ? new Date(iso) : new Date(Date.now() + 7 * 86_400_000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeValue(iso) {
  const d = iso ? new Date(iso) : new Date();
  d.setHours(20, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mergeDateTime(datePart, timePart) {
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  const base = new Date();
  base.setFullYear(y, m - 1, d);
  base.setHours(hh, mm, 0, 0);
  return base.toISOString();
}

export function WizardPage({ snapshot, onSnapshotChange, onComplete }) {
  const product = snapshot.product || {};
  const [step, setStep] = useState(1);
  const [name, setName] = useState(product.name || '');
  const [price, setPrice] = useState(String(product.price || '320000'));
  const [modelId, setModelId] = useState(product.id || PRODUCT_MODELS[0].id);
  const [mediaType, setMediaType] = useState(product.mediaType || '3d');
  const [imageData, setImageData] = useState(product.images?.[0] || '');
  const [date, setDate] = useState(toDateValue(snapshot.startsAt));
  const [time, setTime] = useState(toTimeValue(snapshot.startsAt));
  const [stock, setStock] = useState(snapshot.totalStock || 100);
  const [busy, setBusy] = useState(false);

  const previewProduct = useMemo(() => ({
    name,
    id: modelId,
    mediaType,
    images: imageData ? [imageData] : product.images,
  }), [name, modelId, mediaType, imageData, product.images]);

  const next = () => {
    haptic('selection');
    setStep((s) => Math.min(3, s + 1));
  };

  const launch = async () => {
    if (busy) return;
    const model = PRODUCT_MODELS.find((m) => m.id === modelId) || PRODUCT_MODELS[0];
    const priceNum = Number(String(price).replace(/\s/g, ''));
    if (!name.trim()) return;
    if (!Number.isFinite(priceNum) || priceNum <= 0) return;

    setBusy(true);
    try {
      const nextSnap = await runActionSafe('launch_drop', {
        name: name.trim(),
        price: priceNum,
        startsAt: mergeDateTime(date, time),
        stock,
        totalStock: stock,
        product: mediaType === 'images' && imageData
          ? { mediaType: 'images', images: [imageData] }
          : { id: model.id, mediaType: '3d', modelUrl: model.url },
      });
      onSnapshotChange(nextSnap);
      haptic('success');
      onComplete?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="fm-twa fm-wizard">
      <div className="fm-wizard-progress">Шаг {step}/3</div>

      {step === 1 && (
        <section className="fm-wizard-step">
          <h1 className="fm-wizard-title">Как называется?</h1>
          <input
            className="fm-wizard-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SILK REPAIR"
            autoFocus
          />
          <input
            className="fm-wizard-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="320 000"
            inputMode="numeric"
          />
          <Button mode="filled" size="l" stretched disabled={!name.trim()} onClick={next}>
            Далее →
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="fm-wizard-step">
          <h1 className="fm-wizard-title">Как выглядит?</h1>
          <div className="fm-wizard-preview">
            <ProductPreview product={previewProduct} size="md" />
          </div>
          <div className="fm-media-grid fm-media-grid--wizard">
            {PRODUCT_MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                className={`fm-media-tile${modelId === model.id && mediaType === '3d' ? ' fm-media-tile--active' : ''}`}
                onClick={() => { setModelId(model.id); setMediaType('3d'); haptic('selection'); }}
              >
                <span className="fm-media-tile-emoji">{model.emoji}</span>
                <span className="fm-media-tile-label">{model.label}</span>
              </button>
            ))}
          </div>
          <label className="fm-media-photo-btn">
            <span aria-hidden>📷</span>
            Добавить фото
            <input
              type="file"
              accept="image/*"
              className="fm-media-file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setImageData(String(reader.result));
                  setMediaType('images');
                  haptic('selection');
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <Button mode="filled" size="l" stretched onClick={next}>
            Далее →
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="fm-wizard-step">
          <h1 className="fm-wizard-title">Когда старт?</h1>
          <div className="fm-wizard-datetime">
            <input type="date" className="fm-wizard-input" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" className="fm-wizard-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="fm-wizard-stock">
            <span className="fm-wizard-stock-label">{stock} штук</span>
            <div className="fm-stepper fm-stepper--wizard">
              <button type="button" className="fm-stepper-btn" disabled={stock <= 1} onClick={() => setStock((s) => Math.max(1, s - 10))}>−</button>
              <button type="button" className="fm-stepper-btn" onClick={() => setStock((s) => s + 10)}>+</button>
            </div>
          </div>
          <Button mode="filled" size="l" stretched disabled={busy} onClick={launch}>
            Запустить дроп
          </Button>
        </section>
      )}
    </main>
  );
}
