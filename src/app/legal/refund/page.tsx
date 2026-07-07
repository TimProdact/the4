import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10">
      <Link href="/home" className="text-xs uppercase tracking-widest underline">
        ← Archive
      </Link>
      <h1 className="mt-8 text-2xl font-semibold">Возврат</h1>
      <div className="mt-6 max-w-lg space-y-4 text-sm text-[var(--muted)]">
        <p>
          Лимитированные издания The4 возврату не подлежат, кроме случаев производственного
          брака.
        </p>
        <p>По вопросам: support@the4.io</p>
      </div>
    </main>
  );
}
