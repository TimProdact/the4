import { Button } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { ProductPreview } from '../components/ProductPreview.jsx';
import { formatPrice } from '../utils.js';
import { haptic, runActionSafe } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

function listProducts(snapshot) {
  if (snapshot.products?.length) return snapshot.products;
  if (snapshot.product?.id) return [snapshot.product];
  return [];
}

export function CatalogPage({ snapshot, onSnapshotChange, push }) {
  const products = listProducts(snapshot);

  const addProduct = async () => {
    haptic('selection');
    const next = await runActionSafe('create_product', {
      product: {
        name: '',
        edition: '',
        price: 320000,
        mediaType: '3d',
        id: 'cream-tube',
      },
    });
    onSnapshotChange(next);
    const list = listProducts(next);
    const created = list[list.length - 1];
    if (!created?.id) return;
    push(SCREENS.PRODUCT, { productId: created.id, autoOpenField: 'name' });
  };

  return (
    <SubpageLayout>
      <PageHeader title="Товары" subtitle={`${products.length} в каталоге`} />
      <div className="fm-page-body">
        {products.length > 0 ? (
          <div className="fm-inset-card fm-catalog-card">
            <div className="fm-catalog-list">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  className={`fm-catalog-row fm-tap${index === products.length - 1 ? ' fm-catalog-row--last' : ''}`}
                  onClick={() => { haptic('selection'); push(SCREENS.PRODUCT, { productId: product.id }); }}
                >
                  <div className="fm-catalog-thumb">
                    <ProductPreview product={product} size="sm" />
                  </div>
                  <div className="fm-catalog-copy">
                    <span className="fm-catalog-title">{product.name || 'Без названия'}</span>
                    <span className="fm-catalog-sub">{product.edition || formatPrice(product.price || 0)}</span>
                  </div>
                  <Icon24ChevronRight className="fm-value-row-chevron" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="fm-empty-hint">Добавь первый товар — название, цена и картинка по одному полю</p>
        )}

        <div className="fm-page-cta fm-page-cta--separated">
          <Button mode="filled" size="l" stretched onClick={addProduct}>
            + Добавить товар
          </Button>
        </div>
      </div>
    </SubpageLayout>
  );
}
