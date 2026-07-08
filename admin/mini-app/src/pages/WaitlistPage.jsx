import { List, Section, Cell } from '@telegram-apps/telegram-ui';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { InsetSection } from '../components/InsetSection.jsx';

export function WaitlistPage({ snapshot }) {
  const list = snapshot.waitlist || [];

  return (
    <SubpageLayout>
      <PageHeader title="Waitlist" subtitle={`${list.length} контактов`} />
      <InsetSection>
        <List>
          <Section>
            {list.map(w => (
              <Cell key={w.id} subtitle={w.contact}>
                Подписка
              </Cell>
            ))}
            {!list.length && <Cell subtitle="Пока пусто">Нет подписчиков</Cell>}
          </Section>
        </List>
      </InsetSection>
    </SubpageLayout>
  );
}
