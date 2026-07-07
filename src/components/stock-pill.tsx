interface StockPillProps {
  stock: number;
  totalStock: number;
  soldOut?: boolean;
  lowStock?: boolean;
  allHeld?: boolean;
  onCycleTheme?: () => void;
  themeLabel?: string;
}

const pillClass =
  "inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] transition active:scale-95";

export function StockPill({
  stock,
  totalStock,
  soldOut,
  lowStock,
  allHeld,
  onCycleTheme,
  themeLabel,
}: StockPillProps) {
  if (soldOut) {
    return (
      <button
        type="button"
        onClick={onCycleTheme}
        aria-label={themeLabel ? `Тема: ${themeLabel}. Нажми для смены` : "Сменить тему"}
        className={`${pillClass} bg-[var(--stock-pill-bg)] font-semibold uppercase tracking-[0.14em] text-[var(--stock-sold-text)]`}
      >
        Sold Out
      </button>
    );
  }

  if (allHeld) {
    return (
      <button
        type="button"
        onClick={onCycleTheme}
        aria-label={themeLabel ? `Тема: ${themeLabel}. Нажми для смены` : "Сменить тему"}
        className={`${pillClass} bg-[var(--state-error-bg)] font-semibold uppercase tracking-[0.12em] text-[var(--state-error)]`}
      >
        Все в резерве
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCycleTheme}
      aria-label={
        themeLabel
          ? `Осталось ${stock} из ${totalStock}. Тема: ${themeLabel}. Нажми для смены`
          : `Осталось ${stock} из ${totalStock}. Нажми для смены темы`
      }
      className={`${pillClass} bg-[var(--stock-pill-bg)] font-medium tracking-wide text-[var(--stock-pill-text)] ${
        lowStock ? "ring-1 ring-[var(--accent)]/30" : ""
      }`}
    >
      Осталось: {stock} / {totalStock}
    </button>
  );
}
