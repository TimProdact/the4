import Link from "next/link";

export default function OfferPage() {
  return (
    <LegalLayout title="Публичная оферта">
      <p>
        Настоящая оферта регулирует покупку лимитированных изданий на платформе The4.
        Оформляя заказ, покупатель соглашается с условиями доставки и возврата.
      </p>
      <p>Товар: SHIZARU OKSANA — 1st Edition. Цена указывается на странице дропа.</p>
    </LegalLayout>
  );
}

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10">
      <Link href="/home" className="text-xs uppercase tracking-widest underline">
        ← Archive
      </Link>
      <h1 className="mt-8 text-2xl font-semibold">{title}</h1>
      <div className="prose prose-sm mt-6 max-w-lg space-y-4 text-sm text-[var(--muted)]">
        {children}
      </div>
    </main>
  );
}
