import { useEffect, useState, useCallback } from 'react';
import { AppRoot, Placeholder, Button } from '@telegram-apps/telegram-ui';
import { bootstrap, haptic } from './api.js';
import { useTelegramApp } from './hooks/useTelegramApp.js';
import { useNavStack } from './hooks/useNavStack.js';
import { waitForInitData, hasTelegramContext } from './telegram-init.js';
import { SCREENS } from './navigation/screens.js';
import { needsOnboarding } from './utils.js';
import { HubPage } from './pages/HubPage.jsx';
import { WizardPage } from './pages/WizardPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import { ProductMediaPage } from './pages/ProductMediaPage.jsx';
import { DropPage } from './pages/DropPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { OrderDetailPage } from './pages/OrderDetailPage.jsx';
import { WaitlistPage } from './pages/WaitlistPage.jsx';
import { BrandEditPage } from './pages/BrandEditPage.jsx';
import { QrPage } from './pages/QrPage.jsx';
import { HubSkeleton } from './components/HubSkeleton.jsx';

export default function App() {
  const { tg, platform, appearance, ready } = useTelegramApp();
  const { current, depth, push, pop, reset } = useNavStack({ id: SCREENS.HUB, params: {} });

  const [loading, setLoading] = useState(true);
  const [loadingHint, setLoadingHint] = useState('Загрузка…');
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadingHint('Загрузка…');
    setError('');

    const init = await waitForInitData();
    if (!init) {
      const hint = hasTelegramContext()
        ? 'Сессия Telegram не передана. Закройте Mini App и откройте снова через кнопку «Админка» в @pocketpals_bot.'
        : 'Откройте через кнопку «Админка» в боте @pocketpals_bot (не из браузера).';
      setError(`${hint}\n\nBotFather: /setdomain → timprodact.github.io`);
      setLoading(false);
      return;
    }

    try {
      setLoadingHint('Подключаемся к серверу…');
      const data = await bootstrap();
      setSnapshot(data.snapshot);
      reset(needsOnboarding(data.snapshot) ? SCREENS.WIZARD : SCREENS.HUB);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  useEffect(() => {
    if (!tg?.BackButton) return;
    if (current.id === SCREENS.WIZARD) {
      tg.BackButton.hide();
      return;
    }
    if (depth > 1) {
      tg.BackButton.show();
      const handler = () => {
        haptic('light');
        pop();
      };
      tg.BackButton.onClick(handler);
      return () => { tg.BackButton.offClick(handler); tg.BackButton.hide(); };
    }
    tg.BackButton.hide();
  }, [depth, tg, pop, current.id]);

  const findOrder = (id) => snapshot?.orders?.find(o => o.id === Number(id));

  const renderScreen = () => {
    if (!snapshot) return null;
    const { id, params } = current;
    switch (id) {
      case SCREENS.HUB:
        return <HubPage snapshot={snapshot} push={push} />;
      case SCREENS.WIZARD:
        return (
          <WizardPage
            snapshot={snapshot}
            onSnapshotChange={setSnapshot}
            onComplete={() => reset(SCREENS.HUB)}
          />
        );
      case SCREENS.PRODUCT:
        return <ProductPage snapshot={snapshot} onSnapshotChange={setSnapshot} push={push} />;
      case SCREENS.PRODUCT_MEDIA:
        return (
          <ProductMediaPage
            snapshot={snapshot}
            onSnapshotChange={setSnapshot}
            onDone={pop}
          />
        );
      case SCREENS.DROP:
        return <DropPage snapshot={snapshot} onSnapshotChange={setSnapshot} />;
      case SCREENS.ORDERS:
        return <OrdersPage snapshot={snapshot} push={push} />;
      case SCREENS.ORDER_DETAIL:
        return (
          <OrderDetailPage
            order={findOrder(params.orderId)}
            onSnapshotChange={setSnapshot}
          />
        );
      case SCREENS.WAITLIST:
        return <WaitlistPage snapshot={snapshot} />;
      case SCREENS.STORE_EDIT:
        return (
          <BrandEditPage
            snapshot={snapshot}
            onSnapshotChange={setSnapshot}
            onDone={pop}
          />
        );
      case SCREENS.STORE_QR:
        return <QrPage snapshot={snapshot} onDone={pop} />;
      default:
        return <HubPage snapshot={snapshot} push={push} />;
    }
  };

  if (loading) {
    return (
      <AppRoot appearance={appearance} platform={platform}>
        <HubSkeleton hint={loadingHint} />
      </AppRoot>
    );
  }

  if (error) {
    return (
      <AppRoot appearance={appearance} platform={platform}>
        <Placeholder header="Ошибка" description={error}>
          <Button mode="filled" size="m" onClick={load}>Повторить</Button>
        </Placeholder>
      </AppRoot>
    );
  }

  const isWizard = current.id === SCREENS.WIZARD;
  const isQr = current.id === SCREENS.STORE_QR;

  return (
    <AppRoot appearance={appearance} platform={platform}>
      <div className={`fm-twa fm-scroll fm-scroll--hub${depth > 1 && !isQr ? ' fm-subpage' : ''}${isWizard ? ' fm-scroll--wizard' : ''}`}>
        {renderScreen()}
      </div>
    </AppRoot>
  );
}
