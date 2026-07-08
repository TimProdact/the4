import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { haptic } from '../api.js';

export function MenuGroup({ children }) {
  return <div className="fm-inset-card fm-menu-group">{children}</div>;
}

export function MenuRow({
  label,
  value,
  tone = 'blue',
  glyph,
  onClick,
  last = false,
}) {
  return (
    <button
      type="button"
      className={`fm-menu-row fm-tap${last ? ' fm-menu-row--last' : ''}`}
      onClick={() => { haptic('selection'); onClick?.(); }}
    >
      <span className="fm-menu-icon-wrap">
        <span className="fm-menu-glyph" style={{ backgroundColor: tone }} aria-hidden>{glyph}</span>
      </span>
      <span className="fm-menu-label">{label}</span>
      {value != null && value !== '' && (
        <span className="fm-menu-value">{value}</span>
      )}
      <Icon24ChevronRight className="fm-menu-chevron" />
    </button>
  );
}
