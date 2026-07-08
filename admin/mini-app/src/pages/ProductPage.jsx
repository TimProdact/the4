import { useState } from 'react';
import { List, Section, Cell, Button } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { formatPrice, phaseLabel, vitrinaUrl } from '../utils.js';
import { haptic, runActionSafe } from '../api.js';

const MODELS = [
  { id: 'cream-tube', label: 'Тюбик крема', url: 'https://timprodact.github.io/the4/models/gallery/cream-tube.glb' },
  { id: 'cosmetic-mirror', label: 'Зеркало', url: 'https://timprodact.github.io/the4/models/gallery/cosmetic-mirror.glb' },
  { id: 'pixel-compact', label: 'Компакт', url: 'https://timprodact.github.io/the4/models/gallery/pixel-compact.glb' },
  { id: 'velvet-wings', label: 'Крылья', url: 'https://timprodact.github.io/the4/models/gallery/velvet-wings.glb' },
];

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProductPage({ snapshot, onSnapshotChange }) {
  const product = snapshot.product || {};
  const [name, setName] = useState(product.name || '');
  const [edition, setEdition] = useState(product.edition || '');
  const [tagline, setTagline] = useState(product.tagline || '');
  const [price, setPrice] = useState(String(product.price || ''));
  const [mediaType, setMediaType] = useState(product.mediaType || '3d');
  const [modelId, setModelId] = useState(product.id || 'cream-tube');
  const [imageUrl, setImageUrl] = useState(product.images?.[0] || '');
  const [startsAt, setStartsAt] = useState(toLocalInput(snapshot.startsAt));
  const [totalStock, setTotalStock] = useState(String(snapshot.totalStock ?? ''));
  const [stock, setStock] = useState(String(snapshot.stock ?? ''));
  const [busy, setBusy] = useState(false);

  const act = async (adminAction, payload = {}) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await runActionSafe(adminAction, payload);
      onSnapshotChange(next);
      haptic('success');
    } finally {
      setBusy(false);
    }
  };

  const saveProduct = () => {
    const model = MODELS.find((m) => m.id === modelId) || MODELS[0];
    return act('update_product', {
      product: {
        id: model.id,
        name: name.trim(),
        edition: edition.trim(),
        tagline: tagline.trim(),
        price: Number(price),
        mediaType,
        modelUrl: model.url,
        images: mediaType === 'images' && imageUrl.trim() ? [imageUrl.trim()] : product.images,
      },
    });
  };

  const saveDrop = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let next = await runActionSafe('set_starts_at', { startsAt: new Date(startsAt).toISOString() });
      onSnapshotChange(next);
      next = await runActionSafe('set_total_stock', { totalStock: Number(totalStock) });
      onSnapshotChange(next);
      next = await runActionSafe('set_stock', { stock: Number(stock) });
      onSnapshotChange(next);
      haptic('success');
    } finally {
      setBusy(false);
    }
  };

  const openPreview = (phase) => {
    haptic('light');
    const tg = window.Telegram?.WebApp;
    const url = phase ? `${vitrinaUrl()}?preview=${phase}` : vitrinaUrl();
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
  };

  return (
    <SubpageLayout>
      <PageHeader title="Товар и дроп" subtitle={phaseLabel(snapshot.phase, snapshot.paused)} />
      <InsetSection>
        <List>
          <Section header="ТОВАР">
            <Cell subtitle="Название">
              <input className="fm-field" value={name} onChange={(e) => setName(e.target.value)} />
            </Cell>
            <Cell subtitle="Издание">
              <input className="fm-field" value={edition} onChange={(e) => setEdition(e.target.value)} />
            </Cell>
            <Cell subtitle="Слоган">
              <input className="fm-field" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </Cell>
            <Cell subtitle={`Цена · ${formatPrice(Number(price) || 0)}`}>
              <input className="fm-field" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Cell>
            <Cell subtitle="Медиа">
              <select className="fm-field" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="3d">3D модель</option>
                <option value="images">Фото</option>
              </select>
            </Cell>
            {mediaType === '3d' ? (
              <Cell subtitle="3D модель">
                <select className="fm-field" value={modelId} onChange={(e) => setModelId(e.target.value)}>
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </Cell>
            ) : (
              <Cell subtitle="URL фото">
                <input className="fm-field" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </Cell>
            )}
            <Cell>
              <Button mode="filled" size="l" stretched disabled={busy} onClick={saveProduct}>
                Сохранить товар
              </Button>
            </Cell>
          </Section>

          <Section header="ДРОП">
            <Cell subtitle="Дата и время старта">
              <input className="fm-field" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Cell>
            <Cell subtitle="Всего / в продаже">
              <div className="fm-drop-stock-row">
                <input className="fm-field" type="number" value={totalStock} onChange={(e) => setTotalStock(e.target.value)} />
                <input className="fm-field" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </Cell>
            <Cell>
              <Button mode="filled" size="l" stretched disabled={busy} onClick={saveDrop}>
                Сохранить дроп
              </Button>
            </Cell>
            <Cell>
              <Button
                mode="outline"
                size="l"
                stretched
                disabled={busy}
                onClick={() => act('set_paused', { paused: !snapshot.paused })}
              >
                {snapshot.paused ? '▶️ Снять паузу' : '⏸ Пауза продаж'}
              </Button>
            </Cell>
          </Section>

          <Section header="ПРЕВЬЮ ВИТРИНЫ">
            <Cell subtitle="Как увидят покупатели">
              <div className="fm-preview-row">
                <Button size="s" mode="outline" onClick={() => openPreview('pre_drop')}>Pre-Drop</Button>
                <Button size="s" mode="outline" onClick={() => openPreview('active')}>Active</Button>
                <Button size="s" mode="outline" onClick={() => openPreview(null)}>Live</Button>
              </div>
            </Cell>
          </Section>
        </List>
      </InsetSection>
    </SubpageLayout>
  );
}
