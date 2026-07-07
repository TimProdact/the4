"use client";

interface SuccessOverlayProps {
  receipt: string;
  onDismiss: () => void;
}

export function SuccessOverlay({ receipt, onDismiss }: SuccessOverlayProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--bg)]/85 px-8 backdrop-blur-md">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500 text-3xl text-emerald-600">
        ✓
      </div>
      <p className="mt-2 text-2xl" aria-hidden>
        📡
      </p>
      <h2 className="mt-6 text-center text-xl font-semibold uppercase tracking-[0.12em] md:text-2xl">
        Твоя Оксана ждёт
      </h2>
      <p className="mt-3 text-center text-sm text-[var(--muted)]">
        Оплата прошла успешно
      </p>
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Чек №{receipt} отправлен в SMS.
        <br />
        Мы свяжемся с тобой для доставки.
      </p>
      <p className="mt-4 text-center text-xs text-amber-700">
        Ачивка «Владелец The4» добавлена в Taneesh
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-8 text-xs uppercase tracking-[0.25em] underline underline-offset-4"
      >
        Закрыть
      </button>
    </div>
  );
}
