import { Icon20Copy } from '@telegram-apps/telegram-ui/dist/icons/20/copy';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';
import { copyText } from '../api.js';

export function WaitlistPage({ snapshot }) {
  const list = snapshot.waitlist || [];

  return (
    <SubpageLayout>
      <PageHeader title="Waitlist" subtitle={`${list.length} контактов`} />
      <InsetSection>
        {list.length ? (
          <>
            <ul className="fm-waitlist-list">
              {list.map((w) => (
                <li key={w.id}>{w.contact}</li>
              ))}
            </ul>
            <button
              type="button"
              className="fm-waitlist-copy"
              onClick={() => copyText(list.map((w) => w.contact).join('\n'))}
            >
              <Icon20Copy /> Скопировать все
            </button>
          </>
        ) : (
          <p className="fm-empty-hint">Пока никто не подписался на уведомление</p>
        )}
      </InsetSection>
    </SubpageLayout>
  );
}
