import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { haptic } from '../api.js';

export function ValueRow({
  label,
  value,
  onClick,
  last = false,
  muted = false,
}) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`fm-value-row fm-tap${last ? ' fm-value-row--last' : ''}${onClick ? '' : ' fm-value-row--static'}`}
      onClick={() => { if (onClick) { haptic('selection'); onClick(); } }}
    >
      <span className="fm-value-row-label">{label}</span>
      <span className={`fm-value-row-value${muted ? ' fm-value-row-value--muted' : ''}`}>{value}</span>
      {onClick ? <Icon24ChevronRight className="fm-value-row-chevron" /> : null}
    </Tag>
  );
}

export function SwitchRow({ label, checked, onChange, last = false }) {
  return (
    <label className={`fm-value-row fm-value-row--switch${last ? ' fm-value-row--last' : ''}`}>
      <span className="fm-value-row-label">{label}</span>
      <span className="fm-switch">
        <input
          type="checkbox"
          className="fm-switch-input"
          checked={checked}
          onChange={(e) => { haptic('selection'); onChange?.(e.target.checked); }}
        />
        <span className="fm-switch-track" aria-hidden />
      </span>
    </label>
  );
}
