import { useEffect, useState, useCallback } from 'react';
import { AppRoot, Placeholder, Button } from '@telegram-apps/telegram-ui';
import { bootstrap, haptic } from './api.js';
import { useTelegramApp } from './hooks/useTelegramApp.js';
import { useNavStack } from './hooks/useNavStack.js';
import { waitForInitData, hasTelegramContext } from './telegram-init.js';
import { SCREENS } from './navigation/screens.js';
import { HubPage } from './pages/HubPage.jsx';
import { DropPage } from './pages/DropPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { OrderDetailPage } from './pages/OrderDetailPage.jsx';
import { WaitlistPage } from './pages/WaitlistPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
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
      reset(SCREENS.HUB);
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
  }, [depth, tg, pop]);

  const findOrder = (id) => snapshot?.orders?.find(o => o.id === Number(id));

  const renderScreen = () => {
    if (!snapshot) return null;
    const { id, params } = current;
    switch (id) {
      case SCREENS.HUB:
        return <HubPage snapshot={snapshot} push={push} />;
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
      case SCREENS.ANALYTICS:
        return <AnalyticsPage snapshot={snapshot} onSnapshotChange={setSnapshot} />;
      case SCREENS.SETTINGS:
        return <SettingsPage />;
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

  return (
    <AppRoot appearance={appearance} platform={platform}>
      <div className={`fm-twa fm-scroll fm-scroll--hub${depth > 1 ? ' fm-subpage' : ''}`}>
        {renderScreen()}
      </div>
    </AppRoot>
  );
}
