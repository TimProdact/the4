import { useEffect, useRef, useState } from 'react';
import { PageHeader, SubpageLayout } from '../components/PageLayout.jsx';
import { ManageItemCard } from '../components/ManageItemCard.jsx';
import { PlatformIcon } from '../components/PlatformIcon.jsx';
import { haptic, runActionSafe } from '../api.js';
import {
  PLATFORM_LABELS,
  FIXED_SOCIAL_PLATFORMS,
  normalizeSocialLinks,
} from '../utils.js';

const AUTOSAVE_MS = 600;

function linkTitle(link) {
  return link.title?.trim() || PLATFORM_LABELS[link.platform] || 'Ссылка';
}

function linksEqual(a, b) {
  return JSON.stringify(a || []) === JSON.stringify(b || []);
}

export function SocialsPage({ snapshot, onSnapshotChange }) {
  const tg = window.Telegram?.WebApp;
  const [links, setLinks] = useState(() => normalizeSocialLinks(snapshot.socialLinks));

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const linksRef = useRef(links);
  linksRef.current = links;
  const saveTimerRef = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    setLinks(normalizeSocialLinks(snapshot.socialLinks));
  }, [snapshot.socialLinks]);

  useEffect(() => {
    tg?.MainButton?.hide();
  }, [tg]);

  const persistLinks = async () => {
    const nextLinks = linksRef.current;
    if (linksEqual(nextLinks, snapshotRef.current.socialLinks)) return;
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      const next = await runActionSafe('update_social_links', { socialLinks: nextLinks });
      onSnapshotChange(next);
    } finally {
      savingRef.current = false;
    }
  };

  useEffect(() => {
    if (linksEqual(links, snapshotRef.current.socialLinks)) return undefined;
    saveTimerRef.current = setTimeout(persistLinks, AUTOSAVE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [links]);

  const updateUrl = (platform, url) => {
    setLinks((prev) => prev.map((l) => (l.platform === platform ? { ...l, url } : l)));
  };

  const toggleVis = (platform) => {
    setLinks((prev) => prev.map((l) => (
      l.platform === platform ? { ...l, visible: l.visible === false } : l
    )));
    haptic('light');
  };

  const filledCount = links.filter((l) => l.url?.trim()).length;

  return (
    <SubpageLayout>
      <PageHeader title="Ссылки" subtitle={`${filledCount} из ${FIXED_SOCIAL_PLATFORMS.length}`} />
      <div className="fm-manage-page-list">
        <div className="fm-manage-list fm-manage-list--inset">
          {links.map((link) => (
            <ManageItemCard
              key={link.platform}
              id={link.id}
              title={linkTitle(link)}
              link={link.url}
              linkPlaceholder={`https://${link.platform === 'website' ? '' : `${link.platform}.com/`}…`}
              linkEditable
              onLinkChange={(url) => updateUrl(link.platform, url)}
              clicks={link.clicks}
              visible={link.visible !== false}
              onToggleVisible={() => toggleVis(link.platform)}
              leading={<PlatformIcon platform={link.platform} />}
              showDragHandle={false}
            />
          ))}
        </div>
      </div>
    </SubpageLayout>
  );
}
