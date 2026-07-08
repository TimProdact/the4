import { Button } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { ProductPreview } from '../components/ProductPreview.jsx';
import { formatPrice } from '../utils.js';
import { haptic, runActionSafe } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

export function CatalogPage({ snapshot, onSnapshotChange, push }) {
  const products = snapshot.products || [];

  const addProduct = async () => {
    haptic('selection');
    const next = await runActionSafe('create_product', {
      product: {
        name: 'Новый товар',
        edition: '',
        price: 0,
      },
    });
    onSnapshotChange(next);
    const created = next.products[next.products.length - 1];
    push(SCREENS.PRODUCT, { productId: created.id });
  };

  return (
    <SubpageLayout>
      <PageHeader title="Товары" subtitle={`${products.length} в каталоге`} />
      <InsetSection>
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
        <div className="fm-page-cta">
          <Button mode="filled" size="l" stretched onClick={addProduct}>
            + Добавить товар
          </Button>
        </div>
      </InsetSection>
    </SubpageLayout>
  );
}
