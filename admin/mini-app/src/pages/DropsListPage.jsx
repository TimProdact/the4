import { Button } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { formatDropDate, formatPrice, phaseLabel } from '../utils.js';
import { haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

export function DropsListPage({ snapshot, push }) {
  const drops = snapshot.drops || [];

  return (
    <SubpageLayout>
      <PageHeader title="Дропы" subtitle={`${drops.length} продаж`} />
      <InsetSection>
        <div className="fm-inset-card fm-value-group">
          {drops.map((drop, index) => (
            <button
              key={drop.id}
              type="button"
              className={`fm-value-row fm-tap${index === drops.length - 1 ? ' fm-value-row--last' : ''}`}
              onClick={() => { haptic('selection'); push(SCREENS.DROP, { dropId: drop.id }); }}
            >
              <span className="fm-value-row-label">{drop.productName || drop.product?.name || 'Дроп'}</span>
              <span className="fm-value-row-value">
                {phaseLabel(drop.phase, drop.paused)} · {formatDropDate(drop.startsAt)}
              </span>
              <Icon24ChevronRight className="fm-value-row-chevron" />
            </button>
          ))}
        </div>

        <div className="fm-page-cta">
          <Button mode="filled" size="l" stretched onClick={() => push(SCREENS.WIZARD)}>
            + Запустить дроп
          </Button>
        </div>
      </InsetSection>
    </SubpageLayout>
  );
}
