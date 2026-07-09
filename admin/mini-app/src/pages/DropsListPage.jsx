import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { LaunchDropSheet } from '../components/LaunchDropSheet.jsx';
import { formatDropDate, phaseLabel } from '../utils.js';
import { haptic } from '../api.js';
import { SCREENS } from '../navigation/screens.js';

function listDrops(snapshot) {
  return snapshot.drops || [];
}

export function DropsListPage({ snapshot, onSnapshotChange, push }) {
  const drops = listDrops(snapshot);
  const [launchOpen, setLaunchOpen] = useState(false);

  const openLaunch = () => {
    haptic('selection');
    setLaunchOpen(true);
  };

  return (
    <SubpageLayout>
      <PageHeader title="Дропы" subtitle={`${drops.length} продаж`} />
      <div className="fm-page-body">
        {drops.length > 0 ? (
          <div className="fm-inset-card fm-value-group">
            {drops.map((drop, index) => (
              <button
                key={drop.id}
                type="button"
                className={`fm-value-row fm-value-row--chevron fm-tap${index === drops.length - 1 ? ' fm-value-row--last' : ''}`}
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
        ) : (
          <p className="fm-empty-hint">Запусти первый дроп — выбери товар, дату и количество</p>
        )}

        <div className="fm-page-cta fm-page-cta--separated">
          <Button mode="filled" size="l" stretched onClick={openLaunch}>
            + Запустить дроп
          </Button>
        </div>
      </div>

      <LaunchDropSheet
        open={launchOpen}
        snapshot={snapshot}
        onSnapshotChange={onSnapshotChange}
        onClose={() => setLaunchOpen(false)}
        onGoCatalog={() => push(SCREENS.CATALOG)}
      />
    </SubpageLayout>
  );
}
