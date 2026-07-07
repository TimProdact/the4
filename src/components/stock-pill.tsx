interface StockPillProps {
  stock: number;
  totalStock: number;
  soldOut?: boolean;
  lowStock?: boolean;
  allHeld?: boolean;
}

export function StockPill({ stock, totalStock, soldOut, lowStock, allHeld }: StockPillProps) {
  if (soldOut) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--stock-pill-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--stock-sold-text)]">
        Sold Out
      </span>
    );
  }

  if (allHeld) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--state-error-bg)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--state-error)]">
        Все в резерве
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-[var(--stock-pill-bg)] px-3 py-1 text-[0.68rem] font-medium tracking-wide text-[var(--stock-pill-text)] ${
        lowStock ? "ring-1 ring-[var(--accent)]/30" : ""
      }`}
    >
      Осталось: {stock} / {totalStock}
    </span>
  );
}
