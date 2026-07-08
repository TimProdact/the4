export const PLATFORM_LABELS = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  website: 'Сайт',
};

export const FIXED_SOCIAL_PLATFORMS = [
  'instagram',
  'telegram',
  'tiktok',
  'youtube',
  'twitter',
  'website',
];

export function normalizeSocialLinks(links = []) {
  const byPlatform = new Map();
  for (const link of links || []) {
    if (link?.platform && !byPlatform.has(link.platform)) {
      byPlatform.set(link.platform, link);
    }
  }
  return FIXED_SOCIAL_PLATFORMS.map((platform, index) => {
    const existing = byPlatform.get(platform);
    return {
      id: existing?.id || `social_${platform}`,
      platform,
      url: existing?.url || '',
      visible: existing?.visible !== false,
      clicks: Number(existing?.clicks) || 0,
      sort_order: index,
      title: existing?.title || '',
    };
  });
}

export function formatLinkClicks(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(v);
}

export function formatPrice(n, currency = 'UZS') {
  return `${Number(n).toLocaleString('ru-RU')} ${currency}`;
}

const STATUS_LABELS = {
  paid: 'Оплачен',
  pending: 'Ожидает',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

export function orderStatusLabel(status) {
  return STATUS_LABELS[status] || status || '—';
}

export function phaseLabel(phase, paused) {
  if (paused) return 'Пауза';
  const map = {
    active: 'Идёт продажа',
    pre_drop: 'До старта',
    sold_out: 'Распродано',
  };
  return map[phase] || phase;
}

export function formatDropDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDropDateOnly(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export function formatDropTimeOnly(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function needsOnboarding(snapshot) {
  if (!snapshot) return false;
  if (snapshot.onboardingComplete === false) return true;
  const products = snapshot.products || [];
  if (!products.length) return true;
  return !String(products[0]?.name || '').trim();
}

export function vitrinaUrl() {
  return 'https://timprodact.github.io/the4/';
}

export function vitrinaShortUrl() {
  return 'timprodact.github.io/the4';
}

export function pendingOrders(orders = []) {
  return orders.filter(o => o.status === 'pending');
}

export function productThumb(product = {}) {
  if (product.mediaType === 'images' && product.images?.[0]) return product.images[0];
  return '';
}

export function productAcronym(product = {}) {
  return String(product.name || '?').trim().charAt(0).toUpperCase() || '?';
}
