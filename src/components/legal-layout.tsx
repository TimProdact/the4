"use client";

import Link from "next/link";
import { asset } from "@/lib/asset";
import { useT } from "@/lib/i18n";

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useT();

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10 text-[var(--fg)]">
      <Link href={asset("/")} className="text-xs uppercase tracking-widest underline">
        {t("legal.backToDrop")}
      </Link>
      <h1 className="mt-8 text-2xl font-semibold">{title}</h1>
      <div className="prose prose-sm mt-6 max-w-lg space-y-4 text-sm text-[var(--muted)]">
        {children}
      </div>
      <nav className="mt-10 flex flex-wrap gap-4 text-[0.65rem] uppercase tracking-[0.15em]">
        <Link href={asset("/legal/offer")} className="underline">
          {t("profile.legalOffer")}
        </Link>
        <Link href={asset("/legal/delivery")} className="underline">
          {t("profile.legalDelivery")}
        </Link>
        <Link href={asset("/legal/refund")} className="underline">
          {t("profile.legalRefund")}
        </Link>
        <Link href={asset("/legal/privacy")} className="underline">
          {t("profile.legalPrivacy")}
        </Link>
      </nav>
    </main>
  );
}
